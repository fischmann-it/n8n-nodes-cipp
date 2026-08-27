import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

export const alertOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['alert'],
			},
		},
		options: [
			{
				name: 'Add',
				value: 'add',
				description: 'Create a new alert rule',
				action: 'Add an alert',
			},
			{
				name: 'Add Alert Rule',
				value: 'addAlertRule',
				description: 'Add a new alert rule with notifications',
				action: 'Add alert rule',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get alerts from the queue',
				action: 'Get many alerts',
			},
			{
				name: 'Get Security Alerts',
				value: 'getSecurityAlerts',
				description: 'Get Defender security alerts',
				action: 'Get security alerts',
			},
			{
				name: 'Get Security Incidents',
				value: 'getSecurityIncidents',
				action: 'Get security incidents',
			},
			{
				name: 'List Audit Log Searches',
				value: 'listAuditLogSearches',
				description: 'List existing audit log searches',
				action: 'List audit log searches',
			},
			{
				name: 'List MDO Alerts',
				value: 'listMdoAlerts',
				description: 'List Microsoft Defender for Office alerts',
				action: 'List MDO alerts',
			},
			{
				name: 'List Webhook Alerts',
				value: 'listWebhookAlerts',
				description: 'List configured webhook alerts',
				action: 'List webhook alerts',
			},
			{
				name: 'Remove Queued Alert',
				value: 'removeQueuedAlert',
				description: 'Remove an alert from the queue',
				action: 'Remove a queued alert',
			},
			{
				name: 'Search Audit Log',
				value: 'searchAuditLog',
				description: 'Search or create an audit log search',
				action: 'Search audit log',
			},
			{
				name: 'Set MDO Alert',
				value: 'setMdoAlert',
				description: 'Update a Microsoft Defender for Office alert',
				action: 'Set MDO alert',
			},
			{
				name: 'Set Security Alert Status',
				value: 'setSecurityAlertStatus',
				description: 'Update the status of a security alert',
				action: 'Set security alert status',
			},
			{
				name: 'Set Security Incident Status',
				value: 'setSecurityIncidentStatus',
				description: 'Update the status of a security incident',
				action: 'Set security incident status',
			},
			{
				name: 'Test Audit Log',
				value: 'testAuditLog',
				description: 'Test an audit log search configuration',
				action: 'Test audit log',
			},
		],
		default: 'getAll',
	},
];

