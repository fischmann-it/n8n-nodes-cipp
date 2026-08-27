import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

const RESOURCE = 'contact';

// ── List operations that support returnAll/limit ─────────────────────────
const LIST_OPS = ['listContacts', 'listContactTemplates', 'listContactPermissions'];

export const contactOperations: INodeProperties[] = [
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
				name: 'Add Contact',
				value: 'addContact',
				description: 'Create a new contact in a tenant',
				action: 'Add a contact',
			},
			{
				name: 'Add Contact Template',
				value: 'addContactTemplate',
				description: 'Create a contact template',
				action: 'Add a contact template',
			},
			{
				name: 'Deploy Contact Templates',
				value: 'deployContactTemplates',
				description: 'Deploy contact templates to selected tenants',
				action: 'Deploy contact templates',
			},
			{
				name: 'Edit Contact',
				value: 'editContact',
				description: 'Edit an existing contact in a tenant',
				action: 'Edit a contact',
			},
			{
				name: 'Edit Contact Template',
				value: 'editContactTemplate',
				description: 'Edit an existing contact template',
				action: 'Edit a contact template',
			},
			{
				name: 'List Contact Permissions',
				value: 'listContactPermissions',
				description: 'List contact folder permissions for a tenant',
				action: 'List contact permissions',
			},
			{
				name: 'List Contact Templates',
				value: 'listContactTemplates',
				description: 'List available contact templates',
				action: 'List contact templates',
			},
			{
				name: 'List Contacts',
				value: 'listContacts',
				description: 'List contacts for a tenant',
				action: 'List contacts',
			},
			{
				name: 'Modify Contact Permissions',
				value: 'modifyContactPermissions',
				description: 'Modify contact folder permissions',
				action: 'Modify contact permissions',
			},
			{
				name: 'Remove Contact',
				value: 'removeContact',
				description: 'Remove a contact from a tenant',
				action: 'Remove a contact',
			},
			{
				name: 'Remove Contact Template',
				value: 'removeContactTemplate',
				description: 'Remove a contact template',
				action: 'Remove a contact template',
			},
		],
		default: 'listContacts',
	},
];

