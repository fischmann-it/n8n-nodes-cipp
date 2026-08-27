import type { INodeProperties } from 'n8n-workflow';

const RESOURCE = 'cippAdmin';

export const cippAdminOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
			},
		},
		options: [
			{
				name: 'Create SAM App',
				value: 'createSamApp',
				description: 'Create a SAM application registration',
				action: 'Create a SAM app',
			},
			{
				name: 'Get Extension Cache Data',
				value: 'getExtensionCacheData',
				description: 'Get cached data for extensions',
				action: 'Get extension cache data',
			},
			{
				name: 'Get Extension Mapping',
				value: 'getExtensionMapping',
				description: 'Get extension field mappings',
				action: 'Get extension mapping',
			},
			{
				name: 'Get Extensions Config',
				value: 'getExtensionsConfig',
				description: 'Get the current extensions configuration',
				action: 'Get extensions config',
			},
			{
				name: 'Get NinjaOne Queue',
				value: 'getNinjaOneQueue',
				description: 'Get NinjaOne sync queue status',
				action: 'Get ninja one queue',
			},
			{
				name: 'List Extension Alerts',
				value: 'listExtAlerts',
				description: 'List extension alert monitoring results for a tenant',
				action: 'List extension alerts',
			},
			{
				name: 'List Extension Sync',
				value: 'listExtensionSync',
				description: 'List extension synchronization status',
				action: 'List extension sync',
			},
			{
				name: 'List Pending Webhooks',
				value: 'listPendingWebhooks',
				description: 'List pending webhook deliveries',
				action: 'List pending webhooks',
			},
			{
				name: 'Manage Partner Webhook',
				value: 'managePartnerWebhook',
				description: 'Manage partner webhook subscriptions',
				action: 'Manage partner webhook',
			},
			{
				name: 'Refresh CPV (All Tenants)',
				value: 'refreshCpvAll',
				description: 'Trigger a bulk CPV refresh for all tenants',
				action: 'Refresh CPV for all tenants',
			},
			{
				name: 'Refresh CPV Permissions',
				value: 'refreshCpvPermissions',
				description: 'Refresh CPV consent permissions for a specific tenant',
				action: 'Refresh CPV permissions',
			},
			{
				name: 'Run Combined Setup',
				value: 'runCombinedSetup',
				description: 'Run the combined setup wizard',
				action: 'Run combined setup',
			},
			{
				name: 'Run SAM Setup',
				value: 'runSamSetup',
				description: 'Run SAM application setup',
				action: 'Run SAM setup',
			},
			{
				name: 'Set Backup Retention',
				value: 'setBackupRetention',
				description: 'Configure backup retention settings',
				action: 'Set backup retention',
			},
			{
				name: 'Set Branding',
				value: 'setBranding',
				description: 'Configure CIPP branding settings',
				action: 'Set branding',
			},
			{
				name: 'Set DNS Config',
				value: 'setDnsConfig',
				description: 'Configure DNS resolver settings',
				action: 'Set DNS config',
			},
			{
				name: 'Set Extensions Config',
				value: 'setExtensionsConfig',
				description: 'Save extensions configuration',
				action: 'Set extensions config',
			},
			{
				name: 'Set JIT Admin Settings',
				value: 'setJitAdminSettings',
				description: 'Configure JIT admin settings',
				action: 'Set JIT admin settings',
			},
			{
				name: 'Set Log Retention',
				value: 'setLogRetention',
				description: 'Configure log retention settings',
				action: 'Set log retention',
			},
			{
				name: 'Set Notification Config',
				value: 'setNotificationConfig',
				description: 'Configure notification settings',
				action: 'Set notification config',
			},
			{
				name: 'Set Password Config',
				value: 'setPasswordConfig',
				description: 'Configure password generation settings',
				action: 'Set password config',
			},
			{
				name: 'Set Time Settings',
				value: 'setTimeSettings',
				description: 'Configure business hours and timezone',
				action: 'Set time settings',
			},
			{
				name: 'Sync Extension',
				value: 'syncExtension',
				description: 'Trigger an extension sync',
				action: 'Sync extension',
			},
			{
				name: 'Test Extension',
				value: 'testExtension',
				description: 'Test an extension connection',
				action: 'Test extension',
			},
		],
		default: 'getExtensionsConfig',
	},
];

