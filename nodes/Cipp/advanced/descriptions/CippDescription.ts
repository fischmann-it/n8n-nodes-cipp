import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

export const scheduledItemOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['scheduledItem'],
			},
		},
		options: [
			{
				name: 'Add',
				value: 'add',
				description: 'Create a new scheduled item',
				action: 'Add scheduled item',
			},
			{
				name: 'Get Details',
				value: 'getDetails',
				description: 'Get details of a specific scheduled item',
				action: 'Get scheduled item details',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get a list of scheduled items',
				action: 'Get many scheduled items',
			},
			{
				name: 'Remove',
				value: 'remove',
				description: 'Remove a scheduled item',
				action: 'Remove scheduled item',
			},
			{
				name: 'Trigger Billing Run',
				value: 'triggerBillingRun',
				description: 'Trigger a scheduler billing run',
				action: 'Trigger billing run',
			},
		],
		default: 'getAll',
	},
];

export const scheduledItemFields: INodeProperties[] = [
	// Get Many fields
	returnAllField('scheduledItem', ['getAll']),
	limitField('scheduledItem', ['getAll']),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['scheduledItem'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Show Hidden',
				name: 'showHidden',
				type: 'boolean',
				default: false,
				description: 'Whether to show hidden system jobs',
			},
			{
				displayName: 'Filter by Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter scheduled items by name',
			},
		],
	},

	// Add Scheduled Item fields
	{
		displayName: 'Tenant',
		name: 'tenantFilter',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		description: 'The tenant to run the job for (optional for all-tenant jobs)',
		displayOptions: {
			show: {
				resource: ['scheduledItem'],
				operation: ['add'],
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
	{
		displayName: 'Job Name',
		name: 'jobName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['scheduledItem'],
				operation: ['add'],
			},
		},
		default: '',
		description: 'Name of the scheduled job',
	},
	{
		displayName: 'Command',
		name: 'command',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['scheduledItem'],
				operation: ['add'],
			},
		},
		default: '',
		placeholder: 'e.g. Get-CIPPUsers',
		description: 'The command to execute',
	},
	{
		displayName: 'Scheduled Time',
		name: 'scheduledTime',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['scheduledItem'],
				operation: ['add'],
			},
		},
		default: '',
		description: 'When the job should run',
	},
	{
		displayName: 'Recurrence',
		name: 'recurrence',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['scheduledItem'],
				operation: ['add'],
			},
		},
		options: [
			{ name: 'Once', value: '0' },
			{ name: 'Daily', value: '1d' },
			{ name: 'Weekly', value: '7d' },
			{ name: 'Monthly', value: '30d' },
			{ name: 'Yearly', value: '365d' },
		],
		default: '0',
		description: 'How often the job should recur',
	},
	{
		displayName: 'Parameters',
		name: 'parameters',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['scheduledItem'],
				operation: ['add'],
			},
		},
		default: '{}',
		description: 'JSON parameters for the command',
	},
	{
		displayName: 'Post-Execution Actions',
		name: 'postExecution',
		type: 'multiOptions',
		displayOptions: {
			show: {
				resource: ['scheduledItem'],
				operation: ['add'],
			},
		},
		options: [
			{ name: 'Webhook', value: 'Webhook' },
			{ name: 'Email', value: 'Email' },
			{ name: 'PSA', value: 'PSA' },
		],
		default: [],
		description: 'Actions to take after job execution',
	},

	// Get Scheduled Item Details fields
	{
		displayName: 'Row Key',
		name: 'detailsRowKey',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['scheduledItem'],
				operation: ['getDetails'],
			},
		},
		default: '',
		description: 'The RowKey of the scheduled item to get details for',
	},

	// Remove Scheduled Item fields
	{
		displayName: 'ID',
		name: 'rowKey',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['scheduledItem'],
				operation: ['remove'],
			},
		},
		default: '',
		description: 'The ID of the scheduled item to remove',
	},
];

// Backup operations
export const backupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['backup'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get a list of backups',
				action: 'Get many backups',
			},
			{
				name: 'Restore',
				value: 'restore',
				description: 'Restore a backup',
				action: 'Restore backup',
			},
			{
				name: 'Run',
				value: 'run',
				description: 'Create a new backup',
				action: 'Run backup',
			},
			{
				name: 'Set Auto-Backup',
				value: 'setAutoBackup',
				description: 'Enable or disable automatic backups',
				action: 'Set auto backup',
			},
		],
		default: 'getAll',
	},
];