export const contactFields: INodeProperties[] = [
	// ── Tenant fields ────────────────────────────────────────────
	tenantField(RESOURCE, [
		'listContacts',
		'addContact',
		'editContact',
		'removeContact',
		'deployContactTemplates',
		'listContactPermissions',
		'modifyContactPermissions',
	]),

	// ── Return All / Limit ───────────────────────────────────────
	returnAllField(RESOURCE, LIST_OPS),
	limitField(RESOURCE, LIST_OPS),

	// ══════════════════════════════════════════════════════════════
	// Contacts — List
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Filters',
		name: 'listContactsFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listContacts'],
			},
		},
		options: [
			{
				displayName: 'Contact ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Filter by a specific contact ID',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Contacts — Add
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Display Name',
		name: 'displayName',
		type: 'string',
		required: true,
		default: '',
		description: 'The display name of the contact or template',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addContact', 'addContactTemplate'],
			},
		},
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		description: 'The external email address of the contact',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addContact'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'addContactFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addContact'],
			},
		},
		options: [
			{
				displayName: 'City',
				name: 'City',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Company',
				name: 'Company',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Country or Region',
				name: 'CountryOrRegion',
				type: 'string',
				default: '',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Hide From GAL',
				name: 'hidefromGAL',
				type: 'string',
				default: '',
				description: 'Whether to hide the contact from the Global Address List',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Mail Tip',
				name: 'mailTip',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Mobile Phone',
				name: 'mobilePhone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Postal Code',
				name: 'PostalCode',
				type: 'string',
				default: '',
			},
			{
				displayName: 'State',
				name: 'State',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Street Address',
				name: 'StreetAddress',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Title',
				name: 'Title',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Contacts — Edit
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Contact ID',
		name: 'contactID',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the contact to edit',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['editContact'],
			},
		},
	},
	{
		displayName: 'Edit Fields',
		name: 'editContactFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['editContact'],
			},
		},
		options: [
			{
				displayName: 'City',
				name: 'City',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Company',
				name: 'Company',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Country or Region',
				name: 'CountryOrRegion',
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
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Hide From GAL',
				name: 'hidefromGAL',
				type: 'boolean',
				default: false,
				description: 'Whether to hide the contact from the Global Address List',
			},
			{
				displayName: 'Last Name',
				name: 'LastName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Mail Tip',
				name: 'mailTip',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Mobile Phone',
				name: 'mobilePhone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Postal Code',
				name: 'PostalCode',
				type: 'string',
				default: '',
			},
			{
				displayName: 'State',
				name: 'State',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Street Address',
				name: 'StreetAddress',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Title',
				name: 'Title',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Contacts — Remove
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'GUID',
		name: 'gUID',
		type: 'string',
		required: true,
		default: '',
		description: 'The GUID of the contact to remove',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['removeContact'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'removeContactFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['removeContact'],
			},
		},
		options: [
			{
				displayName: 'Mail',
				name: 'Mail',
				type: 'string',
				default: '',
				description: 'The email address of the contact to remove',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Contact Templates — List
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Filters',
		name: 'listContactTemplatesFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listContactTemplates'],
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

	// ══════════════════════════════════════════════════════════════
	// Contact Templates — Add
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Additional Fields',
		name: 'addContactTemplateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addContactTemplate'],
			},
		},
		options: [
			{
				displayName: 'Business Phone',
				name: 'businessPhone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Company Name',
				name: 'companyName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Hide From GAL',
				name: 'hidefromGAL',
				type: 'boolean',
				default: false,
				description: 'Whether to hide from the Global Address List',
			},
			{
				displayName: 'Job Title',
				name: 'jobTitle',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Mail Tip',
				name: 'mailTip',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Mobile Phone',
				name: 'mobilePhone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Street Address',
				name: 'streetAddress',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Contact Templates — Edit
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Contact Template ID',
		name: 'contactTemplateID',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the contact template to edit',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['editContactTemplate'],
			},
		},
	},
	{
		displayName: 'Edit Fields',
		name: 'editContactTemplateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['editContactTemplate'],
			},
		},
		options: [
			{
				displayName: 'Business Phone',
				name: 'businessPhone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Company Name',
				name: 'companyName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Country',
				name: 'country',
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
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Hide From GAL',
				name: 'hidefromGAL',
				type: 'boolean',
				default: false,
				description: 'Whether to hide from the Global Address List',
			},
			{
				displayName: 'Job Title',
				name: 'jobTitle',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Mail Tip',
				name: 'mailTip',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Mobile Phone',
				name: 'mobilePhone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Street Address',
				name: 'streetAddress',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Contact Templates — Remove
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Template ID',
		name: 'templateID',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the contact template to remove',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['removeContactTemplate'],
			},
		},
	},

	// ══════════════════════════════════════════════════════════════
	// Deploy Contact Templates
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Template List (JSON)',
		name: 'templateList',
		type: 'string',
		required: true,
		default: '',
		description: 'JSON object or array of templates to deploy (e.g. {"label":"Template Name","value":"template-ID"})',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['deployContactTemplates'],
			},
		},
	},

	// ══════════════════════════════════════════════════════════════
	// Contact Permissions — List
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Filters',
		name: 'listContactPermissionsFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listContactPermissions'],
			},
		},
		options: [
			{
				displayName: 'User ID',
				name: 'UserID',
				type: 'string',
				default: '',
				description: 'Filter permissions by a specific user ID',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Contact Permissions — Modify
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'User ID',
		name: 'userID',
		type: 'string',
		required: true,
		default: '',
		description: 'The user ID whose contact permissions to modify',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['modifyContactPermissions'],
			},
		},
	},
	{
		displayName: 'Permissions',
		name: 'permissions',
		type: 'string',
		required: true,
		default: '',
		description: 'The permissions to set (e.g. "Author", "Editor", "Reviewer")',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['modifyContactPermissions'],
			},
		},
	},
];
