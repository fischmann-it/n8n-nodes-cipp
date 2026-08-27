import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

export const conditionalAccessOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
			},
		},
		options: [
			{
				name: 'Add Exclusion',
				value: 'addExclusion',
				description: 'Create a conditional access policy exclusion',
				action: 'Add a CA exclusion',
			},
			{
				name: 'Add Named Location',
				value: 'addNamedLocation',
				description: 'Create a named location (IP or country)',
				action: 'Add a named location',
			},
			{
				name: 'Add Policy',
				value: 'addPolicy',
				description: 'Deploy a conditional access policy from a template',
				action: 'Add a CA policy',
			},
			{
				name: 'Add Service Exclusion',
				value: 'addServiceExclusion',
				description: 'Add a service-level CA policy exclusion',
				action: 'Add a service exclusion',
			},
			{
				name: 'Add Template',
				value: 'addTemplate',
				description: 'Save a CA policy as a reusable template',
				action: 'Add a CA template',
			},
			{
				name: 'Check Policy',
				value: 'checkPolicy',
				description: 'Simulate a conditional access policy evaluation',
				action: 'Check a CA policy',
			},
			{
				name: 'Edit Named Location',
				value: 'editNamedLocation',
				description: 'Edit an existing named location',
				action: 'Edit a named location',
			},
			{
				name: 'Edit Policy',
				value: 'editPolicy',
				description: 'Edit a conditional access policy',
				action: 'Edit a CA policy',
			},
			{
				name: 'List Named Locations',
				value: 'listNamedLocations',
				description: 'List named locations for a tenant',
				action: 'List named locations',
			},
			{
				name: 'List Policies',
				value: 'listPolicies',
				description: 'List conditional access policies for a tenant',
				action: 'List CA policies',
			},
			{
				name: 'List Policy Changes',
				value: 'listPolicyChanges',
				description: 'List audit log of CA policy changes',
				action: 'List CA policy changes',
			},
			{
				name: 'List Templates',
				value: 'listTemplates',
				description: 'List saved CA policy templates',
				action: 'List CA templates',
			},
			{
				name: 'Remove Policy',
				value: 'removePolicy',
				description: 'Delete a conditional access policy',
				action: 'Remove a CA policy',
			},
			{
				name: 'Remove Template',
				value: 'removeTemplate',
				description: 'Delete a CA policy template',
				action: 'Remove a CA template',
			},
		],
		default: 'listPolicies',
	},
];