export const backupFields: INodeProperties[] = [
	// Get Many fields
	returnAllField('backup', ['getAll']),
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Backup Name',
				name: 'backupName',
				type: 'string',
				default: '',
				description: 'Get a specific backup by name',
			},
			{
				displayName: 'Names Only',
				name: 'namesOnly',
				type: 'boolean',
				default: false,
				description: 'Whether to return only backup names',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'string',
				default: '',
				description: 'Filter backups by type',
			},
		],
	},

	// Restore fields
	{
		displayName: 'Backup Name',
		name: 'backupName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['restore'],
			},
		},
		default: '',
		description: 'The name of the backup to restore. If provided, this takes precedence over raw Backup Data.',
	},
	{
		displayName: 'Backup Data (Raw JSON)',
		name: 'backupData',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['restore'],
			},
		},
		default: '{}',
		description: 'Raw backup data as JSON. Used only when Backup Name is empty.',
	},

	// Auto-Backup fields
	{
		displayName: 'Enable Auto-Backup',
		name: 'enableAutoBackup',
		type: 'boolean',
		required: true,
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['setAutoBackup'],
			},
		},
		default: true,
		description: 'Whether to enable automatic backups',
	},
];

// Tools operations
export const toolsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['tools'],
			},
		},
		options: [
			{
				name: 'Breach Search (Account)',
				value: 'breachAccount',
				description: 'Check breaches for an email or domain',
				action: 'Search breaches for account',
			},
			{
				name: 'Breach Search (Tenant)',
				value: 'breachTenant',
				description: 'Get breaches for a tenant',
				action: 'Search breaches for tenant',
			},
			{
				name: 'Exec Graph Request',
				value: 'execGraphRequest',
				description: 'Execute a Microsoft Graph request via POST /api/ExecGraphRequest',
				action: 'Exec graph request',
			},
			{
				name: 'Execute Breach Search',
				value: 'executeBreachSearch',
				description: 'Execute a comprehensive breach search',
				action: 'Execute breach search',
			},
			{
				name: 'GeoIP Lookup',
				value: 'geoIpLookup',
				description: 'Look up geographic location for an IP address',
				action: 'Geo IP lookup',
			},
			{
				name: 'Graph Request (Exec)',
				value: 'graphRequestExec',
				description: 'Execute Microsoft Graph GET/POST/PATCH requests via your CIPP fork',
				action: 'Execute graph request',
			},
			{
				name: 'Graph Request (List)',
				value: 'graphRequest',
				description: 'Make a custom Microsoft Graph GET/list request',
				action: 'Execute graph list request',
			},
			{
				name: 'List All Tenant Device Compliance',
				value: 'listAllTenantDeviceCompliance',
				description: 'List device compliance status across all tenants',
				action: 'List all tenant device compliance',
			},
			{
				name: 'Send Test Email',
				value: 'sendTestEmail',
				description: 'Send a test email to verify CIPP mail integration',
				action: 'Send test email',
			},
			{
				name: 'Universal Search',
				value: 'universalSearch',
				description: 'Search across tenants by name',
				action: 'Universal search',
			},
			{
				name: 'Universal Search V2',
				value: 'universalSearchV2',
				description: 'Search across tenants with advanced filtering',
				action: 'Universal search v2',
			},
		],
		default: 'graphRequest',
	},
];

