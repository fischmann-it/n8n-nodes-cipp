import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

const RESOURCE = 'standard';

const listOps = [
	'compareStandards',
	'listBpa',
	'listBpaResults',
	'listBpaTemplates',
	'listDomainAnalyser',
	'listStandards',
	'listStandardTemplates',
	'listTenantAlignment',
	'listTenantDrift',
	'getDomainHealth',
];

const tenantOps = [
	'addStandardsTemplate',
	'compareStandards',
	'deployStandards',
	'listBpa',
	'listDomainAnalyser',
	'listStandards',
	'listTenantDrift',
	'runBpa',
	'runStandards',
	'updateDriftDeviation',
];

export const standardOperations: INodeProperties[] = [
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
				name: 'Add BPA Template',
				value: 'addBpaTemplate',
				description: 'Create a BPA report template',
				action: 'Add a BPA template',
			},
			{
				name: 'Add Standards Template',
				value: 'addStandardsTemplate',
				description: 'Save a standards configuration as a template',
				action: 'Add a standards template',
			},
			{
				name: 'Clone Drift',
				value: 'cloneDrift',
				description: 'Clone a drift configuration',
				action: 'Clone a drift config',
			},
			{
				name: 'Compare Standards',
				value: 'compareStandards',
				description: 'Compare standards configuration across tenants',
				action: 'Compare standards',
			},
			{
				name: 'Convert Standards',
				value: 'convertStandards',
				description: 'Convert legacy standards to the new format',
				action: 'Convert standards',
			},
			{
				name: 'Deploy Standards',
				value: 'deployStandards',
				description: 'Deploy standards to a tenant',
				action: 'Deploy standards',
			},
			{
				name: 'Get Domain Health',
				value: 'getDomainHealth',
				description: 'Get DNS and domain health details for a domain',
				action: 'Get domain health',
			},
			{
				name: 'List BPA Reports',
				value: 'listBpa',
				description: 'List BPA reports for a tenant',
				action: 'List BPA reports',
			},
			{
				name: 'List BPA Results',
				value: 'listBpaResults',
				description: 'List all BPA analysis results',
				action: 'List BPA results',
			},
			{
				name: 'List BPA Templates',
				value: 'listBpaTemplates',
				description: 'List BPA report templates',
				action: 'List BPA templates',
			},
			{
				name: 'List Domain Analyser',
				value: 'listDomainAnalyser',
				description: 'List domain analyser results for a tenant',
				action: 'List domain analyser results',
			},
			{
				name: 'List Standard Templates',
				value: 'listStandardTemplates',
				description: 'List saved standards templates',
				action: 'List standard templates',
			},
			{
				name: 'List Standards',
				value: 'listStandards',
				description: 'List deployed standards for a tenant',
				action: 'List standards',
			},
			{
				name: 'List Tenant Alignment',
				value: 'listTenantAlignment',
				description: 'List tenant alignment status across all tenants',
				action: 'List tenant alignment',
			},
			{
				name: 'List Tenant Drift',
				value: 'listTenantDrift',
				description: 'List configuration drift for a tenant',
				action: 'List tenant drift',
			},
			{
				name: 'Remove BPA Template',
				value: 'removeBpaTemplate',
				description: 'Delete a BPA report template',
				action: 'Remove a BPA template',
			},
			{
				name: 'Remove Standard',
				value: 'removeStandard',
				description: 'Remove a deployed standard',
				action: 'Remove a standard',
			},
			{
				name: 'Remove Standard Template',
				value: 'removeStandardTemplate',
				description: 'Delete a standards template',
				action: 'Remove a standard template',
			},
			{
				name: 'Run All Standards',
				value: 'runAllStandards',
				description: 'Trigger a full standards run across all tenants',
				action: 'Run all standards',
			},
			{
				name: 'Run BPA',
				value: 'runBpa',
				description: 'Trigger a BPA analysis for a tenant',
				action: 'Run BPA',
			},
			{
				name: 'Run Domain Analyser',
				value: 'runDomainAnalyser',
				description: 'Trigger a domain analysis run',
				action: 'Run domain analyser',
			},
			{
				name: 'Run Standards',
				value: 'runStandards',
				description: 'Trigger a standards run for a tenant',
				action: 'Run standards',
			},
			{
				name: 'Update Drift Deviation',
				value: 'updateDriftDeviation',
				description: 'Update or dismiss a drift deviation',
				action: 'Update drift deviation',
			},
		],
		default: 'listStandards',
	},
];

