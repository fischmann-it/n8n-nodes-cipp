// ai-tools/composite-executor.ts
// Multi-step composite workflow executor — shared by both AI Tools and standard node surfaces.
import type { IExecuteFunctions, ISupplyDataFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { cippApiRequest, getTenantList } from '../GenericFunctions';
import type { ITenant } from '../types';
import { wrapSuccess, wrapError, ERROR_TYPES } from './error-formatter';

// Both node surfaces can call us — we cast to IExecuteFunctions for cippApiRequest
type CompositeContext = IExecuteFunctions | ISupplyDataFunctions;

// ── Internal types ───────────────────────────────────────────────────

interface StepResult {
	step: string;
	ok: boolean;
	data?: unknown;
	error?: string;
	count?: number;
}

interface CompositeResult {
	composite: string;
	tenantFilter: string;
	steps: StepResult[];
	result: unknown;
}

interface SecureScoreCategoryRollup {
	maxScore: number;
	currentScore: number;
}

interface SecureScoreMissedControl {
	controlName: string;
	maxScore: number;
	description: string;
}

interface BpaFailingItem {
	report: unknown;
	question: unknown;
	value: unknown;
	tenant: unknown;
}

/** Thrown by composite fns in fast mode when a step fails — caught by executeComposite */
class CompositeStepError extends Error {
	constructor(
		public readonly step: string,
		message: string,
	) {
		super(message);
		this.name = 'CompositeStepError';
	}
}

// ── Internal helpers ─────────────────────────────────────────────────

async function apiStep(
	ctx: IExecuteFunctions,
	step: string,
	method: IHttpRequestMethods,
	endpoint: string,
	qs: IDataObject,
	body: IDataObject = {},
): Promise<StepResult> {
	try {
		const data = await cippApiRequest.call(ctx, method, endpoint, body, qs);
		return { step, ok: true, data, count: toArray(data).length };
	} catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		return { step, ok: false, error: msg };
	}
}

/** Normalise any CIPP API response into an array of objects */
function toArray(data: unknown): IDataObject[] {
	if (!data) return [];
	if (Array.isArray(data)) return data as IDataObject[];
	const obj = data as IDataObject;
	if (Array.isArray(obj.Results)) return obj.Results as IDataObject[];
	if (Array.isArray(obj.value)) return obj.value as IDataObject[];
	return [obj];
}

function failFast(step: StepResult, failMode: 'fast' | 'bestEffort'): void {
	if (!step.ok && failMode === 'fast') {
		throw new CompositeStepError(step.step, step.error ?? 'Step failed');
	}
}

function requireRootStep(step: StepResult): void {
	if (!step.ok) {
		throw new CompositeStepError(
			step.step,
			`${step.step}: ${step.error ?? 'Required root step failed'}`,
		);
	}
}

function failIfAllRootStepsFailed(composite: string, steps: StepResult[]): void {
	if (steps.length === 0 || steps.some((step) => step.ok)) return;
	const first = steps[0]!;
	throw new CompositeStepError(
		first.step,
		`${composite} could not run because all root steps failed. ${first.step}: ${first.error ?? 'Step failed'}`,
	);
}

const SMTP_ADDRESS_PATTERN = /SMTP:([^\]]+)/i;

// Each CIPP address entry format: `"email@domain.com" [SMTP:email@domain.com]`
function extractEmails(addrs: unknown): string[] {
	if (!Array.isArray(addrs)) return [];
	const results: string[] = [];
	for (const addr of addrs) {
		if (typeof addr !== 'string') continue;
		const email = SMTP_ADDRESS_PATTERN.exec(addr)?.[1]?.trim();
		if (email) results.push(email);
	}
	return results;
}

// ── Composite implementations ────────────────────────────────────────

async function licenseAudit(
	ctx: IExecuteFunctions,
	tenantFilter: string,
	params: Record<string, unknown>,
	failMode: 'fast' | 'bestEffort',
): Promise<CompositeResult> {
	const inactiveDays = typeof params.inactiveDays === 'number' ? params.inactiveDays : 90;
	const steps: StepResult[] = [];

	// Step 1: License inventory
	const s1 = await apiStep(ctx, 'tenant.getLicenses', 'GET', '/api/ListLicenses', { tenantFilter });
	steps.push(s1);
	requireRootStep(s1);

	// Step 2: Disabled users (may hold licenses = waste)
	const s2 = await apiStep(ctx, 'user.listUsers', 'GET', '/api/ListUsers', {
		tenantFilter,
		graphFilter: 'accountEnabled eq false',
	});
	steps.push(s2);
	failFast(s2, failMode);

	// Step 3: Inactive accounts
	const s3 = await apiStep(ctx, 'user.listInactiveAccounts', 'GET', '/api/ListInactiveAccounts', {
		tenantFilter,
		InactiveDays: inactiveDays,
	});
	steps.push(s3);

	// Shape results
	const licenses = toArray(s1.data);
	const allDisabledUsers = toArray(s2.data);
	const inactive = toArray(s3.data);

	const disabledWithLicense = allDisabledUsers.filter((u) => {
		const assigned = u.assignedLicenses as unknown[] | undefined;
		return Array.isArray(assigned) && assigned.length > 0;
	});

	let totalSeats = 0;
	let usedSeats = 0;
	const unusedSkus: IDataObject[] = [];
	for (const sku of licenses) {
		const prepaid = sku.prepaidUnits as IDataObject | undefined;
		const fromPrepaid = typeof prepaid?.enabled === 'number' ? prepaid.enabled : null;
		const fromTotal = typeof sku.totalCount === 'number' ? sku.totalCount : 0;
		const total = fromPrepaid !== null ? fromPrepaid : fromTotal;
		const used = typeof sku.consumedUnits === 'number' ? sku.consumedUnits : 0;
		totalSeats += total;
		usedSeats += used;
		if (total > used) {
			unusedSkus.push({
				skuId: sku.skuId,
				skuPartNumber: sku.skuPartNumber,
				friendlyName: sku.friendlyName ?? sku.productName,
				totalSeats: total,
				usedSeats: used,
				wastedSeats: total - used,
			});
		}
	}

	const wastedSeats = totalSeats - usedSeats;
	const estimatedMonthlySaving = wastedSeats * 8; // rough avg $8/seat/month

	return {
		composite: 'licenseAudit',
		tenantFilter,
		steps,
		result: {
			summary: { totalSeats, usedSeats, wastedSeats, estimatedMonthlySaving },
			disabledWithLicense,
			inactive,
			unusedSkus,
		},
	};
}

