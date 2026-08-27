import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

export const identityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['identity'],
			},
		},
		options: [
			{
				name: 'List Audit Logs',
				value: 'listAuditLogs',
				description: 'List audit logs for compliance monitoring',
				action: 'List audit logs',
			},
			{
				name: 'List Azure AD Connect Status',
				value: 'listAzureAdConnectStatus',
				description: 'List Azure AD Connect sync status for a tenant',
				action: 'List azure AD connect status',
			},
			{
				name: 'List Azure AD Directory Objects',
				value: 'listDirectoryObjects',
				description: 'Look up Azure AD directory objects by ID',
				action: 'List directory objects',
			},
			{
				name: 'List Basic Auth',
				value: 'listBasicAuth',
				description: 'List users with basic authentication enabled',
				action: 'List basic auth',
			},
			{
				name: 'List Deleted Items',
				value: 'listDeletedItems',
				description: 'List deleted users, groups, and applications',
				action: 'List deleted items',
			},
			{
				name: 'List Org',
				value: 'listOrg',
				description: 'List organization information for a tenant',
				action: 'List org info',
			},
			{
				name: 'List Partner Relationships',
				value: 'listPartnerRelationships',
				description: 'List partner tenant relationships',
				action: 'List partner relationships',
			},
			{
				name: 'List Roles',
				value: 'listRoles',
				description: 'List Azure AD roles and assignments',
				action: 'List roles',
			},
			{
				name: 'Restore Deleted',
				value: 'restoreDeleted',
				description: 'Restore a deleted object',
				action: 'Restore deleted object',
			},
		],
		default: 'listAuditLogs',
	},
];

export const identityFields: INodeProperties[] = [
	tenantField('identity'),
	returnAllField('identity', ['listAuditLogs', 'listAzureAdConnectStatus', 'listBasicAuth', 'listDeletedItems', 'listOrg', 'listPartnerRelationships', 'listRoles']),
	limitField('identity', ['listAuditLogs', 'listAzureAdConnectStatus', 'listBasicAuth', 'listDeletedItems', 'listOrg', 'listPartnerRelationships', 'listRoles']),

	// Audit log filters
	{
		displayName: 'Filters',
		name: 'auditLogFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['identity'],
				operation: ['listAuditLogs'],
			},
		},
		options: [
			{
				displayName: 'End Date',
				name: 'EndDate',
				type: 'dateTime',
				default: '',
				description: 'End date for the audit log query',
			},
			{
				displayName: 'Log ID',
				name: 'LogId',
				type: 'string',
				default: '',
				description: 'Filter by a specific audit log ID',
			},
			{
				displayName: 'Relative Time',
				name: 'RelativeTime',
				type: 'string',
				default: '',
				placeholder: 'e.g. 1d, 7d, 30d',
				description: 'Relative time filter (e.g. 1d for last day, 7d for last week)',
			},
			{
				displayName: 'Start Date',
				name: 'StartDate',
				type: 'dateTime',
				default: '',
				description: 'Start date for the audit log query',
			},
		],
	},

	// Azure AD Connect Status filters
	{
		displayName: 'Filters',
		name: 'adConnectFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['identity'],
				operation: ['listAzureAdConnectStatus'],
			},
		},
		options: [
			{
				displayName: 'Data to Return',
				name: 'DataToReturn',
				type: 'string',
				default: '',
				description: 'Specific data set to return from the AD Connect status',
			},
		],
	},

	// Directory Objects filters
	{
		displayName: 'Filters',
		name: 'directoryObjectsFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['identity'],
				operation: ['listDirectoryObjects'],
			},
		},
		options: [
			{
				displayName: 'As App',
				name: 'asApp',
				type: 'string',
				default: '',
				description: 'Whether to run the request as an application',
			},
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of object IDs to look up',
			},
			{
				displayName: 'Partner Lookup',
				name: 'partnerLookup',
				type: 'string',
				default: '',
				description: 'Partner lookup value',
			},
		],
	},

	// Object ID for restore
	{
		displayName: 'Object ID',
		name: 'objectId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['identity'],
				operation: ['restoreDeleted'],
			},
		},
		default: '',
		placeholder: 'e.g. 12345678-1234-1234-1234-123456789abc',
		description: 'The ID of the deleted object to restore',
	},
];
