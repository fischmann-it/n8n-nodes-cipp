import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

// ── Operations needing tenant selector ────────────────────────────────
const tenantOps = [
	'getMany',
	'add',
	'assign',
	'remove',
	'listDefenderTvm',
	'listAssignmentFilters',
	'addAssignmentFilter',
	'editAssignmentFilter',
	'deleteAssignmentFilter',
	'addIntuneTemplate',
	'listIntuneScripts',
	'editIntuneScript',
	'removeIntuneScript',
	'listReusableSettings',
	'addReusableSetting',
	'removeReusableSetting',
	'addReusableSettingTemplate',
	'editPolicy',
	'editIntunePolicy',
	'listCompliancePolicies',
	'listAppProtectionPolicies',
	'listDefenderState',
	'addDefenderDeployment',
	'execDevicePasscodeAction',
	'listIntuneIntents',
];

// ── Operations needing returnAll / limit ──────────────────────────────
const listOps = [
	'getMany',
	'listDefenderTvm',
	'listAssignmentFilters',
	'listAssignmentFilterTemplates',
	'listIntuneTemplates',
	'listIntuneScripts',
	'listReusableSettings',
	'listReusableSettingTemplates',
	'listCompliancePolicies',
	'listAppProtectionPolicies',
	'listDefenderState',
	'listIntuneIntents',
];

export const policyOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['policy'],
			},
		},
		options: [
			{
				name: 'Add',
				value: 'add',
				description: 'Add an Intune policy',
				action: 'Add policy',
			},
			{
				name: 'Add Assignment Filter',
				value: 'addAssignmentFilter',
				description: 'Create an Intune assignment filter',
				action: 'Add assignment filter',
			},
			{
				name: 'Add Assignment Filter Template',
				value: 'addAssignmentFilterTemplate',
				description: 'Create an assignment filter template',
				action: 'Add assignment filter template',
			},
			{
				name: 'Add Defender Deployment',
				value: 'addDefenderDeployment',
				description: 'Deploy Defender for Endpoint configuration',
				action: 'Add defender deployment',
			},
			{
				name: 'Add Intune Template',
				value: 'addIntuneTemplate',
				description: 'Create an Intune policy template',
				action: 'Add intune template',
			},
			{
				name: 'Add Reusable Setting',
				value: 'addReusableSetting',
				description: 'Create an Intune reusable setting',
				action: 'Add reusable setting',
			},
			{
				name: 'Add Reusable Setting Template',
				value: 'addReusableSettingTemplate',
				description: 'Create a reusable setting template',
				action: 'Add reusable setting template',
			},
			{
				name: 'Assign',
				value: 'assign',
				description: 'Assign a policy to users or devices',
				action: 'Assign policy',
			},
			{
				name: 'Delete Assignment Filter',
				value: 'deleteAssignmentFilter',
				description: 'Delete an Intune assignment filter',
				action: 'Delete assignment filter',
			},
			{
				name: 'Edit Assignment Filter',
				value: 'editAssignmentFilter',
				description: 'Edit an Intune assignment filter',
				action: 'Edit assignment filter',
			},
			{
				name: 'Edit Intune Policy',
				value: 'editIntunePolicy',
				description: 'Rename or change the type of an Intune policy',
				action: 'Edit intune policy',
			},
			{
				name: 'Edit Intune Script',
				value: 'editIntuneScript',
				description: 'Update an Intune script',
				action: 'Edit intune script',
			},
			{
				name: 'Edit Policy',
				value: 'editPolicy',
				description: 'Edit policy assignment and display properties',
				action: 'Edit policy',
			},
			{
				name: 'Exec Device Passcode Action',
				value: 'execDevicePasscodeAction',
				description: 'Execute a passcode action on a device',
				action: 'Exec device passcode action',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'List Intune policies',
				action: 'Get many policies',
			},
			{
				name: 'List App Protection Policies',
				value: 'listAppProtectionPolicies',
				description: 'List Intune app protection policies',
				action: 'List app protection policies',
			},
			{
				name: 'List Assignment Filter Templates',
				value: 'listAssignmentFilterTemplates',

				action: 'List assignment filter templates',
			},
			{
				name: 'List Assignment Filters',
				value: 'listAssignmentFilters',
				description: 'List Intune assignment filters',
				action: 'List assignment filters',
			},
			{
				name: 'List Compliance Policies',
				value: 'listCompliancePolicies',
				description: 'List Intune compliance policies',
				action: 'List compliance policies',
			},
			{
				name: 'List Defender State',
				value: 'listDefenderState',
				description: 'List Defender for Endpoint state per device',
				action: 'List defender state',
			},
			{
				name: 'List Defender TVM',
				value: 'listDefenderTvm',
				description: 'List Defender Threat and Vulnerability Management data',
				action: 'List defender tvm',
			},
			{
				name: 'List Intune Intents',
				value: 'listIntuneIntents',
				description: 'List Intune configuration intents',
				action: 'List intune intents',
			},
			{
				name: 'List Intune Scripts',
				value: 'listIntuneScripts',

				action: 'List intune scripts',
			},
			{
				name: 'List Intune Templates',
				value: 'listIntuneTemplates',
				description: 'List Intune policy templates',
				action: 'List intune templates',
			},
			{
				name: 'List Reusable Setting Templates',
				value: 'listReusableSettingTemplates',
				description: 'List Intune reusable setting templates',
				action: 'List reusable setting templates',
			},
			{
				name: 'List Reusable Settings',
				value: 'listReusableSettings',
				description: 'List Intune reusable settings',
				action: 'List reusable settings',
			},
			{
				name: 'Remove',
				value: 'remove',
				description: 'Remove an Intune policy',
				action: 'Remove policy',
			},
			{
				name: 'Remove Assignment Filter Template',
				value: 'removeAssignmentFilterTemplate',
				description: 'Remove an assignment filter template',
				action: 'Remove assignment filter template',
			},
			{
				name: 'Remove Intune Script',
				value: 'removeIntuneScript',
				description: 'Remove an Intune script',
				action: 'Remove intune script',
			},
			{
				name: 'Remove Intune Template',
				value: 'removeIntuneTemplate',
				description: 'Remove an Intune policy template',
				action: 'Remove intune template',
			},
			{
				name: 'Remove Reusable Setting',
				value: 'removeReusableSetting',
				description: 'Remove an Intune reusable setting',
				action: 'Remove reusable setting',
			},
			{
				name: 'Remove Reusable Setting Template',
				value: 'removeReusableSettingTemplate',
				description: 'Remove a reusable setting template',
				action: 'Remove reusable setting template',
			},
		],
		default: 'getMany',
	},
];