async function securityPosture(
	ctx: IExecuteFunctions,
	tenantFilter: string,
	_params: Record<string, unknown>,
	failMode: 'fast' | 'bestEffort',
): Promise<CompositeResult> {
	const steps: StepResult[] = [];

	// s1–s3: critical — respect failMode
	const s1 = await apiStep(ctx, 'user.listMfaUsers', 'GET', '/api/ListMFAUsers', { tenantFilter });
	steps.push(s1);
	failFast(s1, failMode);

	const s2 = await apiStep(ctx, 'identity.listBasicAuth', 'GET', '/api/ListBasicAuth', { tenantFilter });
	steps.push(s2);
	failFast(s2, failMode);

	const s3 = await apiStep(ctx, 'conditionalAccess.listPolicies', 'GET', '/api/ListConditionalAccessPolicies', { tenantFilter });
	steps.push(s3);
	failFast(s3, failMode);
	failIfAllRootStepsFailed('securityPosture', [s1, s2, s3]);

	// s4–s8: best-effort — failFast NOT called; errors captured in steps[].error
	const s4 = await apiStep(ctx, 'tenant.listDefenderState', 'GET', '/api/ListDefenderState', { tenantFilter });
	steps.push(s4);
	const s5 = await apiStep(ctx, 'tenant.listAntiPhishingFilters', 'GET', '/api/ListAntiPhishingFilters', { tenantFilter });
	steps.push(s5);
	const s6 = await apiStep(ctx, 'tenant.listSafeAttachmentsFilters', 'GET', '/api/ListSafeAttachmentsFilters', { tenantFilter });
	steps.push(s6);
	const s7 = await apiStep(ctx, 'safeLinks.listSafeLinksPolicy', 'GET', '/api/ListSafeLinksPolicy', { tenantFilter });
	steps.push(s7);
	const s8 = await apiStep(ctx, 'tenant.listDomainAnalyser', 'GET', '/api/ListDomainAnalyser', { tenantFilter });
	steps.push(s8);
	// s9: Microsoft Secure Score — best-effort; requires SecurityEvents.Read.All on SAM app
	const s9 = await apiStep(ctx, 'security.secureScore', 'GET', '/api/ListGraphRequest', {
		tenantFilter,
		Endpoint: 'security/secureScores',
		'$top': 1,
	});
	steps.push(s9);

	// s10: BPA failing checks — best-effort; governance signal
	const s10 = await apiStep(ctx, 'tenant.listBpa', 'GET', '/api/ListBPA', { tenantFilter });
	steps.push(s10);

	// s11: Tenant standards drift — best-effort; governance signal
	const s11 = await apiStep(ctx, 'tenant.listTenantDrift', 'GET', '/api/ListTenantDrift', { tenantFilter });
	steps.push(s11);

	// s12: OAuth user consent policy — best-effort; Apps category signal
	// Requires Policy.Read.All on SAM app; 403 = permission not granted
	const s12 = await apiStep(ctx, 'security.authorizationPolicy', 'GET', '/api/ListGraphRequest', {
		tenantFilter,
		Endpoint: 'policies/authorizationPolicy',
	});
	steps.push(s12);

	// s13: Role assignments — best-effort; used to count Global Administrators
	const s13 = await apiStep(ctx, 'identity.listRoles', 'GET', '/api/ListRoles', { tenantFilter });
	steps.push(s13);

	// s14: Intune compliance policies — best-effort; device compliance signal
	const s14 = await apiStep(ctx, 'policy.listCompliancePolicies', 'GET', '/api/ListCompliancePolicies', { tenantFilter });
	steps.push(s14);

	// s15: SharePoint external sharing settings — best-effort; data category signal
	const s15 = await apiStep(ctx, 'tenant.listSharepointSettings', 'GET', '/api/ListSharepointSettings', { tenantFilter });
	steps.push(s15);

	// ── Identity: MFA ────────────────────────────────────────────────
	// Filter to active non-guest users so disabled/guest accounts don't skew coverage %
	const allMfaUsers = toArray(s1.data);
	const mfaUsers = allMfaUsers.filter(
		(u) => u.AccountEnabled !== false && u.UserType !== 'Guest',
	);
	const evaluatedUserCount = mfaUsers.length;
	const allWithoutMfa = mfaUsers.filter((u) => !u.MFARegistration);
	const withoutMfaCount = allWithoutMfa.length;
	const withoutMfaUsers = allWithoutMfa
		.slice(0, 25)
		.map((u) => (u.UPN ?? u.DisplayName) as string)
		.filter(Boolean);
	const adminMfaGaps = mfaUsers
		.filter((u) => u.IsAdmin === true && !u.MFARegistration)
		.map((u) => (u.UPN ?? u.DisplayName) as string)
		.filter(Boolean);
	const usersEvaluated = s1.ok ? evaluatedUserCount : null;
	const usersWithoutMfaTotal = s1.ok ? withoutMfaCount : null;
	const usersWithoutMfa = s1.ok ? withoutMfaUsers : null;
	const adminGaps = s1.ok ? adminMfaGaps : null;
	const mfaCoveredPct = !s1.ok
		? null
		: evaluatedUserCount > 0
			? Math.round(((evaluatedUserCount - withoutMfaCount) / evaluatedUserCount) * 100)
			: 100;

	// ── Identity: Basic Auth ─────────────────────────────────────────
	const basicAuthItems = toArray(s2.data);
	const basicAuthIsEnabled = basicAuthItems.length > 0;
	// Protocol field name varies by CIPP version — try known variants
	const detectedBasicAuthProtocols = basicAuthIsEnabled
		? basicAuthItems
			.map((item) => (item.AuthProtocol ?? item.Protocol ?? item.ClientProtocol ?? item.authProtocol) as string | undefined)
			.filter((p): p is string => typeof p === 'string' && p.length > 0)
		: [];
	const basicAuthEnabled = s2.ok ? basicAuthIsEnabled : null;
	const basicAuthProtocols = s2.ok ? detectedBasicAuthProtocols : null;

	// ── Access: Conditional Access ───────────────────────────────────
	const allCaPolicies = toArray(s3.data);
	const totalCaPolicies = allCaPolicies.length;
	// Only ENABLED policies affect posture — report-only and disabled do not
	const enabledCaPolicies = allCaPolicies.filter((p) => p.state === 'enabled');
	const enabledCaPoliciesCount = enabledCaPolicies.length;
	const reportOnlyCaPoliciesCount = allCaPolicies.filter(
		(p) => p.state === 'enabledForReportingButNotEnforced',
	).length;

	const detectedMfaRequirementPolicy = enabledCaPolicies.some((p) => {
		const builtIn = (p.grantControls as IDataObject | undefined)?.builtInControls as string[] | undefined;
		return Array.isArray(builtIn) && builtIn.includes('mfa');
	});

	const detectedLegacyAuthBlockPolicy = enabledCaPolicies.some((p) => {
		const clientAppTypes = ((p.conditions as IDataObject | undefined)?.clientAppTypes as string[] | undefined) ?? [];
		// Empty clientAppTypes = "all apps" = covers legacy auth
		const targetsLegacy =
			clientAppTypes.length === 0 ||
			clientAppTypes.includes('exchangeActiveSync') ||
			clientAppTypes.includes('other');
		const builtIn = (p.grantControls as IDataObject | undefined)?.builtInControls as string[] | undefined;
		return targetsLegacy && Array.isArray(builtIn) && builtIn.includes('block');
	});
	const caPoliciesCount = s3.ok ? totalCaPolicies : null;
	const caPoliciesEnabledCount = s3.ok ? enabledCaPoliciesCount : null;
	const caPoliciesReportOnlyCount = s3.ok ? reportOnlyCaPoliciesCount : null;
	const hasMfaRequirementPolicy = s3.ok ? detectedMfaRequirementPolicy : null;
	const hasLegacyAuthBlockPolicy = s3.ok ? detectedLegacyAuthBlockPolicy : null;

	// ── Endpoint: Defender ───────────────────────────────────────────
	let defenderStatus: 'Active' | 'PartiallyActive' | 'Inactive' | 'Unknown';
	let defenderOnboardedPct = 0;
	let defenderOnboardedCount = 0;
	let defenderDeviceCount = 0;

	if (!s4.ok) {
		defenderStatus = 'Unknown';
	} else {
		const defenderItems = toArray(s4.data);
		defenderDeviceCount = defenderItems.length;
		defenderOnboardedCount = defenderItems.filter(
			(d) => d.status === 'Active' || d.onboardingStatus === 'Onboarded',
		).length;
		defenderOnboardedPct =
			defenderDeviceCount === 0
				? 0
				: Math.round((defenderOnboardedCount / defenderDeviceCount) * 100);
		if (defenderDeviceCount === 0) {
			defenderStatus = 'Inactive';
		} else if (defenderOnboardedPct >= 95) {
			defenderStatus = 'Active';
		} else {
			defenderStatus = 'PartiallyActive';
		}
	}

	// ── Email: Policies ──────────────────────────────────────────────
	// Treat absent Enabled field as enabled (field name varies; absence ≠ disabled)
	const isPolicyEnabled = (p: IDataObject): boolean =>
		p.Enabled !== false &&
		p.IsEnabled !== false &&
		p.enabled !== false &&
		p.State !== 'Disabled' &&
		p.state !== 'disabled';

	const hasAntiPhishingPolicy = s5.ok ? toArray(s5.data).some(isPolicyEnabled) : null;
	const hasSafeAttachments = s6.ok ? toArray(s6.data).some(isPolicyEnabled) : null;
	const hasSafeLinks = s7.ok ? toArray(s7.data).some(isPolicyEnabled) : null;

	// ── Email/DNS: Domain Analyser ───────────────────────────────────
	let domainsTotal = 0;
	let domainsWithDmarc = 0;
	let domainsWithDkim = 0;
	let domainsWithSpfHardFail = 0;

	if (s8.ok) {
		const domains = toArray(s8.data);
		domainsTotal = domains.length;
		for (const d of domains) {
			// Field names not confirmed in OpenAPI — try both cases
			const dmarcRecord = String(d.DMARC ?? d.dmarc ?? '');
			if (/p=(quarantine|reject)/i.test(dmarcRecord)) domainsWithDmarc++;
			const dkimRecord = String(d.DKIM ?? d.dkim ?? '');
			if (dkimRecord && dkimRecord !== 'None' && dkimRecord !== 'false' && dkimRecord !== '') domainsWithDkim++;
			const spfRecord = String(d.SPF ?? d.spf ?? '');
			if (/-all/i.test(spfRecord)) domainsWithSpfHardFail++;
		}
	}

	// ── Secure Score ─────────────────────────────────────────────────
	let secureScore: {
		currentScore: number;
		maxScore: number;
		pct: number;
		byCategory: Record<string, SecureScoreCategoryRollup>;
		topMissedControls: SecureScoreMissedControl[];
	} | null = null;

	if (s9.ok) {
		const scores = toArray(s9.data);
		if (scores.length > 0) {
			const latest = scores[0];
			const current = typeof latest.currentScore === 'number' ? latest.currentScore : 0;
			const max = typeof latest.maxScore === 'number' ? latest.maxScore : 0;

			const byCategory: Record<string, SecureScoreCategoryRollup> = {};
			const rawControlScores = Array.isArray(latest.controlScores) ? (latest.controlScores as IDataObject[]) : [];

			for (const cs of rawControlScores) {
				const cat = typeof cs.controlCategory === 'string' ? cs.controlCategory : 'Other';
				const csMax = typeof cs.maxScore === 'number' ? cs.maxScore : 0;
				const csScore = typeof cs.score === 'number' ? cs.score : 0;
				if (!byCategory[cat]) byCategory[cat] = { maxScore: 0, currentScore: 0 };
				byCategory[cat].maxScore += csMax;
				byCategory[cat].currentScore += csScore;
			}

			const topMissedControls: SecureScoreMissedControl[] = rawControlScores
				.filter((cs) => {
					// Treat non-numeric score as achieved (safer default — don't flag unknowns as missed)
					const score = typeof cs.score === 'number' ? cs.score : 1;
					return score === 0;
				})
				.sort((a, b) => {
					const aMax = typeof a.maxScore === 'number' ? a.maxScore : 0;
					const bMax = typeof b.maxScore === 'number' ? b.maxScore : 0;
					return bMax - aMax;
				})
				.slice(0, 5)
				.map((cs) => ({
					controlName: String(cs.controlName ?? ''),
					maxScore: typeof cs.maxScore === 'number' ? cs.maxScore : 0,
					description: String(cs.description ?? ''),
				}));

			secureScore = {
				currentScore: current,
				maxScore: max,
				pct: max > 0 ? Math.round((current / max) * 100) : 0,
				byCategory,
				topMissedControls,
			};
		}
	}

	// ── Governance: BPA ──────────────────────────────────────────────
	let bpaFailingCount = 0;
	let bpaFailingItems: BpaFailingItem[] = [];

	if (s10.ok) {
		const allBpa = toArray(s10.data);
		const failingBpa = allBpa.filter((item) => {
			const score = item.Score ?? item.score;
			if (score === 0 || score === '0') return true;
			const passed = item.Passed ?? item.passed;
			if (passed === false || passed === 'false') return true;
			return false;
		});
		bpaFailingCount = failingBpa.length;
		bpaFailingItems = failingBpa.slice(0, 10).map((item) => ({
			report: item.Report ?? item.report ?? item.PolicyName ?? item.policyName,
			question: item.Question ?? item.question ?? item.CheckName ?? item.checkName,
			value: item.Value ?? item.value ?? item.CurrentValue ?? item.currentValue,
			tenant: item.Tenant ?? item.tenant,
		}));
	}

	// ── Governance: Drift ────────────────────────────────────────────
	let driftCount = 0;
	if (s11.ok) {
		driftCount = toArray(s11.data).length;
	}

	// ── Apps: OAuth consent policy ─────────────────────────────────
	let userConsentEnabled = false;
	let consentPolicies: string[] = [];

	if (s12.ok) {
		const policyObj = toArray(s12.data)[0] as IDataObject | undefined;
		if (policyObj) {
			const policyIds = (policyObj.permissionGrantPolicyIdsAssignedToDefaultUserRole ?? []) as unknown[];
			consentPolicies = Array.isArray(policyIds)
				? policyIds.filter((p): p is string => typeof p === 'string')
				: [];
			// Non-empty array means users can consent to OAuth apps without admin approval
			userConsentEnabled = consentPolicies.length > 0;
		}
	}

	// ── Access: Global Administrator count ─────────────────────────
	let globalAdminCount = 0;
	let globalAdminUpns: string[] = [];

	if (s13.ok) {
		const roleItems = toArray(s13.data);
		// Each item is a role object with DisplayName (string) and Members[] (nested array).
		// Global Administrator roleTemplateId is fixed across all tenants.
		const GA_TEMPLATE_ID = '62e90394-69f5-4237-9190-012177145e10';
		const gaRole = roleItems.find(
			(r) =>
				r.roleTemplateId === GA_TEMPLATE_ID ||
				String(r.DisplayName ?? r.displayName ?? '').toLowerCase() === 'global administrator',
		);
		const gaMembers = Array.isArray(gaRole?.Members) ? (gaRole.Members as IDataObject[]) : [];
		globalAdminCount = gaMembers.length;
		globalAdminUpns = gaMembers
			.map((m) => String(m.userPrincipalName ?? m.UserPrincipalName ?? ''))
			.filter(Boolean);
	}

	// ── Device: Intune compliance policies ──────────────
	let hasCompliancePolicies = false;
	let compliancePoliciesCount = 0;

	if (s14.ok) {
		compliancePoliciesCount = toArray(s14.data).length;
		hasCompliancePolicies = compliancePoliciesCount > 0;
	}

	// ── Data: SharePoint sharing ─────────────────
	let sharingLevel: string | null = null;

	if (s15.ok) {
		const spSettings = toArray(s15.data)[0] as IDataObject | undefined;
		if (spSettings) {
			const raw = spSettings.SharingCapability ??
				spSettings.sharingCapability ??
				spSettings.ExternalSharingCapability ??
				spSettings.externalSharingCapability;
			if (typeof raw === 'string') {
				sharingLevel = raw;
			} else if (typeof raw === 'number') {
				// Numeric enum: 0=Disabled, 1=ExistingExternalUserSharingOnly, 2=ExternalUserSharingOnly, 3=ExternalUserAndGuestSharing
				const sharingMap: Record<number, string> = {
					0: 'Disabled',
					1: 'ExistingExternalUserSharingOnly',
					2: 'ExternalUserSharingOnly',
					3: 'ExternalUserAndGuestSharing',
				};
				sharingLevel = sharingMap[raw as number] ?? String(raw);
			}
		}
	}

	// ── Gap Rules ────────────────────────────────────────────────────
	const gaps: string[] = [];

	// Identity
	if (!s1.ok) {
		gaps.push('MFA posture unavailable (step failed)');
	} else if (evaluatedUserCount === 0) {
		gaps.push('No active users found — tenant may be empty');
	} else {
		if (adminMfaGaps.length > 0) {
			gaps.push(`${adminMfaGaps.length} admin(s) without MFA: ${adminMfaGaps.join(', ')}`);
		}
		if (withoutMfaCount > 0) {
			gaps.push(
				`${withoutMfaCount} user(s) without MFA registered` +
				(withoutMfaCount > 25 ? ' (showing first 25 UPNs)' : ''),
			);
		}
	}
	if (!s2.ok) {
		gaps.push('Basic authentication posture unavailable (step failed)');
	} else if (basicAuthIsEnabled) {
		const protoStr = detectedBasicAuthProtocols.length > 0
			? `protocols: ${detectedBasicAuthProtocols.join(', ')}`
			: 'see step data for protocol details';
		gaps.push(`Basic authentication enabled (${protoStr})`);
	}

	// Access
	if (!s3.ok) {
		gaps.push('Conditional Access posture unavailable (step failed)');
	} else if (totalCaPolicies === 0) {
		gaps.push('No Conditional Access policies found');
	} else {
		if (!detectedMfaRequirementPolicy) {
			const reportNote = reportOnlyCaPoliciesCount > 0
				? ` (${reportOnlyCaPoliciesCount} report-only policy/policies exist — enforce to activate)`
				: '';
			gaps.push(`No enabled Conditional Access policy requiring MFA found${reportNote}`);
		}
		if (!detectedLegacyAuthBlockPolicy) {
			gaps.push('No enabled Conditional Access policy blocking legacy authentication found');
		}
	}

	// Endpoint
	if (defenderStatus === 'PartiallyActive') {
		gaps.push(
			`Microsoft Defender partially deployed: ${defenderOnboardedCount}/${defenderDeviceCount} devices onboarded (${defenderOnboardedPct}%)`,
		);
	} else if (defenderStatus === 'Inactive') {
		gaps.push('Microsoft Defender not deployed (no managed devices found)');
	} else if (defenderStatus === 'Unknown') {
		gaps.push('Defender status unavailable (step failed)');
	}

	// Email — report each source independently so a partial outage is not mistaken for absent policy.
	if (!s5.ok) gaps.push('Anti-phishing policy posture unavailable (step failed)');
	else if (!hasAntiPhishingPolicy) gaps.push('No anti-phishing policy configured');
	if (!s6.ok) gaps.push('Safe Attachments policy posture unavailable (step failed)');
	else if (!hasSafeAttachments) gaps.push('No Safe Attachments policy configured (requires Defender for Office 365)');
	if (!s7.ok) gaps.push('Safe Links policy posture unavailable (step failed)');
	else if (!hasSafeLinks) gaps.push('No Safe Links policy configured (requires Defender for Office 365)');

	// DNS — only emit domain gaps when analyser returned data
	if (s8.ok && domainsTotal > 0) {
		if (domainsWithDmarc < domainsTotal) {
			gaps.push(`${domainsTotal - domainsWithDmarc} domain(s) without enforced DMARC policy`);
		}
		if (domainsWithDkim < domainsTotal) {
			gaps.push(`${domainsTotal - domainsWithDkim} domain(s) without DKIM configured`);
		}
		if (domainsWithSpfHardFail < domainsTotal) {
			gaps.push(`${domainsTotal - domainsWithSpfHardFail} domain(s) without SPF hard-fail (-all)`);
		}
	}

	// Governance
	if (s10.ok && bpaFailingCount > 0) {
		const preview = bpaFailingItems
			.slice(0, 3)
			.map((i) => `${String(i.report ?? '')}: ${String(i.question ?? '')}`)
			.filter(Boolean)
			.join('; ');
		const more = bpaFailingCount > 3 ? ` (+ ${bpaFailingCount - 3} more)` : '';
		gaps.push(`${bpaFailingCount} BPA check(s) failing: ${preview}${more}`);
	}
	if (s11.ok && driftCount > 0) {
		gaps.push(`${driftCount} tenant standard(s) in drift — review Standards page in CIPP`);
	}

	// Apps: OAuth user consent
	if (s12.ok && userConsentEnabled) {
		gaps.push(
			'User consent for OAuth apps is enabled — users can grant third-party app access to their data without admin approval',
		);
	}

	// Access: Global Admins
	if (s13.ok && globalAdminCount > 5) {
		gaps.push(`${globalAdminCount} Global Administrator accounts found (Microsoft recommends 2–5 for most tenants)`);
	}

	// Device: Compliance policies
	if (s14.ok && !hasCompliancePolicies) {
		gaps.push('No Intune compliance policies configured — device compliance state is unknown for this tenant');
	}

	// Data: SharePoint sharing
	if (s15.ok && sharingLevel === 'ExternalUserAndGuestSharing') {
		gaps.push(
			'SharePoint external sharing allows Anyone links — unauthenticated access to tenant content is possible',
		);
	}

	return {
		composite: 'securityPosture',
		tenantFilter,
		steps,
		result: {
			secureScore,
			indicators: {
				identity: {
					mfaCoveredPct,
					usersEvaluated,
					usersWithoutMfa,
					usersWithoutMfaTotal,
					adminGaps,
					basicAuthEnabled,
					basicAuthProtocols,
				},
				access: {
					caPoliciesCount,
					caPoliciesEnabledCount,
					caPoliciesReportOnlyCount,
					hasMfaRequirementPolicy,
					hasLegacyAuthBlockPolicy,
					userConsentEnabled,
					consentPolicies,
					globalAdminCount,
					globalAdminUpns,
				},
				endpoint: {
					defenderStatus,
					defenderOnboardedPct,
					defenderOnboardedCount,
					defenderDeviceCount,
					hasCompliancePolicies,
					compliancePoliciesCount,
				},
				email: {
					hasAntiPhishingPolicy,
					hasSafeAttachments,
					hasSafeLinks,
					domainsTotal,
					domainsWithDmarc,
					domainsWithDkim,
					domainsWithSpfHardFail,
				},
				governance: {
					bpaFailingCount,
					bpaFailingItems,
					driftCount,
				},
				data: {
					sharingLevel,
				},
			},
			gaps,
		},
	};
}