export const toolsFields: INodeProperties[] = [
	// Tenant selector for tenant-specific operations
	tenantField('tools', ['breachTenant', 'executeBreachSearch', 'execGraphRequest', 'graphRequest', 'graphRequestExec', 'listAllTenantDeviceCompliance']),
	returnAllField('tools', ['listAllTenantDeviceCompliance']),
	limitField('tools', ['listAllTenantDeviceCompliance']),

	// Breach Account fields
	{
		displayName: 'Account',
		name: 'account',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tools'],
				operation: ['breachAccount'],
			},
		},
		default: '',
		placeholder: 'user@domain.com or domain.com',
		description: 'The email address or domain to check for breaches',
	},

	// Graph Request fields
	{
		displayName: 'Endpoint',
		name: 'graphEndpoint',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tools'],
				operation: ['graphRequest'],
			},
		},
		default: 'users',
		placeholder: 'e.g. users, groups, devices',
		description: 'The Graph API endpoint to call',
	},
	{
		displayName: 'Options',
		name: 'graphOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['tools'],
				operation: ['graphRequest'],
			},
		},
		options: [
			{
				displayName: '$Count',
				name: 'count',
				type: 'boolean',
				default: false,
				description: 'Whether to include count',
			},
			{
				displayName: '$Filter',
				name: 'filter',
				type: 'string',
				default: '',
				placeholder: "startsWith(displayName,'John')",
				description: 'OData filter',
			},
			{
				displayName: '$Orderby',
				name: 'orderby',
				type: 'string',
				default: '',
				placeholder: 'displayName',
				description: 'Field to order by',
			},
			{
				displayName: '$Select',
				name: 'select',
				type: 'string',
				default: '',
				placeholder: 'ID,displayName,userPrincipalName',
				description: 'Fields to select',
			},
			{
				displayName: '$Top',
				name: 'top',
				type: 'number',
				default: 100,
				description: 'Number of records to return',
			},
		],
	},
	// Exec Graph Request fields
	{
		displayName: 'Endpoint',
		name: 'execEndpoint',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tools'],
				operation: ['execGraphRequest'],
			},
		},
		default: '',
		placeholder: 'e.g. users, groups, devices',
		description: 'The Graph API endpoint to call',
	},
	{
		displayName: 'Method',
		name: 'execMethod',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['tools'],
				operation: ['execGraphRequest'],
			},
		},
		options: [
			{ name: 'GET', value: 'GET' },
			{ name: 'PATCH', value: 'PATCH' },
			{ name: 'POST', value: 'POST' },
			{ name: 'DELETE', value: 'DELETE' },
		],
		default: 'GET',
		description: 'HTTP method for the Graph request',
	},
	{
		displayName: 'Body',
		name: 'execBody',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['tools'],
				operation: ['execGraphRequest'],
				execMethod: ['POST', 'PATCH'],
			},
		},
		default: '{}',
		description: 'Request body as JSON',
	},

	// Graph Request (Exec) fields — Teams Shifts focused
	{
		displayName: 'Endpoint',
		name: 'graphExecEndpoint',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tools'],
				operation: ['graphRequestExec'],
			},
		},
		default: 'teams/{team-ID}/schedule/shifts',
		placeholder: 'e.g. teams/{team-ID}/schedule/shifts',
		description:
			'Graph endpoint path to execute (relative path preferred, such as teams/{team-ID}/schedule/shifts)',
	},
	{
		displayName: 'Method',
		name: 'graphExecMethod',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['tools'],
				operation: ['graphRequestExec'],
			},
		},
		options: [
			{
				name: 'GET',
				value: 'GET',
			},
			{
				name: 'PATCH',
				value: 'PATCH',
			},
			{
				name: 'POST',
				value: 'POST',
			},
		],
		default: 'GET',
		description: 'HTTP method for the Graph request',
	},
	{
		displayName: 'Headers',
		name: 'graphExecHeaders',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['tools'],
				operation: ['graphRequestExec'],
			},
		},
		default: '{}',
		description: 'Optional Graph request headers as a JSON object',
	},
	{
		displayName: 'Body',
		name: 'graphExecBody',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['tools'],
				operation: ['graphRequestExec'],
				graphExecMethod: ['POST', 'PATCH'],
			},
		},
		default: '{}',
		description: 'Graph request body as JSON',
	},
	{
		displayName: 'Exec Options',
		name: 'graphExecOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['tools'],
				operation: ['graphRequestExec'],
			},
		},
		options: [
			{
				displayName: 'Enforce Teams Shifts Endpoint Pattern',
				name: 'enforceShiftsAllowlist',
				type: 'boolean',
				default: true,
				description: 'Whether to require an endpoint matching teams/{ID}/schedule/* before sending',
			},
			{
				displayName: 'Max Payload Bytes',
				name: 'maxPayloadBytes',
				type: 'number',
				typeOptions: {
					minValue: 1024,
					maxValue: 1048576,
				},
				default: 262144,
				description: 'Maximum serialized payload size in bytes sent to CIPP',
			},
		],
	},

	// ── GeoIP Lookup ──
	{
		displayName: 'IP Address',
		name: 'ipAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tools'],
				operation: ['geoIpLookup'],
			},
		},
		default: '',
		placeholder: '8.8.8.8',
		description: 'The IP address to look up geographic location for',
	},

	// ── Universal Search ──
	{
		displayName: 'Search Name',
		name: 'searchName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['tools'],
				operation: ['universalSearch'],
			},
		},
		default: '',
		description: 'The name or term to search for across tenants',
	},

	// ── Universal Search V2 ──
	{
		displayName: 'Options',
		name: 'universalSearchV2Options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['tools'],
				operation: ['universalSearchV2'],
			},
		},
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'string',
				default: '',
				description: 'Maximum number of results to return from the API',
			},
			{
				displayName: 'Search Terms',
				name: 'searchTerms',
				type: 'string',
				default: '',
				description: 'The search terms to query across tenants',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'string',
				default: '',
				description: 'Filter results by object type (e.g. user, group, device)',
			},
		],
	},
];