export const alertFields: INodeProperties[] = [
	// Tenant selector for operations that require it
	tenantField('alert', [
		'getSecurityAlerts',
		'getSecurityIncidents',
		'listAuditLogSearches',
		'listMdoAlerts',
		'searchAuditLog',
		'setMdoAlert',
		'setSecurityAlertStatus',
		'setSecurityIncidentStatus',
		'testAuditLog',
	]),

	// Return All / Limit fields
	returnAllField('alert', [
		'getAll',
		'getSecurityAlerts',
		'getSecurityIncidents',
		'listAuditLogSearches',
		'listMdoAlerts',
		'listWebhookAlerts',
	]),
	limitField('alert', [
		'getAll',
		'getSecurityAlerts',
		'getSecurityIncidents',
		'listAuditLogSearches',
		'listMdoAlerts',
		'listWebhookAlerts',
	]),

	// ── Add Alert ──
	{
		displayName: 'Alert Configuration',
		name: 'alertConfig',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['add'],
			},
		},
		default: '{\n  "tenantFilter": "",\n  "excludedTenants": [],\n  "logbook": { "label": "", "value": "" },\n  "conditions": {},\n  "actions": []\n}',
		description: 'JSON configuration for the alert rule. See CIPP AddAlert API for full schema.',
	},

	// ── Set Security Alert Status ──
	{
		displayName: 'Alert ID',
		name: 'alertId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['setSecurityAlertStatus'],
			},
		},
		default: '',
		description: 'The ID of the security alert',
	},
	{
		displayName: 'Status',
		name: 'alertStatus',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['setSecurityAlertStatus'],
			},
		},
		options: [
			{ name: 'In Progress', value: 'inProgress' },
			{ name: 'New', value: 'new' },
			{ name: 'Resolved', value: 'resolved' },
		],
		default: 'resolved',
		description: 'The new status for the alert',
	},
	{
		displayName: 'Additional Fields',
		name: 'alertAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['setSecurityAlertStatus'],
			},
		},
		options: [
			{
				displayName: 'Provider Name',
				name: 'Provider',
				type: 'string',
				default: '',
				description: 'The provider name for the alert',
			},
			{
				displayName: 'Vendor Name',
				name: 'Vendor',
				type: 'string',
				default: '',
				description: 'The vendor name for the alert',
			},
		],
	},

	// ── Set Security Incident Status ──
	{
		displayName: 'Incident ID',
		name: 'incidentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['setSecurityIncidentStatus'],
			},
		},
		default: '',
		description: 'The ID of the security incident',
	},
	{
		displayName: 'Status',
		name: 'incidentStatus',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['setSecurityIncidentStatus'],
			},
		},
		options: [
			{ name: 'Active', value: 'active' },
			{ name: 'In Progress', value: 'inProgress' },
			{ name: 'New', value: 'new' },
			{ name: 'Resolved', value: 'resolved' },
		],
		default: 'resolved',
		description: 'The new status for the incident',
	},
	{
		displayName: 'Assign To',
		name: 'assignedTo',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['setSecurityIncidentStatus'],
			},
		},
		default: '',
		placeholder: 'user@domain.com',
		description: 'The user to assign the incident to',
	},

	// ── Search Audit Log (ExecAuditLogSearch) ──
	{
		displayName: 'Search Fields',
		name: 'auditSearchFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['searchAuditLog'],
			},
		},
		options: [
			{
				displayName: 'Action',
				name: 'Action',
				type: 'string',
				default: '',
				description: 'The audit log action to search for',
			},
			{
				displayName: 'End Time',
				name: 'EndTime',
				type: 'string',
				default: '',
				description: 'End time for the search window (ISO 8601 format)',
			},
			{
				displayName: 'PS Object',
				name: 'PSObject',
				type: 'string',
				default: '',
				description: 'PowerShell object filter for the search',
			},
			{
				displayName: 'Search ID',
				name: 'SearchId',
				type: 'string',
				default: '',
				description: 'ID of an existing search to retrieve results for',
			},
			{
				displayName: 'Start Time',
				name: 'StartTime',
				type: 'string',
				default: '',
				description: 'Start time for the search window (ISO 8601 format)',
			},
		],
	},

	// ── List Audit Log Searches (ListAuditLogSearches) ──
	{
		displayName: 'Filters',
		name: 'auditSearchFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['listAuditLogSearches'],
			},
		},
		options: [
			{
				displayName: 'Days',
				name: 'Days',
				type: 'string',
				default: '',
				description: 'Number of days to look back',
			},
			{
				displayName: 'Search ID',
				name: 'SearchId',
				type: 'string',
				default: '',
				description: 'Filter by a specific search ID',
			},
			{
				displayName: 'Type',
				name: 'Type',
				type: 'string',
				default: '',
				description: 'Filter by audit log type',
			},
		],
	},

	// ── Test Audit Log (ListAuditLogTest) ──
	{
		displayName: 'Search ID',
		name: 'searchId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['testAuditLog'],
			},
		},
		default: '',
		description: 'The search ID to test',
	},

	// ── Remove Queued Alert (RemoveQueuedAlert) ──
	{
		displayName: 'Alert Queue ID',
		name: 'alertQueueId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['removeQueuedAlert'],
			},
		},
		default: '',
		description: 'The ID of the queued alert to remove',
	},
	{
		displayName: 'Event Type',
		name: 'eventType',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['removeQueuedAlert'],
			},
		},
		default: '',
		description: 'The event type of the queued alert to remove',
	},

	// ── Set MDO Alert (ExecSetMdoAlert) ──
	{
		displayName: 'Alert GUID',
		name: 'mdoAlertGuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['setMdoAlert'],
			},
		},
		default: '',
		description: 'The GUID of the MDO alert to update',
	},
	{
		displayName: 'Fields',
		name: 'mdoAlertFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['setMdoAlert'],
			},
		},
		options: [
			{
				displayName: 'Assigned',
				name: 'Assigned',
				type: 'string',
				default: '',
				placeholder: 'user@domain.com',
				description: 'User to assign the alert to',
			},
			{
				displayName: 'Classification',
				name: 'Classification',
				type: 'string',
				default: '',
				description: 'Classification for the alert',
			},
			{
				displayName: 'Determination',
				name: 'Determination',
				type: 'string',
				default: '',
				description: 'Determination for the alert',
			},
			{
				displayName: 'Status',
				name: 'Status',
				type: 'string',
				default: '',
				description: 'New status for the alert',
			},
		],
	},

	// ── Add Alert Rule (ExecAddAlert) ──
	{
		displayName: 'Alert Rule Fields',
		name: 'addAlertFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['addAlertRule'],
			},
		},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'admin@domain.com',
				description: 'Email address to send alert notifications to',
			},
			{
				displayName: 'Logs to Include',
				name: 'logsToInclude',
				type: 'string',
				default: '',
				description: 'Which logs to include in the alert notification',
			},
			{
				displayName: 'One Per Tenant',
				name: 'onePerTenant',
				type: 'string',
				default: '',
				description: 'Whether to send only one alert per tenant',
			},
			{
				displayName: 'Send Email Now',
				name: 'sendEmailNow',
				type: 'string',
				default: '',
				description: 'Whether to send an email notification immediately',
			},
			{
				displayName: 'Send PSA Now',
				name: 'sendPsaNow',
				type: 'string',
				default: '',
				description: 'Whether to send a PSA ticket immediately',
			},
			{
				displayName: 'Send Webhook Now',
				name: 'sendWebhookNow',
				type: 'string',
				default: '',
				description: 'Whether to send a webhook notification immediately',
			},
			{
				displayName: 'Severity',
				name: 'Severity',
				type: 'options',
				options: [
					{ name: 'Critical', value: 'Critical' },
					{ name: 'Error', value: 'Error' },
					{ name: 'Info', value: 'Info' },
					{ name: 'Warning', value: 'Warning' },
				],
				default: 'Info',
				description: 'The severity level of the alert',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				default: '',
				description: 'The alert message text content',
			},
			{
				displayName: 'Webhook',
				name: 'webhook',
				type: 'string',
				default: '',
				description: 'Webhook URL for alert notifications',
			},
			{
				displayName: 'Write Log',
				name: 'writeLog',
				type: 'string',
				default: '',
				description: 'Whether to write the alert to the CIPP log',
			},
		],
	},
];
