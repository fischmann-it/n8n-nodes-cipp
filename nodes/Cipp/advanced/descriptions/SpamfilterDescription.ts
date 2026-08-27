import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

export const spamfilterOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['spamfilter'],
			},
		},
		options: [
			{
				name: 'Add Quarantine Policy',
				value: 'addQuarantinePolicy',
				description: 'Deploy a quarantine policy from template or custom settings',
				action: 'Add a quarantine policy',
			},
			{
				name: 'Add Spam Filter',
				value: 'addSpamFilter',
				description: 'Deploy a spam filter from template or PowerShell command',
				action: 'Add a spam filter',
			},
			{
				name: 'Add Spam Filter Template',
				value: 'addSpamFilterTemplate',
				description: 'Create a spam filter template',
				action: 'Add a spam filter template',
			},
			{
				name: 'Add Tenant Allow/Block List Entry',
				value: 'addTenantAllowBlockList',
				description: 'Add an entry to the tenant allow/block list',
				action: 'Add a tenant allow block list entry',
			},
			{
				name: 'Edit Anti-Phishing Filter',
				value: 'editAntiPhishingFilter',
				description: 'Enable or disable an anti-phishing filter rule',
				action: 'Edit an anti phishing filter',
			},
			{
				name: 'Edit Malware Filter',
				value: 'editMalwareFilter',
				description: 'Enable or disable a malware filter rule',
				action: 'Edit a malware filter',
			},
			{
				name: 'Edit Quarantine Policy',
				value: 'editQuarantinePolicy',
				description: 'Edit a quarantine policy',
				action: 'Edit a quarantine policy',
			},
			{
				name: 'Edit Safe Attachments Filter',
				value: 'editSafeAttachmentsFilter',
				description: 'Enable or disable a safe attachments filter rule',
				action: 'Edit a safe attachments filter',
			},
			{
				name: 'Edit Spam Filter',
				value: 'editSpamFilter',
				description: 'Enable or disable a spam filter rule',
				action: 'Edit a spam filter',
			},
			{
				name: 'List Anti-Phishing Filters',
				value: 'listAntiPhishingFilters',
				description: 'List anti-phishing filter rules for a tenant',
				action: 'List anti phishing filters',
			},
			{
				name: 'List Malware Filters',
				value: 'listMalwareFilters',
				description: 'List malware filter rules for a tenant',
				action: 'List malware filters',
			},
			{
				name: 'List Quarantine Policies',
				value: 'listQuarantinePolicies',
				description: 'List quarantine policies for a tenant',
				action: 'List quarantine policies',
			},
			{
				name: 'List Safe Attachments Filters',
				value: 'listSafeAttachmentsFilters',
				description: 'List safe attachments filter rules for a tenant',
				action: 'List safe attachments filters',
			},
			{
				name: 'List Spam Filter Templates',
				value: 'listSpamFilterTemplates',
				description: 'List available spam filter templates',
				action: 'List spam filter templates',
			},
			{
				name: 'List Spam Filters',
				value: 'listSpamfilters',
				description: 'List spam filter rules for a tenant',
				action: 'List spam filters',
			},
			{
				name: 'Remove Quarantine Policy',
				value: 'removeQuarantinePolicy',
				description: 'Remove a quarantine policy',
				action: 'Remove a quarantine policy',
			},
			{
				name: 'Remove Spam Filter',
				value: 'removeSpamfilter',
				description: 'Remove a spam filter rule',
				action: 'Remove a spam filter',
			},
			{
				name: 'Remove Spam Filter Template',
				value: 'removeSpamFilterTemplate',
				description: 'Remove a spam filter template',
				action: 'Remove a spam filter template',
			},
		],
		default: 'listSpamfilters',
	},
];