export const conditionalAccessFields: INodeProperties[] = [
	// ── Tenant field (most ops need tenant, except templates) ──
	tenantField('conditionalAccess', [
		'addExclusion',
		'addNamedLocation',
		'addPolicy',
		'addServiceExclusion',
		'addTemplate',
		'checkPolicy',
		'editNamedLocation',
		'editPolicy',
		'listNamedLocations',
		'listPolicies',
		'listPolicyChanges',
		'removePolicy',
	]),

	// ── Return All / Limit for list operations ──
	returnAllField('conditionalAccess', ['listNamedLocations', 'listPolicies', 'listPolicyChanges', 'listTemplates']),
	limitField('conditionalAccess', ['listNamedLocations', 'listPolicies', 'listPolicyChanges', 'listTemplates']),

	// ── Add Policy fields ──
	{
		displayName: 'Template',
		name: 'templateList',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['addPolicy'],
			},
		},
		default: '{ "label": "", "value": "" }',
		description: 'The CA template to deploy as a LabelValue JSON object (label = display name, value = GUID)',
	},
	{
		displayName: 'Additional Fields',
		name: 'addPolicyFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['addPolicy'],
			},
		},
		options: [
			{
				displayName: 'Create Groups',
				name: 'CreateGroups',
				type: 'boolean',
				default: false,
				description: 'Whether to auto-create groups referenced in the policy',
			},
			{
				displayName: 'Disable Self-Destruct',
				name: 'DisableSD',
				type: 'boolean',
				default: false,
				description: 'Whether to disable the self-destruct timer on the policy',
			},
			{
				displayName: 'New State',
				name: 'NewState',
				type: 'options',
				options: [
					{ name: 'Do Not Change', value: 'donotchange' },
					{ name: 'Disabled', value: 'Disabled' },
					{ name: 'Enabled', value: 'Enabled' },
					{ name: 'Report Only', value: 'enabledForReportingButNotEnforced' },
				],
				default: 'donotchange',
				description: 'The state to set on the deployed policy',
			},
			{
				displayName: 'Overwrite',
				name: 'overwrite',
				type: 'boolean',
				default: false,
				description: 'Whether to overwrite an existing policy with the same name',
			},
			{
				displayName: 'Raw JSON',
				name: 'RawJSON',
				type: 'string',
				default: '',
				description: 'Raw JSON policy definition to deploy instead of a template',
			},
			{
				displayName: 'Replace Name',
				name: 'replacename',
				type: 'options',
				options: [
					{ name: 'Leave', value: 'leave' },
					{ name: 'Display Name', value: 'displayName' },
					{ name: 'All Users', value: 'AllUsers' },
				],
				default: 'leave',
				description: 'How to handle the policy display name',
			},
		],
	},

	// ── Edit Policy fields ──
	{
		displayName: 'Policy GUID',
		name: 'policyGuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['editPolicy'],
			},
		},
		default: '',
		description: 'The GUID of the CA policy to edit',
	},
	{
		displayName: 'Additional Fields',
		name: 'editPolicyFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['editPolicy'],
			},
		},
		options: [
			{
				displayName: 'New Display Name',
				name: 'newDisplayName',
				type: 'string',
				default: '',
				description: 'New display name for the policy',
			},
			{
				displayName: 'State',
				name: 'State',
				type: 'options',
				options: [
					{ name: 'Disabled', value: 'Disabled' },
					{ name: 'Enabled', value: 'Enabled' },
					{ name: 'Report Only', value: 'enabledForReportingButNotEnforced' },
				],
				default: 'Enabled',
				description: 'The new state for the policy',
			},
		],
	},

	// ── Remove Policy fields ──
	{
		displayName: 'Policy GUID',
		name: 'removePolicyGuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['removePolicy'],
			},
		},
		default: '',
		description: 'The GUID of the CA policy to remove',
	},

	// ── Add Template fields ──
	{
		displayName: 'Template Name',
		name: 'templateName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['addTemplate'],
			},
		},
		default: '',
		description: 'Name for the new template',
	},
	{
		displayName: 'Policy Source',
		name: 'policySource',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['addTemplate'],
			},
		},
		default: '{ "label": "", "value": "" }',
		description: 'The source CA policy as a LabelValue JSON object',
	},

	// ── Remove Template fields ──
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['removeTemplate'],
			},
		},
		default: '',
		description: 'The ID of the CA template to remove',
	},

	// ── List Templates filters ──
	{
		displayName: 'Filters',
		name: 'listTemplatesFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['listTemplates'],
			},
		},
		options: [
			{
				displayName: 'GUID',
				name: 'GUID',
				type: 'string',
				default: '',
				description: 'Filter by template GUID',
			},
			{
				displayName: 'ID',
				name: 'ID',
				type: 'string',
				default: '',
				description: 'Filter by template ID',
			},
		],
	},

	// ── Add Named Location fields ──
	{
		displayName: 'Location Name',
		name: 'policyName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['addNamedLocation'],
			},
		},
		default: '',
		description: 'Name for the named location',
	},
	{
		displayName: 'Type',
		name: 'locationType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['addNamedLocation'],
			},
		},
		options: [
			{ name: 'Countries', value: 'Countries' },
			{ name: 'IP Location', value: 'IPLocation' },
		],
		default: 'IPLocation',
		description: 'The type of named location',
	},
	{
		displayName: 'Additional Fields',
		name: 'namedLocationFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['addNamedLocation'],
			},
		},
		options: [
			{
				displayName: 'Countries',
				name: 'Countries',
				type: 'json',
				default: '[]',
				description: 'Array of LabelValue objects for country selection (for Countries type)',
			},
			{
				displayName: 'Include Unknown Countries',
				name: 'includeUnknownCountriesAndRegions',
				type: 'boolean',
				default: false,
				description: 'Whether to include unknown countries and regions',
			},
			{
				displayName: 'IP Ranges',
				name: 'Ips',
				type: 'string',
				default: '',
				description: 'IP ranges for the location (for IPLocation type)',
			},
			{
				displayName: 'Trusted',
				name: 'Trusted',
				type: 'boolean',
				default: false,
				description: 'Whether to mark this location as trusted',
			},
		],
	},

	// ── Edit Named Location fields ──
	{
		displayName: 'Named Location ID',
		name: 'namedLocationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['editNamedLocation'],
			},
		},
		default: '',
		description: 'The ID of the named location to edit',
	},
	{
		displayName: 'Change',
		name: 'change',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['editNamedLocation'],
			},
		},
		default: '',
		description: 'The change to apply to the named location',
	},
	{
		displayName: 'Input',
		name: 'input',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['editNamedLocation'],
			},
		},
		default: '',
		description: 'The input value for the change',
	},

	// ── Check Policy fields ──
	{
		displayName: 'User ID',
		name: 'userID',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['checkPolicy'],
			},
		},
		default: '',
		description: 'The user ID to simulate the policy check for',
	},
	{
		displayName: 'Additional Fields',
		name: 'checkPolicyFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['checkPolicy'],
			},
		},
		options: [
			{
				displayName: 'Client App Type',
				name: 'ClientAppType',
				type: 'json',
				default: '',
				description: 'Client app type as LabelValue JSON',
			},
			{
				displayName: 'Country',
				name: 'Country',
				type: 'json',
				default: '',
				description: 'Country as LabelValue JSON',
			},
			{
				displayName: 'Device Platform',
				name: 'DevicePlatform',
				type: 'json',
				default: '',
				description: 'Device platform as LabelValue JSON',
			},
			{
				displayName: 'Include Applications',
				name: 'IncludeApplications',
				type: 'json',
				default: '',
				description: 'Applications to include as LabelValue JSON',
			},
			{
				displayName: 'IP Address',
				name: 'IpAddress',
				type: 'string',
				default: '',
				description: 'IP address for the simulation',
			},
			{
				displayName: 'Sign-In Risk Level',
				name: 'SignInRiskLevel',
				type: 'json',
				default: '',
				description: 'Sign-in risk level as LabelValue JSON',
			},
			{
				displayName: 'User Risk Level',
				name: 'UserRiskLevel',
				type: 'json',
				default: '',
				description: 'User risk level as LabelValue JSON',
			},
		],
	},

	// ── Add Exclusion fields ──
	{
		displayName: 'User ID',
		name: 'exclusionUserId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['addExclusion'],
			},
		},
		default: '',
		description: 'The user ID to exclude',
	},
	{
		displayName: 'Policy ID',
		name: 'exclusionPolicyId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['addExclusion'],
			},
		},
		default: '',
		description: 'The CA policy ID to add the exclusion to',
	},
	{
		displayName: 'Additional Fields',
		name: 'exclusionFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['addExclusion'],
			},
		},
		options: [
			{
				displayName: 'End Date',
				name: 'EndDate',
				type: 'number',
				default: 0,
				description: 'End date as epoch timestamp',
			},
			{
				displayName: 'Exclude Location Audit Alerts',
				name: 'excludeLocationAuditAlerts',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Exclusion Type',
				name: 'ExclusionType',
				type: 'string',
				default: '',
				description: 'The type of exclusion',
			},
			{
				displayName: 'Post Execution',
				name: 'postExecution',
				type: 'json',
				default: '[]',
				description: 'Post-execution actions as JSON array of strings',
			},
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'Reference note for the exclusion',
			},
			{
				displayName: 'Start Date',
				name: 'StartDate',
				type: 'number',
				default: 0,
				description: 'Start date as epoch timestamp',
			},
			{
				displayName: 'Username',
				name: 'Username',
				type: 'string',
				default: '',
				description: 'The username of the excluded user',
			},
			{
				displayName: 'Users',
				name: 'Users',
				type: 'json',
				default: '[]',
				description: 'Additional users as JSON array of strings',
			},
			{
				displayName: 'Vacation',
				name: 'vacation',
				type: 'boolean',
				default: false,
				description: 'Whether this is a vacation exclusion',
			},
		],
	},

	// ── Add Service Exclusion fields ──
	{
		displayName: 'Policy GUID',
		name: 'serviceExclusionGuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['addServiceExclusion'],
			},
		},
		default: '',
		description: 'The GUID of the CA policy for the service exclusion',
	},

	// ── List Policy Changes filters ──
	{
		displayName: 'Filters',
		name: 'policyChangesFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['conditionalAccess'],
				operation: ['listPolicyChanges'],
			},
		},
		options: [
			{
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
				description: 'Filter by policy display name',
			},
			{
				displayName: 'Policy ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Filter by policy ID',
			},
		],
	},
];
