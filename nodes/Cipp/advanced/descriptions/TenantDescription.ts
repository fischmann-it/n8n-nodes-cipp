import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

export const tenantOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['tenant'],
			},
		},
		options: [
			{
				name: 'Add',
				value: 'add',
				description: 'Add a new tenant to CIPP',
				action: 'Add tenant',
			},
			{
				name: 'Add Domain',
				value: 'addDomain',
				description: 'Add a custom domain to a tenant',
				action: 'Add domain',
			},
			{
				name: 'Add SPN',
				value: 'addSpn',
				description: 'Add Service Principal Name for CIPP',
				action: 'Add SPN',
			},
			{
				name: 'Add Tenant (by Token)',
				value: 'execAddTenant',
				description: 'Add a tenant using access token and domain name',
				action: 'Add tenant by token',
			},
			{
				name: 'Clear Cache',
				value: 'clearCache',
				description: 'Clear the tenant cache in CIPP',
				action: 'Clear tenant cache',
			},
			{
				name: 'CSP License Action (Sherweb)',
				value: 'cspLicenseAction',
				description: 'Add or remove CSP licenses via Sherweb integration (requires Sherweb extension enabled and tenant mapped in CIPP)',
				action: 'Csp license action via sherweb',
			},
			{
				name: 'Delete Tenant Group',
				value: 'deleteTenantGroup',
				description: 'Delete a tenant group',
				action: 'Delete tenant group',
			},
			{
				name: 'Edit',
				value: 'edit',
				description: 'Edit tenant metadata (alias, groups)',
				action: 'Edit tenant',
			},
			{
				name: 'Edit Offboarding Defaults',
				value: 'editOffboardingDefaults',
				description: 'Edit default offboarding settings for a tenant',
				action: 'Edit offboarding defaults',
			},
			{
				name: 'Exclude Tenant',
				value: 'excludeTenant',
				description: 'Exclude a tenant from processing',
				action: 'Exclude tenant',
			},
			{
				name: 'Get CSP Licenses (Sherweb)',
				value: 'getCspLicenses',
				description: 'Get CSP license subscriptions via Sherweb integration (requires Sherweb extension enabled and tenant mapped in CIPP)',
				action: 'Get csp licenses via sherweb',
			},
			{
				name: 'Get Details',
				value: 'getDetails',
				description: 'Get detailed information about a specific tenant',
				action: 'Get tenant details',
			},
			{
				name: 'Get Licenses',
				value: 'getLicenses',
				description: 'Get license information and usage for a tenant',
				action: 'Get licenses',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get a list of many managed tenants',
				action: 'Get many tenants',
			},
			{
				name: 'Get Offboarding Job',
				value: 'getOffboardingJob',
				description: 'Check offboarding job status',
				action: 'Get offboarding job',
			},
			{
				name: 'Get Secure Score',
				value: 'getSecureScore',
				description: 'Retrieve Microsoft Secure Score data for a tenant',
				action: 'Get secure score',
			},
			{
				name: 'List Admin Portal Licenses',
				value: 'listAdminPortalLicenses',
				description: 'List admin portal license information for a tenant',
				action: 'List admin portal licenses',
			},
			{
				name: 'List App Consent Requests',
				value: 'listAppConsentRequests',
				description: 'List app consent requests for a tenant',
				action: 'List app consent requests',
			},
			{
				name: 'List CSP SKUs (Sherweb)',
				value: 'listCspSkus',
				description: 'List available CSP license SKU catalog via Sherweb integration (requires Sherweb extension enabled in CIPP)',
				action: 'List csp skus via sherweb',
			},
			{
				name: 'List Defender State',
				value: 'listDefenderState',
				description: 'Get Defender security posture for a tenant',
				action: 'List defender state',
			},
			{
				name: 'List Domains',
				value: 'listDomains',
				description: 'List all domains registered in a tenant',
				action: 'List domains',
			},
			{
				name: 'List OAuth Apps',
				value: 'listOAuthApps',
				description: 'List OAuth applications registered in a tenant',
				action: 'List oauth apps',
			},
			{
				name: 'List Service Health',
				value: 'listServiceHealth',
				description: 'List service health status for a tenant',
				action: 'List service health',
			},
			{
				name: 'List Service Principals',
				value: 'listServicePrincipals',
				description: 'List and manage tenant service principals',
				action: 'List service principals',
			},
			{
				name: 'List Tenant Allow/Block List',
				value: 'listTenantAllowBlockList',
				description: 'List tenant allow/block entries',
				action: 'List tenant allow block list',
			},
			{
				name: 'List Tenant Groups',
				value: 'listTenantGroups',
				description: 'List tenant groups configured in CIPP',
				action: 'List tenant groups',
			},
			{
				name: 'List Tenant Onboarding',
				value: 'listTenantOnboarding',
				description: 'List tenant onboarding status',
				action: 'List tenant onboarding',
			},
			{
				name: 'Offboard',
				value: 'offboard',
				description: 'Offboard a tenant from CIPP management',
				action: 'Offboard tenant',
			},
			{
				name: 'Onboard',
				value: 'onboard',
				description: 'Onboard a tenant into CIPP management',
				action: 'Onboard tenant',
			},
			{
				name: 'Remove Allow/Block Entry',
				value: 'removeTenantAllowBlockList',
				description: 'Remove an entry from the tenant allow/block list',
				action: 'Remove tenant allow block entry',
			},
			{
				name: 'Remove Capabilities Cache',
				value: 'removeCapabilitiesCache',
				description: 'Remove cached tenant capabilities data',
				action: 'Remove capabilities cache',
			},
			{
				name: 'Remove Domain',
				value: 'removeDomain',
				description: 'Execute a domain action (delete) on a tenant domain',
				action: 'Remove domain',
			},
			{
				name: 'Remove Tenant',
				value: 'removeTenant',
				description: 'Remove/delete a tenant from CIPP',
				action: 'Remove tenant',
			},
			{
				name: 'Run Access Checks',
				value: 'runAccessChecks',
				description: 'Run CIPP access checks for a tenant to validate permissions and connectivity',
				action: 'Run access checks',
			},
			{
				name: 'Run Tenant Group Rule',
				value: 'runTenantGroupRule',
				description: 'Execute tenant group dynamic rules immediately',
				action: 'Run tenant group rule',
			},
			{
				name: 'Set Auth Method',
				value: 'setAuthMethod',
				description: 'Set authentication method policy for a tenant',
				action: 'Set auth method',
			},
			{
				name: 'Update Secure Score',
				value: 'updateSecureScore',
				description: 'Update secure score control resolution for a tenant',
				action: 'Update secure score',
			},
		],
		default: 'getAll',
	},
];

