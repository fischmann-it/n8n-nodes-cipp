import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

const RESOURCE = 'cippCore';

const LIST_OPS = ['getAppStatus', 'listFunctionStats', 'getCippAlerts', 'listLogs', 'listKnownIpDb'];
const TENANT_OPS = ['getAppStatus', 'listFunctionStats', 'listKnownIpDb'];

export const cippCoreOperations: INodeProperties[] = [
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
				name: 'Execute CIPP Function',
				value: 'execCippFunction',
				description: 'Execute a CIPP function (requires SuperAdmin role)',
				action: 'Execute a CIPP function',
			},
			{
				name: 'Execute GitHub Action',
				value: 'execGitHubAction',
				description: 'Execute a GitHub action on the CIPP repository',
				action: 'Execute a git hub action',
			},
			{
				name: 'Get App Status',
				value: 'getAppStatus',
				description: 'Get CIPP application status for a tenant',
				action: 'Get app status',
			},
			{
				name: 'Get CIPP Alerts',
				value: 'getCippAlerts',
				description: 'Get CIPP platform health monitoring alerts',
				action: 'Get CIPP alerts',
			},
			{
				name: 'Get External Tenant Info',
				value: 'getExternalTenantInfo',
				description: 'Look up information about an external tenant',
				action: 'Get external tenant info',
			},
			{
				name: 'Get Version',
				value: 'getVersion',
				description: 'Get the current CIPP version',
				action: 'Get version',
			},
			{
				name: 'List Function Parameters',
				value: 'listFunctionParameters',
				description: 'List available function parameters',
				action: 'List function parameters',
			},
			{
				name: 'List Function Stats',
				value: 'listFunctionStats',
				description: 'List function execution statistics for a tenant',
				action: 'List function stats',
			},
			{
				name: 'List GitHub Release Notes',
				value: 'listGitHubReleaseNotes',
				description: 'List GitHub release notes for CIPP',
				action: 'List git hub release notes',
			},
			{
				name: 'List Known IP Database',
				value: 'listKnownIpDb',
				description: 'List known IP database entries for a tenant',
				action: 'List known IP database',
			},
			{
				name: 'List Logs',
				value: 'listLogs',
				description: 'List CIPP audit and monitoring logs with filters',
				action: 'List logs',
			},
			{
				name: 'Manage Durable Functions',
				value: 'manageDurableFunctions',
				description: 'Manage Azure Durable Functions instances',
				action: 'Manage durable functions',
			},
			{
				name: 'Offload Functions',
				value: 'offloadFunctions',
				description: 'Configure function offloading (requires SuperAdmin role)',
				action: 'Offload functions',
			},
			{
				name: 'Test Function',
				value: 'testFunction',
				description: 'Run a generic test function',
				action: 'Test function',
			},
		],
		default: 'getVersion',
	},
];

