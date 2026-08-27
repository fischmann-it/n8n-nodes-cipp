import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

// Operations that use the shared required userId field
const userIdOps = [
	'convert',
	'editCalendarPermissions',
	'editMailboxPermissions',
	'enableArchive',
	'enableAutoExpandArchive',
	'hideFromGAL',
	'manageMobileDevice',
	'removeMailboxRule',
	'setCalendarProcessing',
	'setCopyForSent',
	'setDefaultCalendarPerms',
	'setDefaultContactPerms',
	'setDefaultMailboxPerms',
	'setEmailSize',
	'setForwarding',
	'setLitigationHold',
	'setLocale',
	'setMailboxQuota',
	'setMailboxRule',
	'setOutOfOffice',
	'setRecipientLimits',
	'setRetentionHold',
	'startManagedFolderAssistant',
];

// List operations with returnAll/limit support
const listOps = [
	'listCalendarPermissions',
	'listGlobalAddressList',
	'listMailboxCAS',
	'listMailboxPermissions',
	'listMailboxRestores',
	'listMailboxRules',
	'listMailboxes',
	'listMessageTrace',
	'listMobileDevices',
	'listOutOfOffice',
	'listRestrictedUsers',
	'listSharedMailboxAccountEnabled',
	'listSharedMailboxStats',
	'runExoRequest',
];

// List operations that accept an optional user filter
const listUserFilterOps = [
	'listCalendarPermissions',
	'listMailboxPermissions',
	'listOutOfOffice',
];