async function becInvestigation(
	ctx: IExecuteFunctions,
	tenantFilter: string,
	params: Record<string, unknown>,
	failMode: 'fast' | 'bestEffort',
): Promise<CompositeResult> {
	const userId = params.userId as string | undefined;
	const days = typeof params.days === 'number' ? params.days : 30;
	const steps: StepResult[] = [];

	// Step 1: Sign-ins (tenant-wide; filtered client-side when userId provided)
	const s1 = await apiStep(ctx, 'user.listSignIns', 'GET', '/api/ListSignIns', {
		tenantFilter,
		Days: days,
	});
	steps.push(s1);
	failFast(s1, failMode);

	// Step 2: Mailbox rules — per-user when userId provided, tenant-wide (live pull) otherwise.
	// /api/ListUserMailboxRules requires UserID; /api/ListMailboxRules needs UseReportDB=true for live data.
	const s2 = userId
		? await apiStep(ctx, 'user.listUserMailboxRules', 'GET', '/api/ListUserMailboxRules', { tenantFilter, UserID: userId })
		: await apiStep(ctx, 'mailbox.listMailboxRules', 'GET', '/api/ListMailboxRules', { tenantFilter, UseReportDB: 'true' });
	steps.push(s2);
	failFast(s2, failMode);

	// Step 2b: SMTP-level mailbox forwarding — separate from inbox rules.
	// ForwardingSmtpAddress set via Set-Mailbox is invisible to inbox rule inspection.
	// Best-effort: tenants without appropriate permissions return 403/empty.
	const s2b = await apiStep(ctx, 'mailbox.listMailboxForwarding', 'GET', '/api/ListMailboxForwarding', {
		tenantFilter,
		UseReportDB: 'true',
	});
	steps.push(s2b);

	// Step 3: OAuth apps
	const s3 = await apiStep(ctx, 'tenant.listOAuthApps', 'GET', '/api/ListOAuthApps', { tenantFilter });
	steps.push(s3);
	failFast(s3, failMode);
	failIfAllRootStepsFailed('becInvestigation', [s1, s2, s3]);

	// Step 4: BEC check — only when userId provided; registry param is 'userid' (all lowercase)
	let s4: StepResult | null = null;
	if (userId) {
		s4 = await apiStep(ctx, 'user.execBecCheck', 'GET', '/api/ExecBECCheck', {
			tenantFilter,
			userid: userId,
		});
		steps.push(s4);
	}

	// s5: Identity Protection risky users — best-effort; requires AAD P1/P2 licensing
	// 403 = no Identity Protection license — fails gracefully
	const s5 = await apiStep(ctx, 'security.riskyUsers', 'GET', '/api/ListGraphRequest', {
		tenantFilter,
		Endpoint: 'identityProtection/riskyUsers',
		graphFilter: "riskState eq 'atRisk' or riskState eq 'confirmedCompromised'",
	});
	steps.push(s5);

	// s6: MDO security alerts — best-effort; requires Defender for Office 365 licensing
	// 403 = no MDO license — fails gracefully
	const s6 = await apiStep(ctx, 'security.mdoAlerts', 'GET', '/api/ExecMdoAlertsList', { tenantFilter });
	steps.push(s6);

	// Shape results
	let signIns = toArray(s1.data);
	if (userId) {
		signIns = signIns.filter(
			(s) => s.userId === userId || s.userPrincipalName === userId,
		);
	}
	const suspiciousSignIns = signIns.filter((s) => {
		const errorCode = (s.status as IDataObject)?.errorCode;
		return s.riskState === 'atRisk' || s.riskDetail !== 'none' || (typeof errorCode === 'number' && errorCode !== 0);
	});

	const mailboxRules = toArray(s2.data);
	// Only consider enabled rules; ForwardTo/ForwardAsAttachmentTo/RedirectTo are top-level fields
	// (not nested under r.Actions). A field is active when it is a non-empty array.
	const forwardingTypes = ['ForwardTo', 'ForwardAsAttachmentTo', 'RedirectTo'] as const;
	type ForwardingType = (typeof forwardingTypes)[number];

	type ShapedForwardingRule = {
		name: unknown;
		enabled: unknown;
		mailboxOwner: unknown;
		forwardingTypes: ForwardingType[];
		externalTargets: string[];
	};

	const externalForwardingRules: ShapedForwardingRule[] = [];
	// tenantFilter must be a primary SMTP domain (not a GUID) for external-domain filtering to be meaningful.
	const tenantDomain =
		typeof tenantFilter === 'string' && tenantFilter.includes('.')
			? tenantFilter.toLowerCase()
			: '';

	for (const r of mailboxRules) {
		if (r.Enabled === false) continue;

		const allExternalTargets: string[] = [];
		const activeTypes: ForwardingType[] = [];

		for (const fwdType of forwardingTypes) {
			const addrs = r[fwdType];
			if (!Array.isArray(addrs) || addrs.length === 0) continue;
			const emails = extractEmails(addrs);
			const external = tenantDomain
				? emails.filter((e) => !e.toLowerCase().endsWith('@' + tenantDomain))
				: emails;
			if (external.length > 0) {
				allExternalTargets.push(...external);
				activeTypes.push(fwdType);
			}
		}

		if (allExternalTargets.length > 0) {
			externalForwardingRules.push({
				name: r.Name,
				enabled: r.Enabled,
				mailboxOwner: r.UserPrincipalName ?? r.MailboxOwnerId,
				forwardingTypes: activeTypes,
				externalTargets: allExternalTargets,
			});
		}
	}

	// Parse s2b — SMTP-level forwarding configured directly on mailbox objects
	type SmtpForwardingEntry = {
		displayName: unknown;
		userPrincipalName: unknown;
		forwardingSmtpAddress: string;
		deliverToMailboxAndForward: unknown;
	};
	const smtpForwardingRules: SmtpForwardingEntry[] = [];
	if (s2b.ok) {
		const fwdItems = toArray(s2b.data);
		for (const item of fwdItems) {
			// Field name varies — try known variants
			const fwdAddr = (item.ForwardingSmtpAddress ?? item.forwardingSmtpAddress ?? item.ForwardingAddress ?? item.forwardingAddress ?? '') as string;
			if (!fwdAddr) continue;
			// Filter to external only when tenantDomain is known
			if (tenantDomain && fwdAddr.toLowerCase().includes('@' + tenantDomain)) continue;
			smtpForwardingRules.push({
				displayName: item.DisplayName ?? item.displayName,
				userPrincipalName: item.UserPrincipalName ?? item.userPrincipalName,
				forwardingSmtpAddress: fwdAddr,
				deliverToMailboxAndForward: item.DeliverToMailboxAndForward ?? item.deliverToMailboxAndForward,
			});
		}
	}

	// Parse s5 — Identity Protection risky users
	type RiskyUser = {
		id: unknown;
		userPrincipalName: unknown;
		riskLevel: unknown;
		riskState: unknown;
		riskDetail: unknown;
	};
	const riskyUsers: RiskyUser[] = [];
	if (s5.ok) {
		const rawRiskyUsers = toArray(s5.data);
		for (const u of rawRiskyUsers) {
			riskyUsers.push({
				id: u.id,
				userPrincipalName: u.userPrincipalName,
				riskLevel: u.riskLevel,
				riskState: u.riskState,
				riskDetail: u.riskDetail,
			});
		}
	}
	const riskyUsersCount = riskyUsers.length;
	const atRiskCount = riskyUsers.filter((u) => u.riskState === 'atRisk').length;
	const confirmedCompromisedCount = riskyUsers.filter((u) => u.riskState === 'confirmedCompromised').length;

	// Parse s6 — MDO security alerts filtered to BEC/phishing-relevant signals
	const BEC_ALERT_KEYWORDS = ['bec', 'phish', 'forward', 'suspicious inbox', 'impossible travel', 'mass download', 'oauth'];
	type MdoAlert = {
		title: unknown;
		severity: unknown;
		category: unknown;
		status: unknown;
		createdDateTime: unknown;
	};
	const mdoAlerts: MdoAlert[] = [];
	if (s6.ok) {
		const rawAlerts = toArray(s6.data);
		const relevant = rawAlerts.filter((a) => {
			const title = String(a.Title ?? a.title ?? a.AlertName ?? a.alertName ?? '').toLowerCase();
			const category = String(a.Category ?? a.category ?? '').toLowerCase();
			return BEC_ALERT_KEYWORDS.some((kw) => title.includes(kw) || category.includes(kw));
		});
		for (const a of relevant.slice(0, 10)) {
			mdoAlerts.push({
				title: a.Title ?? a.title ?? a.AlertName ?? a.alertName,
				severity: a.Severity ?? a.severity,
				category: a.Category ?? a.category,
				status: a.Status ?? a.status,
				createdDateTime: a.CreatedDateTime ?? a.createdDateTime ?? a.EventDateTime ?? a.eventDateTime,
			});
		}
	}
	const mdoAlertsCount = mdoAlerts.length;

	const oauthApps = toArray(s3.data);
	const HIGH_RISK_SCOPES = new Set([
		'Mail.ReadWrite', 'MailboxSettings.ReadWrite', 'Mail.Send',
		'Contacts.ReadWrite', 'full_access_as_user', 'Calendars.ReadWrite',
	]);
	const suspiciousOAuthApps = oauthApps.filter((a) => {
		if (a.riskLevel === 'high' || a.consentType === 'AllPrincipals') return true;
		const perms = (a.permissions ?? a.Permissions ?? a.scopes ?? a.Scopes ?? []) as unknown[];
		return Array.isArray(perms) && perms.some((p) => typeof p === 'string' && HIGH_RISK_SCOPES.has(p));
	});

	// Risk score: additive based on findings
	let riskScore = 0;
	riskScore += Math.min(40, suspiciousSignIns.length * 10);
	riskScore += Math.min(30, (externalForwardingRules.length + smtpForwardingRules.length) * 15);
	riskScore += Math.min(20, suspiciousOAuthApps.length * 5);
	riskScore += Math.min(20, atRiskCount * 8);
	riskScore += Math.min(30, confirmedCompromisedCount * 15);
	if (s4?.ok && s4.data) riskScore = Math.min(100, riskScore + 10);
	riskScore = Math.min(100, riskScore);

	const result: IDataObject = {
		riskScore,
		suspiciousSignIns,
		externalForwardingRules,
		smtpForwardingRules,
		suspiciousOAuthApps,
		riskyUsersCount,
		riskyUsers,
		mdoAlertsCount,
		mdoAlerts,
		knownLimitations: [
			'Hidden inbox rules (created with -Hidden flag in EXO PowerShell) are not accessible via CIPP API or Microsoft Graph. Run Get-InboxRule -IncludeHidden in EXO PowerShell for complete rule inventory.',
		],
	};
	if (s4 !== null) {
		result.becCheckResult = s4.ok ? (s4.data as IDataObject) : null;
	}

	return { composite: 'becInvestigation', tenantFilter, steps, result };
}