export const cippCoreFields: INodeProperties[] = [
	// ── Shared fields ──────────────────────────────────────────────────
	tenantField(RESOURCE, TENANT_OPS),
	returnAllField(RESOURCE, LIST_OPS),
	limitField(RESOURCE, LIST_OPS),

	// ── execCippFunction ───────────────────────────────────────────────
	{
		displayName: 'Function Name',
		name: 'FunctionName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['execCippFunction'],
			},
		},
		default: '',
		description: 'The name of the CIPP function to execute',
	},
	{
		displayName: 'Parameters',
		name: 'Parameters',
		type: 'string',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['execCippFunction'],
			},
		},
		default: '',
		description: 'Parameters to pass to the function (string)',
	},

	// ── execGitHubAction ───────────────────────────────────────────────
	{
		displayName: 'Action',
		name: 'Action',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['execGitHubAction'],
			},
		},
		default: '',

	},
	{
		displayName: 'Additional Fields',
		name: 'gitHubFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['execGitHubAction'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'Description',
				type: 'string',
				default: '',
				description: 'Description for the GitHub action',
			},
			{
				displayName: 'Include Forks',
				name: 'includeforks',
				type: 'boolean',
				default: false,
				description: 'Whether to include forked repositories',
			},
			{
				displayName: 'Org Name (JSON)',
				name: 'orgName',
				type: 'string',
				default: '',
				description: 'LabelValue JSON object for organization name',
			},
			{
				displayName: 'Policy Source (JSON)',
				name: 'policySource',
				type: 'string',
				default: '',
				description: 'LabelValue JSON object for policy source',
			},
			{
				displayName: 'Private',
				name: 'Private',
				type: 'boolean',
				default: false,
				description: 'Whether the repository is private',
			},
			{
				displayName: 'Repo Name',
				name: 'repoName',
				type: 'string',
				default: '',
				description: 'The repository name',
			},
			{
				displayName: 'Search Term (JSON)',
				name: 'searchTerm',
				type: 'string',
				default: '',
				description: 'LabelValue JSON object for search term',
			},
		],
	},

	// ── getAppStatus ───────────────────────────────────────────────────
	{
		displayName: 'Filters',
		name: 'appStatusFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['getAppStatus'],
			},
		},
		options: [
			{
				displayName: 'App Filter',
				name: 'AppFilter',
				type: 'string',
				default: '',
				description: 'Filter by application name',
			},
		],
	},

	// ── getExternalTenantInfo ──────────────────────────────────────────
	{
		displayName: 'Tenant',
		name: 'tenant',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['getExternalTenantInfo'],
			},
		},
		default: '',
		description: 'The external tenant domain or ID to look up',
	},

	// ── getVersion ─────────────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'versionFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['getVersion'],
			},
		},
		options: [
			{
				displayName: 'Local Version',
				name: 'LocalVersion',
				type: 'string',
				default: '',
				description: 'The local version to compare against',
			},
		],
	},

	// ── listFunctionParameters ─────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'functionParamsFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listFunctionParameters'],
			},
		},
		options: [
			{
				displayName: 'Compliance',
				name: 'Compliance',
				type: 'string',
				default: '',
				description: 'Compliance mode filter',
			},
			{
				displayName: 'Function',
				name: 'Function',
				type: 'string',
				default: '',
				description: 'Filter by function name',
			},
			{
				displayName: 'Module',
				name: 'Module',
				type: 'string',
				default: '',
				description: 'Filter by module name',
			},
		],
	},

	// ── listFunctionStats ──────────────────────────────────────────────
	{
		displayName: 'Filters',
		name: 'functionStatsFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listFunctionStats'],
			},
		},
		options: [
			{
				displayName: 'Function Type',
				name: 'FunctionType',
				type: 'string',
				default: '',
				description: 'Filter by function type',
			},
			{
				displayName: 'Interval',
				name: 'Interval',
				type: 'string',
				default: '',
				description: 'Time interval for statistics',
			},
			{
				displayName: 'Time',
				name: 'Time',
				type: 'string',
				default: '',
				description: 'Time range filter',
			},
		],
	},

	// ── listGitHubReleaseNotes ─────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'releaseNotesFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listGitHubReleaseNotes'],
			},
		},
		options: [
			{
				displayName: 'Owner',
				name: 'Owner',
				type: 'string',
				default: '',
				description: 'GitHub repository owner',
			},
			{
				displayName: 'Repository',
				name: 'Repository',
				type: 'string',
				default: '',
				description: 'GitHub repository name',
			},
		],
	},

	// ── manageDurableFunctions ──────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'durableFunctionsFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['manageDurableFunctions'],
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
				displayName: 'Partition Key',
				name: 'PartitionKey',
				type: 'string',
				default: '',
				description: 'Filter by partition key',
			},
		],
	},

	// ── offloadFunctions ───────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'offloadFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['offloadFunctions'],
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
				displayName: 'Offload Functions',
				name: 'OffloadFunctions',
				type: 'boolean',
				default: false,
				description: 'Whether to enable function offloading',
			},
		],
	},

	// ── getCippAlerts ──────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'cippAlertsFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['getCippAlerts'],
			},
		},
		options: [
			{
				displayName: 'Local Version',
				name: 'localversion',
				type: 'string',
				default: '',
				description: 'Local CIPP version for comparison',
			},
		],
	},

	// ── listLogs ───────────────────────────────────────────────────
	{
		displayName: 'Filters',
		name: 'logFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listLogs'],
			},
		},
		options: [
			{
				displayName: 'API',
				name: 'API',
				type: 'string',
				default: '',
				description: 'Filter by API name',
			},
			{
				displayName: 'Date Filter',
				name: 'DateFilter',
				type: 'string',
				default: '',
				description: 'Predefined date filter',
			},
			{
				displayName: 'End Date',
				name: 'EndDate',
				type: 'string',
				default: '',
				description: 'End date for range filtering (ISO 8601)',
			},
			{
				displayName: 'Filter',
				name: 'Filter',
				type: 'string',
				default: '',
				description: 'General filter expression',
			},
			{
				displayName: 'List Logs',
				name: 'ListLogs',
				type: 'string',
				default: '',
				description: 'List logs flag parameter',
			},
			{
				displayName: 'Log Entry ID',
				name: 'logentryid',
				type: 'string',
				default: '',
				description: 'Filter by specific log entry ID',
			},
			{
				displayName: 'Scheduled Task ID',
				name: 'ScheduledTaskId',
				type: 'string',
				default: '',
				description: 'Filter by scheduled task ID',
			},
			{
				displayName: 'Severity',
				name: 'Severity',
				type: 'string',
				default: '',
				description: 'Filter by severity level',
			},
			{
				displayName: 'Standard Template ID',
				name: 'StandardTemplateId',
				type: 'string',
				default: '',
				description: 'Filter by standard template ID',
			},
			{
				displayName: 'Start Date',
				name: 'StartDate',
				type: 'string',
				default: '',
				description: 'Start date for range filtering (ISO 8601)',
			},
			{
				displayName: 'Tenant',
				name: 'Tenant',
				type: 'string',
				default: '',
				description: 'Filter by tenant domain',
			},
			{
				displayName: 'User',
				name: 'User',
				type: 'string',
				default: '',
				description: 'Filter by user',
			},
		],
	},
];