export const policyFields: INodeProperties[] = [
	// ── Shared helpers ────────────────────────────────────────────────────
	tenantField('policy', tenantOps),
	returnAllField('policy', listOps),
	limitField('policy', listOps),

	// ── Existing: Policy ID (assign, remove) ──────────────────────────────
	{
		displayName: 'Policy ID',
		name: 'policyId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['assign', 'remove', 'editIntunePolicy'],
			},
		},
		default: '',
		description: 'The ID of the policy',
	},

	// ── Existing: Assign fields ───────────────────────────────────────────
	{
		displayName: 'Assign To',
		name: 'assignTo',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['assign'],
			},
		},
		options: [
			{ name: 'All Users', value: 'allUsers' },
			{ name: 'All Devices', value: 'allDevices' },
			{ name: 'Custom Group', value: 'customGroup' },
		],
		default: 'allUsers',
		description: 'Target for policy assignment',
	},
	{
		displayName: 'Group Names',
		name: 'customGroupNames',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['assign'],
				assignTo: ['customGroup'],
			},
		},
		default: '',
		placeholder: 'e.g. Group1, Group2',
		description: 'Comma-separated list of group names to assign the policy to',
	},

	// ── Existing: Add policy ──────────────────────────────────────────────
	{
		displayName: 'Policy Configuration',
		name: 'policyConfig',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['add'],
			},
		},
		default: '{}',
		description: 'JSON configuration for the new policy',
	},

	// ══════════════════════════════════════════════════════════════════════
	// Group 1: Assignment Filters
	// ══════════════════════════════════════════════════════════════════════

	// -- editAssignmentFilter: required filter ID
	{
		displayName: 'Filter ID',
		name: 'filterId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['editAssignmentFilter'],
			},
		},
		required: true,
		default: '',
		description: 'The assignment filter ID',
	},
	// -- listAssignmentFilters: optional filter ID
	{
		displayName: 'Filter ID',
		name: 'filterId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['listAssignmentFilters'],
			},
		},
		default: '',
		description: 'Filter by a specific assignment filter ID',
	},

	// -- addAssignmentFilter
	{
		displayName: 'Display Name',
		name: 'displayName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: [
					'addAssignmentFilter',
					'addAssignmentFilterTemplate',
					'addReusableSettingTemplate',
				],
			},
		},
		default: '',
		description: 'Display name for the resource',
	},
	{
		displayName: 'Additional Fields',
		name: 'assignmentFilterOptions',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['addAssignmentFilter'],
			},
		},
		options: [
			{
				displayName: 'Assignment Filter Management Type',
				name: 'assignmentFilterManagementType',
				type: 'options',
				default: 'devices',
				options: [
					{ name: 'Apps', value: 'apps' },
					{ name: 'Devices', value: 'devices' },
				],
				description: 'Whether the filter targets devices or apps',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the assignment filter',
			},
			{
				displayName: 'Platform',
				name: 'platform',
				type: 'string',
				default: '',
				description: 'Target platform (e.g. windows10AndLater)',
			},
			{
				displayName: 'Rule',
				name: 'rule',
				type: 'string',
				default: '',
				description: 'Filter rule expression',
			},
		],
	},

	// -- editAssignmentFilter
	{
		displayName: 'Fields to Update',
		name: 'editAssignmentFilterFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['editAssignmentFilter'],
			},
		},
		options: [
			{
				displayName: 'Assignment Filter Management Type',
				name: 'assignmentFilterManagementType',
				type: 'options',
				default: 'devices',
				options: [
					{ name: 'Apps', value: 'apps' },
					{ name: 'Devices', value: 'devices' },
				],
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Platform',
				name: 'platform',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Rule',
				name: 'rule',
				type: 'string',
				default: '',
			},
		],
	},

	// -- deleteAssignmentFilter
	{
		displayName: 'Assignment Filter ID',
		name: 'assignmentFilterId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['deleteAssignmentFilter'],
			},
		},
		default: '',
		description: 'The ID of the assignment filter to delete',
	},

	// -- Template ID (shared across template operations)
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: [
					'removeAssignmentFilterTemplate',
					'removeIntuneTemplate',
					'removeReusableSettingTemplate',
				],
			},
		},
		default: '',
		description: 'The ID of the template',
	},
	// Optional template ID for list operations
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: [
					'listAssignmentFilterTemplates',
					'listReusableSettingTemplates',
				],
			},
		},
		default: '',
		description: 'Filter by a specific template ID',
	},

	// -- addAssignmentFilterTemplate
	{
		displayName: 'Additional Fields',
		name: 'assignmentFilterTemplateOptions',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['addAssignmentFilterTemplate'],
			},
		},
		options: [
			{
				displayName: 'Assignment Filter Management Type',
				name: 'assignmentFilterManagementType',
				type: 'options',
				default: 'devices',
				options: [
					{ name: 'Apps', value: 'apps' },
					{ name: 'Devices', value: 'devices' },
				],
			},
			{
				displayName: 'Description',
				name: 'Description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'GUID',
				name: 'GUID',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Platform',
				name: 'platform',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Rule',
				name: 'rule',
				type: 'string',
				default: '',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════════════
	// Group 2: Intune Templates
	// ══════════════════════════════════════════════════════════════════════

	// -- listIntuneTemplates filters
	{
		displayName: 'Filters',
		name: 'intuneTemplateFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['listIntuneTemplates'],
			},
		},
		options: [
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Filter by template ID',
			},
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'string',
				default: '',
				description: 'Filter mode',
			},
			{
				displayName: 'View',
				name: 'View',
				type: 'string',
				default: '',
				description: 'View filter',
			},
		],
	},

	// -- addIntuneTemplate: RawJSON (required)
	{
		displayName: 'Raw JSON',
		name: 'rawJSON',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['addIntuneTemplate', 'addReusableSetting', 'addReusableSettingTemplate'],
			},
		},
		default: '{}',
		description: 'Raw JSON configuration for the template or setting',
	},

	// -- addIntuneTemplate options
	{
		displayName: 'Additional Fields',
		name: 'intuneTemplateOptions',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['addIntuneTemplate'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'ID',
				name: 'ID',
				type: 'string',
				default: '',
			},
			{
				displayName: 'OData Type',
				name: 'ODataType',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Policy Source',
				name: 'policySource',
				type: 'json',
				default: '{}',
				placeholder: '{"value": "ID", "label": "name"}',
				description: 'Policy source as a LabelValue JSON object',
			},
			{
				displayName: 'Template Type',
				name: 'TemplateType',
				type: 'string',
				default: '',
			},
			{
				displayName: 'URL Name',
				name: 'URLName',
				type: 'string',
				default: '',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════════════
	// Group 3: Intune Scripts
	// ══════════════════════════════════════════════════════════════════════

	// -- Script ID (edit + remove)
	{
		displayName: 'Script ID',
		name: 'scriptId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['editIntuneScript', 'removeIntuneScript'],
			},
		},
		default: '',
		description: 'The ID of the Intune script',
	},

	// -- editIntuneScript options
	{
		displayName: 'Fields to Update',
		name: 'editIntuneScriptFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['editIntuneScript'],
			},
		},
		options: [
			{
				displayName: 'Intune Script',
				name: 'IntuneScript',
				type: 'string',
				default: '',
				description: 'The script content',
			},
			{
				displayName: 'Script Type',
				name: 'ScriptType',
				type: 'string',
				default: '',
				description: 'The type of script',
			},
		],
	},

	// -- removeIntuneScript options
	{
		displayName: 'Additional Fields',
		name: 'removeIntuneScriptFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['removeIntuneScript'],
			},
		},
		options: [
			{
				displayName: 'Display Name',
				name: 'DisplayName',
				type: 'string',
				default: '',
				description: 'Display name of the script (for logging)',
			},
			{
				displayName: 'Script Type',
				name: 'ScriptType',
				type: 'string',
				default: '',
				description: 'The type of script',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════════════
	// Group 4: Reusable Settings
	// ══════════════════════════════════════════════════════════════════════

	// -- Setting ID (list filter + remove)
	{
		displayName: 'Setting ID',
		name: 'settingId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['removeReusableSetting'],
			},
		},
		default: '',
		description: 'The ID of the reusable setting',
	},
	{
		displayName: 'Setting ID',
		name: 'settingId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['listReusableSettings'],
			},
		},
		default: '',
		description: 'Filter by a specific setting ID',
	},

	// -- removeReusableSetting: optional display name
	{
		displayName: 'Display Name',
		name: 'settingDisplayName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['removeReusableSetting'],
			},
		},
		default: '',
		description: 'Display name of the setting (for logging)',
	},

	// -- addReusableSetting options
	{
		displayName: 'Additional Fields',
		name: 'reusableSettingOptions',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['addReusableSetting'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'ID',
				name: 'ID',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Template ID',
				name: 'TemplateId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Template List',
				name: 'TemplateList',
				type: 'string',
				default: '',
			},
		],
	},

	// -- addReusableSettingTemplate options
	{
		displayName: 'Additional Fields',
		name: 'reusableSettingTemplateOptions',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['addReusableSettingTemplate'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'GUID',
				name: 'GUID',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Package',
				name: 'package',
				type: 'string',
				default: '',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════════════
	// Group 5: Policy Edit / List
	// ══════════════════════════════════════════════════════════════════════

	// -- editPolicy fields
	{
		displayName: 'Fields to Update',
		name: 'editPolicyFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['editPolicy'],
			},
		},
		options: [
			{
				displayName: 'Assign To',
				name: 'Assignto',
				type: 'string',
				default: '',
				description: 'Assignment target',
			},
			{
				displayName: 'Description',
				name: 'Description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Display Name',
				name: 'Displayname',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Group ID',
				name: 'groupid',
				type: 'string',
				default: '',
				description: 'Target group ID',
			},
		],
	},

	// -- editIntunePolicy fields
	{
		displayName: 'Fields to Update',
		name: 'editIntunePolicyFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['editIntunePolicy'],
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
				displayName: 'Policy Type',
				name: 'policyType',
				type: 'string',
				default: '',
				description: 'The policy type identifier',
			},
		],
	},

	// -- listDefenderState: optional DeviceID filter
	{
		displayName: 'Device ID',
		name: 'deviceId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['listDefenderState'],
			},
		},
		default: '',
		description: 'Filter by a specific device ID',
	},

	// ══════════════════════════════════════════════════════════════════════
	// Group 6: Defender Deployment + Passcode
	// ══════════════════════════════════════════════════════════════════════

	// -- addDefenderDeployment: JSON config
	{
		displayName: 'Deployment Configuration',
		name: 'deploymentConfig',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['addDefenderDeployment'],
			},
		},
		default: '{}',

		description:
			'Full JSON deployment config including ASR, Compliance, EDR, Exclusion, and Policy objects. See CIPP API docs for the complete schema.',
	},

	// -- execDevicePasscodeAction
	{
		displayName: 'Action',
		name: 'passcodeAction',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['execDevicePasscodeAction'],
			},
		},
		default: '',
		description: 'The passcode action to execute on the device',
	},
	{
		displayName: 'Device GUID',
		name: 'deviceGuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['execDevicePasscodeAction'],
			},
		},
		default: '',
		description: 'The GUID of the target device',
	},
];