async function user360(
	ctx: IExecuteFunctions,
	tenantFilter: string,
	params: Record<string, unknown>,
	failMode: 'fast' | 'bestEffort',
): Promise<CompositeResult> {
	const userId = params.userId as string;
	if (!userId) {
		throw new CompositeStepError('user360.validation', 'Required parameter userId is missing');
	}
	const steps: StepResult[] = [];

	// Step 1: User profile — registry param UserID (capital I)
	const s1 = await apiStep(ctx, 'user.listUsers', 'GET', '/api/ListUsers', {
		tenantFilter,
		UserID: userId,
	});
	steps.push(s1);
	requireRootStep(s1);

	// Step 2: Group memberships — registry param userId (lowercase i)
	const s2 = await apiStep(ctx, 'user.listUserGroups', 'GET', '/api/ListUserGroups', {
		tenantFilter,
		userId,
	});
	steps.push(s2);
	failFast(s2, failMode);

	// Step 3: Devices — registry param UserID (capital I)
	const s3 = await apiStep(ctx, 'user.listUserDevices', 'GET', '/api/ListUserDevices', {
		tenantFilter,
		UserID: userId,
	});
	steps.push(s3);
	failFast(s3, failMode);

	// Step 4: Mailbox details — registry param UserID (capital I)
	const s4 = await apiStep(ctx, 'user.listUserMailboxDetails', 'GET', '/api/ListUserMailboxDetails', {
		tenantFilter,
		UserID: userId,
	});
	steps.push(s4);
	failFast(s4, failMode);

	// Step 5: Per-user MFA — registry param userId (lowercase i)
	const s5 = await apiStep(ctx, 'user.listPerUserMfa', 'GET', '/api/ListPerUserMFA', {
		tenantFilter,
		userId,
	});
	steps.push(s5);
	failFast(s5, failMode);

	// Step 6: Sign-in logs — registry params UserID (capital I), top hardcoded to 10
	const s6 = await apiStep(ctx, 'user.listUserSigninLogs', 'GET', '/api/ListUserSigninLogs', {
		tenantFilter,
		UserID: userId,
		top: 10,
	});
	steps.push(s6);

	const userArr = toArray(s1.data);

	return {
		composite: 'user360',
		tenantFilter,
		steps,
		result: {
			user: s1.ok ? (userArr[0] ?? null) : null,
			groups: s2.ok ? toArray(s2.data) : null,
			devices: s3.ok ? toArray(s3.data) : null,
			mailbox: s4.ok ? (toArray(s4.data)[0] ?? null) : null,
			mfa: s5.ok ? (toArray(s5.data)[0] ?? null) : null,
			recentSignIns: s6.ok ? toArray(s6.data) : null,
		},
	};
}