export const cippAdminFields: INodeProperties[] = [
	// ── Tenant field — only for getExtensionCacheData ──────────────────
	{
		displayName: 'Tenant',
		name: 'tenantFilter',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The tenant to get cache data for',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['getExtensionCacheData', 'refreshCpvPermissions', 'listExtAlerts'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'tenantSearch',
					searchable: true,
				},
			},
			{
				displayName: 'By Domain',
				name: 'domain',
				type: 'string',
				placeholder: 'e.g. contoso.onmicrosoft.com',
			},
		],
	},

	// ── createSamApp ───────────────────────────────────────────────────
	{
		displayName: 'Access Token',
		name: 'access_token',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['createSamApp'],
			},
		},
		default: '',
		description: 'The access token for SAM app creation',
	},

	// ── getExtensionCacheData ──────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'cacheDataFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['getExtensionCacheData'],
			},
		},
		options: [
			{
				displayName: 'Data Types',
				name: 'dataTypes',
				type: 'string',
				default: '',
				description: 'Filter by specific data types',
			},
		],
	},

	// ── getExtensionMapping ────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'extensionMappingFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['getExtensionMapping'],
			},
		},
		options: [
			{
				displayName: 'Add Mapping',
				name: 'AddMapping',
				type: 'string',
				default: '',
				description: 'Add a new field mapping',
			},
			{
				displayName: 'Auto Mapping',
				name: 'AutoMapping',
				type: 'string',
				default: '',
				description: 'Auto-map extension fields',
			},
			{
				displayName: 'List',
				name: 'List',
				type: 'string',
				default: '',
				description: 'List specific mappings',
			},
		],
	},

	// ── runCombinedSetup ───────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'combinedSetupFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['runCombinedSetup'],
			},
		},
		options: [
			{
				displayName: 'Application ID',
				name: 'applicationId',
				type: 'string',
				default: '',
				description: 'The application (client) ID',
			},
			{
				displayName: 'Application Secret',
				name: 'applicationSecret',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'The application client secret',
			},
			{
				displayName: 'Baseline Option',
				name: 'baselineOption',
				type: 'string',
				default: '',
				description: 'Baseline configuration option',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Email address for setup notifications',
			},
			{
				displayName: 'Refresh Token',
				name: 'RefreshToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'OAuth refresh token',
			},
			{
				displayName: 'Selected Baselines',
				name: 'selectedBaselines',
				type: 'string',
				default: '',
				description: 'Comma-separated list of selected baselines',
			},
			{
				displayName: 'Selected Option',
				name: 'selectedOption',
				type: 'string',
				default: '',
				description: 'The selected setup option',
			},
			{
				displayName: 'Tenant ID',
				name: 'tenantid',
				type: 'string',
				default: '',
				description: 'The Azure AD tenant ID for setup',
			},
			{
				displayName: 'Webhook',
				name: 'webhook',
				type: 'string',
				default: '',
				description: 'Webhook URL for setup notifications',
			},
		],
	},

	// ── runSamSetup — query params ─────────────────────────────────────
	{
		displayName: 'Query Parameters',
		name: 'setupQueryParams',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['runSamSetup'],
			},
		},
		options: [
			{
				displayName: 'Check Setup Process',
				name: 'CheckSetupProcess',
				type: 'string',
				default: '',
				description: 'Check the status of a setup process',
			},
			{
				displayName: 'Code',
				name: 'code',
				type: 'string',
				default: '',
				description: 'Authorization code from OAuth flow',
			},
			{
				displayName: 'Count',
				name: 'count',
				type: 'string',
				default: '',
				description: 'Step count parameter',
			},
			{
				displayName: 'Create SAM',
				name: 'CreateSAM',
				type: 'string',
				default: '',
				description: 'Flag to create SAM application',
			},
			{
				displayName: 'Error',
				name: 'error',
				type: 'string',
				default: '',
				description: 'Error code from OAuth callback',
			},
			{
				displayName: 'Error Description',
				name: 'error_description',
				type: 'string',
				default: '',
				description: 'Error description from OAuth callback',
			},
			{
				displayName: 'Step',
				name: 'step',
				type: 'string',
				default: '',
				description: 'Current setup step number',
			},
		],
	},

	// ── runSamSetup — body params ──────────────────────────────────────
	{
		displayName: 'Body Parameters',
		name: 'setupBodyParams',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['runSamSetup'],
			},
		},
		options: [
			{
				displayName: 'Application ID',
				name: 'applicationid',
				type: 'string',
				default: '',
				description: 'The application (client) ID',
			},
			{
				displayName: 'Application Secret',
				name: 'applicationsecret',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'The application client secret',
			},
			{
				displayName: 'Refresh Token',
				name: 'RefreshToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'OAuth refresh token',
			},
			{
				displayName: 'Set Keys',
				name: 'setkeys',
				type: 'string',
				default: '',
				description: 'Set encryption keys',
			},
			{
				displayName: 'Tenant ID',
				name: 'tenantid',
				type: 'string',
				default: '',
				description: 'The Azure AD tenant ID',
			},
		],
	},

	// ── setBackupRetention ─────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'backupRetentionFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['setBackupRetention'],
			},
		},
		options: [
			{
				displayName: 'List',
				name: 'List',
				type: 'string',
				default: '',
				description: 'List current retention settings (pass any value)',
			},
			{
				displayName: 'Retention Days',
				name: 'RetentionDays',
				type: 'string',
				default: '',
				description: 'Number of days to retain backups',
			},
		],
	},

	// ── setBranding ────────────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'brandingFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['setBranding'],
			},
		},
		options: [
			{
				displayName: 'Action',
				name: 'Action',
				type: 'string',
				default: '',

			},
			{
				displayName: 'Colour',
				name: 'colour',
				type: 'color',
				default: '',
				description: 'The brand colour value',
			},
			{
				displayName: 'Logo',
				name: 'logo',
				type: 'string',
				default: '',
				description: 'The logo URL or base64 data',
			},
		],
	},

	// ── setDnsConfig ───────────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'dnsConfigFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['setDnsConfig'],
			},
		},
		options: [
			{
				displayName: 'Action',
				name: 'Action',
				type: 'string',
				default: '',

			},
			{
				displayName: 'Domain',
				name: 'Domain',
				type: 'string',
				default: '',
				description: 'The domain name to configure',
			},
			{
				displayName: 'Resolver',
				name: 'Resolver',
				type: 'string',
				default: '',
				description: 'The DNS resolver to use',
			},
			{
				displayName: 'Selector',
				name: 'Selector',
				type: 'string',
				default: '',
				description: 'The DKIM selector',
			},
		],
	},

	// ── setExtensionsConfig ────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'extensionsConfigFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['setExtensionsConfig'],
			},
		},
		options: [
			{
				displayName: 'Hudu',
				name: 'Hudu',
				type: 'string',
				default: '',
				description: 'Hudu extension configuration (JSON string)',
			},
			{
				displayName: 'NinjaOne',
				name: 'NinjaOne',
				type: 'string',
				default: '',
				description: 'NinjaOne extension configuration (JSON string)',
			},
			{
				displayName: 'PS Object',
				name: 'PSObject',
				type: 'string',
				default: '',
				description: 'PowerShell object configuration (JSON string)',
			},
		],
	},

	// ── setJitAdminSettings ────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'jitAdminFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['setJitAdminSettings'],
			},
		},
		options: [
			{
				displayName: 'Action',
				name: 'Action',
				type: 'string',
				default: '',

			},
			{
				displayName: 'Max Duration',
				name: 'MaxDuration',
				type: 'string',
				default: '',
				description: 'Maximum duration for JIT admin sessions',
			},
		],
	},

	// ── setLogRetention ────────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'logRetentionFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['setLogRetention'],
			},
		},
		options: [
			{
				displayName: 'List',
				name: 'List',
				type: 'string',
				default: '',
				description: 'List current log retention settings (pass any value)',
			},
			{
				displayName: 'Retention Days',
				name: 'RetentionDays',
				type: 'string',
				default: '',
				description: 'Number of days to retain logs',
			},
		],
	},

	// ── setNotificationConfig ──────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'notificationFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['setNotificationConfig'],
			},
		},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Email address for notifications',
			},
			{
				displayName: 'Logs to Include (JSON)',
				name: 'logsToInclude',
				type: 'string',
				default: '',
				description: 'LabelValue JSON object specifying which logs to include',
			},
			{
				displayName: 'One Per Tenant',
				name: 'onePerTenant',
				type: 'boolean',
				default: false,
				description: 'Whether to send one notification per tenant',
			},
			{
				displayName: 'Send to Integration',
				name: 'sendtoIntegration',
				type: 'boolean',
				default: false,
				description: 'Whether to send notifications to the configured integration',
			},
			{
				displayName: 'Severity (JSON)',
				name: 'Severity',
				type: 'string',
				default: '',
				description: 'LabelValue JSON object specifying severity filter',
			},
			{
				displayName: 'Webhook',
				name: 'webhook',
				type: 'string',
				default: '',
				description: 'Webhook URL for notifications',
			},
		],
	},

	// ── setPasswordConfig ──────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'passwordConfigFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['setPasswordConfig'],
			},
		},
		options: [
			{
				displayName: 'List',
				name: 'List',
				type: 'string',
				default: '',
				description: 'List current password settings (pass any value)',
			},
			{
				displayName: 'Password Type',
				name: 'passwordType',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'The password generation type',
			},
		],
	},

	// ── setTimeSettings ────────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'timeSettingsFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['setTimeSettings'],
			},
		},
		options: [
			{
				displayName: 'Business Hours Start (JSON)',
				name: 'BusinessHoursStart',
				type: 'string',
				default: '',
				description: 'LabelValue JSON object for business hours start time',
			},
			{
				displayName: 'Timezone (JSON)',
				name: 'Timezone',
				type: 'string',
				default: '',
				description: 'LabelValue JSON object for timezone setting',
			},
		],
	},

	// ── syncExtension ──────────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'syncExtensionFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['syncExtension'],
			},
		},
		options: [
			{
				displayName: 'Extension',
				name: 'Extension',
				type: 'string',
				default: '',
				description: 'The extension name to sync',
			},
			{
				displayName: 'Tenant ID',
				name: 'TenantID',
				type: 'string',
				default: '',
				description: 'The tenant ID to sync for',
			},
		],
	},

	// ── testExtension ──────────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'testExtensionFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['testExtension'],
			},
		},
		options: [
			{
				displayName: 'Extension Name',
				name: 'extensionName',
				type: 'string',
				default: '',
				description: 'The name of the extension to test',
			},
		],
	},

	// ── Return All / Limit for list operations ──────────────────
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listPendingWebhooks', 'listExtAlerts'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: { minValue: 1, maxValue: 500 },
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listPendingWebhooks', 'listExtAlerts'],
				returnAll: [false],
			},
		},
	},

	// ── refreshCpvPermissions ─────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'cpvPermissionsFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['refreshCpvPermissions'],
			},
		},
		options: [
			{
				displayName: 'Reset Service Principal',
				name: 'ResetSP',
				type: 'string',
				default: '',
				description: 'Reset the service principal (pass any value to trigger)',
			},
		],
	},

	// ── managePartnerWebhook ──────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'partnerWebhookFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['managePartnerWebhook'],
			},
		},
		options: [
			{
				displayName: 'Action',
				name: 'Action',
				type: 'string',
				default: '',

			},
			{
				displayName: 'Correlation ID',
				name: 'CorrelationId',
				type: 'string',
				default: '',
				description: 'Correlation ID for the webhook operation',
			},
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean',
				default: true,
				description: 'Whether the webhook is enabled',
			},
			{
				displayName: 'Event Type (JSON)',
				name: 'EventType',
				type: 'string',
				default: '',
				description: 'LabelValue JSON object for the event type to subscribe to',
			},
			{
				displayName: 'Exclude All Tenants From Standards',
				name: 'standardsExcludeAllTenants',
				type: 'boolean',
				default: false,
				description: 'Whether to exclude all tenants from standards processing',
			},
		],
	},
];
