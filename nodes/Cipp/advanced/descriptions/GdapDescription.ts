import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

export const gdapOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['gdap'],
			},
		},
		options: [
			{
				name: 'Add Role',
				value: 'addRole',
				description: 'Add a GDAP role mapping or create invite with roles',
				action: 'Add GDAP role',
			},
			{
				name: 'Auto-Extend',
				value: 'autoExtend',
				description: 'Auto-extend a GDAP relationship',
				action: 'Auto extend GDAP relationship',
			},
			{
				name: 'Delete Relationship',
				value: 'deleteRelationship',
				description: 'Delete a GDAP relationship',
				action: 'Delete GDAP relationship',
			},
			{
				name: 'Delete Role Mapping',
				value: 'deleteRoleMapping',
				description: 'Delete a GDAP role mapping by group ID',
				action: 'Delete GDAP role mapping',
			},
			{
				name: 'Delete Role Template',
				value: 'deleteRoleTemplate',
				description: 'Delete a GDAP role template',
				action: 'Delete GDAP role template',
			},
			{
				name: 'List Access Assignments',
				value: 'listAccessAssignments',
				description: 'List GDAP access assignments',
				action: 'List GDAP access assignments',
			},
			{
				name: 'List Approved Invites',
				value: 'listApprovedInvites',
				description: 'List approved GDAP invites',
				action: 'List approved GDAP invites',
			},
			{
				name: 'List Invites',
				value: 'listInvites',
				description: 'List GDAP invites',
				action: 'List GDAP invites',
			},
			{
				name: 'List Roles',
				value: 'listRoles',
				description: 'List GDAP roles and assignments',
				action: 'List GDAP roles',
			},
			{
				name: 'Manage Access Assignment',
				value: 'manageAccessAssignment',
				description: 'Update a GDAP access assignment (approve/reject)',
				action: 'Manage GDAP access assignment',
			},
			{
				name: 'Remove GA Role',
				value: 'removeGARole',
				description: 'Remove Global Admin role from a GDAP relationship',
				action: 'Remove GA role from GDAP relationship',
			},
			{
				name: 'Send Invite',
				value: 'sendInvite',
				description: 'Send or manage a GDAP invitation',
				action: 'Send GDAP invite',
			},
			{
				name: 'Trace Access',
				value: 'traceAccess',
				description: 'Test the complete GDAP access path for a user',
				action: 'Trace GDAP access',
			},
		],
		default: 'listRoles',
	},
];

// List operations that support returnAll/limit
const listOps = ['listAccessAssignments', 'listApprovedInvites', 'listInvites', 'listRoles'];

