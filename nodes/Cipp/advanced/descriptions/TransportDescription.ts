import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

export const transportOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transport'],
			},
		},
		options: [
			{
				name: 'Add Connection Filter',
				value: 'addConnectionFilter',
				description: 'Deploy a connection filter from template or PowerShell command',
				action: 'Add a connection filter',
			},
			{
				name: 'Add Connection Filter Template',
				value: 'addConnectionFilterTemplate',
				description: 'Save a connection filter as a reusable template',
				action: 'Add a connection filter template',
			},
			{
				name: 'Add Connector',
				value: 'addConnector',
				description: 'Deploy an Exchange connector from template or PowerShell command',
				action: 'Add an exchange connector',
			},
			{
				name: 'Add Connector Template',
				value: 'addConnectorTemplate',
				description: 'Save an Exchange connector as a reusable template',
				action: 'Add a connector template',
			},
			{
				name: 'Add or Edit Rule',
				value: 'addEditRule',
				description: 'Create or edit a transport rule with full field control',
				action: 'Add or edit a transport rule',
			},
			{
				name: 'Add Rule',
				value: 'addRule',
				description: 'Deploy a transport rule from template or PowerShell command',
				action: 'Add a transport rule',
			},
			{
				name: 'Add Rule Template',
				value: 'addRuleTemplate',
				description: 'Save a transport rule as a reusable template',
				action: 'Add a transport rule template',
			},
			{
				name: 'Edit Connector',
				value: 'editConnector',
				description: 'Change the state of an Exchange connector',
				action: 'Edit an exchange connector',
			},
			{
				name: 'Edit Rule',
				value: 'editRule',
				description: 'Change the state of a transport rule',
				action: 'Edit a transport rule',
			},
			{
				name: 'List Connection Filter Templates',
				value: 'listConnectionFilterTemplates',
				description: 'List saved connection filter templates',
				action: 'List connection filter templates',
			},
			{
				name: 'List Connection Filters',
				value: 'listConnectionFilters',
				description: 'List connection filters for a tenant',
				action: 'List connection filters',
			},
			{
				name: 'List Connector Templates',
				value: 'listConnectorTemplates',
				description: 'List saved Exchange connector templates',
				action: 'List connector templates',
			},
			{
				name: 'List Connectors',
				value: 'listConnectors',
				description: 'List Exchange connectors for a tenant',
				action: 'List exchange connectors',
			},
			{
				name: 'List Rule Templates',
				value: 'listRuleTemplates',
				description: 'List saved transport rule templates',
				action: 'List transport rule templates',
			},
			{
				name: 'List Rules',
				value: 'listRules',
				description: 'List transport rules for a tenant',
				action: 'List transport rules',
			},
			{
				name: 'Remove Connection Filter Template',
				value: 'removeConnectionFilterTemplate',
				description: 'Delete a connection filter template',
				action: 'Remove a connection filter template',
			},
			{
				name: 'Remove Connector',
				value: 'removeConnector',
				description: 'Remove an Exchange connector',
				action: 'Remove an exchange connector',
			},
			{
				name: 'Remove Connector Template',
				value: 'removeConnectorTemplate',
				description: 'Delete an Exchange connector template',
				action: 'Remove a connector template',
			},
			{
				name: 'Remove Rule',
				value: 'removeRule',
				description: 'Remove a transport rule',
				action: 'Remove a transport rule',
			},
			{
				name: 'Remove Rule Template',
				value: 'removeRuleTemplate',
				description: 'Delete a transport rule template',
				action: 'Remove a transport rule template',
			},
		],
		default: 'listRules',
	},
];

