// ai-tools/registry/workflows.ts
// Composite workflow operations — multi-step, AI-friendly MSP automation.
import type { ResourceConfig, CompositeOperationDef } from './types';
import { P, TENANT } from './types';

const licenseAudit: CompositeOperationDef = {
	isComposite: true,
	isWrite: false,
	isList: false,
	tenant: TENANT.qs,
	params: {
		inactiveDays: P.qsNum(
			'Days since last sign-in to classify a user as inactive. Default: 90. ' +
			'Used for the inactive accounts step.',
		),
		failMode: P.qsEnum(
			'Error handling: "fast" stops on first step failure; "bestEffort" continues and returns partial results.',
			['fast', 'bestEffort'],
		),
	},
	description:
		'LICENSE AUDIT — combines license inventory, disabled users holding licenses, and inactive ' +
		'accounts into a cost-saving report. Returns: summary (totalSeats, usedSeats, wastedSeats, ' +
		'estimatedMonthlySaving at $8/seat), disabledWithLicense[], inactive[], unusedSkus[]. ' +
		'Use to identify M365 license waste across a tenant.',
};

const securityPosture: CompositeOperationDef = {
	isComposite: true,
	isWrite: false,
	isList: false,
	tenant: TENANT.qs,
	params: {
		failMode: P.qsEnum(
			'Error handling: "fast" stops on first step failure; "bestEffort" continues and returns partial results.',
			['fast', 'bestEffort'],
		),
	},
	description:
		'SECURITY POSTURE — runs 15 CIPP checks and returns observable indicators plus a ' +
		'gaps[] array of plain-English findings (empty array on clean tenants, no numeric score). ' +
		'Returns: secureScore { currentScore, maxScore, pct, byCategory { [category]: { maxScore, currentScore } }, ' +
		'topMissedControls[5] { controlName, maxScore, description } } | null (Microsoft Secure Score; null if ' +
		'SecurityEvents.Read.All not granted or no data), ' +
		'indicators { identity { mfaCoveredPct, usersEvaluated, usersWithoutMfa[], ' +
		'usersWithoutMfaTotal, adminGaps[], basicAuthEnabled, basicAuthProtocols[] }, ' +
		'access { caPoliciesCount, caPoliciesEnabledCount, caPoliciesReportOnlyCount, ' +
		'hasMfaRequirementPolicy, hasLegacyAuthBlockPolicy, userConsentEnabled, consentPolicies[], ' +
		'globalAdminCount, globalAdminUpns[] }, ' +
		'endpoint { defenderStatus ("Active"|"PartiallyActive"|"Inactive"|"Unknown"), ' +
		'defenderOnboardedPct, defenderOnboardedCount, defenderDeviceCount, ' +
		'hasCompliancePolicies, compliancePoliciesCount }, ' +
		'email { hasAntiPhishingPolicy, hasSafeAttachments, hasSafeLinks, ' +
		'domainsTotal, domainsWithDmarc, domainsWithDkim, domainsWithSpfHardFail }, ' +
		'governance { bpaFailingCount, bpaFailingItems[10] { report, question, value, tenant }, driftCount }, ' +
		'data { sharingLevel } }, ' +
		'gaps[], steps[] { step, ok, count?, error? } (metadata only — no raw payloads). ' +
		'NOTE: Safe Attachments/Safe Links gaps expected on tenants without Defender for Office 365. ' +
		'Domain health gaps skipped if domain analyser not run. ' +
		'Risky users step requires AAD P1/P2. MDO alerts step requires Defender for Office 365. ' +
		'OAuth consent policy step requires Policy.Read.All on SAM app.',
};

const becInvestigation: CompositeOperationDef = {
	isComposite: true,
	isWrite: false,
	isList: false,
	tenant: TENANT.qs,
	params: {
		userId: P.qs(
			'User principal name or ID to scope the investigation. Optional — omit to run tenant-wide. ' +
			'When provided: sign-ins are filtered client-side; mailbox rules and BEC check target this user.',
		),
		days: P.qsNum(
			'Number of days of sign-in history to retrieve. Default: 30.',
		),
		failMode: P.qsEnum(
			'Error handling: "fast" stops on first step failure; "bestEffort" continues and returns partial results.',
			['fast', 'bestEffort'],
		),
	},
	description:
		'BEC INVESTIGATION — pulls sign-ins, mailbox forwarding rules, suspicious OAuth apps, ' +
		'and (if userId provided) runs a BEC check. Returns: riskScore (0–100), suspiciousSignIns[], ' +
		'externalForwardingRules[], suspiciousOAuthApps[], becCheckResult? (when userId provided). ' +
		'Sign-ins are fetched tenant-wide and filtered client-side when userId is given.',
};

const user360: CompositeOperationDef = {
	isComposite: true,
	isWrite: false,
	isList: false,
	tenant: TENANT.qs,
	params: {
		userId: P.qs(
			'User principal name or object ID to profile. Required.',
			true,
		),
		failMode: P.qsEnum(
			'Error handling: "fast" stops on first step failure; "bestEffort" continues and returns partial results.',
			['fast', 'bestEffort'],
		),
	},
	description:
		'USER 360 — aggregates user profile, group memberships, devices, mailbox details, MFA status, ' +
		'and last 10 sign-ins into a single object. Returns: user, groups[], devices[], mailbox, mfa, ' +
		'recentSignIns[]. Failed steps return null for that field (bestEffort mode).',
};

const crossTenantSweep: CompositeOperationDef = {
	isComposite: true,
	isWrite: false,
	isList: false,
	tenant: TENANT.none,
	params: {
		composite: P.qsEnum(
			'Which composite to run per tenant. "user360" is excluded (requires a per-user userId).',
			['licenseAudit', 'securityPosture', 'becInvestigation'],
			true,
		),
		tenantIds: P.qs(
			'Comma-separated list of tenant defaultDomainNames or customerIds to scope the sweep. ' +
			'Omit to sweep all tenants (capped by maxTenants).',
		),
		maxTenants: P.qsNum(
			'Maximum number of tenants to process. Default: 20. Hard cap: 50. ' +
			'Each tenant runs the sub-composite serially. 20 tenants × 4 calls = ~80 API calls.',
		),
		failMode: P.qsEnum(
			'Error handling within each tenant\'s sub-composite. Per-tenant errors are always captured; ' +
			'the sweep always continues across tenants regardless of this setting.',
			['fast', 'bestEffort'],
		),
	},
	description:
		'CROSS-TENANT SWEEP — runs licenseAudit, securityPosture, or becInvestigation across multiple ' +
		'(or all) tenants and aggregates results. Returns: tenantsScanned, tenantsErrored, ' +
		'results { [tenantDomain]: compositeResult }, errors { [tenantDomain]: errorMessage }. ' +
		'WARNING: 50 tenants × 4 calls = 200 API calls. Default maxTenants=20 keeps sweeps under ~80 calls.',
};

export const resourceConfig: ResourceConfig = {
	label: 'Workflow',
	description: 'Multi-step composite workflows: license audit, security posture, BEC investigation, user 360, cross-tenant sweep',
	operations: {
		licenseAudit,
		securityPosture,
		becInvestigation,
		user360,
		crossTenantSweep,
	},
};