export const mailboxOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
			},
		},
		options: [
			{
				name: 'Add Shared Mailbox',
				value: 'addSharedMailbox',
				description: 'Create a new shared mailbox',
				action: 'Add shared mailbox',
			},
			{
				name: 'Convert',
				value: 'convert',
				description: 'Convert mailbox between shared and regular types',
				action: 'Convert mailbox',
			},
			{
				name: 'Create High Volume Email',
				value: 'createHighVolumeEmail',
				description: 'Create a high volume email user',
				action: 'Create high volume email user',
			},
			{
				name: 'Edit Calendar Permissions',
				value: 'editCalendarPermissions',
				description: 'Edit calendar folder permissions for a user',
				action: 'Edit calendar permissions',
			},
			{
				name: 'Edit Mailbox Permissions',
				value: 'editMailboxPermissions',
				description: 'Add or remove mailbox delegation permissions',
				action: 'Edit mailbox permissions',
			},
			{
				name: 'Enable Archive',
				value: 'enableArchive',
				description: 'Enable online archive for a user',
				action: 'Enable archive',
			},
			{
				name: 'Enable Auto-Expand Archive',
				value: 'enableAutoExpandArchive',
				description: 'Enable auto-expanding archive for a mailbox',
				action: 'Enable auto expand archive',
			},
			{
				name: 'Hide From GAL',
				value: 'hideFromGAL',
				description: 'Show or hide a mailbox from the Global Address List',
				action: 'Hide from GAL',
			},
			{
				name: 'List Calendar Permissions',
				value: 'listCalendarPermissions',
				description: 'List calendar permissions for a tenant',
				action: 'List calendar permissions',
			},
			{
				name: 'List Global Address List',
				value: 'listGlobalAddressList',
				description: 'List the Global Address List entries for a tenant',
				action: 'List global address list',
			},
			{
				name: 'List Mailbox Client Access Settings',
				value: 'listMailboxCAS',
				description: 'List mailbox Client Access Settings (OWA, ActiveSync, IMAP, POP, etc.)',
				action: 'List mailbox client access settings',
			},
			{
				name: 'List Mailbox Permissions',
				value: 'listMailboxPermissions',
				description: 'List mailbox delegation permissions for a tenant',
				action: 'List mailbox permissions',
			},
			{
				name: 'List Mailbox Restores',
				value: 'listMailboxRestores',
				description: 'List mailbox restore requests for a tenant',
				action: 'List mailbox restores',
			},
			{
				name: 'List Mailbox Rules',
				value: 'listMailboxRules',
				description: 'List inbox rules across mailboxes in a tenant',
				action: 'List mailbox rules',
			},
			{
				name: 'List Mailboxes',
				value: 'listMailboxes',
				description: 'List all mailboxes in a tenant',
				action: 'List mailboxes',
			},
			{
				name: 'List Message Trace',
				value: 'listMessageTrace',
				description: 'Trace email messages across Exchange Online',
				action: 'List message trace',
			},
			{
				name: 'List Mobile Devices',
				value: 'listMobileDevices',
				description: 'List mobile devices connected to mailboxes',
				action: 'List mobile devices',
			},
			{
				name: 'List Out of Office',
				value: 'listOutOfOffice',
				description: 'List out-of-office settings for a tenant',
				action: 'List out of office',
			},
			{
				name: 'List Restricted Users',
				value: 'listRestrictedUsers',
				description: 'List users restricted from sending email',
				action: 'List restricted users',
			},
			{
				name: 'List Shared Mailbox Account Enabled',
				value: 'listSharedMailboxAccountEnabled',
				description: 'List shared mailboxes that have direct sign-in enabled',
				action: 'List shared mailbox account enabled',
			},
			{
				name: 'List Shared Mailbox Statistics',
				value: 'listSharedMailboxStats',
				description: 'List statistics for shared mailboxes in a tenant',
				action: 'List shared mailbox statistics',
			},
			{
				name: 'Manage Mobile Device',
				value: 'manageMobileDevice',
				description: 'Delete or quarantine a mobile device',
				action: 'Manage mobile device',
			},
			{
				name: 'Manage Retention Policies',
				value: 'manageRetentionPolicies',
				description: 'Create, modify, or delete retention policies',
				action: 'Manage retention policies',
			},
			{
				name: 'Manage Retention Tags',
				value: 'manageRetentionTags',
				description: 'Create, modify, or delete retention tags',
				action: 'Manage retention tags',
			},
			{
				name: 'Remove Mailbox Rule',
				value: 'removeMailboxRule',
				description: 'Remove an inbox rule from a mailbox',
				action: 'Remove mailbox rule',
			},
			{
				name: 'Remove Restricted User',
				value: 'removeRestrictedUser',
				description: 'Unblock a restricted user from sending email',
				action: 'Remove restricted user',
			},
			{
				name: 'Repair Exchange Role',
				value: 'repairExchangeRole',
				description: 'Repair Exchange role assignments for a tenant',
				action: 'Repair exchange role',
			},
			{
				name: 'Restore Mailbox',
				value: 'restoreMailbox',
				description: 'Create a mailbox restore request to copy data between mailboxes',
				action: 'Restore mailbox',
			},
			{
				name: 'Run Exchange Request',
				value: 'runExoRequest',
				description: 'Execute an arbitrary Exchange Online PowerShell cmdlet via CIPP',
				action: 'Run exchange request',
			},
			{
				name: 'Send Org Message',
				value: 'sendOrgMessage',
				description: 'Send an organization-wide message to users',
				action: 'Send org message',
			},
			{
				name: 'Set Calendar Processing',
				value: 'setCalendarProcessing',
				description: 'Configure calendar processing for a resource mailbox',
				action: 'Set calendar processing',
			},
			{
				name: 'Set Copy for Sent',
				value: 'setCopyForSent',
				description: 'Enable or disable saving sent items copy for delegates',
				action: 'Set copy for sent',
			},
			{
				name: 'Set Default Calendar Permissions',
				value: 'setDefaultCalendarPerms',
				description: 'Set default calendar folder permissions for all users',
				action: 'Set default calendar permissions',
			},
			{
				name: 'Set Default Contact Permissions',
				value: 'setDefaultContactPerms',
				description: 'Set default contact folder permissions for all users',
				action: 'Set default contact permissions',
			},
			{
				name: 'Set Default Mailbox Permissions',
				value: 'setDefaultMailboxPerms',
				description: 'Set default mailbox permissions for all users',
				action: 'Set default mailbox permissions',
			},
			{
				name: 'Set Email Forwarding',
				value: 'setForwarding',
				description: 'Manage email forwarding settings',
				action: 'Set email forwarding',
			},
			{
				name: 'Set Email Size',
				value: 'setEmailSize',
				description: 'Set maximum send and receive email size limits',
				action: 'Set email size',
			},
			{
				name: 'Set Litigation Hold',
				value: 'setLitigationHold',
				description: 'Enable or disable litigation hold on a mailbox',
				action: 'Set litigation hold',
			},
			{
				name: 'Set Locale',
				value: 'setLocale',
				description: 'Set the language/locale for a mailbox',
				action: 'Set locale',
			},
			{
				name: 'Set Mailbox Quota',
				value: 'setMailboxQuota',
				description: 'Set mailbox storage quotas',
				action: 'Set mailbox quota',
			},
			{
				name: 'Set Mailbox Retention Policies',
				value: 'setMailboxRetentionPolicies',
				description: 'Assign a retention policy to mailboxes',
				action: 'Set mailbox retention policies',
			},
			{
				name: 'Set Mailbox Rule',
				value: 'setMailboxRule',
				description: 'Enable or disable an inbox rule',
				action: 'Set mailbox rule',
			},
			{
				name: 'Set Out of Office',
				value: 'setOutOfOffice',
				description: 'Set or disable out of office message',
				action: 'Set out of office',
			},
			{
				name: 'Set Recipient Limits',
				value: 'setRecipientLimits',
				description: 'Set maximum recipient limits for a mailbox',
				action: 'Set recipient limits',
			},
			{
				name: 'Set Retention Hold',
				value: 'setRetentionHold',
				description: 'Enable or disable retention hold on a mailbox',
				action: 'Set retention hold',
			},
			{
				name: 'Start Managed Folder Assistant',
				value: 'startManagedFolderAssistant',
				description: 'Trigger the Managed Folder Assistant for a mailbox',
				action: 'Start managed folder assistant',
			},
		],
		default: 'listMailboxes',
	},
];

