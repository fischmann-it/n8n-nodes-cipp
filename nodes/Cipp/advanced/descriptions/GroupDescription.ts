import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

export const groupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['group'],
			},
		},
		options: [
			{
				name: 'Add',
				value: 'add',
				description: 'Create a new group',
				action: 'Add a group',
			},
			{
				name: 'Add Team',
				value: 'addTeam',
				description: 'Add a Teams team to a group',
				action: 'Add team to group',
			},
			{
				name: 'Add Template',
				value: 'addTemplate',
				description: 'Create a group template',
				action: 'Add a group template',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a group',
				action: 'Delete a group',
			},
			{
				name: 'Edit Members',
				value: 'edit',
				description: 'Add or remove members/owners from a group',
				action: 'Edit group members',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get a list of groups',
				action: 'Get many groups',
			},
			{
				name: 'Hide From GAL',
				value: 'hideFromGal',
				description: 'Hide or unhide a group from the Global Address List',
				action: 'Hide group from GAL',
			},
			{
				name: 'List Sender Authentication',
				value: 'listSenderAuthentication',
				description: 'List sender authentication settings for groups',
				action: 'List sender authentication',
			},
			{
				name: 'List Templates',
				value: 'listTemplates',
				description: 'Get a list of group templates',
				action: 'List group templates',
			},
			{
				name: 'Remove Template',
				value: 'removeTemplate',
				description: 'Remove a group template',
				action: 'Remove a group template',
			},
			{
				name: 'Set Delivery Management',
				value: 'deliveryManagement',
				description: 'Manage group delivery settings',
				action: 'Set delivery management',
			},
		],
		default: 'getAll',
	},
];