async function crossTenantSweep(
	ctx: IExecuteFunctions,
	params: Record<string, unknown>,
	failMode: 'fast' | 'bestEffort',
): Promise<CompositeResult> {
	const composite = params.composite as string;
	const tenantIdsRaw = params.tenantIds as string | string[] | undefined;
	// Support comma-separated string (from UI) or array (from AI Tools path)
	const tenantIds: string[] =
		typeof tenantIdsRaw === 'string'
			? tenantIdsRaw.split(',').map((s) => s.trim()).filter(Boolean)
			: Array.isArray(tenantIdsRaw)
			? tenantIdsRaw
			: [];
	const maxTenants = normalizeMaxTenants(params.maxTenants);

	const steps: StepResult[] = [];

	// Fetch tenant list
	let allTenants: ITenant[] = [];
	try {
		allTenants = await getTenantList.call(ctx);
		steps.push({ step: 'tenant.getAll', ok: true, count: allTenants.length });
	} catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		steps.push({ step: 'tenant.getAll', ok: false, error: msg });
		throw new CompositeStepError('tenant.getAll', `tenant.getAll: ${msg}`);
	}

	// Filter and cap
	let tenants = tenantIds.length > 0
		? allTenants.filter(
				(t) =>
					tenantIds.includes(t.customerId) ||
					(t.defaultDomainName !== undefined && tenantIds.includes(t.defaultDomainName)),
			)
		: allTenants;
	tenants = tenants.slice(0, maxTenants);

	const results: Record<string, unknown> = {};
	const errors: Record<string, string> = {};

	for (const tenant of tenants) {
		const tenantId = tenant.defaultDomainName ?? tenant.customerId;
		try {
			const subResult = await executeCompositeInternal(ctx, composite, tenantId, {}, failMode, true);
			results[tenantId] = subResult.result;
			// Tag sub-steps with the tenant domain for traceability
			for (const s of subResult.steps) {
				steps.push({ ...s, step: `${tenantId}:${s.step}` });
			}
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			errors[tenantId] = msg;
		}
	}

	return {
		composite: 'crossTenantSweep',
		tenantFilter: '',
		steps,
		result: {
			tenantsScanned: tenants.length,
			tenantsErrored: Object.keys(errors).length,
			results,
			errors,
		},
	};
}

