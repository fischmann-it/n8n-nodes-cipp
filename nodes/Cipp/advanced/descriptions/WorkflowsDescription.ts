import type { INodeProperties } from 'n8n-workflow';
import { tenantField } from './DescriptionHelpers';

export const workflowsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['workflows'],
			},
		},
		options: [
			{
				name: 'BEC Investigation',
				value: 'becInvestigation',
				description: 'Investigate business email compromise: suspicious sign-ins, forwarding rules, OAuth apps',
				action: 'Run BEC investigation',
			},
			{
				name: 'Cross-Tenant Sweep',
				value: 'crossTenantSweep',
				description: 'Run a composite operation across all managed tenants (up to 50)',
				action: 'Run cross tenant sweep',
			},
			{
				name: 'License Audit',
				value: 'licenseAudit',
				description: 'Audit license waste: disabled/inactive users holding licenses, unused SKUs, estimated saving',
				action: 'Run license audit',
			},
			{
				name: 'Security Posture',
				value: 'securityPosture',
				description: 'Score tenant security: MFA coverage, basic auth, conditional access, Defender status',
				action: 'Run security posture check',
			},
			{
				name: 'User 360',
				value: 'user360',
				description: 'Full user profile snapshot: groups, devices, mailbox, MFA status, recent sign-ins',
				action: 'Run user 360',
			},
		],
		default: 'licenseAudit',
	},
];

export const workflowsFields: INodeProperties[] = [
	// ── Tenant selector — all ops except crossTenantSweep ──
	tenantField('workflows', ['licenseAudit', 'securityPosture', 'becInvestigation', 'user360']),

	// ── Fail Mode — all 5 ops ──
	{
		displayName: 'Fail Mode',
		name: 'failMode',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['workflows'],
				operation: ['licenseAudit', 'securityPosture', 'becInvestigation', 'user360', 'crossTenantSweep'],
			},
		},
		options: [
			{
				name: 'Best Effort',
				value: 'bestEffort',
				description: 'Continue on step failures, include partial results',
			},
			{
				name: 'Fast Fail',
				value: 'fast',
				description: 'Stop immediately on first step failure',
			},
		],
		default: 'bestEffort',
		description: 'How to handle individual step failures within the workflow',
	},

	// ── Inactive Days Threshold — licenseAudit only ──
	{
		displayName: 'Inactive Days Threshold',
		name: 'inactiveDays',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['workflows'],
				operation: ['licenseAudit'],
			},
		},
		default: 90,
		description: 'Number of days without sign-in to consider a user inactive',
		typeOptions: { minValue: 1 },
	},

	// ── User ID or UPN — becInvestigation and user360 ──
	{
		displayName: 'User ID or UPN',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['workflows'],
				operation: ['becInvestigation', 'user360'],
			},
		},
		default: '',
		// Required for user360, optional for becInvestigation — enforce required at runtime via actions/workflows.ts
		description: 'User ID or UPN to scope the operation. Required for User 360, optional for BEC Investigation.',
	},

	// ── Lookback Days — becInvestigation only ──
	{
		displayName: 'Lookback Days',
		name: 'days',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['workflows'],
				operation: ['becInvestigation'],
			},
		},
		default: 30,
		description: 'Number of days of sign-in history to analyse',
		typeOptions: { minValue: 1, maxValue: 365 },
	},

	// ── Operation to Sweep — crossTenantSweep only ──
	{
		displayName: 'Operation to Sweep',
		name: 'sweepComposite',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['workflows'],
				operation: ['crossTenantSweep'],
			},
		},
		options: [
			{ name: 'License Audit', value: 'licenseAudit' },
			{ name: 'Security Posture', value: 'securityPosture' },
			{ name: 'BEC Investigation', value: 'becInvestigation' },
		],
		default: 'licenseAudit',
		required: true,
		description: 'Which composite operation to run across all tenants',
	},

	// ── Tenant IDs — crossTenantSweep only ──
	{
		displayName: 'Tenant IDs (Optional)',
		name: 'tenantIds',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['workflows'],
				operation: ['crossTenantSweep'],
			},
		},
		default: '',
		description: 'Comma-separated tenant IDs or domain names to scope the sweep. Leave empty to sweep all tenants.',
	},

	// ── Max Tenants — crossTenantSweep only ──
	{
		displayName: 'Max Tenants',
		name: 'maxTenants',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['workflows'],
				operation: ['crossTenantSweep'],
			},
		},
		default: 20,
		description: 'Maximum number of tenants to sweep (hard cap: 50)',
		typeOptions: { minValue: 1, maxValue: 50 },
	},
];