export const gdapFields: INodeProperties[] = [
	// ── Tenant selector — only for traceAccess ──
	tenantField('gdap', ['traceAccess']),

	// ── Return All / Limit for list operations ──
	returnAllField('gdap', listOps),
	limitField('gdap', listOps),

	// ── listAccessAssignments optional filter ──
	{
		displayName: 'Assignment ID',
		name: 'assignmentId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['listAccessAssignments'],
			},
		},
		default: '',
		description: 'Optional GDAP access assignment ID to filter by',
	},

	// ── listInvites optional filter ──
	{
		displayName: 'Relationship ID',
		name: 'relationshipId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['listInvites'],
			},
		},
		default: '',
		description: 'Optional GDAP relationship ID to filter invites',
	},

	// ── addRole fields ──
	{
		displayName: 'Action',
		name: 'addRoleAction',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['addRole'],
			},
		},
		default: '',
		placeholder: 'e.g. addRoles',

	},
	{
		displayName: 'Additional Fields',
		name: 'addRoleFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['addRole'],
			},
		},
		options: [
			{
				displayName: 'Custom Suffix',
				name: 'customSuffix',
				type: 'string',
				default: '',
				description: 'Custom suffix for the GDAP role',
			},
			{
				displayName: 'GDAP Roles',
				name: 'gdapRoles',
				type: 'string',
				default: '',
				description: 'Comma-separated list of GDAP role names',
			},
			{
				displayName: 'GDAP Template (JSON)',
				name: 'gdapTemplate',
				type: 'string',
				default: '',
				placeholder: '{"label": "...", "value": "..."}',
				description: 'LabelValue JSON object for the GDAP template',
			},
			{
				displayName: 'Invite Count',
				name: 'inviteCount',
				type: 'number',
				default: 1,
				description: 'Number of invites to create',
			},
			{
				displayName: 'Mappings (JSON)',
				name: 'mappings',
				type: 'string',
				default: '',
				description: 'JSON string of role mappings',
			},
			{
				displayName: 'Reference',
				name: 'Reference',
				type: 'string',
				default: '',
				description: 'Reference string for the role',
			},
			{
				displayName: 'Replace',
				name: 'replace',
				type: 'string',
				default: '',
				description: 'Replace existing mappings',
			},
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'string',
				default: '',
				description: 'Template ID to use for role creation',
			},
		],
	},

	// ── autoExtend ──
	{
		displayName: 'Relationship ID',
		name: 'autoExtendId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['autoExtend'],
			},
		},
		default: '',
		description: 'The GDAP relationship ID to auto-extend',
	},

	// ── deleteRelationship ──
	{
		displayName: 'GDAP ID',
		name: 'deleteRelationshipId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['deleteRelationship'],
			},
		},
		default: '',
		description: 'The GDAP relationship ID to delete',
	},

	// ── deleteRoleMapping ──
	{
		displayName: 'Group ID',
		name: 'deleteRoleMappingGroupId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['deleteRoleMapping'],
			},
		},
		default: '',
		description: 'The security group ID whose role mapping should be deleted',
	},

	// ── deleteRoleTemplate ──
	{
		displayName: 'Template ID',
		name: 'deleteTemplateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['deleteRoleTemplate'],
			},
		},
		default: '',
		description: 'The GDAP role template ID to delete',
	},
	{
		displayName: 'Additional Fields',
		name: 'deleteTemplateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['deleteRoleTemplate'],
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
				displayName: 'GDAP Template (JSON)',
				name: 'gdapTemplate',
				type: 'string',
				default: '',
				placeholder: '{"label": "...", "value": "..."}',
				description: 'LabelValue JSON object for the GDAP template',
			},
			{
				displayName: 'Group ID',
				name: 'GroupId',
				type: 'string',
				default: '',
				description: 'Security group ID associated with the template',
			},
			{
				displayName: 'Invite Count',
				name: 'inviteCount',
				type: 'number',
				default: 1,
				description: 'Number of invites',
			},
			{
				displayName: 'Original Template ID',
				name: 'OriginalTemplateId',
				type: 'string',
				default: '',
				description: 'Original template ID if replacing',
			},
			{
				displayName: 'Reference',
				name: 'Reference',
				type: 'string',
				default: '',
				description: 'Reference string',
			},
			{
				displayName: 'Role Mappings (JSON)',
				name: 'RoleMappings',
				type: 'string',
				default: '',
				placeholder: '{"label": "...", "value": "..."}',
				description: 'LabelValue JSON for role mappings',
			},
		],
	},

	// ── manageAccessAssignment ──
	{
		displayName: 'Action',
		name: 'accessAssignmentAction',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['manageAccessAssignment'],
			},
		},
		options: [
			{ name: 'Approve', value: 'approve' },
			{ name: 'Reject', value: 'reject' },
		],
		default: 'approve',
		description: 'Whether to approve or reject the access assignment',
	},
	{
		displayName: 'Assignment ID',
		name: 'accessAssignmentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['manageAccessAssignment'],
			},
		},
		default: '',
		description: 'The GDAP access assignment ID',
	},
	{
		displayName: 'Role Template ID',
		name: 'roleTemplateId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['manageAccessAssignment'],
			},
		},
		default: '',
		description: 'Optional role template ID for the assignment',
	},

	// ── removeGARole ──
	{
		displayName: 'GDAP ID',
		name: 'removeGARoleId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['removeGARole'],
			},
		},
		default: '',
		description: 'The GDAP relationship ID to remove Global Admin role from',
	},

	// ── sendInvite (redesigned — spec says DELETE with body) ──
	{
		displayName: 'Action',
		name: 'inviteAction',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['sendInvite'],
			},
		},
		default: '',
		placeholder: 'e.g. sendInvite',

	},
	{
		displayName: 'Additional Fields',
		name: 'inviteFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['sendInvite'],
			},
		},
		options: [
			{
				displayName: 'GDAP Template (JSON)',
				name: 'gdapTemplate',
				type: 'string',
				default: '',
				placeholder: '{"label": "...", "value": "..."}',
				description: 'LabelValue JSON object for the GDAP template',
			},
			{
				displayName: 'Invite Count',
				name: 'inviteCount',
				type: 'number',
				default: 1,
				description: 'Number of invites to send',
			},
			{
				displayName: 'Invite ID',
				name: 'InviteId',
				type: 'string',
				default: '',
				description: 'Specific invite ID to act on',
			},
			{
				displayName: 'Reference',
				name: 'Reference',
				type: 'string',
				default: '',
				description: 'Reference string for the invite',
			},
			{
				displayName: 'Role Definition ID',
				name: 'roleDefinitionId',
				type: 'string',
				default: '',
				description: 'Role definition ID for the invite',
			},
			{
				displayName: 'Role Mappings (JSON)',
				name: 'roleMappings',
				type: 'string',
				default: '',
				placeholder: '{"label": "...", "value": "..."}',
				description: 'LabelValue JSON for role mappings',
			},
		],
	},

	// ── traceAccess ──
	{
		displayName: 'UPN',
		name: 'traceUpn',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['gdap'],
				operation: ['traceAccess'],
			},
		},
		default: '',
		description: 'User principal name to trace GDAP access for',
	},
];