/**
 * Applies the sweep default and hard cap while rejecting values whose slice
 * semantics could expand the requested tenant scope (for example -1).
 */
export function normalizeMaxTenants(value: unknown): number {
	if (value === undefined) return 20;
	if (
		typeof value !== 'number' ||
		!Number.isFinite(value) ||
		!Number.isInteger(value) ||
		value <= 0
	) {
		throw new Error('maxTenants must be a positive integer');
	}
	return Math.min(value, 50);
}

// ── Internal dispatch (bypasses JSON wrapping — used by crossTenantSweep) ──

async function executeCompositeInternal(
	ctx: IExecuteFunctions,
	operation: string,
	tenantFilter: string,
	params: Record<string, unknown>,
	failMode: 'fast' | 'bestEffort',
	insideSweep: boolean,
): Promise<CompositeResult> {
	if (insideSweep && operation === 'crossTenantSweep') {
		throw new Error('Recursive crossTenantSweep is not allowed');
	}
	if (insideSweep && operation === 'user360') {
		throw new Error('user360 cannot be used as a crossTenantSweep sub-composite');
	}
	switch (operation) {
		case 'licenseAudit':
			return licenseAudit(ctx, tenantFilter, params, failMode);
		case 'securityPosture':
			return securityPosture(ctx, tenantFilter, params, failMode);
		case 'becInvestigation':
			return becInvestigation(ctx, tenantFilter, params, failMode);
		case 'user360':
			return user360(ctx, tenantFilter, params, failMode);
		case 'crossTenantSweep':
			return crossTenantSweep(ctx, params, failMode);
		default:
			throw new Error(`Unknown composite operation: ${operation}`);
	}
}

