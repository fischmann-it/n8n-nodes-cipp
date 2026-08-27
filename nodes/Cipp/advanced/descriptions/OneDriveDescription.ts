import type { INodeProperties } from 'n8n-workflow';
import { tenantField } from './DescriptionHelpers';

export const onedriveOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['onedrive'],
			},
		},
		options: [
			{
				name: 'Add Shortcut',
				value: 'addShortcut',
				description: 'Add a OneDrive shortcut for a user',
				action: 'Add one drive shortcut',
			},
			{
				name: 'Provision',
				value: 'provision',
				description: 'Pre-provision OneDrive for a user',
				action: 'Provision one drive',
			},
		],
		default: 'provision',
	},
];

export const onedriveFields: INodeProperties[] = [
	tenantField('onedrive'),

	// User ID for all OneDrive operations
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['onedrive'],
			},
		},
		default: '',
		placeholder: 'user@domain.com',
		description: 'The User Principal Name (UPN) of the user',
	},

	// Shortcut URL for addShortcut
	{
		displayName: 'Shortcut URL',
		name: 'shortcutUrl',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['onedrive'],
				operation: ['addShortcut'],
			},
		},
		default: '',
		placeholder: 'e.g. https://contoso.sharepoint.com/sites/TeamSite',
		description: 'The SharePoint URL to create a shortcut to',
	},
];