export const groupFields: INodeProperties[] = [
	tenantField('group', [
		'add',
		'addTeam',
		'delete',
		'deliveryManagement',
		'edit',
		'getAll',
		'hideFromGal',
		'listSenderAuthentication',
	]),
	returnAllField('group', ['getAll', 'listSenderAuthentication', 'listTemplates']),
	limitField('group', ['getAll', 'listSenderAuthentication', 'listTemplates']),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'string',
				default: '',
				description: 'Get details for a specific group by ID',
			},
			{
				displayName: 'Include Members',
				name: 'members',
				type: 'boolean',
				default: false,
				description: 'Whether to include group members in the response',
			},
			{
				displayName: 'Include Owners',
				name: 'owners',
				type: 'boolean',
				default: false,
				description: 'Whether to include group owners in the response',
			},
		],
	},

	// Add Group fields
	{
		displayName: 'Group Name',
		name: 'groupName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['add'],
			},
		},
		default: '',
		description: 'The display name of the group',
	},
	{
		displayName: 'Group Type',
		name: 'groupType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['add'],
			},
		},
		options: [
			{ name: 'Distribution', value: 'distribution' },
			{ name: 'Dynamic', value: 'dynamic' },
			{ name: 'Dynamic Distribution', value: 'dynamicdistribution' },
			{ name: 'Mail-Enabled Security', value: 'generic' },
			{ name: 'Microsoft 365', value: 'm365' },
			{ name: 'Security', value: 'security' },
		],
		default: 'm365',
		description: 'The type of group to create',
	},

	// Edit Group fields
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['edit', 'delete', 'hideFromGal', 'deliveryManagement'],
			},
		},
		default: '',
		description: 'The ID of the group to modify',
	},
	{
		displayName: 'Edit Options',
		name: 'editOptions',
		type: 'collection',
		placeholder: 'Add Edit Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['edit'],
			},
		},
		options: [
			{
				displayName: 'Add Members',
				name: 'addMembers',
				type: 'string',
				default: '',
				placeholder: 'user1@domain.com,user2@domain.com',
				description: 'Comma-separated list of users to add as members',
			},
			{
				displayName: 'Add Owners',
				name: 'addOwners',
				type: 'string',
				default: '',
				placeholder: 'owner@domain.com',
				description: 'Comma-separated list of users to add as owners',
			},
			{
				displayName: 'Remove Members',
				name: 'removeMembers',
				type: 'string',
				default: '',
				placeholder: 'user1@domain.com,user2@domain.com',
				description: 'Comma-separated list of members to remove',
			},
			{
				displayName: 'Remove Owners',
				name: 'removeOwners',
				type: 'string',
				default: '',
				placeholder: 'owner@domain.com',
				description: 'Comma-separated list of owners to remove',
			},
		],
	},

	// Delete Group fields
	{
		displayName: 'Group Type',
		name: 'groupTypeForDelete',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['delete', 'hideFromGal', 'deliveryManagement'],
			},
		},
		options: [
			{ name: 'Distribution', value: 'distribution' },
			{ name: 'Dynamic', value: 'dynamic' },
			{ name: 'Dynamic Distribution', value: 'dynamicdistribution' },
			{ name: 'Mail-Enabled Security', value: 'generic' },
			{ name: 'Microsoft 365', value: 'm365' },
			{ name: 'Security', value: 'security' },
		],
		default: 'm365',
		description: 'The type of the group',
	},
	// Hide from GAL option
	{
		displayName: 'Hide From GAL',
		name: 'hideFromGal',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['hideFromGal'],
			},
		},
		default: true,
		description: 'Whether to hide the group from the Global Address List',
	},

	// Delivery Management option
	{
		displayName: 'Only Allow Internal Messages',
		name: 'onlyInternal',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['deliveryManagement'],
			},
		},
		default: false,
		description: 'Whether to only allow messages from internal senders',
	},

	// ── Add Team fields ──
	{
		displayName: 'Group ID',
		name: 'teamGroupId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['addTeam'],
			},
		},
		default: '',
		description: 'The object ID of the group to add a Teams team to',
	},
	{
		displayName: 'Team Settings',
		name: 'teamSettings',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['addTeam'],
			},
		},
		default: '',
		description: 'Optional team configuration settings (JSON string)',
	},

	// ── Add Template fields ──
	{
		displayName: 'Display Name',
		name: 'templateDisplayName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['addTemplate'],
			},
		},
		default: '',
		description: 'The display name for the group template',
	},
	{
		displayName: 'Group Type',
		name: 'templateGroupType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['addTemplate'],
			},
		},
		options: [
			{ name: 'Azure Role', value: 'azurerole' },
			{ name: 'Distribution', value: 'distribution' },
			{ name: 'Dynamic', value: 'dynamic' },
			{ name: 'Dynamic Distribution', value: 'dynamicDistribution' },
			{ name: 'Mail-Enabled Security', value: 'generic' },
			{ name: 'Microsoft 365', value: 'm365' },
			{ name: 'Security', value: 'security' },
		],
		default: 'm365',
		description: 'The type of group for the template',
	},
	{
		displayName: 'Template Options',
		name: 'templateOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['addTemplate'],
			},
		},
		options: [
			{
				displayName: 'Allow External',
				name: 'allowExternal',
				type: 'boolean',
				default: false,
				description: 'Whether to allow external members',
			},
			{
				displayName: 'Description',
				name: 'Description',
				type: 'string',
				default: '',
				description: 'Description for the template',
			},
			{
				displayName: 'GUID',
				name: 'GUID',
				type: 'string',
				default: '',
				description: 'Template identifier (for updating an existing template)',
			},
			{
				displayName: 'Membership Rules',
				name: 'membershipRules',
				type: 'string',
				default: '',
				description: 'Dynamic group membership rules',
			},
			{
				displayName: 'Subscribe Members',
				name: 'subscribeMembers',
				type: 'boolean',
				default: false,
				description: 'Whether to subscribe members to the group',
			},
			{
				displayName: 'Username',
				name: 'username',
				type: 'string',
				default: '',
				description: 'Username for group creation',
			},
		],
	},

	// ── Remove Template fields ──
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['removeTemplate'],
			},
		},
		default: '',
		description: 'The ID of the group template to remove',
	},

	// ── List Templates fields ──
	{
		displayName: 'Options',
		name: 'listTemplateOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['group'],
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

	// ── List Sender Authentication fields ──
	{
		displayName: 'Options',
		name: 'senderAuthOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['listSenderAuthentication'],
			},
		},
		options: [
			{
				displayName: 'Group ID',
				name: 'groupid',
				type: 'string',
				default: '',
				description: 'Filter by a specific group object ID',
			},
			{
				displayName: 'Type',
				name: 'Type',
				type: 'string',
				default: '',
				description: 'Filter by sender authentication type',
			},
		],
	},
];
