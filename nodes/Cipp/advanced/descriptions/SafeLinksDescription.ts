import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

const RESOURCE = 'safeLinks';

/** Shared Safe Links policy setting options reused by add/edit policy + create/edit template. */
const policySettingOptions: INodeProperties['options'] = [
	{
		displayName: 'Admin Display Name',
		name: 'AdminDisplayName',
		type: 'string',
		default: '',
		description: 'Admin-facing display name for the policy',
	},
	{
		displayName: 'Allow Click Through',
		name: 'AllowClickThrough',
		type: 'boolean',
		default: false,
		description: 'Whether users can click through Safe Links warnings',
	},
	{
		displayName: 'Comments',
		name: 'Comments',
		type: 'string',
		default: '',
		description: 'Comments about the policy',
	},
	{
		displayName: 'Custom Notification Text',
		name: 'CustomNotificationText',
		type: 'string',
		default: '',
		description: 'Custom notification text shown to users',
	},
	{
		displayName: 'Deliver Message After Scan',
		name: 'DeliverMessageAfterScan',
		type: 'boolean',
		default: false,
		description: 'Whether to deliver messages only after Safe Links scanning completes',
	},
	{
		displayName: 'Disable URL Rewrite',
		name: 'DisableUrlRewrite',
		type: 'boolean',
		default: false,
		description: 'Whether to disable URL rewriting by Safe Links',
	},
	{
		displayName: 'Do Not Rewrite URLs (Comma-Separated)',
		name: 'DoNotRewriteUrls',
		type: 'string',
		default: '',
		description: 'Comma-separated list of URLs to exclude from Safe Links rewriting',
	},
	{
		displayName: 'Enable for Internal Senders',
		name: 'EnableForInternalSenders',
		type: 'boolean',
		default: false,
		description: 'Whether to apply Safe Links to messages from internal senders',
	},
	{
		displayName: 'Enable Organization Branding',
		name: 'EnableOrganizationBranding',
		type: 'boolean',
		default: false,
		description: 'Whether to show organization branding on Safe Links warning pages',
	},
	{
		displayName: 'Enable Safe Links for Email',
		name: 'EnableSafeLinksForEmail',
		type: 'boolean',
		default: false,
		description: 'Whether to enable Safe Links protection for email messages',
	},
	{
		displayName: 'Enable Safe Links for Office',
		name: 'EnableSafeLinksForOffice',
		type: 'boolean',
		default: false,
		description: 'Whether to enable Safe Links protection for Office documents',
	},
	{
		displayName: 'Enable Safe Links for Teams',
		name: 'EnableSafeLinksForTeams',
		type: 'boolean',
		default: false,
		description: 'Whether to enable Safe Links protection for Microsoft Teams',
	},
	{
		displayName: 'Except If Recipient Domain Is (Comma-Separated)',
		name: 'ExceptIfRecipientDomainIs',
		type: 'string',
		default: '',
		description: 'Comma-separated list of recipient domains to exclude from the rule',
	},
	{
		displayName: 'Except If Sent To (Comma-Separated)',
		name: 'ExceptIfSentTo',
		type: 'string',
		default: '',
		description: 'Comma-separated list of recipients to exclude from the rule',
	},
	{
		displayName: 'Except If Sent To Member Of (Comma-Separated)',
		name: 'ExceptIfSentToMemberOf',
		type: 'string',
		default: '',
		description: 'Comma-separated list of groups whose members are excluded from the rule',
	},
	{
		displayName: 'Priority',
		name: 'Priority',
		type: 'number',
		default: 0,
		description: 'Priority of the policy rule (lower = higher priority)',
	},
	{
		displayName: 'Recipient Domain Is (Comma-Separated)',
		name: 'RecipientDomainIs',
		type: 'string',
		default: '',
		description: 'Comma-separated list of recipient domains the rule applies to',
	},
	{
		displayName: 'Rule Name',
		name: 'RuleName',
		type: 'string',
		default: '',
		description: 'Name of the associated transport rule',
	},
	{
		displayName: 'Scan URLs',
		name: 'ScanUrls',
		type: 'boolean',
		default: false,
		description: 'Whether to scan URLs in email messages',
	},
	{
		displayName: 'Sent To (Comma-Separated)',
		name: 'SentTo',
		type: 'string',
		default: '',
		description: 'Comma-separated list of recipients the rule applies to',
	},
	{
		displayName: 'Sent To Member Of (Comma-Separated)',
		name: 'SentToMemberOf',
		type: 'string',
		default: '',
		description: 'Comma-separated list of groups whose members the rule applies to',
	},
	{
		displayName: 'State',
		name: 'State',
		type: 'boolean',
		default: true,
		description: 'Whether the policy is enabled',
	},
	{
		displayName: 'Track Clicks',
		name: 'TrackClicks',
		type: 'boolean',
		default: false,
		description: 'Whether to track user clicks on Safe Links URLs',
	},
];