export const mailboxFields: INodeProperties[] = [
	// ── Shared Fields ──────────────────────────────────────────────────

	tenantField('mailbox'),
	returnAllField('mailbox', listOps),
	limitField('mailbox', listOps),

	// User ID — required for most action operations
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: userIdOps,
			},
		},
		default: '',
		placeholder: 'user@domain.com',
		description: 'The User Principal Name (UPN) of the mailbox owner',
	},

	// ── List Operation Filters ─────────────────────────────────────────

	// Optional user filter for list operations
	{
		displayName: 'User ID (Filter)',
		name: 'listUserId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: listUserFilterOps,
			},
		},
		default: '',
		placeholder: 'user@domain.com',
		description: 'Filter results by a specific user (leave empty for all)',
	},

	// Use Report DB toggle for listMailboxRules
	{
		displayName: 'Use Report Database',
		name: 'useReportDb',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['listMailboxRules'],
			},
		},
		default: false,
		description: 'Whether to use the CIPP Report Database cache. When off (default), forces a live Exchange Online pull. Turn on only if the CIPP scheduled reporting job has run and you want cached results.',
	},

	// Mailbox filter for listMobileDevices
	{
		displayName: 'Mailbox (Filter)',
		name: 'mailboxFilter',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['listMobileDevices'],
			},
		},
		default: '',
		placeholder: 'user@domain.com',
		description: 'Filter mobile devices by a specific mailbox (leave empty for all)',
	},

	// ── Add Shared Mailbox ─────────────────────────────────────────────

	{
		displayName: 'Display Name',
		name: 'displayName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['addSharedMailbox', 'createHighVolumeEmail'],
			},
		},
		default: '',
		description: 'The display name for the mailbox',
	},
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['addSharedMailbox'],
			},
		},
		default: '',
		placeholder: 'sharedmailbox',
		description: 'The username (alias) for the shared mailbox',
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['addSharedMailbox'],
			},
		},
		default: '',
		placeholder: 'contoso.onmicrosoft.com',
		description: 'The domain for the shared mailbox email address',
	},
	{
		displayName: 'Additional Aliases',
		name: 'addedAliases',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['addSharedMailbox'],
			},
		},
		default: '',
		description: 'Additional email aliases for the shared mailbox',
	},

	// ── Create High Volume Email ───────────────────────────────────────

	{
		displayName: 'Primary SMTP Address',
		name: 'primarySMTPAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['createHighVolumeEmail'],
			},
		},
		default: '',
		placeholder: 'noreply@contoso.com',
		description: 'The primary email address for the HVE user',
	},
	{
		displayName: 'Password',
		name: 'password',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['createHighVolumeEmail'],
			},
		},
		default: '',
		description: 'The password for the HVE user',
	},

	// ── Remove Restricted User ─────────────────────────────────────────

	{
		displayName: 'Sender Address',
		name: 'senderAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['removeRestrictedUser'],
			},
		},
		default: '',
		placeholder: 'user@domain.com',
		description: 'The email address of the restricted user to unblock',
	},

	// ── Convert Mailbox ────────────────────────────────────────────────

	{
		displayName: 'Mailbox Type',
		name: 'mailboxType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['convert'],
			},
		},
		options: [
			{ name: 'Regular', value: 'Regular' },
			{ name: 'Shared', value: 'Shared' },
		],
		default: 'Shared',
		description: 'The type to convert the mailbox to',
	},

	// ── Out of Office ──────────────────────────────────────────────────

	{
		displayName: 'Auto-Reply State',
		name: 'autoReplyState',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setOutOfOffice'],
			},
		},
		options: [
			{ name: 'Disabled', value: 'Disabled' },
			{ name: 'Enabled', value: 'Enabled' },
			{ name: 'Scheduled', value: 'Scheduled' },
		],
		default: 'Enabled',
		description: 'Whether to enable, schedule, or disable the auto-reply',
	},
	{
		displayName: 'Auto-Reply Message',
		name: 'autoReplyMessage',
		type: 'string',
		typeOptions: { rows: 4 },
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setOutOfOffice'],
				autoReplyState: ['Enabled', 'Scheduled'],
			},
		},
		default: '',
		description: 'The out of office message to set',
	},
	{
		displayName: 'Start Time',
		name: 'startTime',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setOutOfOffice'],
				autoReplyState: ['Scheduled'],
			},
		},
		default: '',
		description: 'When the scheduled out-of-office auto-reply should start',
	},
	{
		displayName: 'End Time',
		name: 'endTime',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setOutOfOffice'],
				autoReplyState: ['Scheduled'],
			},
		},
		default: '',
		description: 'When the scheduled out-of-office auto-reply should end',
	},

	// ── Email Forwarding ───────────────────────────────────────────────

	{
		displayName: 'Forward Option',
		name: 'forwardOption',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setForwarding'],
			},
		},
		options: [
			{ name: 'External', value: 'external' },
			{ name: 'Internal', value: 'internal' },
		],
		default: 'internal',
		description: 'Whether to forward to an internal or external address',
	},
	{
		displayName: 'Forward Internal',
		name: 'forwardInternal',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setForwarding'],
				forwardOption: ['internal'],
			},
		},
		default: '',
		placeholder: 'user@domain.com',
		description: 'The internal email address to forward to',
	},
	{
		displayName: 'Forward External',
		name: 'forwardExternal',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setForwarding'],
				forwardOption: ['external'],
			},
		},
		default: '',
		placeholder: 'user@external.com',
		description: 'The external email address to forward to',
	},
	{
		displayName: 'Keep Copy',
		name: 'keepCopy',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setForwarding'],
			},
		},
		default: true,
		description: 'Whether to keep a copy of forwarded messages in the mailbox',
	},

	// ── Edit Mailbox Permissions ───────────────────────────────────────

	{
		displayName: 'Permission Options',
		name: 'permissionOptions',
		type: 'collection',
		placeholder: 'Add Permission',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['editMailboxPermissions'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Add Full Access',
				name: 'AddFullAccess',
				type: 'string',
				default: '',
				description: 'User to grant Full Access permission',
			},
			{
				displayName: 'Add Full Access (No Auto-Map)',
				name: 'AddFullAccessNoAutoMap',
				type: 'string',
				default: '',
				description: 'User to grant Full Access without auto-mapping in Outlook',
			},
			{
				displayName: 'Add Send As',
				name: 'AddSendAs',
				type: 'string',
				default: '',
				description: 'User to grant Send As permission',
			},
			{
				displayName: 'Add Send on Behalf',
				name: 'AddSendOnBehalf',
				type: 'string',
				default: '',
				description: 'User to grant Send on Behalf permission',
			},
			{
				displayName: 'Remove Full Access',
				name: 'RemoveFullAccess',
				type: 'string',
				default: '',
				description: 'User to remove Full Access permission from',
			},
			{
				displayName: 'Remove Send As',
				name: 'RemoveSendAs',
				type: 'string',
				default: '',
				description: 'User to remove Send As permission from',
			},
			{
				displayName: 'Remove Send on Behalf',
				name: 'RemoveSendOnBehalf',
				type: 'string',
				default: '',
				description: 'User to remove Send on Behalf permission from',
			},
		],
	},

	// ── Edit Calendar Permissions ──────────────────────────────────────

	{
		displayName: 'User to Grant Permissions',
		name: 'userToGetPermissions',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['editCalendarPermissions'],
			},
		},
		default: '',
		placeholder: 'user@domain.com',
		description: 'The user to grant calendar permissions to',
	},
	{
		displayName: 'Permissions',
		name: 'permissions',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['editCalendarPermissions'],
			},
		},
		options: [
			{ name: 'Author', value: 'Author' },
			{ name: 'Contributor', value: 'Contributor' },
			{ name: 'Editor', value: 'Editor' },
			{ name: 'Non-Editing Author', value: 'NonEditingAuthor' },
			{ name: 'None', value: 'None' },
			{ name: 'Owner', value: 'Owner' },
			{ name: 'Publishing Author', value: 'PublishingAuthor' },
			{ name: 'Publishing Editor', value: 'PublishingEditor' },
			{ name: 'Reviewer', value: 'Reviewer' },
		],
		default: 'Reviewer',
		description: 'The permission level to grant',
	},
	{
		displayName: 'Additional Options',
		name: 'calendarPermOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['editCalendarPermissions'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Can View Private Items',
				name: 'CanViewPrivateItems',
				type: 'options',
				options: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
				default: 'false',
				description: 'Whether the user can view private calendar items',
			},
			{
				displayName: 'Folder Name',
				name: 'FolderName',
				type: 'string',
				default: '',
				description: 'Calendar folder name (leave empty for default calendar)',
			},
			{
				displayName: 'Remove Access',
				name: 'RemoveAccess',
				type: 'options',
				options: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
				default: 'false',
				description: 'Whether to remove access instead of granting it',
			},
		],
	},

	// ── Set Default Permissions (Calendar / Contact / Mailbox) ─────────

	{
		displayName: 'Permissions',
		name: 'permissions',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: [
					'setDefaultCalendarPerms',
					'setDefaultContactPerms',
					'setDefaultMailboxPerms',
				],
			},
		},
		options: [
			{ name: 'Author', value: 'Author' },
			{ name: 'Contributor', value: 'Contributor' },
			{ name: 'Editor', value: 'Editor' },
			{ name: 'Non-Editing Author', value: 'NonEditingAuthor' },
			{ name: 'None', value: 'None' },
			{ name: 'Owner', value: 'Owner' },
			{ name: 'Publishing Author', value: 'PublishingAuthor' },
			{ name: 'Publishing Editor', value: 'PublishingEditor' },
			{ name: 'Reviewer', value: 'Reviewer' },
		],
		default: 'None',
		description: 'The default permission level to set for all users',
	},

	// ── Set Mailbox Quota ──────────────────────────────────────────────

	{
		displayName: 'Quota Options',
		name: 'quotaOptions',
		type: 'collection',
		placeholder: 'Add Quota',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setMailboxQuota'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Issue Warning Quota (GB)',
				name: 'IssueWarningQuota',
				type: 'string',
				default: '',
				description: 'Size at which a warning is issued (e.g. "49")',
			},
			{
				displayName: 'Prohibit Send Quota (GB)',
				name: 'ProhibitSendQuota',
				type: 'string',
				default: '',
				description: 'Size at which sending is prohibited (e.g. "49.5")',
			},
			{
				displayName: 'Prohibit Send Receive Quota (GB)',
				name: 'ProhibitSendReceiveQuota',
				type: 'string',
				default: '',
				description: 'Size at which sending and receiving are prohibited (e.g. "50")',
			},
		],
	},

	// ── Set Email Size ─────────────────────────────────────────────────

	{
		displayName: 'Max Send Size (MB)',
		name: 'maxSendSize',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setEmailSize'],
			},
		},
		default: '35',
		description: 'Maximum outgoing email size in megabytes',
	},
	{
		displayName: 'Max Receive Size (MB)',
		name: 'maxReceiveSize',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setEmailSize'],
			},
		},
		default: '36',
		description: 'Maximum incoming email size in megabytes',
	},

	// ── Set Locale ─────────────────────────────────────────────────────

	{
		displayName: 'Locale',
		name: 'locale',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setLocale'],
			},
		},
		default: 'en-US',
		placeholder: 'en-US',
		description: 'The language/locale code to set (e.g. en-US, de-DE, fr-FR)',
	},

	// ── Set / Remove Mailbox Rule ──────────────────────────────────────

	{
		displayName: 'Rule Name',
		name: 'ruleName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setMailboxRule', 'removeMailboxRule'],
			},
		},
		default: '',
		description: 'The name of the inbox rule',
	},
	{
		displayName: 'Rule State',
		name: 'ruleState',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setMailboxRule'],
			},
		},
		options: [
			{ name: 'Disable', value: 'disable' },
			{ name: 'Enable', value: 'enable' },
		],
		default: 'enable',
		description: 'Whether to enable or disable the rule',
	},
	{
		displayName: 'Rule ID',
		name: 'ruleId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setMailboxRule', 'removeMailboxRule'],
			},
		},
		default: '',
		description: 'The ID of the rule (optional, rule name is used if not provided)',
	},

	// ── Set Recipient Limits ───────────────────────────────────────────

	{
		displayName: 'Recipient Limit',
		name: 'recipientLimit',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setRecipientLimits'],
			},
		},
		default: '500',
		description: 'Maximum number of recipients per message',
	},

	// ── Set Copy for Sent ──────────────────────────────────────────────

	{
		displayName: 'Message Copy State',
		name: 'messageCopyState',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setCopyForSent'],
			},
		},
		options: [
			{ name: 'Disable', value: 'false' },
			{ name: 'Enable', value: 'true' },
		],
		default: 'true',
		description: 'Whether to save a copy of sent items for delegates',
	},

	// ── Set Calendar Processing ────────────────────────────────────────

	{
		displayName: 'Calendar Processing Options',
		name: 'calendarProcessingOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setCalendarProcessing'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Add Organizer to Subject',
				name: 'addOrganizerToSubject',
				type: 'options',
				options: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
				default: 'true',
				description: 'Whether to add the organizer name to the meeting subject',
			},
			{
				displayName: 'Additional Response',
				name: 'additionalResponse',
				type: 'string',
				default: '',
				description: 'Additional text to include in meeting responses',
			},
			{
				displayName: 'Allow Conflicts',
				name: 'allowConflicts',
				type: 'options',
				options: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
				default: 'false',
				description: 'Whether to allow conflicting meeting requests',
			},
			{
				displayName: 'Allow Recurring Meetings',
				name: 'allowRecurringMeetings',
				type: 'options',
				options: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
				default: 'true',
				description: 'Whether to allow recurring meeting requests',
			},
			{
				displayName: 'Automatically Accept',
				name: 'automaticallyAccept',
				type: 'options',
				options: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
				default: 'true',
				description: 'Whether to automatically accept meeting requests',
			},
			{
				displayName: 'Automatically Process',
				name: 'automaticallyProcess',
				type: 'options',
				options: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
				default: 'true',
				description: 'Whether to automatically process meeting requests',
			},
			{
				displayName: 'Booking Window (Days)',
				name: 'bookingWindowInDays',
				type: 'string',
				default: '',
				description: 'Maximum number of days in advance a meeting can be booked',
			},
			{
				displayName: 'Delete Comments',
				name: 'deleteComments',
				type: 'options',
				options: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
				default: 'true',
				description: 'Whether to delete comments from meeting requests',
			},
			{
				displayName: 'Delete Subject',
				name: 'deleteSubject',
				type: 'options',
				options: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
				default: 'true',
				description: 'Whether to delete the subject from meeting requests',
			},
			{
				displayName: 'Max Conflicts',
				name: 'maxConflicts',
				type: 'string',
				default: '',
				description: 'Maximum number of conflicts allowed',
			},
			{
				displayName: 'Maximum Duration (Minutes)',
				name: 'maximumDurationInMinutes',
				type: 'string',
				default: '',
				description: 'Maximum meeting duration in minutes',
			},
			{
				displayName: 'Minimum Duration (Minutes)',
				name: 'minimumDurationInMinutes',
				type: 'string',
				default: '',
				description: 'Minimum meeting duration in minutes',
			},
			{
				displayName: 'Process External Meeting Messages',
				name: 'processExternalMeetingMessages',
				type: 'options',
				options: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
				default: 'false',
				description: 'Whether to process meeting requests from external senders',
			},
			{
				displayName: 'Remove Canceled Meetings',
				name: 'removeCanceledMeetings',
				type: 'options',
				options: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
				default: 'true',
				description: 'Whether to remove canceled meetings from the calendar',
			},
			{
				displayName: 'Remove Old Meeting Messages',
				name: 'removeOldMeetingMessages',
				type: 'options',
				options: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
				default: 'true',
				description: 'Whether to remove old meeting messages',
			},
			{
				displayName: 'Remove Private Property',
				name: 'removePrivateProperty',
				type: 'options',
				options: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
				default: 'true',
				description: 'Whether to remove the private flag from meeting requests',
			},
			{
				displayName: 'Schedule Only During Work Hours',
				name: 'scheduleOnlyDuringWorkHours',
				type: 'options',
				options: [
					{ name: 'No', value: 'false' },
					{ name: 'Yes', value: 'true' },
				],
				default: 'false',
				description: 'Whether to only allow scheduling during work hours',
			},
		],
	},

	// ── Litigation Hold / Retention Hold ───────────────────────────────

	{
		displayName: 'Hold Action',
		name: 'holdAction',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setLitigationHold', 'setRetentionHold'],
			},
		},
		options: [
			{ name: 'Disable', value: 'disable' },
			{ name: 'Enable', value: 'enable' },
		],
		default: 'enable',
		description: 'Whether to enable or disable the hold',
	},
	{
		displayName: 'Hold Duration (Days)',
		name: 'holdDays',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setLitigationHold'],
				holdAction: ['enable'],
			},
		},
		default: '',
		description: 'Duration of the litigation hold in days (leave empty for indefinite)',
	},

	// ── Hide From GAL ──────────────────────────────────────────────────

	{
		displayName: 'Hide From GAL',
		name: 'hideFromGAL',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['hideFromGAL'],
			},
		},
		options: [
			{ name: 'Hide', value: 'true' },
			{ name: 'Show', value: 'false' },
		],
		default: 'true',
		description: 'Whether to hide or show the mailbox in the Global Address List',
	},

	// ── Manage Mobile Device ───────────────────────────────────────────

	{
		displayName: 'Device ID',
		name: 'deviceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['manageMobileDevice'],
			},
		},
		default: '',
		description: 'The ID of the mobile device',
	},
	{
		displayName: 'Device Action',
		name: 'deviceAction',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['manageMobileDevice'],
			},
		},
		options: [
			{ name: 'Delete', value: 'delete' },
			{ name: 'Quarantine', value: 'quarantine' },
		],
		default: 'delete',
		description: 'Whether to delete or quarantine the mobile device',
	},

	// ── List Mailbox Restores ─────────────────────────────────────────

	{
		displayName: 'Identity (Filter)',
		name: 'restoreIdentity',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['listMailboxRestores'],
			},
		},
		default: '',
		description: 'Filter by a specific restore request identity',
	},
	{
		displayName: 'Include Report',
		name: 'includeReport',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['listMailboxRestores'],
			},
		},
		default: false,
		description: 'Whether to include the detailed report for each restore request',
	},
	{
		displayName: 'Include Statistics',
		name: 'statistics',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['listMailboxRestores'],
			},
		},
		default: false,
		description: 'Whether to include statistics for each restore request',
	},

	// ── Restore Mailbox ───────────────────────────────────────────────

	{
		displayName: 'Source Mailbox',
		name: 'sourceMailbox',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['restoreMailbox'],
			},
		},
		default: '',
		placeholder: 'user@domain.com',
		description: 'The source mailbox to restore data from',
	},
	{
		displayName: 'Target Mailbox',
		name: 'targetMailbox',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['restoreMailbox'],
			},
		},
		default: '',
		placeholder: 'user@domain.com',
		description: 'The target mailbox to restore data into',
	},
	{
		displayName: 'Restore Options',
		name: 'restoreOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['restoreMailbox'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Accept Large Data Loss',
				name: 'AcceptLargeDataLoss',
				type: 'boolean',
				default: false,
				description: 'Whether to accept large data loss during restore',
			},
			{
				displayName: 'Action',
				name: 'Action',
				type: 'string',
				default: '',

			},
			{
				displayName: 'Associated Messages Copy Option',
				name: 'AssociatedMessagesCopyOption',
				type: 'string',
				default: '',
				description: 'How to handle associated messages (e.g. DoNotCopy, MapByMessageClass)',
			},
			{
				displayName: 'Bad Item Limit',
				name: 'BadItemLimit',
				type: 'number',
				default: 0,
				description: 'Maximum number of bad items to skip',
			},
			{
				displayName: 'Batch Name',
				name: 'BatchName',
				type: 'string',
				default: '',
				description: 'Name of the restore batch',
			},
			{
				displayName: 'Completed Request Age Limit',
				name: 'CompletedRequestAgeLimit',
				type: 'number',
				default: 0,
				description: 'Number of days to keep completed requests',
			},
			{
				displayName: 'Conflict Resolution Option',
				name: 'ConflictResolutionOption',
				type: 'string',
				default: '',
				description: 'How to resolve conflicts (e.g. KeepSourceItem, KeepLatestItem)',
			},
			{
				displayName: 'Exclude Dumpster',
				name: 'ExcludeDumpster',
				type: 'boolean',
				default: false,
				description: 'Whether to exclude the dumpster (recoverable items) from restore',
			},
			{
				displayName: 'Exclude Folders',
				name: 'ExcludeFolders',
				type: 'string',
				default: '',
				description: 'Comma-separated list of folder names to exclude from restore',
			},
			{
				displayName: 'Identity',
				name: 'Identity',
				type: 'string',
				default: '',
				description: 'Identity of an existing restore request to manage',
			},
			{
				displayName: 'Include Folders',
				name: 'IncludeFolders',
				type: 'string',
				default: '',
				description: 'Comma-separated list of folder names to include in restore',
			},
			{
				displayName: 'Large Item Limit',
				name: 'LargeItemLimit',
				type: 'number',
				default: 0,
				description: 'Maximum number of large items to skip',
			},
			{
				displayName: 'Request Name',
				name: 'RequestName',
				type: 'string',
				default: '',
				description: 'A name for the restore request',
			},
			{
				displayName: 'Source Is Archive',
				name: 'SourceIsArchive',
				type: 'boolean',
				default: false,
				description: 'Whether the source mailbox is an archive mailbox',
			},
			{
				displayName: 'Source Root Folder',
				name: 'SourceRootFolder',
				type: 'string',
				default: '',
				description: 'Root folder in the source mailbox to start from',
			},
			{
				displayName: 'Target Is Archive',
				name: 'TargetIsArchive',
				type: 'boolean',
				default: false,
				description: 'Whether the target mailbox is an archive mailbox',
			},
			{
				displayName: 'Target Root Folder',
				name: 'TargetRootFolder',
				type: 'string',
				default: '',
				description: 'Root folder in the target mailbox to restore into',
			},
			{
				displayName: 'Target Type',
				name: 'TargetType',
				type: 'string',
				default: '',
				description: 'The target type for the restore',
			},
		],
	},

	// ── Run Exchange Request ──────────────────────────────────────────

	{
		displayName: 'Cmdlet',
		name: 'cmdlet',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['runExoRequest'],
			},
		},
		default: '',
		placeholder: 'e.g. Get-Mailbox',
		description: 'The Exchange Online PowerShell cmdlet to execute',
	},
	{
		displayName: 'Exchange Request Options',
		name: 'exoOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['runExoRequest'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Anchor',
				name: 'Anchor',
				type: 'string',
				default: '',
				description: 'The anchor mailbox for the request',
			},
			{
				displayName: 'Available Cmdlets',
				name: 'AvailableCmdlets',
				type: 'string',
				default: '',
				description: 'Comma-separated list of available cmdlets to expose',
			},
			{
				displayName: 'Cmdlet Parameters',
				name: 'cmdParams',
				type: 'string',
				default: '',
				description: 'Cmdlet parameters as a JSON string (e.g. {"Identity":"user@domain.com"})',
			},
			{
				displayName: 'Compliance',
				name: 'Compliance',
				type: 'boolean',
				default: false,
				description: 'Whether to use the compliance endpoint',
			},
			{
				displayName: 'Run as App',
				name: 'AsApp',
				type: 'boolean',
				default: false,
				description: 'Whether to run the cmdlet as the application instead of a user',
			},
			{
				displayName: 'Select',
				name: 'Select',
				type: 'string',
				default: '',
				description: 'Comma-separated list of properties to select from the output',
			},
			{
				displayName: 'Use System Mailbox',
				name: 'UseSystemMailbox',
				type: 'string',
				default: '',
				description: 'Whether to use the system mailbox for the connection',
			},
		],
	},

	// ── List Message Trace ────────────────────────────────────────────

	{
		displayName: 'Date Filter',
		name: 'dateFilter',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['listMessageTrace'],
			},
		},
		options: [
			{ name: 'Relative (Days)', value: 'relative' },
			{ name: 'Start/End Date', value: 'startEnd' },
		],
		default: 'relative',
		description: 'Whether to filter by relative days or specific date range',
	},
	{
		displayName: 'Days',
		name: 'days',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['listMessageTrace'],
				dateFilter: ['relative'],
			},
		},
		default: 7,
		description: 'Number of days to look back for message traces',
	},
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['listMessageTrace'],
				dateFilter: ['startEnd'],
			},
		},
		default: '',
		description: 'Start date for the message trace',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['listMessageTrace'],
				dateFilter: ['startEnd'],
			},
		},
		default: '',
		description: 'End date for the message trace',
	},
	{
		displayName: 'Message Trace Options',
		name: 'messageTraceOptions',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['listMessageTrace'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'From IP',
				name: 'fromIP',
				type: 'string',
				default: '',
				description: 'Filter by source IP address',
			},
			{
				displayName: 'Message ID',
				name: 'MessageId',
				type: 'string',
				default: '',
				description: 'Filter by specific message ID',
			},
			{
				displayName: 'Recipient',
				name: 'recipient',
				type: 'string',
				default: '',
				description: 'Comma-separated list of recipient email addresses to filter by',
			},
			{
				displayName: 'Sender',
				name: 'sender',
				type: 'string',
				default: '',
				description: 'Comma-separated list of sender email addresses to filter by',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				options: [
					{ name: 'Delivered', value: 'Delivered' },
					{ name: 'Expanded', value: 'Expanded' },
					{ name: 'Failed', value: 'Failed' },
					{ name: 'FilteredAsSpam', value: 'FilteredAsSpam' },
					{ name: 'GettingStatus', value: 'GettingStatus' },
					{ name: 'None', value: 'None' },
					{ name: 'Pending', value: 'Pending' },
					{ name: 'Quarantined', value: 'Quarantined' },
				],
				default: [],
				description: 'Filter by message delivery status',
			},
			{
				displayName: 'To IP',
				name: 'toIP',
				type: 'string',
				default: '',
				description: 'Filter by destination IP address',
			},
			{
				displayName: 'Trace Detail',
				name: 'traceDetail',
				type: 'string',
				default: '',
				description: 'Get detailed trace information for a specific message',
			},
			{
				displayName: 'Trace ID',
				name: 'ID',
				type: 'string',
				default: '',
				description: 'Filter by specific trace ID',
			},
		],
	},

	// ── manageRetentionPolicies ────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'retentionPolicyFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['manageRetentionPolicies'],
			},
		},
		options: [
			{
				displayName: 'Create Policies (JSON)',
				name: 'CreatePolicies',
				type: 'string',
				default: '',
				description: 'JSON array of policies to create',
			},
			{
				displayName: 'Delete Policies (JSON)',
				name: 'DeletePolicies',
				type: 'string',
				default: '',
				description: 'JSON array of policies to delete',
			},
			{
				displayName: 'Modify Policies (JSON)',
				name: 'ModifyPolicies',
				type: 'string',
				default: '',
				description: 'JSON array of policies to modify',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by policy name',
			},
		],
	},

	// ── manageRetentionTags ────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'retentionTagFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['manageRetentionTags'],
			},
		},
		options: [
			{
				displayName: 'Comment',
				name: 'Comment',
				type: 'string',
				default: '',
				description: 'Comment for the retention tag operation',
			},
			{
				displayName: 'Create Tags (JSON)',
				name: 'CreateTags',
				type: 'string',
				default: '',
				description: 'JSON array of tags to create',
			},
			{
				displayName: 'Delete Tags (JSON)',
				name: 'DeleteTags',
				type: 'string',
				default: '',
				description: 'JSON array of tags to delete',
			},
			{
				displayName: 'Modify Tags (JSON)',
				name: 'ModifyTags',
				type: 'string',
				default: '',
				description: 'JSON array of tags to modify',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by tag name',
			},
		],
	},

	// ── setMailboxRetentionPolicies ────────────────────────────────────
	{
		displayName: 'Mailboxes',
		name: 'Mailboxes',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setMailboxRetentionPolicies'],
			},
		},
		default: '',
		description: 'The mailbox or mailboxes to assign the policy to',
	},
	{
		displayName: 'Policy Name',
		name: 'PolicyName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['setMailboxRetentionPolicies'],
			},
		},
		default: '',
		description: 'The retention policy name to assign',
	},

	// ── Send Org Message fields ──
	{
		displayName: 'Options',
		name: 'sendOrgMessageFields',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['sendOrgMessage'],
			},
		},
		options: [
			{
				displayName: 'Frequency',
				name: 'freq',
				type: 'string',
				default: '',
				description: 'Message frequency',
			},
			{
				displayName: 'ID',
				name: 'ID',
				type: 'string',
				default: '',
				description: 'The ID of the org message',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'string',
				default: '',
				description: 'The type of org message',
			},
			{
				displayName: 'URL',
				name: 'URL',
				type: 'string',
				default: '',
				description: 'URL to include in the org message',
			},
		],
	},
];