export const transportFields: INodeProperties[] = [
	// ── Tenant field (list/edit/remove ops need tenant; template ops and add-from-template use selectedTenants or none) ──
	tenantField('transport', [
		'addEditRule',
		'editRule',
		'removeRule',
		'listRules',
		'editConnector',
		'removeConnector',
		'listConnectors',
		'addConnectionFilter',
		'listConnectionFilters',
		'addRule',
		'addConnector',
	]),

	// ── Return All / Limit for list operations ──
	returnAllField('transport', [
		'listRules',
		'listRuleTemplates',
		'listConnectors',
		'listConnectorTemplates',
		'listConnectionFilters',
		'listConnectionFilterTemplates',
	]),
	limitField('transport', [
		'listRules',
		'listRuleTemplates',
		'listConnectors',
		'listConnectorTemplates',
		'listConnectionFilters',
		'listConnectionFilterTemplates',
	]),

	// ══════════════════════════════════════════════
	// ── Transport Rules ──
	// ══════════════════════════════════════════════

	// ── Add Rule (from template/PowerShell) ──
	{
		displayName: 'PowerShell Command',
		name: 'powerShellCommand',
		type: 'string',
		typeOptions: { rows: 4 },
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addRule'],
			},
		},
		default: '',
		description: 'PowerShell command to create the transport rule (provide this or Template)',
	},
	{
		displayName: 'Additional Fields',
		name: 'addRuleFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addRule'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name for the transport rule',
			},
			{
				displayName: 'PS Object',
				name: 'PSObject',
				type: 'string',
				default: '',
				description: 'PowerShell serialized object',
			},
			{
				displayName: 'Template',
				name: 'TemplateList',
				type: 'json',
				default: '{ "label": "", "value": "" }',
				description: 'Template to deploy as a LabelValue JSON object',
			},
		],
	},

	// ── Add/Edit Rule (full control) ──
	{
		displayName: 'Rule Name',
		name: 'addEditRuleName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addEditRule'],
			},
		},
		default: '',
		description: 'Name of the transport rule to create or edit',
	},
	{
		displayName: 'Enabled',
		name: 'addEditRuleEnabled',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addEditRule'],
			},
		},
		default: true,
		description: 'Whether the transport rule is enabled',
	},
	{
		displayName: 'Conditions',
		name: 'addEditRuleConditions',
		type: 'collection',
		placeholder: 'Add Condition',
		default: {},
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addEditRule'],
			},
		},
		options: [
			{
				displayName: 'Apply to All Messages',
				name: 'applyToAllMessages',
				type: 'boolean',
				default: false,
				description: 'Whether to apply the rule to all messages',
			},
			{
				displayName: 'Attachment Contains Words',
				name: 'AttachmentContainsWords',
				type: 'string',
				default: '',
				description: 'Match when attachment contains these words (comma-separated)',
			},
			{
				displayName: 'From',
				name: 'From',
				type: 'string',
				default: '',
				description: 'Match messages from this sender',
			},
			{
				displayName: 'From Address Contains Words',
				name: 'FromAddressContainsWords',
				type: 'string',
				default: '',
				description: 'Match when sender address contains these words (comma-separated)',
			},
			{
				displayName: 'From Member Of',
				name: 'FromMemberOf',
				type: 'string',
				default: '',
				description: 'Match when sender is a member of this group',
			},
			{
				displayName: 'From Scope',
				name: 'FromScope',
				type: 'options',
				options: [
					{ name: 'In Organization', value: 'InOrganization' },
					{ name: 'Not In Organization', value: 'NotInOrganization' },
				],
				default: 'InOrganization',
				description: 'Match messages from internal or external senders',
			},
			{
				displayName: 'Message Size Over (KB)',
				name: 'MessageSizeOver',
				type: 'number',
				default: 0,
				description: 'Match when message size exceeds this value in KB',
			},
			{
				displayName: 'Message Type Matches',
				name: 'MessageTypeMatches',
				type: 'string',
				default: '',
				description: 'Match this message type',
			},
			{
				displayName: 'Recipient Domain Is',
				name: 'RecipientDomainIs',
				type: 'string',
				default: '',
				description: 'Match when recipient domain is this value (comma-separated)',
			},
			{
				displayName: 'SCL Over',
				name: 'SCLOver',
				type: 'number',
				default: 0,
				description: 'Match when Spam Confidence Level exceeds this value',
			},
			{
				displayName: 'Sender Domain Is',
				name: 'SenderDomainIs',
				type: 'string',
				default: '',
				description: 'Match when sender domain is this value (comma-separated)',
			},
			{
				displayName: 'Sender IP Ranges',
				name: 'SenderIpRanges',
				type: 'string',
				default: '',
				description: 'Match when sender IP is in these ranges (comma-separated CIDR)',
			},
			{
				displayName: 'Sent To',
				name: 'SentTo',
				type: 'string',
				default: '',
				description: 'Match messages sent to this recipient',
			},
			{
				displayName: 'Sent To Member Of',
				name: 'SentToMemberOf',
				type: 'string',
				default: '',
				description: 'Match when recipient is a member of this group',
			},
			{
				displayName: 'Sent To Scope',
				name: 'SentToScope',
				type: 'options',
				options: [
					{ name: 'In Organization', value: 'InOrganization' },
					{ name: 'Not In Organization', value: 'NotInOrganization' },
				],
				default: 'InOrganization',
				description: 'Match messages sent to internal or external recipients',
			},
			{
				displayName: 'Subject Contains Words',
				name: 'SubjectContainsWords',
				type: 'string',
				default: '',
				description: 'Match when subject contains these words (comma-separated)',
			},
			{
				displayName: 'Subject or Body Contains Words',
				name: 'SubjectOrBodyContainsWords',
				type: 'string',
				default: '',
				description: 'Match when subject or body contains these words (comma-separated)',
			},
		],
	},
	{
		displayName: 'Actions',
		name: 'addEditRuleActions',
		type: 'collection',
		placeholder: 'Add Action',
		default: {},
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addEditRule'],
			},
		},
		options: [
			{
				displayName: 'Apply OME',
				name: 'ApplyOME',
				type: 'boolean',
				default: false,
				description: 'Whether to apply Office Message Encryption',
			},
			{
				displayName: 'Blind Copy To',
				name: 'BlindCopyTo',
				type: 'string',
				default: '',
				description: 'BCC recipient address',
			},
			{
				displayName: 'Copy To',
				name: 'CopyTo',
				type: 'string',
				default: '',
				description: 'CC recipient address',
			},
			{
				displayName: 'Delete Message',
				name: 'DeleteMessage',
				type: 'boolean',
				default: false,
				description: 'Whether to delete the message',
			},
			{
				displayName: 'Disclaimer Fallback Action',
				name: 'ApplyHtmlDisclaimerFallbackAction',
				type: 'options',
				options: [
					{ name: 'Wrap', value: 'Wrap' },
					{ name: 'Ignore', value: 'Ignore' },
					{ name: 'Reject', value: 'Reject' },
				],
				default: 'Wrap',
				description: 'Action when HTML disclaimer cannot be applied',
			},
			{
				displayName: 'Disclaimer Location',
				name: 'ApplyHtmlDisclaimerLocation',
				type: 'options',
				options: [
					{ name: 'Append', value: 'Append' },
					{ name: 'Prepend', value: 'Prepend' },
				],
				default: 'Append',
				description: 'Where to place the HTML disclaimer',
			},
			{
				displayName: 'Disclaimer Text',
				name: 'ApplyHtmlDisclaimerText',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description: 'HTML disclaimer text to apply to messages',
			},
			{
				displayName: 'With Importance',
				name: 'WithImportance',
				type: 'options',
				options: [
					{ name: 'Low', value: 'Low' },
					{ name: 'Normal', value: 'Normal' },
					{ name: 'High', value: 'High' },
				],
				default: 'Normal',
				description: 'Set message importance level',
			},
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'addEditRuleFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addEditRule'],
			},
		},
		options: [
			{
				displayName: 'Activation Date',
				name: 'ActivationDate',
				type: 'string',
				default: '',
				description: 'Date when the rule becomes active (ISO 8601)',
			},
			{
				displayName: 'Comments',
				name: 'Comments',
				type: 'string',
				default: '',
				description: 'Comments for the transport rule',
			},
			{
				displayName: 'Extra Properties (JSON)',
				name: 'extraProperties',
				type: 'json',
				default: '{}',
				description: 'Additional transport rule properties not listed above, as a JSON object. These are merged into the request body.',
			},
		],
	},

	// ── Edit Rule (state change) ──
	{
		displayName: 'Rule GUID',
		name: 'editRuleGuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['editRule'],
			},
		},
		default: '',
		description: 'The GUID of the transport rule to edit',
	},
	{
		displayName: 'State',
		name: 'editRuleState',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['editRule'],
			},
		},
		options: [
			{ name: 'Enable', value: 'Enable' },
			{ name: 'Disable', value: 'Disable' },
		],
		default: 'Enable',
		description: 'The new state for the transport rule',
	},

	// ── Remove Rule ──
	{
		displayName: 'Rule GUID',
		name: 'removeRuleGuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['removeRule'],
			},
		},
		default: '',
		description: 'The GUID of the transport rule to remove',
	},

	// ══════════════════════════════════════════════
	// ── Transport Rule Templates ──
	// ══════════════════════════════════════════════

	// ── Add Rule Template ──
	{
		displayName: 'Template Name',
		name: 'ruleTemplateName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addRuleTemplate'],
			},
		},
		default: '',
		description: 'Name for the transport rule template',
	},
	{
		displayName: 'PowerShell Command',
		name: 'ruleTemplatePowerShell',
		type: 'string',
		typeOptions: { rows: 4 },
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addRuleTemplate'],
			},
		},
		default: '',
		description: 'PowerShell command that defines the transport rule',
	},

	// ── List Rule Templates filters ──
	{
		displayName: 'Filters',
		name: 'listRuleTemplatesFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['listRuleTemplates'],
			},
		},
		options: [
			{
				displayName: 'Template ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Filter by template ID',
			},
		],
	},

	// ── Remove Rule Template ──
	{
		displayName: 'Template ID',
		name: 'removeRuleTemplateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['removeRuleTemplate'],
			},
		},
		default: '',
		description: 'The ID of the transport rule template to remove',
	},

	// ══════════════════════════════════════════════
	// ── Exchange Connectors ──
	// ══════════════════════════════════════════════

	// ── Add Connector (from template/PowerShell) ──
	{
		displayName: 'PowerShell Command',
		name: 'connectorPowerShell',
		type: 'string',
		typeOptions: { rows: 4 },
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addConnector'],
			},
		},
		default: '',
		description: 'PowerShell command to create the Exchange connector (provide this or Template)',
	},
	{
		displayName: 'Additional Fields',
		name: 'addConnectorFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addConnector'],
			},
		},
		options: [
			{
				displayName: 'Comment',
				name: 'comment',
				type: 'string',
				default: '',
				description: 'Comment for the connector',
			},
			{
				displayName: 'Template',
				name: 'TemplateList',
				type: 'json',
				default: '{ "label": "", "value": "" }',
				description: 'Template to deploy as a LabelValue JSON object',
			},
		],
	},

	// ── Edit Connector ──
	{
		displayName: 'Connector GUID',
		name: 'editConnectorGuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['editConnector'],
			},
		},
		default: '',
		description: 'The GUID of the Exchange connector to edit',
	},
	{
		displayName: 'State',
		name: 'editConnectorState',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['editConnector'],
			},
		},
		options: [
			{ name: 'Enable', value: 'Enable' },
			{ name: 'Disable', value: 'Disable' },
		],
		default: 'Enable',
		description: 'The new state for the connector',
	},
	{
		displayName: 'Type',
		name: 'editConnectorType',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['editConnector'],
			},
		},
		default: '',
		description: 'The type of the Exchange connector',
	},

	// ── Remove Connector ──
	{
		displayName: 'Connector GUID',
		name: 'removeConnectorGuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['removeConnector'],
			},
		},
		default: '',
		description: 'The GUID of the Exchange connector to remove',
	},
	{
		displayName: 'Type',
		name: 'removeConnectorType',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['removeConnector'],
			},
		},
		default: '',
		description: 'The type of the Exchange connector to remove',
	},

	// ══════════════════════════════════════════════
	// ── Connector Templates ──
	// ══════════════════════════════════════════════

	// ── Add Connector Template ──
	{
		displayName: 'Template Name',
		name: 'connectorTemplateName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addConnectorTemplate'],
			},
		},
		default: '',
		description: 'Name for the connector template',
	},
	{
		displayName: 'Connector Type',
		name: 'connectorTemplateType',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addConnectorTemplate'],
			},
		},
		default: '',
		description: 'The type of connector (e.g. inbound, outbound)',
	},

	// ── List Connector Templates filters ──
	{
		displayName: 'Filters',
		name: 'listConnectorTemplatesFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['listConnectorTemplates'],
			},
		},
		options: [
			{
				displayName: 'Template ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Filter by template ID',
			},
		],
	},

	// ── Remove Connector Template ──
	{
		displayName: 'Template ID',
		name: 'removeConnectorTemplateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['removeConnectorTemplate'],
			},
		},
		default: '',
		description: 'The ID of the connector template to remove',
	},

	// ══════════════════════════════════════════════
	// ── Connection Filters ──
	// ══════════════════════════════════════════════

	// ── Add Connection Filter (from template/PowerShell) ──
	{
		displayName: 'PowerShell Command',
		name: 'connectionFilterPowerShell',
		type: 'string',
		typeOptions: { rows: 4 },
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addConnectionFilter'],
			},
		},
		default: '',
		description: 'PowerShell command to create the connection filter (provide this or Template)',
	},
	{
		displayName: 'Additional Fields',
		name: 'addConnectionFilterFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addConnectionFilter'],
			},
		},
		options: [
			{
				displayName: 'Template',
				name: 'TemplateList',
				type: 'json',
				default: '{ "label": "", "value": "" }',
				description: 'Template to deploy as a LabelValue JSON object',
			},
		],
	},

	// ── Add Connection Filter Template ──
	{
		displayName: 'Template Name',
		name: 'connectionFilterTemplateName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addConnectionFilterTemplate'],
			},
		},
		default: '',
		description: 'Name for the connection filter template',
	},
	{
		displayName: 'PowerShell Command',
		name: 'connectionFilterTemplatePowerShell',
		type: 'string',
		typeOptions: { rows: 4 },
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['addConnectionFilterTemplate'],
			},
		},
		default: '',
		description: 'PowerShell command that defines the connection filter',
	},

	// ── List Connection Filter Templates filters ──
	{
		displayName: 'Filters',
		name: 'listConnectionFilterTemplatesFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['listConnectionFilterTemplates'],
			},
		},
		options: [
			{
				displayName: 'Template ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Filter by template ID',
			},
		],
	},

	// ── Remove Connection Filter Template ──
	{
		displayName: 'Template ID',
		name: 'removeConnectionFilterTemplateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transport'],
				operation: ['removeConnectionFilterTemplate'],
			},
		},
		default: '',
		description: 'The ID of the connection filter template to remove',
	},
];