export const safeLinksOperations: INodeProperties[] = [
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
				name: 'Add Policy',
				value: 'addPolicy',
				description: 'Create a new Safe Links policy',
				action: 'Add a safe links policy',
			},
			{
				name: 'Add Template (Minimal)',
				value: 'addTemplate',
				description: 'Create a Safe Links policy template with minimal fields',
				action: 'Add a safe links template',
			},
			{
				name: 'Create Template (Full)',
				value: 'createTemplate',
				description: 'Create a Safe Links policy template with full policy settings',
				action: 'Create a safe links template',
			},
			{
				name: 'Delete Policy',
				value: 'deletePolicy',
				description: 'Delete a Safe Links policy',
				action: 'Delete a safe links policy',
			},
			{
				name: 'Deploy From Template',
				value: 'deployFromTemplate',
				description: 'Deploy Safe Links policies from templates to a tenant',
				action: 'Deploy safe links from template',
			},
			{
				name: 'Edit Policy',
				value: 'editPolicy',
				description: 'Edit an existing Safe Links policy',
				action: 'Edit a safe links policy',
			},
			{
				name: 'Edit Template',
				value: 'editTemplate',
				description: 'Edit an existing Safe Links policy template',
				action: 'Edit a safe links template',
			},
			{
				name: 'Get Policy Details',
				value: 'getPolicyDetails',
				description: 'Get detailed information about Safe Links policies',
				action: 'Get safe links policy details',
			},
			{
				name: 'Get Template Details',
				value: 'getTemplateDetails',
				description: 'Get detailed information about a Safe Links policy template',
				action: 'Get safe links template details',
			},
			{
				name: 'List Policies',
				value: 'listPolicies',
				description: 'List Safe Links policies for a tenant',
				action: 'List safe links policies',
			},
			{
				name: 'List Templates',
				value: 'listTemplates',
				description: 'List available Safe Links policy templates',
				action: 'List safe links templates',
			},
			{
				name: 'Remove Template',
				value: 'removeTemplate',
				description: 'Remove a Safe Links policy template',
				action: 'Remove a safe links template',
			},
		],
		default: 'listPolicies',
	},
];