export const spamfilterFields: INodeProperties[] = [
	// ── Shared fields ────────────────────────────────────────────
	tenantField('spamfilter', [
		'addQuarantinePolicy',
		'addSpamFilter',
		'addTenantAllowBlockList',
		'editAntiPhishingFilter',
		'editMalwareFilter',
		'editQuarantinePolicy',
		'editSafeAttachmentsFilter',
		'editSpamFilter',
		'listAntiPhishingFilters',
		'listMalwareFilters',
		'listQuarantinePolicies',
		'listSafeAttachmentsFilters',
		'listSpamfilters',
		'removeQuarantinePolicy',
		'removeSpamfilter',
	]),
	returnAllField('spamfilter', [
		'listAntiPhishingFilters',
		'listMalwareFilters',
		'listQuarantinePolicies',
		'listSafeAttachmentsFilters',
		'listSpamFilterTemplates',
		'listSpamfilters',
	]),
	limitField('spamfilter', [
		'listAntiPhishingFilters',
		'listMalwareFilters',
		'listQuarantinePolicies',
		'listSafeAttachmentsFilters',
		'listSpamFilterTemplates',
		'listSpamfilters',
	]),

	// ══════════════════════════════════════════════════════════════
	// Spam Filters
	// ══════════════════════════════════════════════════════════════

	// ── addSpamFilter ────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'addSpamFilterFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['addSpamFilter'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name for the spam filter rule',
			},
			{
				displayName: 'PowerShell Command',
				name: 'PowerShellCommand',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description: 'PowerShell command to execute for spam filter configuration',
			},
			{
				displayName: 'Priority',
				name: 'Priority',
				type: 'string',
				default: '',
				description: 'Priority of the spam filter rule',
			},
			{
				displayName: 'Template (JSON)',
				name: 'TemplateList',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description:
					'Template to deploy as LabelValue JSON, e.g. {"label":"Template Name","value":"template-ID"}',
			},
		],
	},

	// ── editSpamFilter / removeSpamfilter shared field ──────────
	{
		displayName: 'Rule Name',
		name: 'spamFilterName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['editSpamFilter', 'removeSpamfilter'],
			},
		},
		default: '',
		description: 'Name of the spam filter rule',
	},
	{
		displayName: 'State',
		name: 'spamFilterState',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['editSpamFilter'],
			},
		},
		options: [
			{ name: 'Enable', value: 'Enable' },
			{ name: 'Disable', value: 'Disable' },
		],
		default: 'Enable',
		description: 'Whether to enable or disable the spam filter rule',
	},

	// ── removeSpamfilter ─────────────────────────────────────────

	// ══════════════════════════════════════════════════════════════
	// Spam Filter Templates
	// ══════════════════════════════════════════════════════════════

	// ── listSpamFilterTemplates ──────────────────────────────────
	{
		displayName: 'Filters',
		name: 'listSpamFilterTemplatesFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['listSpamFilterTemplates'],
			},
		},
		options: [
			{
				displayName: 'Template ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Filter by a specific template ID',
			},
		],
	},

	// ── addSpamFilterTemplate ────────────────────────────────────
	{
		displayName: 'Template Name',
		name: 'templateName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['addSpamFilterTemplate'],
			},
		},
		default: '',
		description: 'Name for the spam filter template',
	},
	{
		displayName: 'Additional Fields',
		name: 'addSpamFilterTemplateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['addSpamFilterTemplate'],
			},
		},
		options: [
			{
				displayName: 'PowerShell Command',
				name: 'PowerShellCommand',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description: 'PowerShell command for the template',
			},
		],
	},

	// ── removeSpamFilterTemplate ─────────────────────────────────
	{
		displayName: 'Template ID',
		name: 'templateID',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['removeSpamFilterTemplate'],
			},
		},
		default: '',
		description: 'ID of the spam filter template to remove',
	},

	// ══════════════════════════════════════════════════════════════
	// Quarantine Policies
	// ══════════════════════════════════════════════════════════════

	// ── listQuarantinePolicies ───────────────────────────────────
	{
		displayName: 'Filters',
		name: 'listQuarantinePoliciesFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['listQuarantinePolicies'],
			},
		},
		options: [
			{
				displayName: 'Type',
				name: 'Type',
				type: 'string',
				default: '',
				description: 'Filter by quarantine policy type',
			},
		],
	},

	// ── addQuarantinePolicy ──────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'addQuarantinePolicyFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['addQuarantinePolicy'],
			},
		},
		options: [
			{
				displayName: 'Allow Sender',
				name: 'AllowSender',
				type: 'boolean',
				default: false,
				description: 'Whether to allow sender actions in quarantine',
			},
			{
				displayName: 'Block Sender',
				name: 'BlockSender',
				type: 'boolean',
				default: false,
				description: 'Whether to allow block sender actions in quarantine',
			},
			{
				displayName: 'Delete',
				name: 'Delete',
				type: 'boolean',
				default: false,
				description: 'Whether to allow delete actions in quarantine',
			},
			{
				displayName: 'Include Messages From Blocked Sender Address',
				name: 'IncludeMessagesFromBlockedSenderAddress',
				type: 'boolean',
				default: false,
				description:
					'Whether to include messages from blocked sender addresses',
			},
			{
				displayName: 'Name',
				name: 'Name',
				type: 'string',
				default: '',
				description: 'Name for the quarantine policy',
			},
			{
				displayName: 'Preview',
				name: 'Preview',
				type: 'boolean',
				default: false,
				description: 'Whether to allow preview actions in quarantine',
			},
			{
				displayName: 'Quarantine Notification',
				name: 'QuarantineNotification',
				type: 'boolean',
				default: false,
				description: 'Whether to enable quarantine notifications',
			},
			{
				displayName: 'Release Action Preference (JSON)',
				name: 'ReleaseActionPreference',
				type: 'string',
				default: '',
				description:
					'Release action preference as LabelValue JSON, e.g. {"label":"PermissionToRelease","value":"PermissionToRelease"}',
			},
			{
				displayName: 'Template (JSON)',
				name: 'TemplateList',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description:
					'Template to deploy as LabelValue JSON, e.g. {"label":"Template Name","value":"template-ID"}',
			},
		],
	},

	// ── editQuarantinePolicy / removeQuarantinePolicy shared field ──
	{
		displayName: 'Identity',
		name: 'quarantinePolicyIdentity',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['editQuarantinePolicy', 'removeQuarantinePolicy'],
			},
		},
		default: '',
		description: 'Identity of the quarantine policy',
	},
	{
		displayName: 'Additional Fields',
		name: 'editQuarantinePolicyFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['editQuarantinePolicy'],
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
				displayName: 'Allow Sender',
				name: 'AllowSender',
				type: 'string',
				default: '',
				description: 'Allow sender setting (true/false)',
			},
			{
				displayName: 'Block Sender',
				name: 'BlockSender',
				type: 'string',
				default: '',
				description: 'Block sender setting (true/false)',
			},
			{
				displayName: 'Delete',
				name: 'Delete',
				type: 'string',
				default: '',
				description: 'Delete setting (true/false)',
			},
			{
				displayName: 'End User Spam Notification Custom From Address',
				name: 'EndUserSpamNotificationCustomFromAddress',
				type: 'string',
				default: '',
				description: 'Custom from address for end user spam notifications',
			},
			{
				displayName: 'End User Spam Notification Frequency',
				name: 'EndUserSpamNotificationFrequency',
				type: 'string',
				default: '',
				description: 'Frequency of end user spam notifications',
			},
			{
				displayName: 'Include Messages From Blocked Sender Address',
				name: 'IncludeMessagesFromBlockedSenderAddress',
				type: 'string',
				default: '',
				description: 'Include messages from blocked sender addresses (true/false)',
			},
			{
				displayName: 'Name',
				name: 'Name',
				type: 'string',
				default: '',
				description: 'New name for the quarantine policy',
			},
			{
				displayName: 'Organization Branding Enabled',
				name: 'OrganizationBrandingEnabled',
				type: 'string',
				default: '',
				description: 'Organization branding enabled (true/false)',
			},
			{
				displayName: 'Preview',
				name: 'Preview',
				type: 'string',
				default: '',
				description: 'Preview setting (true/false)',
			},
			{
				displayName: 'Quarantine Notification',
				name: 'QuarantineNotification',
				type: 'string',
				default: '',
				description: 'Quarantine notification setting (true/false)',
			},
			{
				displayName: 'Release Action Preference',
				name: 'ReleaseActionPreference',
				type: 'string',
				default: '',
				description: 'Release action preference value',
			},
		],
	},

	// ── removeQuarantinePolicy ───────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'removeQuarantinePolicyFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['removeQuarantinePolicy'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'Name',
				type: 'string',
				default: '',
				description: 'Name of the quarantine policy to remove',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Allow/Block List
	// ══════════════════════════════════════════════════════════════

	// ── addTenantAllowBlockList ──────────────────────────────────
	{
		displayName: 'Entries',
		name: 'entries',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['addTenantAllowBlockList'],
			},
		},
		default: '',
		description: 'The entries to add (e.g. sender address, URL, or file hash)',
	},
	{
		displayName: 'List Type',
		name: 'listType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['addTenantAllowBlockList'],
			},
		},
		options: [
			{ name: 'File Hash', value: 'FileHash' },
			{ name: 'Sender', value: 'Sender' },
			{ name: 'URL', value: 'Url' },
		],
		default: 'Sender',
		description: 'Type of the allow/block list entry',
	},
	{
		displayName: 'List Method',
		name: 'listMethod',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['addTenantAllowBlockList'],
			},
		},
		options: [
			{ name: 'Allow', value: 'Allow' },
			{ name: 'Block', value: 'Block' },
		],
		default: 'Block',
		description: 'Whether to allow or block the entry',
	},
	{
		displayName: 'Additional Fields',
		name: 'addTenantAllowBlockListFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: ['addTenantAllowBlockList'],
			},
		},
		options: [
			{
				displayName: 'No Expiration',
				name: 'NoExpiration',
				type: 'boolean',
				default: false,
				description: 'Whether the entry should never expire',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Notes for the allow/block list entry',
			},
			{
				displayName: 'Remove After',
				name: 'RemoveAfter',
				type: 'boolean',
				default: false,
				description: 'Whether to automatically remove the entry after expiration',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Filter Edits (Anti-Phishing, Malware, Safe Attachments)
	// ══════════════════════════════════════════════════════════════

	{
		displayName: 'Rule Name',
		name: 'filterRuleName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: [
					'editAntiPhishingFilter',
					'editMalwareFilter',
					'editSafeAttachmentsFilter',
				],
			},
		},
		default: '',
		description: 'Name of the filter rule to edit',
	},
	{
		displayName: 'State',
		name: 'filterState',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['spamfilter'],
				operation: [
					'editAntiPhishingFilter',
					'editMalwareFilter',
					'editSafeAttachmentsFilter',
				],
			},
		},
		options: [
			{ name: 'Enable', value: 'Enable' },
			{ name: 'Disable', value: 'Disable' },
		],
		default: 'Enable',
		description: 'Whether to enable or disable the filter rule',
	},
];