export const standardFields: INodeProperties[] = [
	// ── Tenant field (ops that need tenant) ──
	tenantField(RESOURCE, tenantOps),

	// ── Return All / Limit for list operations ──
	returnAllField(RESOURCE, listOps),
	limitField(RESOURCE, listOps),

	// ── Compare Standards filters ──
	{
		displayName: 'Filters',
		name: 'compareStandardsFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['compareStandards'],
			},
		},
		options: [
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'string',
				default: '',
				description: 'Filter comparison by a specific template ID',
			},
		],
	},

	// ── List Standards filters ──
	{
		displayName: 'Filters',
		name: 'listStandardsFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listStandards'],
			},
		},
		options: [
			{
				displayName: 'Show Consolidated',
				name: 'ShowConsolidated',
				type: 'boolean',
				default: false,
				description: 'Whether to show consolidated standards view',
			},
		],
	},

	// ── Deploy Standards fields ──
	{
		displayName: 'Additional Fields',
		name: 'deployStandardsFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['deployStandards'],
			},
		},
		options: [
			{
				displayName: 'Standards JSON',
				name: 'standardsJson',
				type: 'json',
				default: '{}',
				description: 'The full standards deployment configuration as JSON',
			},
		],
	},

	// ── Add Standards Template fields ──
	{
		displayName: 'Template Name',
		name: 'templateName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addStandardsTemplate'],
			},
		},
		default: '',
		description: 'Name for the standards template',
	},
	{
		displayName: 'Additional Fields',
		name: 'addStandardsTemplateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addStandardsTemplate'],
			},
		},
		options: [
			{
				displayName: 'Created At',
				name: 'createdAt',
				type: 'string',
				default: '',
				description: 'Timestamp for the template creation',
			},
			{
				displayName: 'GUID',
				name: 'GUID',
				type: 'string',
				default: '',
				description: 'Optional GUID for the template',
			},
		],
	},

	// ── Remove Standard fields ──
	{
		displayName: 'Standard ID',
		name: 'standardId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['removeStandard'],
			},
		},
		default: '',
		description: 'The ID of the standard to remove',
	},

	// ── Remove Standard Template fields ──
	{
		displayName: 'Template ID',
		name: 'standardTemplateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['removeStandardTemplate'],
			},
		},
		default: '',
		description: 'The ID of the standards template to remove',
	},

	// ── List Standard Templates filters ──
	{
		displayName: 'Filters',
		name: 'listStandardTemplatesFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listStandardTemplates'],
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

	// ── Run Standards fields ──
	{
		displayName: 'Filters',
		name: 'runStandardsFilters',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['runStandards'],
			},
		},
		options: [
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'string',
				default: '',
				description: 'Optional template ID to run specific standards',
			},
		],
	},

	// ── List BPA filters ──
	{
		displayName: 'Filters',
		name: 'listBpaFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listBpa'],
			},
		},
		options: [
			{
				displayName: 'Report',
				name: 'Report',
				type: 'string',
				default: '',
				description: 'Filter by report name',
			},
		],
	},

	// ── List BPA Templates filters ──
	{
		displayName: 'Filters',
		name: 'listBpaTemplatesFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listBpaTemplates'],
			},
		},
		options: [
			{
				displayName: 'Raw JSON',
				name: 'RawJson',
				type: 'string',
				default: '',
				description: 'Whether to return raw JSON format',
			},
		],
	},

	// ── Add BPA Template fields ──
	{
		displayName: 'Template Name',
		name: 'bpaTemplateName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addBpaTemplate'],
			},
		},
		default: '',
		description: 'Name for the BPA template',
	},
	{
		displayName: 'Style',
		name: 'bpaTemplateStyle',
		type: 'options',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addBpaTemplate'],
			},
		},
		options: [
			{ name: 'Table', value: 'Table' },
			{ name: 'Tenant', value: 'Tenant' },
		],
		default: 'Tenant',
		description: 'The BPA template report style',
	},

	// ── Remove BPA Template fields ──
	{
		displayName: 'Template Name',
		name: 'bpaRemoveTemplateName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['removeBpaTemplate'],
			},
		},
		default: '',
		description: 'The name of the BPA template to remove',
	},

	// ── Get Domain Health fields ──
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['getDomainHealth'],
			},
		},
		default: '',
		description: 'The domain to check health for',
	},
	{
		displayName: 'Additional Fields',
		name: 'domainHealthFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['getDomainHealth'],
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
				displayName: 'Expected Include',
				name: 'ExpectedInclude',
				type: 'string',
				default: '',
				description: 'Expected value to include in results',
			},
			{
				displayName: 'Record',
				name: 'Record',
				type: 'string',
				default: '',
				description: 'DNS record type to check',
			},
			{
				displayName: 'Selector',
				name: 'Selector',
				type: 'string',
				default: '',
				description: 'DKIM selector to check',
			},
			{
				displayName: 'Subdomains',
				name: 'Subdomains',
				type: 'string',
				default: '',
				description: 'Subdomains to include in the health check',
			},
		],
	},

	// ── Clone Drift fields ──
	{
		displayName: 'Drift ID',
		name: 'driftId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['cloneDrift'],
			},
		},
		default: '',
		description: 'The ID of the drift configuration to clone',
	},

	// ── Update Drift Deviation fields ──
	{
		displayName: 'Update Fields',
		name: 'updateDriftFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['updateDriftDeviation'],
			},
		},
		options: [
			{
				displayName: 'Deviations',
				name: 'deviations',
				type: 'string',
				default: '',
				description: 'The deviations to update (JSON string)',
			},
			{
				displayName: 'Reason',
				name: 'reason',
				type: 'string',
				default: '',
				description: 'Reason for the deviation update',
			},
			{
				displayName: 'Remove Drift Customization',
				name: 'RemoveDriftCustomization',
				type: 'string',
				default: '',
				description: 'Remove a drift customization by ID',
			},
		],
	},
];