export const safeLinksFields: INodeProperties[] = [
	// ── Shared fields ────────────────────────────────────────────
	tenantField(RESOURCE, [
		'addPolicy',
		'createTemplate',
		'deletePolicy',
		'deployFromTemplate',
		'editPolicy',
		'editTemplate',
		'getPolicyDetails',
		'listPolicies',
	]),
	returnAllField(RESOURCE, ['listPolicies', 'listTemplates']),
	limitField(RESOURCE, ['listPolicies', 'listTemplates']),

	// ══════════════════════════════════════════════════════════════
	// Safe Links Policies
	// ══════════════════════════════════════════════════════════════

	// ── Shared: policyName (add/edit/delete) ─────────────────────
	{
		displayName: 'Policy Name',
		name: 'policyName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addPolicy', 'editPolicy', 'deletePolicy'],
			},
		},
		default: '',
		description: 'Name of the Safe Links policy',
	},

	// ── listPolicies (no extra fields) ───────────────────────────

	// ── getPolicyDetails ─────────────────────────────────────────
	{
		displayName: 'Filters',
		name: 'getPolicyDetailsFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['getPolicyDetails'],
			},
		},
		options: [
			{
				displayName: 'Policy Name',
				name: 'PolicyName',
				type: 'string',
				default: '',
				description: 'Filter by policy name',
			},
			{
				displayName: 'Rule Name',
				name: 'RuleName',
				type: 'string',
				default: '',
				description: 'Filter by rule name',
			},
		],
	},

	// ── addPolicy ────────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'addPolicyFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addPolicy'],
			},
		},
		options: policySettingOptions,
	},

	// ── editPolicy ───────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'editPolicyFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['editPolicy'],
			},
		},
		options: policySettingOptions,
	},

	// ── deletePolicy ─────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'deletePolicyFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['deletePolicy'],
			},
		},
		options: [
			{
				displayName: 'Rule Name',
				name: 'RuleName',
				type: 'string',
				default: '',
				description: 'Name of the associated rule to delete',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Safe Links Policy Templates
	// ══════════════════════════════════════════════════════════════

	// ── listTemplates ────────────────────────────────────────────
	{
		displayName: 'Filters',
		name: 'listTemplatesFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listTemplates'],
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

	// ── getTemplateDetails ───────────────────────────────────────
	{
		displayName: 'Filters',
		name: 'getTemplateDetailsFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['getTemplateDetails'],
			},
		},
		options: [
			{
				displayName: 'Template ID',
				name: 'ID',
				type: 'string',
				default: '',
				description: 'Filter by a specific template ID',
			},
		],
	},

	// ── addTemplate (minimal) ────────────────────────────────────
	{
		displayName: 'Fields',
		name: 'addTemplateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addTemplate'],
			},
		},
		options: [
			{
				displayName: 'Admin Display Name',
				name: 'AdminDisplayName',
				type: 'string',
				default: '',
				description: 'Admin-facing display name',
			},
			{
				displayName: 'Description',
				name: 'Description',
				type: 'string',
				default: '',
				description: 'Description of the template',
			},
			{
				displayName: 'Name',
				name: 'Name',
				type: 'string',
				default: '',
				description: 'Name of the template',
			},
			{
				displayName: 'Policy Name',
				name: 'PolicyName',
				type: 'string',
				default: '',
				description: 'Policy name for the template',
			},
			{
				displayName: 'Template Description',
				name: 'TemplateDescription',
				type: 'string',
				default: '',
				description: 'Description of the template',
			},
			{
				displayName: 'Template Name',
				name: 'TemplateName',
				type: 'string',
				default: '',
				description: 'Name of the template',
			},
		],
	},

	// ── Shared: templateName (createTemplate) ────────────────────
	{
		displayName: 'Template Name',
		name: 'templateName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['createTemplate'],
			},
		},
		default: '',
		description: 'Name for the Safe Links policy template',
	},

	// ── createTemplate (full) ────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'createTemplateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['createTemplate'],
			},
		},
		options: [
			...(policySettingOptions as INodeProperties[]),
			{
				displayName: 'Template Description',
				name: 'TemplateDescription',
				type: 'string',
				default: '',
				description: 'Description for the template',
			},
		],
	},

	// ── Shared: templateID (editTemplate/removeTemplate) ─────────
	{
		displayName: 'Template ID',
		name: 'templateID',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['editTemplate', 'removeTemplate'],
			},
		},
		default: '',
		description: 'ID of the Safe Links policy template',
	},

	// ── editTemplate ─────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'editTemplateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['editTemplate'],
			},
		},
		options: [
			...(policySettingOptions as INodeProperties[]).filter((o) => o.name !== 'State'),
			{
				displayName: 'State',
				name: 'State',
				type: 'string',
				default: '',
				description: 'State of the policy (string value per API spec)',
			},
			{
				displayName: 'Template Description',
				name: 'TemplateDescription',
				type: 'string',
				default: '',
				description: 'Description for the template',
			},
			{
				displayName: 'Template Name',
				name: 'TemplateName',
				type: 'string',
				default: '',
				description: 'Name for the template',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Template Deployment
	// ══════════════════════════════════════════════════════════════

	// ── deployFromTemplate ───────────────────────────────────────
	{
		displayName: 'Template List (JSON)',
		name: 'templateList',
		type: 'string',
		required: true,
		typeOptions: { rows: 4 },
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['deployFromTemplate'],
			},
		},
		default: '',
		description:
			'Template IDs to deploy as JSON array, e.g. ["template-ID-1","template-ID-2"]',
	},
];
