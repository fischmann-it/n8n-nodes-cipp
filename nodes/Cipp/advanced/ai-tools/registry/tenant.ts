import type { IDataObject } from 'n8n-workflow';
import type { ResourceConfig } from './types';
import { P, TENANT } from './types';
import { applyOutputMode } from '../../actions/helpers/secureScoreTransform';

export const resourceConfig: ResourceConfig = {
	label: 'Tenant',
	description: 'List, manage, onboard/offboard tenants, licenses, and service health',
	operations: {
		getAll: {
			method: 'POST',
			endpoint: '/api/ListTenants',
			isWrite: false,
			isList: true,
			tenant: TENANT.none,
			params: {
				AllTenantSelector: P.qsBool('Include all tenants'),
			},
			description: 'List all tenants',
		},
		clearCache: {
			method: 'POST',
			endpoint: '/api/ListTenants',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				TenantsOnly: P.bodyBool('Clear tenant cache only'),
			},
			defaults: { body: { ClearCache: 'true' } },
			description: 'Clear tenant cache',
		},
		getLicenses: {
			method: 'GET',
			endpoint: '/api/ListLicenses',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {},
			description: 'List licenses for a tenant',
		},
		getCspLicenses: {
			method: 'GET',
			endpoint: '/api/ListCSPLicenses',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {},
			description: 'List CSP licenses for a tenant',
		},
		cspLicenseAction: {
			method: 'POST',
			endpoint: '/api/ExecCSPLicense',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				SKU: P.body('License SKU', true),
				Quantity: P.bodyNum('Quantity', true),
				Action: P.body('Action', true),
			},
			description: 'Perform a CSP license action (add/remove)',
		},
		listDefenderState: {
			method: 'GET',
			endpoint: '/api/ListDefenderState',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {},
			description: 'List Defender state for a tenant',
		},
		listCspSkus: {
			method: 'GET',
			endpoint: '/api/ListCSPsku',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {},
			description: 'List CSP SKUs for a tenant',
		},
		getDetails: {
			method: 'GET',
			endpoint: '/api/ListTenantDetails',
			isWrite: false,
			isList: false,
			tenant: TENANT.qs,
			params: {},
			description: 'Get detailed information about a tenant',
		},
		edit: {
			method: 'POST',
			endpoint: '/api/EditTenant',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				customerId: P.body('Customer ID', true),
				tenantAlias: P.body('Alias'),
				tenantGroups: P.body('Groups'),
			},
			description: 'Edit tenant properties',
		},
		add: {
			method: 'POST',
			endpoint: '/api/AddTenant',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				TenantName: P.body('Tenant name'),
				CompanyName: P.body('Company name'),
				FirstName: P.body('First name'),
				LastName: P.body('Last name'),
				Email: P.body('Email'),
			},
			description: 'Add a new tenant',
		},
		addSpn: {
			method: 'GET',
			endpoint: '/api/ExecAddSPN',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {},
			description: 'Add a service principal name',
		},
		offboard: {
			method: 'PATCH',
			endpoint: '/api/ExecOffboardTenant',
			isWrite: true,
			isList: false,
			tenant: TENANT.bodyPascal,
			params: {
				config: P.bodyJson('Offboard config'),
			},
			description: 'Offboard a tenant (TenantFilter is JSON object)',
		},
		onboard: {
			method: 'POST',
			endpoint: '/api/ExecOnboardTenant',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				id: P.bodyJson('Tenant ID JSON'),
				gdapRoles: P.bodyJson('GDAP roles JSON'),
			},
			description: 'Onboard a new tenant',
		},
		updateSecureScore: {
			method: 'POST',
			endpoint: '/api/ExecUpdateSecureScore',
			isWrite: true,
			isList: false,
			tenant: TENANT.bodyPascal,
			params: {
				ControlName: P.body('Control name'),
				reason: P.body('Reason'),
				resolutionType: P.body('Resolution type'),
			},
			description: 'Update secure score for a tenant',
		},
		getSecureScore: {
			method: 'GET',
			endpoint: '/api/ListGraphRequest',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			defaults: { qs: { Endpoint: 'security/secureScores', '$top': 1 } },
			params: {
				'$top': P.qsNum(
					'Number of historical days to fetch. Meaningful for slim, averaged, and full modes only — ' +
					'other modes always use the latest entry. Default: 1.',
				),
				outputMode: P.localEnum(
					'Controls response size. Default: summary. ' +
					'Sizes relative to smallest (historyCount=1): ' +
					'categoryBreakdown (1x — scores grouped by Identity/Apps/Data/Device), ' +
					'summary (2x — top-level scores + comparative averages), ' +
					'implementationStatus (15x — per-control name/category/score/status), ' +
					'averaged (15x — single record averaged across $top days), ' +
					'slim (150x per entry, scales with $top — all controls minus descriptions), ' +
					'full (4000x per entry, scales with $top — complete raw response, use only when all detail needed).',
					['summary', 'categoryBreakdown', 'implementationStatus', 'averaged', 'slim', 'full'],
				),
				includeDescriptions: P.localBool(
					'Add verbose control descriptions to modes that strip them (slim/implementationStatus/averaged). ' +
					'Adds ~500 bytes per control (~35KB for latest entry). ' +
					'Ignored for summary/categoryBreakdown/full. Default: false.',
				),
			},
			description:
				'Get Microsoft Secure Score for a tenant. Default output: summary (~2KB — currentScore, maxScore, ' +
				'scorePercent, enabledServices, averageComparativeScores). Use outputMode to control detail level. ' +
				'Requires SecurityEvents.Read.All on the SAM app and Security Reader GDAP role.',
			transform: (results: IDataObject[], localParams: Record<string, unknown>) =>
				applyOutputMode(
					results,
					(localParams.outputMode as string) ?? 'summary',
					(localParams.includeDescriptions as boolean) ?? false,
				),
		},
		getSecureScoreControlProfiles: {
			method: 'GET',
			endpoint: '/api/ListGraphRequest',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			defaults: { qs: { Endpoint: 'security/secureScoreControlProfiles' } },
			params: {},
			description: 'Get Microsoft Secure Score control profiles for a tenant. Returns metadata for all ' +
				'available Secure Score controls: id, title, maxScore, category, remediation, and implementationCost. ' +
				'Use alongside getSecureScore to get the full picture of a tenant\'s security posture. ' +
				'Requires SecurityEvents.Read.All on the SAM app.',
		},
		listAppConsentRequests: {
			method: 'GET',
			endpoint: '/api/ListAppConsentRequests',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {
				Filter: P.qs('Filter'),
				RequestStatus: P.qs('Request status'),
			},
			description: 'List app consent requests for a tenant',
		},
		setAuthMethod: {
			method: 'POST',
			endpoint: '/api/SetAuthMethod',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				Id: P.body('Method ID'),
				GroupIds: P.body('Group IDs'),
				state: P.body('State'),
			},
			description: 'Set authentication method for a tenant',
		},
		editOffboardingDefaults: {
			method: 'POST',
			endpoint: '/api/EditTenantOffboardingDefaults',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				customerId: P.body('Customer ID', true),
			},
			description: 'Edit tenant offboarding defaults',
		},
		removeCapabilitiesCache: {
			method: 'GET',
			endpoint: '/api/RemoveTenantCapabilitiesCache',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				defaultDomainName: P.qs('Domain name'),
			},
			description: 'Remove tenant capabilities cache',
		},
		listOAuthApps: {
			method: 'GET',
			endpoint: '/api/ListOAuthApps',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {},
			description: 'List OAuth apps for a tenant',
		},
		listServiceHealth: {
			method: 'GET',
			endpoint: '/api/ListServiceHealth',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {
				displayName: P.qs('Service name'),
			},
			description: 'List service health for a tenant',
		},
		listTenantGroups: {
			method: 'POST',
			endpoint: '/api/ListTenantGroups',
			isWrite: false,
			isList: true,
			tenant: TENANT.none,
			params: {
				groupId: P.qs('Group ID'),
			},
			description: 'List tenant groups',
		},
		deleteTenantGroup: {
			method: 'DELETE',
			endpoint: '/api/ExecTenantGroup',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				groupId: P.body('Group ID', true),
			},
			description: 'Delete a tenant group',
		},
		runTenantGroupRule: {
			method: 'POST',
			endpoint: '/api/ExecRunTenantGroupRule',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				groupId: P.body('Group ID', true),
			},
			description: 'Run a tenant group rule',
		},
		excludeTenant: {
			method: 'POST',
			endpoint: '/api/ExecExcludeTenant',
			isWrite: true,
			isList: false,
			tenant: TENANT.qs,
			params: {
				value: P.body('Exclusion value'),
			},
			defaults: { qs: { AddExclusion: 'true' } },
			description: 'Exclude a tenant',
		},
		removeTenant: {
			method: 'POST',
			endpoint: '/api/ExecRemoveTenant',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				TenantID: P.body('Tenant ID', true),
			},
			description: 'Remove a tenant',
		},
		listTenantAllowBlockList: {
			method: 'GET',
			endpoint: '/api/ListTenantAllowBlockList',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {},
			description: 'List tenant allow/block list entries',
		},
		removeTenantAllowBlockList: {
			method: 'POST',
			endpoint: '/api/RemoveTenantAllowBlockList',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				Entries: P.body('Entries'),
				ListType: P.body('List type'),
			},
			description: 'Remove entries from tenant allow/block list',
		},
		listTenantOnboarding: {
			method: 'GET',
			endpoint: '/api/ListTenantOnboarding',
			isWrite: false,
			isList: true,
			tenant: TENANT.none,
			params: {
				id: P.qs('Onboarding ID'),
			},
			description: 'List tenant onboarding status',
		},
		getOffboardingJob: {
			method: 'GET',
			endpoint: '/api/CIPPOffboardingJob',
			isWrite: false,
			isList: false,
			tenant: TENANT.none,
			params: {},
			description: 'Get offboarding job status',
		},
		execAddTenant: {
			method: 'POST',
			endpoint: '/api/ExecAddTenant',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				accessToken: P.body('Access token'),
				defaultDomainName: P.body('Domain name'),
				tenantId: P.body('Tenant ID'),
			},
			description: 'Add a tenant via access token',
		},
		listDomains: {
			method: 'GET',
			endpoint: '/api/ListDomains',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {},
			description: 'List domains for a tenant',
		},
		addDomain: {
			method: 'POST',
			endpoint: '/api/AddDomain',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				domain: P.body('Domain name', true),
			},
			description: 'Add a domain to a tenant',
		},
		removeDomain: {
			method: 'DELETE',
			endpoint: '/api/ExecDomainAction',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				domain: P.body('Domain name', true),
				Action: P.body('Action', true),
			},
			description: 'Remove or act on a domain',
		},
		listAdminPortalLicenses: {
			method: 'GET',
			endpoint: '/api/ListAdminPortalLicenses',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {},
			description: 'List admin portal license information for a tenant',
		},
		runAccessChecks: {
			method: 'POST',
			endpoint: '/api/ExecAccessChecks',
			isWrite: false,
			isList: false,
			tenant: TENANT.bodyTenantIdPascal,
			params: {
				SkipCache: P.qs('Skip cached results (set to "true" for fresh checks)'),
				Type: P.qs('Type of access check to run'),
			},
			description: 'Run CIPP access checks for a tenant to validate permissions and connectivity',
		},
		listServicePrincipals: {
			method: 'GET',
			endpoint: '/api/ExecServicePrincipals',
			isWrite: false,
			isList: true,
			tenant: TENANT.none,
			params: {
				Action: P.qs('Service principal action'),
				AppId: P.qs('Application ID'),
				Id: P.qs('Service principal ID'),
				Select: P.qs('Graph $select projection'),
			},
			description: 'List and manage tenant service principals',
		},
	},
};
