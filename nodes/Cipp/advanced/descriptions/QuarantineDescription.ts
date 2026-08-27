import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

export const quarantineOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['quarantine'],
			},
		},
		options: [
			{
				name: 'Deny',
				value: 'deny',
				description: 'Deny a quarantined message and prevent delivery',
				action: 'Deny quarantined message',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'List quarantined email messages',
				action: 'List quarantined messages',
			},
			{
				name: 'Get Message',
				value: 'getMessage',
				description: 'Get the body content of a quarantined message',
				action: 'Get quarantined message body',
			},
			{
				name: 'Release',
				value: 'release',
				description: 'Release a quarantined message for delivery',
				action: 'Release quarantined message',
			},
		],
		default: 'getMany',
	},
];

export const quarantineFields: INodeProperties[] = [
	tenantField('quarantine'),

	// Message ID for release/deny operations
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['quarantine'],
				operation: ['release', 'deny', 'getMessage'],
			},
		},
		default: '',
		placeholder: 'e.g. abc123def456...',
		description: 'The unique identifier of the quarantined message',
	},

	// Allow Sender option for release operation
	{
		displayName: 'Allow Sender',
		name: 'allowSender',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['quarantine'],
				operation: ['release'],
			},
		},
		default: false,
		description: 'Whether to add the sender to the allowed list when releasing the message',
	},

	returnAllField('quarantine', ['getMany']),
	limitField('quarantine', ['getMany']),
];