// ── Public entry point ───────────────────────────────────────────────

/**
 * Execute a composite workflow operation.
 * Returns JSON string compatible with executeAiTool return type.
 * Called from tool-executor.ts (AI Tools path) and actions/workflows.ts (standard node path).
 */
export async function executeComposite(
	context: CompositeContext,
	resource: string,
	operation: string,
	tenantFilter: string,
	params: Record<string, unknown>,
	failMode: 'fast' | 'bestEffort',
): Promise<string> {
	const ctx = context as unknown as IExecuteFunctions;
	try {
		const compositeResult = await executeCompositeInternal(
			ctx,
			operation,
			tenantFilter,
			params,
			failMode,
			false,
		);
		// Strip raw .data from every step — keep only metadata (step, ok, count, error)
		// to keep composite output compact. The composite's `result` already carries the
		// processed/summarised output; `steps[]` is for LLM transparency into partial failures,
		// not a place to echo back raw API payloads (which can reach 2MB+ for large tenants).
		const slimSteps = compositeResult.steps.map(({ step, ok, count, error }) => ({
			step,
			ok,
			...(count !== undefined && { count }),
			...(error !== undefined && { error }),
		}));
		const resultWithSteps: Record<string, unknown> = {
			...(compositeResult.result !== null && typeof compositeResult.result === 'object'
				? (compositeResult.result as Record<string, unknown>)
				: { data: compositeResult.result }),
			steps: slimSteps,
		};
		return JSON.stringify(wrapSuccess(resource, operation, resultWithSteps));
	} catch (error) {
		if (error instanceof CompositeStepError) {
			return JSON.stringify(
				wrapError(resource, operation, ERROR_TYPES.API_ERROR, error.message, 'retry', {
					step: error.step,
				}),
			);
		}
		const msg = error instanceof Error ? error.message : String(error);
		return JSON.stringify(
			wrapError(resource, operation, ERROR_TYPES.API_ERROR, msg, 'Check parameters and retry.'),
		);
	}
}