export const tenantFields: INodeProperties[] = [
	// ── Tenant selector for tenant-specific operations ──
	tenantField('tenant', [
		'getLicenses', 'getCspLicenses', 'cspLicenseAction', 'listDefenderState', 'listCspSkus',
		'getDetails', 'updateSecureScore', 'getSecureScore', 'listAppConsentRequests', 'setAuthMethod',
		'listOAuthApps', 'listServiceHealth',
		'listDomains', 'addDomain', 'removeDomain',
		'excludeTenant', 'listTenantAllowBlockList', 'removeTenantAllowBlockList',
		'listAdminPortalLicenses', 'runAccessChecks',
	]),

	// ── Return All / Limit for list operations ──
	returnAllField('tenant', [
		'getAll', 'getLicenses', 'getCspLicenses', 'listDefenderState', 'listCspSkus',
		'listAppConsentRequests', 'listOAuthApps', 'listServiceHealth',
		'listDomains',
		'listTenantAllowBlockList', 'listTenantGroups', 'listTenantOnboarding',
		'listAdminPortalLicenses', 'listServicePrincipals',
	]),
	limitField('tenant', [
		'getAll', 'getLicenses', 'getCspLicenses', 'listDefenderState', 'listCspSkus',
		'listAppConsentRequests', 'listOAuthApps', 'listServiceHealth',
		'listDomains',
		'listTenantAllowBlockList', 'listTenantGroups', 'listTenantOnboarding',
		'listAdminPortalLicenses', 'listServicePrincipals',
	]),

	// ── Get Many options ──
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Include All Tenants Option',
				name: 'allTenantSelector',
				type: 'boolean',
				default: false,
				description: 'Whether to include the "All Tenants" option in the results',
			},
		],
	},
	{
		displayName: 'Output Mode',
		name: 'licenseOutputMode',
		type: 'options',
		options: [
			{ name: 'Full', value: 'full', description: 'Raw API response with all nested arrays' },
			{ name: 'Summary', value: 'mspSummary', description: 'Flattened output with computed metrics (no nested arrays)' },
		],
		default: 'full',
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['getLicenses'],
			},
		},
		description: 'Full returns the raw API response. Summary flattens the data and adds computed columns like UtilizationPct, RenewalUrgency, and AssignmentMethod.',
	},

	// ── Clear Cache ──
	{
		displayName: 'Clear Tenant Cache Only',
		name: 'clearCacheTenantOnly',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['clearCache'],
			},
		},
		default: false,
		description: 'Whether to only clear the tenant cache (not all caches)',
	},

	// ── CSP License Action ──
	{
		displayName: 'Action',
		name: 'cspAction',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['cspLicenseAction'],
			},
		},
		options: [
			{ name: 'Add Licenses', value: 'add' },
			{ name: 'Remove Licenses', value: 'remove' },
		],
		default: 'add',
		description: 'Whether to add or remove licenses',
	},
	{
		displayName: 'License SKU',
		name: 'licenseSku',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['cspLicenseAction'],
			},
		},
		default: '',
		placeholder: 'e.g. O365_BUSINESS_PREMIUM',
		description: 'The license SKU to add or remove',
	},
	{
		displayName: 'Quantity',
		name: 'licenseQuantity',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['cspLicenseAction'],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 1,
		description: 'Number of licenses to add or remove',
	},

	// ── Edit Tenant ──
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['edit'],
			},
		},
		default: '',
		description: 'The customer ID of the tenant to edit',
	},
	{
		displayName: 'Fields',
		name: 'editFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['edit'],
			},
		},
		options: [
			{
				displayName: 'Group ID',
				name: 'GroupId',
				type: 'string',
				default: '',
				description: 'Group ID to assign to the tenant',
			},
			{
				displayName: 'Tenant Alias',
				name: 'tenantAlias',
				type: 'string',
				default: '',
				description: 'Alias for the tenant',
			},
			{
				displayName: 'Tenant Groups',
				name: 'tenantGroups',
				type: 'string',
				default: '',
				description: 'Groups associated with the tenant',
			},
		],
	},

	// ── Add Tenant ──
	{
		displayName: 'Fields',
		name: 'addFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['add'],
			},
		},
		options: [
			{
				displayName: 'Action',
				name: 'Action',
				type: 'string',
				default: '',
				description: 'CIPP action type for the tenant add operation (e.g. create, invite)',
			},
			{
				displayName: 'Address Line 1',
				name: 'AddressLine1',
				type: 'string',
				default: '',
				description: 'Primary address line',
			},
			{
				displayName: 'Address Line 2',
				name: 'AddressLine2',
				type: 'string',
				default: '',
				description: 'Secondary address line',
			},
			{
				displayName: 'City',
				name: 'City',
				type: 'string',
				default: '',
				description: 'City of the tenant',
			},
			{
				displayName: 'Company Name',
				name: 'CompanyName',
				type: 'string',
				default: '',
				description: 'Company name for the tenant',
			},
			{
				displayName: 'Country',
				name: 'Country',
				type: 'string',
				default: '',
				description: 'Country of the tenant',
			},
			{
				displayName: 'Email',
				name: 'Email',
				type: 'string',
				default: '',
				placeholder: 'admin@contoso.com',
				description: 'Contact email address',
			},
			{
				displayName: 'First Name',
				name: 'FirstName',
				type: 'string',
				default: '',
				description: 'First name of the primary contact',
			},
			{
				displayName: 'Last Name',
				name: 'LastName',
				type: 'string',
				default: '',
				description: 'Last name of the primary contact',
			},
			{
				displayName: 'Phone Number',
				name: 'PhoneNumber',
				type: 'string',
				default: '',
				description: 'Contact phone number',
			},
			{
				displayName: 'Postal Code',
				name: 'PostalCode',
				type: 'string',
				default: '',
				description: 'Postal/ZIP code',
			},
			{
				displayName: 'State',
				name: 'State',
				type: 'string',
				default: '',
				description: 'State or province',
			},
			{
				displayName: 'Tenant Name',
				name: 'TenantName',
				type: 'string',
				default: '',
				description: 'Name of the tenant to add',
			},
		],
	},

	// ── Offboard Tenant ──
	{
		displayName: 'Tenant Filter (JSON)',
		name: 'offboardTenantFilter',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['offboard'],
			},
		},
		default: '',
		placeholder: '{"label": "Contoso", "value": "contoso.onmicrosoft.com"}',
		description: 'LabelValue JSON identifying the tenant to offboard',
	},
	{
		displayName: 'Options',
		name: 'offboardFields',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['offboard'],
			},
		},
		options: [
			{
				displayName: 'Remove CSP Guest Users',
				name: 'RemoveCSPGuestUsers',
				type: 'boolean',
				default: false,
				description: 'Whether to remove CSP guest users from the tenant',
			},
			{
				displayName: 'Remove CSP Notification Contacts',
				name: 'RemoveCSPnotificationContacts',
				type: 'boolean',
				default: false,
				description: 'Whether to remove CSP notification contacts',
			},
			{
				displayName: 'Remove Domain Analyser Data',
				name: 'RemoveDomainAnalyserData',
				type: 'boolean',
				default: false,
				description: 'Whether to remove domain analyser data',
			},
			{
				displayName: 'Remove Multitenant CSP Apps',
				name: 'RemoveMultitenantCSPApps',
				type: 'boolean',
				default: false,
				description: 'Whether to remove multitenant CSP applications',
			},
			{
				displayName: 'Terminate Contract',
				name: 'TerminateContract',
				type: 'boolean',
				default: false,
				description: 'Whether to terminate the CSP contract',
			},
			{
				displayName: 'Terminate GDAP',
				name: 'TerminateGDAP',
				type: 'boolean',
				default: false,
				description: 'Whether to terminate GDAP relationships',
			},
			{
				displayName: 'Vendor Applications (JSON)',
				name: 'vendorApplications',
				type: 'string',
				default: '',
				placeholder: '{"label": "App Name", "value": "appId"}',
				description: 'LabelValue JSON for vendor application to remove',
			},
		],
	},

	// ── Onboard Tenant ──
	{
		displayName: 'Fields',
		name: 'onboardFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['onboard'],
			},
		},
		options: [
			{
				displayName: 'Add Missing Groups',
				name: 'addMissingGroups',
				type: 'string',
				default: '',
				description: 'Whether to add missing security groups',
			},
			{
				displayName: 'Auto Map Roles',
				name: 'autoMapRoles',
				type: 'string',
				default: '',
				description: 'Whether to automatically map GDAP roles to groups',
			},
			{
				displayName: 'Cancel',
				name: 'Cancel',
				type: 'string',
				default: '',
				description: 'Cancel the onboarding process',
			},
			{
				displayName: 'GDAP Roles (JSON)',
				name: 'gdapRoles',
				type: 'string',
				default: '',
				placeholder: '{"label": "Role Name", "value": "roleId"}',
				description: 'LabelValue JSON for GDAP roles to assign',
			},
			{
				displayName: 'Ignore Missing Roles',
				name: 'ignoreMissingRoles',
				type: 'boolean',
				default: false,
				description: 'Whether to ignore missing roles during onboarding',
			},
			{
				displayName: 'Remap Roles',
				name: 'remapRoles',
				type: 'string',
				default: '',
				description: 'Whether to remap existing GDAP roles',
			},
			{
				displayName: 'Retry',
				name: 'Retry',
				type: 'string',
				default: '',
				description: 'Retry the onboarding process',
			},
			{
				displayName: 'Standards Exclude All Tenants',
				name: 'standardsExcludeAllTenants',
				type: 'boolean',
				default: false,
				description: 'Whether to exclude this tenant from all-tenant standards',
			},
			{
				displayName: 'Tenant ID (JSON)',
				name: 'id',
				type: 'string',
				default: '',
				placeholder: '{"label": "Contoso", "value": "contoso.onmicrosoft.com"}',
				description: 'LabelValue JSON identifying the tenant/relationship to onboard',
			},
		],
	},

	// ── Update Secure Score ──
	{
		displayName: 'Fields',
		name: 'secureScoreFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['updateSecureScore'],
			},
		},
		options: [
			{
				displayName: 'Control Name',
				name: 'ControlName',
				type: 'string',
				default: '',
				description: 'Name of the secure score control to update',
			},
			{
				displayName: 'Reason',
				name: 'reason',
				type: 'string',
				default: '',
				description: 'Reason for the secure score update',
			},
			{
				displayName: 'Resolution Type',
				name: 'resolutionType',
				type: 'string',
				default: '',
				description: 'Type of resolution for the control',
			},
			{
				displayName: 'Vendor Information',
				name: 'vendorInformation',
				type: 'string',
				default: '',
				description: 'Vendor information for the resolution',
			},
		],
	},

	// ── Get Secure Score ──
	{
		displayName: 'Options',
		name: 'secureScoreOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['getSecureScore'],
			},
		},
		options: [
			{
				displayName: 'Output Mode',
				name: 'outputMode',
				type: 'options',
				default: 'summary',
				description: 'Controls the amount and shape of returned data',
				options: [
					{
						name: 'Averaged (15× — Single Record Averaged Across History)',
						value: 'averaged',
					},
					{
						name: 'Category Breakdown (1× — Smallest, Scores by Category)',
						value: 'categoryBreakdown',
					},
					{
						name: 'Full (4000× per Entry — Complete Raw Data)',
						value: 'full',
					},
					{
						name: 'Implementation Status (15× — per-Control Status)',
						value: 'implementationStatus',
					},
					{
						name: 'Slim (150× per Entry — All Controls, Descriptions Stripped)',
						value: 'slim',
					},
					{
						name: 'Summary (2× — Top-Level Scores + Comparative Averages)',
						value: 'summary',
					},
				],
			},
			{
				displayName: 'History Count',
				name: 'historyCount',
				type: 'number',
				default: 1,
				description: 'Number of historical score entries to fetch (used by slim, averaged, full modes)',
				typeOptions: {
					minValue: 1,
				},
			},
			{
				displayName: 'Include Descriptions',
				name: 'includeDescriptions',
				type: 'boolean',
				default: false,
				description:
					'Whether to include verbose control descriptions (applies to slim/implementationStatus/averaged modes only)',
			},
		],
	},

	// ── List App Consent Requests ──
	{
		displayName: 'Filters',
		name: 'consentFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['listAppConsentRequests'],
			},
		},
		options: [
			{
				displayName: 'Filter',
				name: 'Filter',
				type: 'string',
				default: '',
				description: 'Filter expression for consent requests',
			},
			{
				displayName: 'Request Status',
				name: 'RequestStatus',
				type: 'string',
				default: '',
				description: 'Filter by request status',
			},
		],
	},

	// ── Set Auth Method ──
	{
		displayName: 'Fields',
		name: 'authMethodFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['setAuthMethod'],
			},
		},
		options: [
			{
				displayName: 'Group IDs',
				name: 'GroupIds',
				type: 'string',
				default: '',
				description: 'Group IDs to target for the auth method policy',
			},
			{
				displayName: 'ID',
				name: 'Id',
				type: 'string',
				default: '',
				description: 'ID of the authentication method to configure',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
				description: 'State to set for the authentication method',
			},
		],
	},

	// ── Edit Offboarding Defaults ──
	{
		displayName: 'Customer ID',
		name: 'offboardDefaultsCustomerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['editOffboardingDefaults'],
			},
		},
		default: '',
		description: 'The customer ID of the tenant',
	},
	{
		displayName: 'Fields',
		name: 'offboardDefaultsFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['editOffboardingDefaults'],
			},
		},
		options: [
			{
				displayName: 'Alias',
				name: 'Alias',
				type: 'string',
				default: '',
				description: 'Alias for the offboarding defaults',
			},
			{
				displayName: 'Default Domain Name',
				name: 'defaultDomainName',
				type: 'string',
				default: '',
				placeholder: 'contoso.onmicrosoft.com',
				description: 'Default domain name of the tenant',
			},
			{
				displayName: 'Groups (JSON)',
				name: 'Groups',
				type: 'string',
				default: '',
				placeholder: '{"label": "Group Name", "value": "groupId"}',
				description: 'LabelValue JSON for groups configuration',
			},
			{
				displayName: 'Offboarding Defaults',
				name: 'offboardingDefaults',
				type: 'string',
				default: '',
				description: 'JSON string of default offboarding settings',
			},
		],
	},

	// ── Remove Capabilities Cache ──
	{
		displayName: 'Default Domain Name',
		name: 'cacheDomainName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['removeCapabilitiesCache'],
			},
		},
		default: '',
		placeholder: 'contoso.onmicrosoft.com',
		description: 'Domain name of the tenant to clear capabilities cache for (leave empty for all)',
	},

	// ── List Service Health filters ──
	{
		displayName: 'Filters',
		name: 'serviceHealthFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['listServiceHealth'],
			},
		},
		options: [
			{
				displayName: 'Default Domain Name',
				name: 'defaultDomainName',
				type: 'string',
				default: '',
				description: 'Filter by default domain name',
			},
			{
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
				description: 'Filter by display name',
			},
		],
	},

	// ── Tenant Group operations ══════════════════════════════════════════

	// Shared group ID field for deleteTenantGroup and runTenantGroupRule
	{
		displayName: 'Group ID',
		name: 'tenantGroupId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['deleteTenantGroup', 'runTenantGroupRule'],
			},
		},
		default: '',
		description: 'The ID of the tenant group',
	},

	// List Tenant Groups filters
	{
		displayName: 'Filters',
		name: 'tenantGroupFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['listTenantGroups'],
			},
		},
		options: [
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'string',
				default: '',
				description: 'Filter by a specific group ID',
			},
		],
	},

	// ── Exclude Tenant ══════════════════════════════════════════════════

	{
		displayName: 'Options',
		name: 'excludeFields',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['excludeTenant'],
			},
		},
		options: [
			{
				displayName: 'Value',
				name: 'value',
				type: 'string',
				default: '',
				description: 'Additional value for the exclusion',
			},
		],
	},

	// ── Remove Tenant ═══════════════════════════════════════════════════

	{
		displayName: 'Tenant ID',
		name: 'removeTenantId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['removeTenant'],
			},
		},
		default: '',
		description: 'The tenant ID to remove from CIPP',
	},

	// ── Allow/Block List ════════════════════════════════════════════════

	{
		displayName: 'Fields',
		name: 'allowBlockFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['removeTenantAllowBlockList'],
			},
		},
		options: [
			{
				displayName: 'Entries',
				name: 'Entries',
				type: 'string',
				default: '',
				description: 'The entries to remove from the allow/block list',
			},
			{
				displayName: 'List Type',
				name: 'ListType',
				type: 'string',
				default: '',
				description: 'The type of list to remove from (e.g. Sender, URL, FileHash)',
			},
		],
	},

	// ── List Tenant Onboarding ══════════════════════════════════════════

	{
		displayName: 'Filters',
		name: 'onboardingFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['listTenantOnboarding'],
			},
		},
		options: [
			{
				displayName: 'GDAP Roles',
				name: 'gdapRoles',
				type: 'string',
				default: '',
				description: 'Filter by GDAP roles',
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Filter by a specific onboarding ID',
			},
			{
				displayName: 'Ignore Missing Roles',
				name: 'ignoreMissingRoles',
				type: 'string',
				default: '',
				description: 'Whether to ignore missing roles',
			},
			{
				displayName: 'Remap Roles',
				name: 'remapRoles',
				type: 'string',
				default: '',
				description: 'Whether to remap roles',
			},
			{
				displayName: 'Standards Exclude All Tenants',
				name: 'standardsExcludeAllTenants',
				type: 'string',
				default: '',
				description: 'Whether to exclude all tenants from standards',
			},
		],
	},

	// ── Exec Add Tenant (by token) ══════════════════════════════════════

	{
		displayName: 'Fields',
		name: 'execAddTenantFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['execAddTenant'],
			},
		},
		options: [
			{
				displayName: 'Access Token',
				name: 'accessToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Access token for the tenant',
			},
			{
				displayName: 'Default Domain Name',
				name: 'defaultDomainName',
				type: 'string',
				default: '',
				placeholder: 'contoso.onmicrosoft.com',
				description: 'Default domain name of the tenant to add',
			},
			{
				displayName: 'Tenant ID',
				name: 'tenantId',
				type: 'string',
				default: '',
				description: 'The Azure AD tenant ID to add',
			},
		],
	},

	// ── Domain operations (TODO-14j) ══════════════════════════════════════

	// Add Domain / Remove Domain — shared domain name field
	{
		displayName: 'Domain',
		name: 'domainName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['addDomain', 'removeDomain'],
			},
		},
		default: '',
		placeholder: 'e.g. contoso.com',
		description: 'The custom domain name',
	},

	// Remove Domain — action field
	{
		displayName: 'Action',
		name: 'domainAction',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['removeDomain'],
			},
		},
		options: [
			{ name: 'Delete', value: 'delete' },
		],
		default: 'delete',
		description: 'The domain action to execute',
	},

	// ── Run Access Checks ─────────────────────────────────────────
	{
		displayName: 'Options',
		name: 'accessCheckOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['runAccessChecks'],
			},
		},
		options: [
			{
				displayName: 'Skip Cache',
				name: 'SkipCache',
				type: 'string',
				default: '',
				description: 'Set to "true" to skip cached results and run fresh checks',
			},
			{
				displayName: 'Type',
				name: 'Type',
				type: 'string',
				default: '',
				description: 'Type of access check to run',
			},
		],
	},

	// ── listServicePrincipals ─────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'servicePrincipalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['listServicePrincipals'],
			},
		},
		options: [
			{
				displayName: 'Action',
				name: 'Action',
				type: 'string',
				default: '',
				description: 'Service principal action (e.g. list, create, delete)',
			},
			{
				displayName: 'App ID',
				name: 'AppId',
				type: 'string',
				default: '',
				description: 'Filter by application ID',
			},
			{
				displayName: 'ID',
				name: 'Id',
				type: 'string',
				default: '',
				description: 'Filter by service principal ID',
			},
			{
				displayName: 'Select',
				name: 'Select',
				type: 'string',
				default: '',
				description: 'Graph $select projection (comma-separated properties)',
			},
		],
	},
];
