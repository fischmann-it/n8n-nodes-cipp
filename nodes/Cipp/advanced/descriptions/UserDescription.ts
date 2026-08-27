import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

const RESOURCE = 'user';

const listOps = [
	'getAll',
	'listInactiveAccounts',
	'listJitAdmin',
	'listJitTemplates',
	'listMfaUsers',
	'listNewUserDefaults',
	'listPerUserMfa',
	'listSignIns',
	'listTrustedBlockedSenders',
	'listUserCaPolicies',
	'listUserCounts',
	'listUserDevices',
	'listUserGroups',
	'listUserMailboxDetails',
	'listUserMailboxRules',
	'listUserSettings',
	'listUserSigninLogs',
	'listUsers',
	'listUsersAndGroups',
];

const tenantOps = [
	'add',
	'addGuest',
	'addJitTemplate',
	'addUserBulk',
	'addUserDefaults',
	'clearImmutableId',
	'createTap',
	'disable',
	'dismissRiskyUser',
	'edit',
	'editJitTemplate',
	'editUserAliases',
	'enable',
	'execBecCheck',
	'execBecRemediate',
	'execJitAdmin',
	'getAll',
	'listInactiveAccounts',
	'listJitAdmin',
	'listJitTemplates',
	'listMfaUsers',
	'listNewUserDefaults',
	'listPerUserMfa',
	'listSignIns',
	'listTrustedBlockedSenders',
	'listUserCaPolicies',
	'listUserCounts',
	'listUserDevices',
	'listUserGroups',
	'listUserMailboxDetails',
	'listUserMailboxRules',
	'listUserPhoto',
	'listUserSettings',
	'listUserSigninLogs',
	'listUsers',
	'listUsersAndGroups',
	'offboard',
	'patchUser',
	'remove',
	'removeTrustedBlockedSender',
	'reprocessLicenses',
	'resetMfa',
	'resetPassword',
	'revokeSessions',
	'sendMfaPush',
	'setPasswordNeverExpires',
	'setPerUserMfa',
	'setUserPhoto',
];

export const userOperations: INodeProperties[] = [
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
				name: 'Add',
				value: 'add',
				description: 'Create a new user',
				action: 'Add a user',
			},
			{
				name: 'Add Guest',
				value: 'addGuest',
				description: 'Invite a guest user to the tenant',
				action: 'Add a guest user',
			},
			{
				name: 'Add JIT Template',
				value: 'addJitTemplate',
				description: 'Create a JIT admin template',
				action: 'Add a JIT template',
			},
			{
				name: 'Add User Defaults',
				value: 'addUserDefaults',
				description: 'Create a user default template for new users',
				action: 'Add user defaults',
			},
			{
				name: 'Add Users (Bulk)',
				value: 'addUserBulk',
				description: 'Add multiple users from CSV data',
				action: 'Add users in bulk',
			},
			{
				name: 'BEC Check',
				value: 'execBecCheck',
				description: 'Run a business email compromise check',
				action: 'Run BEC check',
			},
			{
				name: 'BEC Remediate',
				value: 'execBecRemediate',
				description: 'Remediate a business email compromise',
				action: 'Remediate BEC',
			},
			{
				name: 'Clear Immutable ID',
				value: 'clearImmutableId',
				description: 'Clear the immutable ID for a user',
				action: 'Clear immutable ID',
			},
			{
				name: 'Create TAP',
				value: 'createTap',
				description: 'Create a Temporary Access Password',
				action: 'Create temporary access password',
			},
			{
				name: 'Disable',
				value: 'disable',
				description: 'Block sign-in for a user',
				action: 'Disable a user',
			},
			{
				name: 'Dismiss Risky User',
				value: 'dismissRiskyUser',
				description: 'Dismiss a risky user after investigation',
				action: 'Dismiss risky user',
			},
			{
				name: 'Edit',
				value: 'edit',
				description: 'Update an existing user\'s properties',
				action: 'Edit a user',
			},
			{
				name: 'Edit JIT Template',
				value: 'editJitTemplate',
				description: 'Update an existing JIT admin template',
				action: 'Edit a JIT template',
			},
			{
				name: 'Edit User Aliases',
				value: 'editUserAliases',
				description: 'Add, remove, or change primary alias for a user',
				action: 'Edit user aliases',
			},
			{
				name: 'Enable',
				value: 'enable',
				description: 'Unblock sign-in for a user',
				action: 'Enable a user',
			},
			{
				name: 'Execute JIT Admin',
				value: 'execJitAdmin',
				description: 'Request just-in-time admin access',
				action: 'Execute JIT admin',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get a list of users',
				action: 'Get many users',
			},
			{
				name: 'List Inactive Accounts',
				value: 'listInactiveAccounts',
				description: 'List accounts with no recent sign-in activity',
				action: 'List inactive accounts',
			},
			{
				name: 'List JIT Admin',
				value: 'listJitAdmin',
				description: 'List just-in-time admin requests',
				action: 'List JIT admin',
			},
			{
				name: 'List JIT Templates',
				value: 'listJitTemplates',
				description: 'List JIT admin templates',
				action: 'List JIT templates',
			},
			{
				name: 'List MFA Users',
				value: 'listMfaUsers',
				description: 'List users with their MFA status',
				action: 'List MFA users',
			},
			{
				name: 'List New User Defaults',
				value: 'listNewUserDefaults',
				description: 'List user default templates',
				action: 'List new user defaults',
			},
			{
				name: 'List Per-User MFA',
				value: 'listPerUserMfa',
				description: 'List per-user MFA states',
				action: 'List per user MFA',
			},
			{
				name: 'List Sign-Ins',
				value: 'listSignIns',
				description: 'List user sign-in events for security monitoring',
				action: 'List sign ins',
			},
			{
				name: 'List Trusted/Blocked Senders',
				value: 'listTrustedBlockedSenders',
				description: 'List a user\'s trusted and blocked senders',
				action: 'List trusted blocked senders',
			},
			{
				name: 'List User CA Policies',
				value: 'listUserCaPolicies',
				description: 'List conditional access policies applied to a user',
				action: 'List user CA policies',
			},
			{
				name: 'List User Counts',
				value: 'listUserCounts',
				description: 'Get user count statistics for the tenant',
				action: 'List user counts',
			},
			{
				name: 'List User Devices',
				value: 'listUserDevices',
				description: 'List devices registered to a user',
				action: 'List user devices',
			},
			{
				name: 'List User Groups',
				value: 'listUserGroups',
				description: 'List groups a user belongs to',
				action: 'List user groups',
			},
			{
				name: 'List User Mailbox Details',
				value: 'listUserMailboxDetails',
				description: 'Get detailed mailbox information for a user',
				action: 'List user mailbox details',
			},
			{
				name: 'List User Mailbox Rules',
				value: 'listUserMailboxRules',
				description: 'List inbox rules for a user mailbox',
				action: 'List user mailbox rules',
			},
			{
				name: 'List User Photo',
				value: 'listUserPhoto',
				description: 'Get the profile photo for a user',
				action: 'List user photo',
			},
			{
				name: 'List User Settings',
				value: 'listUserSettings',
				description: 'List settings for users in the tenant',
				action: 'List user settings',
			},
			{
				name: 'List User Sign-In Logs',
				value: 'listUserSigninLogs',
				description: 'List sign-in logs for a specific user',
				action: 'List user sign in logs',
			},
			{
				name: 'List Users',
				value: 'listUsers',
				description: 'List users via the CIPP ListUsers endpoint',
				action: 'List users',
			},
			{
				name: 'List Users and Groups',
				value: 'listUsersAndGroups',
				description: 'Get a combined directory snapshot of users and groups for a tenant',
				action: 'List users and groups',
			},
			{
				name: 'Offboard',
				value: 'offboard',
				description: 'Offboard a user with all offboarding tasks',
				action: 'Offboard a user',
			},
			{
				name: 'Patch User',
				value: 'patchUser',
				description: 'Patch user fields directly via the CIPP PatchUser endpoint',
				action: 'Patch a user',
			},
			{
				name: 'Remove',
				value: 'remove',
				description: 'Delete a user',
				action: 'Remove a user',
			},
			{
				name: 'Remove JIT Template',
				value: 'removeJitTemplate',
				description: 'Delete a JIT admin template',
				action: 'Remove a JIT template',
			},
			{
				name: 'Remove Trusted/Blocked Sender',
				value: 'removeTrustedBlockedSender',
				description: 'Remove an entry from a user\'s trusted/blocked sender list',
				action: 'Remove trusted blocked sender',
			},
			{
				name: 'Remove User Default Template',
				value: 'removeUserDefaultTemplate',
				description: 'Remove a user default template',
				action: 'Remove user default template',
			},
			{
				name: 'Reprocess Licenses',
				value: 'reprocessLicenses',
				description: 'Reprocess license assignments for a user',
				action: 'Reprocess licenses',
			},
			{
				name: 'Reset MFA',
				value: 'resetMfa',
				description: 'Re-require MFA registration for a user',
				action: 'Reset MFA',
			},
			{
				name: 'Reset Password',
				value: 'resetPassword',
				description: 'Reset a user password',
				action: 'Reset password',
			},
			{
				name: 'Revoke Sessions',
				value: 'revokeSessions',
				description: 'Revoke all active sessions',
				action: 'Revoke sessions',
			},
			{
				name: 'Send MFA Push',
				value: 'sendMfaPush',
				description: 'Send an MFA push notification',
				action: 'Send MFA push',
			},
			{
				name: 'Set Password Never Expires',
				value: 'setPasswordNeverExpires',
				description: 'Set or unset the password-never-expires policy',
				action: 'Set password never expires',
			},
			{
				name: 'Set Per-User MFA',
				value: 'setPerUserMfa',
				description: 'Set per-user MFA state',
				action: 'Set per user mfa',
			},
			{
				name: 'Set User Photo',
				value: 'setUserPhoto',
				description: 'Set or remove a user\'s profile photo',
				action: 'Set user photo',
			},
			{
				name: 'Trigger Bulk License',
				value: 'triggerBulkLicense',
				description: 'Trigger the bulk license processing job',
				action: 'Trigger bulk license',
			},
		],
		default: 'getAll',
	},
];

export const userFields: INodeProperties[] = [
	// Tenant selector — excludes no-tenant ops (removeJitTemplate, triggerBulkLicense)
	tenantField(RESOURCE, tenantOps),

	// Return All / Limit for list operations
	returnAllField(RESOURCE, listOps),
	limitField(RESOURCE, listOps),

	// ── User ID for single-user operations ──
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: [
					'clearImmutableId',
					'createTap',
					'disable',
					'dismissRiskyUser',
					'edit',
					'enable',
					'resetMfa',
					'resetPassword',
					'revokeSessions',
					'remove',
					'sendMfaPush',
					'setPerUserMfa',
				],
			},
		},
		default: '',
		placeholder: 'user@domain.com or GUID',
		description: 'The User Principal Name (UPN) or Object ID of the user',
	},

	// ── Per-User MFA state ──
	{
		displayName: 'MFA State',
		name: 'mfaState',
		type: 'options',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['setPerUserMfa'],
			},
		},
		options: [
			{ name: 'Enforced', value: 'Enforced' },
			{ name: 'Enabled', value: 'Enabled' },
			{ name: 'Disabled', value: 'Disabled' },
		],
		default: 'Enforced',
		description: 'The MFA state to set for the user',
	},

	// ── JIT Admin fields ──
	{
		displayName: 'User Action',
		name: 'userAction',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['execJitAdmin'],
			},
		},
		options: [
			{ name: 'Create New User', value: 'create' },
			{ name: 'Select Existing User', value: 'select' },
		],
		default: 'select',
		description: 'Whether to create a new JIT admin user or select an existing one',
	},
	{
		displayName: 'Admin Roles',
		name: 'AdminRoles',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['execJitAdmin'],
			},
		},
		default: '',
		placeholder: 'e.g. Global Administrator or role GUID',
		description: 'The admin role name or GUID to assign for JIT access',
	},
	{
		displayName: 'Start Date',
		name: 'StartDate',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['execJitAdmin'],
			},
		},
		default: '',
		description: 'When the JIT admin access should begin',
	},
	{
		displayName: 'End Date',
		name: 'EndDate',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['execJitAdmin'],
			},
		},
		default: '',
		description: 'When the JIT admin access should expire',
	},
	{
		displayName: 'Expire Action',
		name: 'ExpireAction',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['execJitAdmin'],
			},
		},
		default: 'delete',
		placeholder: 'e.g. delete, disable',
		description: 'Action to take when JIT admin access expires',
	},
	{
		displayName: 'Use TAP',
		name: 'UseTAP',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['execJitAdmin'],
			},
		},
		default: false,
		description: 'Whether to generate a Temporary Access Password for the JIT admin',
	},
	{
		displayName: 'Additional Fields',
		name: 'jitAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['execJitAdmin'],
			},
		},
		options: [
			{
				displayName: 'Domain (JSON)',
				name: 'Domain',
				type: 'string',
				default: '',
				placeholder: '{"label":"contoso.com","value":"contoso.com"}',
				description: 'LabelValue JSON for the domain to use for JIT admin user',
			},
			{
				displayName: 'First Name',
				name: 'FirstName',
				type: 'string',
				default: '',
				description: 'First name for the JIT admin user (when creating new)',
			},
			{
				displayName: 'JIT Admin Template (JSON)',
				name: 'jitAdminTemplate',
				type: 'string',
				default: '',
				placeholder: '{"label":"Template Name","value":"template-guid"}',
				description: 'LabelValue JSON for the JIT admin template to apply',
			},
			{
				displayName: 'Last Name',
				name: 'LastName',
				type: 'string',
				default: '',
				description: 'Last name for the JIT admin user (when creating new)',
			},
			{
				displayName: 'Post Execution',
				name: 'PostExecution',
				type: 'string',
				default: '',
				placeholder: 'e.g. ["webhook","email"]',
				description: 'JSON array of post-execution action strings',
			},
			{
				displayName: 'Reason',
				name: 'Reason',
				type: 'string',
				default: '',
				description: 'Reason for requesting JIT admin access',
			},
			{
				displayName: 'Username',
				name: 'Username',
				type: 'string',
				default: '',
				description: 'Username for the JIT admin user (when creating new)',
			},
		],
	},

	// JIT Admin — existing user selector (only when userAction is 'select')
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['execJitAdmin'],
				userAction: ['select'],
			},
		},
		default: '',
		placeholder: 'user@domain.com or GUID',
		description: 'The existing user to grant JIT admin access to',
	},

	// ── Reset Password options ──
	{
		displayName: 'Additional Options',
		name: 'passwordOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['resetPassword'],
			},
		},
		options: [
			{
				displayName: 'Must Change Password',
				name: 'mustChangePass',
				type: 'boolean',
				default: true,
				description: 'Whether the user must change password at next logon',
			},
		],
	},

	// ── Add User fields ──
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['add'],
			},
		},
		default: '',
		description: 'The first name of the user',
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['add'],
			},
		},
		default: '',
		description: 'The last name of the user',
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['add'],
			},
		},
		default: '',
		placeholder: 'e.g. contoso.com',
		description: 'The primary domain for the user email',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['add'],
			},
		},
		options: [
			{
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
				description: 'Custom display name (defaults to First Last)',
			},
			{
				displayName: 'Mail Nickname',
				name: 'mailNickname',
				type: 'string',
				default: '',
				description: 'Mail alias (defaults to first.last)',
			},
			{
				displayName: 'Must Change Password',
				name: 'MustChangePass',
				type: 'boolean',
				default: true,
				description: 'Whether the user must change password at first sign-in',
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Initial password for the user (auto-generated if not provided)',
			},
			{
				displayName: 'Usage Location',
				name: 'usageLocation',
				type: 'string',
				default: 'US',
				placeholder: 'e.g. US, GB, DE',
				description: 'ISO country code for license assignment',
			},
		],
	},

	// ── Offboard User fields ──
	{
		displayName: 'Users to Offboard',
		name: 'usersToOffboard',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['offboard'],
			},
		},
		default: '[]',
		description: 'JSON array of user objects to offboard',
	},
	{
		displayName: 'Scheduled Offboard',
		name: 'scheduledOffboard',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['offboard'],
			},
		},
		default: false,
		description: 'Whether to schedule the offboarding for later',
	},
	{
		displayName: 'Offboard Options',
		name: 'offboardOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['offboard'],
			},
		},
		options: [
			{
				displayName: 'Convert to Shared Mailbox',
				name: 'ConvertToShared',
				type: 'boolean',
				default: false,
				description: 'Whether to convert the mailbox to a shared mailbox',
			},
			{
				displayName: 'Delete User',
				name: 'DeleteUser',
				type: 'boolean',
				default: false,
				description: 'Whether to delete the user account',
			},
			{
				displayName: 'Disable Sign-In',
				name: 'DisableSignIn',
				type: 'boolean',
				default: false,
				description: 'Whether to block the user from signing in',
			},
			{
				displayName: 'Hide From GAL',
				name: 'HideFromGAL',
				type: 'boolean',
				default: false,
				description: 'Whether to hide the user from the Global Address List',
			},
			{
				displayName: 'Remove Groups',
				name: 'RemoveGroups',
				type: 'boolean',
				default: false,
				description: 'Whether to remove the user from all groups',
			},
			{
				displayName: 'Remove Licenses',
				name: 'RemoveLicenses',
				type: 'boolean',
				default: false,
				description: 'Whether to remove all assigned licenses',
			},
			{
				displayName: 'Reset Password',
				name: 'ResetPass',
				type: 'boolean',
				default: false,
				description: 'Whether to reset the user password',
			},
			{
				displayName: 'Revoke Sessions',
				name: 'RevokeSessions',
				type: 'boolean',
				default: false,
				description: 'Whether to revoke all active sessions',
			},
		],
	},

	// ── List Sign-Ins filters ──
	{
		displayName: 'Options',
		name: 'signInFilters',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listSignIns'],
			},
		},
		options: [
			{
				displayName: 'Days',
				name: 'Days',
				type: 'number',
				default: 7,
				description: 'Number of days to look back',
			},
			{
				displayName: 'Failed Logons Only',
				name: 'failedLogonsOnly',
				type: 'boolean',
				default: false,
				description: 'Whether to return only failed sign-in attempts',
			},
		],
	},

	// ── List Inactive Accounts filters ──
	{
		displayName: 'Options',
		name: 'inactiveFilters',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listInactiveAccounts'],
			},
		},
		options: [
			{
				displayName: 'Inactive Days',
				name: 'InactiveDays',
				type: 'number',
				default: 90,
				description: 'Number of days of inactivity to qualify',
			},
		],
	},

	// ── Get Many - Fields to return ──
	{
		displayName: 'Fields to Return',
		name: 'userFields',
		type: 'multiOptions',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['getAll'],
			},
		},
		options: [
			{
				name: 'Account Enabled',
				value: 'accountEnabled',
				description: 'Whether the account is enabled',
			},
			{
				name: 'Assigned Licenses',
				value: 'assignedLicenses',
				description: 'Licenses assigned to the user',
			},
			{
				name: 'City',
				value: 'city',
				description: 'City from address',
			},
			{
				name: 'Company Name',
				value: 'companyName',
			},
			{
				name: 'Country',
				value: 'country',
				description: 'Country/region',
			},
			{
				name: 'Created Date',
				value: 'createdDateTime',
				description: 'When the user was created',
			},
			{
				name: 'Department',
				value: 'department',
				description: 'Department name',
			},
			{
				name: 'Display Name',
				value: 'displayName',
				description: 'Display name of the user',
			},
			{
				name: 'Employee ID',
				value: 'employeeId',
				description: 'Employee identifier',
			},
			{
				name: 'First Name',
				value: 'givenName',
				description: 'First/given name',
			},
			{
				name: 'ID',
				value: 'id',
				description: 'Unique identifier (GUID)',
			},
			{
				name: 'Job Title',
				value: 'jobTitle',
			},
			{
				name: 'Last Name',
				value: 'surname',
				description: 'Last/family name',
			},
			{
				name: 'Last Password Change',
				value: 'lastPasswordChangeDateTime',
				description: 'When password was last changed',
			},
			{
				name: 'License Details',
				value: 'licenseAssignmentStates',
				description: 'Details about license assignments',
			},
			{
				name: 'Mail',
				value: 'mail',
				description: 'Primary email address',
			},
			{
				name: 'Manager',
				value: 'manager',
				description: 'User manager',
			},
			{
				name: 'Mobile Phone',
				value: 'mobilePhone',
				description: 'Mobile phone number',
			},
			{
				name: 'Office Location',
				value: 'officeLocation',
			},
			{
				name: 'On-Premises Sync',
				value: 'onPremisesSyncEnabled',
				description: 'Whether synced from on-premises AD',
			},
			{
				name: 'Phone Number',
				value: 'businessPhones',
				description: 'Business phone numbers',
			},
			{
				name: 'Proxy Addresses',
				value: 'proxyAddresses',
				description: 'All email addresses including aliases',
			},
			{
				name: 'Sign-In Activity',
				value: 'signInActivity',
				description: 'Last sign-in date/time (requires Azure AD Premium)',
			},
			{
				name: 'State',
				value: 'state',
				description: 'State or province',
			},
			{
				name: 'Street Address',
				value: 'streetAddress',
			},
			{
				name: 'Usage Location',
				value: 'usageLocation',
				description: 'Country code for license assignment',
			},
			{
				name: 'User Principal Name',
				value: 'userPrincipalName',
				description: 'Sign-in name (email format)',
			},
			{
				name: 'User Type',
				value: 'userType',
				description: 'Member or Guest',
			},
		],
		default: ['id', 'displayName', 'userPrincipalName', 'mail', 'accountEnabled'],
		description: 'Select which user properties to return. Limiting fields improves performance.',
	},

	// ── Get Many filters ──
	{
		displayName: 'Options',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Additional Fields',
				name: 'select',
				type: 'string',
				default: '',
				placeholder: 'e.g. otherMails,employeeType',
				description: 'Additional fields not in the list above (comma-separated)',
			},
			{
				displayName: 'Filter Query',
				name: 'filter',
				type: 'string',
				default: '',
				placeholder: "e.g. startsWith(displayName,'John')",
				description: 'OData filter query to filter which users are returned',
			},
		],
	},

	// ── Edit User fields ──
	{
		displayName: 'Update Fields',
		name: 'editFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['edit'],
			},
		},
		options: [
			{
				displayName: 'Add to Groups',
				name: 'AddToGroups',
				type: 'string',
				default: '',
				placeholder: 'e.g. ["group-ID-1","group-ID-2"]',
				description: 'JSON array of group IDs to add the user to',
			},
			{
				displayName: 'Added Aliases',
				name: 'AddedAliases',
				type: 'string',
				default: '',
				description: 'Email aliases to add to the user',
			},
			{
				displayName: 'Auto Password',
				name: 'Autopassword',
				type: 'boolean',
				default: false,
				description: 'Whether to auto-generate a password instead of using the password field',
			},
			{
				displayName: 'Business Phones',
				name: 'businessPhones',
				type: 'string',
				default: '',
				description: 'Business phone number',
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
				displayName: 'Copy From',
				name: 'CopyFrom',
				type: 'string',
				default: '',
				placeholder: 'user@domain.com',
				description: 'Copy group memberships and licenses from this user',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				placeholder: 'e.g. US, GB, DE',
			},
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Display Name',
				name: 'DisplayName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Domain',
				name: 'Domain',
				type: 'string',
				default: '',
				placeholder: 'e.g. contoso.com',
				description: 'Change the user\'s domain',
			},
			{
				displayName: 'First Name',
				name: 'givenName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Job Title',
				name: 'jobTitle',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Last Name',
				name: 'surname',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Licenses',
				name: 'licenses',
				type: 'string',
				default: '',
				placeholder: 'e.g. ["SKU-ID-1","SKU-ID-2"]',
				description: 'JSON array of license SKU IDs to assign',
			},
			{
				displayName: 'Mail Nickname',
				name: 'mailNickname',
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
				displayName: 'Must Change Password',
				name: 'MustChangePass',
				type: 'boolean',
				default: false,
				description: 'Whether the user must change password at next sign-in',
			},
			{
				displayName: 'Other Emails',
				name: 'otherMails',
				type: 'string',
				default: '',
				description: 'Alternate email addresses',
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Set a new password for the user',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Remove From Groups',
				name: 'RemoveFromGroups',
				type: 'string',
				default: '',
				placeholder: 'e.g. ["group-ID-1","group-ID-2"]',
				description: 'JSON array of group IDs to remove the user from',
			},
			{
				displayName: 'Remove Licenses',
				name: 'removeLicenses',
				type: 'boolean',
				default: false,
				description: 'Whether to remove all licenses from the user',
			},
			{
				displayName: 'Set Manager',
				name: 'setManager',
				type: 'string',
				default: '',
				placeholder: '{"label":"Name","value":"user-ID"}',
				description: 'JSON LabelValue object for the manager to assign',
			},
			{
				displayName: 'Set Sponsor',
				name: 'setSponsor',
				type: 'string',
				default: '',
				placeholder: '{"label":"Name","value":"user-ID"}',
				description: 'JSON LabelValue object for the sponsor to assign',
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
				displayName: 'Usage Location',
				name: 'usageLocation',
				type: 'string',
				default: '',
				placeholder: 'e.g. US, GB, DE',
				description: 'ISO country code for license assignment',
			},
		],
	},

	// ── Add Guest fields ──
	{
		displayName: 'Display Name',
		name: 'guestDisplayName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addGuest'],
			},
		},
		default: '',
		description: 'Display name of the guest user',
	},
	{
		displayName: 'Email',
		name: 'guestMail',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addGuest'],
			},
		},
		default: '',
		placeholder: 'guest@external.com',
		description: 'Email address of the guest user to invite',
	},
	{
		displayName: 'Options',
		name: 'guestOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addGuest'],
			},
		},
		options: [
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: '',
				description: 'Custom message to include in the invitation email',
			},
			{
				displayName: 'Redirect URI',
				name: 'redirectUri',
				type: 'string',
				default: '',
				description: 'URL to redirect the guest after accepting the invitation',
			},
			{
				displayName: 'Send Invite',
				name: 'sendInvite',
				type: 'boolean',
				default: true,
				description: 'Whether to send the invitation email',
			},
		],
	},

	// ── Add Users (Bulk) fields ──
	{
		displayName: 'Bulk Users',
		name: 'BulkUser',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addUserBulk'],
			},
		},
		default: '[]',
		description: 'JSON array of user CSV row strings to import',
	},
	{
		displayName: 'Options',
		name: 'bulkUserOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addUserBulk'],
			},
		},
		options: [
			{
				displayName: 'Licenses',
				name: 'licenses',
				type: 'string',
				default: '',
				placeholder: 'e.g. SKU-ID-1,SKU-ID-2',
				description: 'Comma-separated license SKU IDs to assign',
			},
			{
				displayName: 'Usage Location',
				name: 'usageLocation',
				type: 'string',
				default: '',
				placeholder: '{"label":"US","value":"US"}',
				description: 'JSON LabelValue object for the usage location',
			},
		],
	},

	// ── BEC Check filters ──
	{
		displayName: 'Options',
		name: 'becCheckFilters',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['execBecCheck'],
			},
		},
		options: [
			{
				displayName: 'GUID',
				name: 'GUID',
				type: 'string',
				default: '',
				description: 'The GUID to check',
			},
			{
				displayName: 'Overwrite',
				name: 'overwrite',
				type: 'string',
				default: '',
				description: 'Whether to overwrite existing results',
			},
			{
				displayName: 'User ID',
				name: 'userid',
				type: 'string',
				default: '',
				description: 'The user ID to check',
			},
			{
				displayName: 'User Name',
				name: 'userName',
				type: 'string',
				default: '',
				description: 'The user name to check',
			},
		],
	},

	// ── BEC Remediate fields ──
	{
		displayName: 'Options',
		name: 'becRemediateFields',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['execBecRemediate'],
			},
		},
		options: [
			{
				displayName: 'User ID',
				name: 'userid',
				type: 'string',
				default: '',
				description: 'The user ID to remediate',
			},
			{
				displayName: 'User Name',
				name: 'username',
				type: 'string',
				default: '',
				description: 'The user name to remediate',
			},
		],
	},

	// ── Set Password Never Expires fields ──
	{
		displayName: 'Options',
		name: 'passwordNeverExpiresFields',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['setPasswordNeverExpires'],
			},
		},
		options: [
			{
				displayName: 'Password Policy',
				name: 'PasswordPolicy',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'The password policy to apply (e.g. DisablePasswordExpiration)',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'The user ID to update',
			},
			{
				displayName: 'User Principal Name',
				name: 'userPrincipalName',
				type: 'string',
				default: '',
				description: 'The UPN of the user to update',
			},
		],
	},

	// ── Reprocess Licenses fields ──
	{
		displayName: 'Options',
		name: 'reprocessLicensesFields',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['reprocessLicenses'],
			},
		},
		options: [
			{
				displayName: 'ID',
				name: 'ID',
				type: 'string',
				default: '',
				description: 'The user ID',
			},
			{
				displayName: 'User Principal Name',
				name: 'userPrincipalName',
				type: 'string',
				default: '',
				description: 'The UPN of the user',
			},
		],
	},

	// ── Set User Photo fields ──
	{
		displayName: 'Photo Action',
		name: 'photoAction',
		type: 'options',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['setUserPhoto'],
			},
		},
		options: [
			{ name: 'Set', value: 'set' },
			{ name: 'Remove', value: 'remove' },
		],
		default: 'set',
		description: 'Whether to set or remove the user photo',
	},
	{
		displayName: 'Options',
		name: 'userPhotoFields',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['setUserPhoto'],
			},
		},
		options: [
			{
				displayName: 'Photo Data',
				name: 'photoData',
				type: 'string',
				default: '',
				description: 'Base64-encoded photo data',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'The user ID to set the photo for',
			},
		],
	},

	// ── User list filters (shared across multiple list operations) ──
	{
		displayName: 'Options',
		name: 'userListFilters',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: [
					'listUserCaPolicies',
					'listUserDevices',
					'listUserMailboxDetails',
					'listTrustedBlockedSenders',
				],
			},
		},
		options: [
			{
				displayName: 'User ID',
				name: 'UserID',
				type: 'string',
				default: '',
				placeholder: 'user@domain.com or GUID',
				description: 'Filter by a specific user',
			},
		],
	},

	// ── List User Mailbox Details extra filter ──
	{
		displayName: 'User Mail Filter',
		name: 'userMailFilter',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listUserMailboxDetails'],
			},
		},
		options: [
			{
				displayName: 'User Mail',
				name: 'userMail',
				type: 'string',
				default: '',
				description: 'Filter by user email address',
			},
		],
	},

	// ── List User Mailbox Rules filter ──
	{
		displayName: 'Options',
		name: 'mailboxRulesFilter',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listUserMailboxRules'],
			},
		},
		options: [
			{
				displayName: 'User ID or UPN',
				name: 'userID',
				type: 'string',
				default: '',
				placeholder: 'user@domain.com or GUID',
				description: 'Azure AD user identifier — GUID or UPN (user@domain.com). Filters rules to a specific mailbox.',
			},
			{
				displayName: 'User Email',
				name: 'userEmail',
				type: 'string',
				default: '',
				placeholder: 'user@domain.com',
				description: 'Exchange email address. Use when the mailbox email differs from the Azure AD UPN.',
			},
		],
	},

	// ── List User Groups filter (camelCase userId) ──
	{
		displayName: 'Options',
		name: 'userGroupsFilters',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listUserGroups'],
			},
		},
		options: [
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				placeholder: 'user@domain.com or GUID',
				description: 'Filter by a specific user',
			},
		],
	},

	// ── List Per-User MFA filters ──
	{
		displayName: 'Options',
		name: 'perUserMfaFilters',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listPerUserMfa'],
			},
		},
		options: [
			{
				displayName: 'All Users',
				name: 'allUsers',
				type: 'string',
				default: '',
				description: 'Whether to include all users',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'Filter by a specific user',
			},
		],
	},

	// ── List Trusted/Blocked Senders extra filter ──
	{
		displayName: 'UPN Filter',
		name: 'trustedBlockedUpnFilter',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listTrustedBlockedSenders'],
			},
		},
		options: [
			{
				displayName: 'User Principal Name',
				name: 'userPrincipalName',
				type: 'string',
				default: '',
				description: 'Filter by user principal name',
			},
		],
	},

	// ── Remove Trusted/Blocked Sender fields ──
	{
		displayName: 'Type',
		name: 'senderType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['removeTrustedBlockedSender'],
			},
		},
		options: [
			{ name: 'Allowed', value: 'Allowed' },
			{ name: 'Blocked', value: 'Blocked' },
		],
		default: 'Blocked',
		description: 'The type of sender list entry to remove',
	},
	{
		displayName: 'Value',
		name: 'senderValue',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['removeTrustedBlockedSender'],
			},
		},
		default: '',
		placeholder: 'sender@domain.com',
		description: 'The sender address or domain to remove',
	},
	{
		displayName: 'User Principal Name',
		name: 'senderUpn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['removeTrustedBlockedSender'],
			},
		},
		default: '',
		placeholder: 'user@domain.com',
		description: 'The user whose sender list to modify',
	},

	// ── JIT Template fields (shared for add/edit) ──
	{
		displayName: 'Template Name',
		name: 'jitTemplateName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addJitTemplate', 'editJitTemplate'],
			},
		},
		default: '',
		description: 'Name of the JIT admin template',
	},
	{
		displayName: 'GUID',
		name: 'jitTemplateGuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['editJitTemplate'],
			},
		},
		default: '',
		description: 'The GUID of the template to edit',
	},
	{
		displayName: 'Options',
		name: 'jitTemplateFields',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addJitTemplate', 'editJitTemplate'],
			},
		},
		options: [
			{
				displayName: 'Default Domain',
				name: 'defaultDomain',
				type: 'string',
				default: '',
				placeholder: '{"label":"domain.com","value":"domain.com"}',
				description: 'JSON LabelValue for the default domain',
			},
			{
				displayName: 'Default Duration',
				name: 'defaultDuration',
				type: 'string',
				default: '',
				placeholder: '{"label":"1 hour","value":"60"}',
				description: 'JSON LabelValue for the default JIT duration',
			},
			{
				displayName: 'Default Existing User',
				name: 'defaultExistingUser',
				type: 'string',
				default: '',
				placeholder: '{"label":"user@domain.com","value":"user-ID"}',
				description: 'JSON LabelValue for the default existing user',
			},
			{
				displayName: 'Default Expire Action',
				name: 'defaultExpireAction',
				type: 'string',
				default: '',
				placeholder: '{"label":"Delete","value":"delete"}',
				description: 'JSON LabelValue for the default expire action',
			},
			{
				displayName: 'Default First Name',
				name: 'defaultFirstName',
				type: 'string',
				default: '',
				description: 'Default first name for new JIT admin users',
			},
			{
				displayName: 'Default For Tenant',
				name: 'defaultForTenant',
				type: 'boolean',
				default: false,
				description: 'Whether this is the default template for the tenant',
			},
			{
				displayName: 'Default Last Name',
				name: 'defaultLastName',
				type: 'string',
				default: '',
				description: 'Default last name for new JIT admin users',
			},
			{
				displayName: 'Default Notification Actions',
				name: 'defaultNotificationActions',
				type: 'string',
				default: '',
				placeholder: 'e.g. ["email","webhook"]',
				description: 'JSON array of notification action strings',
			},
			{
				displayName: 'Default Roles',
				name: 'defaultRoles',
				type: 'string',
				default: '',
				placeholder: '{"label":"Global Admin","value":"role-guid"}',
				description: 'JSON LabelValue for the default admin roles',
			},
			{
				displayName: 'Default User Action',
				name: 'defaultUserAction',
				type: 'string',
				default: '',
				description: 'Default user action (create or select)',
			},
			{
				displayName: 'Default User Name',
				name: 'defaultUserName',
				type: 'string',
				default: '',
				description: 'Default username for new JIT admin users',
			},
			{
				displayName: 'Generate TAP By Default',
				name: 'generateTAPByDefault',
				type: 'boolean',
				default: false,
				description: 'Whether to generate a TAP by default',
			},
			{
				displayName: 'Reason Template',
				name: 'reasonTemplate',
				type: 'string',
				default: '',
				description: 'Default reason text for JIT requests',
			},
		],
	},

	// ── Remove JIT Template field ──
	{
		displayName: 'Template ID',
		name: 'jitRemoveId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['removeJitTemplate'],
			},
		},
		default: '',
		description: 'The ID of the JIT template to remove',
	},

	// ── List JIT Templates filters ──
	{
		displayName: 'Options',
		name: 'jitTemplateListFilters',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listJitTemplates'],
			},
		},
		options: [
			{
				displayName: 'GUID',
				name: 'GUID',
				type: 'string',
				default: '',
				description: 'Filter by template GUID',
			},
			{
				displayName: 'Include All Tenants',
				name: 'includeAllTenants',
				type: 'string',
				default: '',
				description: 'Whether to include templates from all tenants',
			},
		],
	},

	// ── List Users (ListUsers endpoint) filters ──
	{
		displayName: 'Options',
		name: 'listUsersFilters',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listUsers'],
			},
		},
		options: [
			{
				displayName: 'Graph Filter',
				name: 'graphFilter',
				type: 'string',
				default: '',
				placeholder: "e.g. startsWith(displayName,'John')",
				description: 'OData $filter expression passed to Graph',
			},
			{
				displayName: 'Include Logon Details',
				name: 'IncludeLogonDetails',
				type: 'string',
				default: '',
				description: 'Whether to include logon details in the response',
			},
			{
				displayName: 'User ID',
				name: 'UserID',
				type: 'string',
				default: '',
				placeholder: 'user@domain.com or GUID',
				description: 'Filter by a specific user ID',
			},
		],
	},

	// ── Edit User Aliases fields ──
	{
		displayName: 'User ID',
		name: 'aliasUserId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['editUserAliases'],
			},
		},
		default: '',
		placeholder: 'user@domain.com or GUID',
		description: 'The user ID to edit aliases for',
	},
	{
		displayName: 'Options',
		name: 'aliasFields',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['editUserAliases'],
			},
		},
		options: [
			{
				displayName: 'Added Aliases',
				name: 'AddedAliases',
				type: 'string',
				default: '',
				description: 'Email aliases to add (comma-separated)',
			},
			{
				displayName: 'Make Primary',
				name: 'MakePrimary',
				type: 'string',
				default: '',
				description: 'Email alias to set as the primary address',
			},
			{
				displayName: 'Removed Aliases',
				name: 'RemovedAliases',
				type: 'string',
				default: '',
				description: 'Email aliases to remove (comma-separated)',
			},
		],
	},

	// ── List User Photo filters ──
	{
		displayName: 'Options',
		name: 'listUserPhotoFilters',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listUserPhoto'],
			},
		},
		options: [
			{
				displayName: 'User ID',
				name: 'UserID',
				type: 'string',
				default: '',
				placeholder: 'user@domain.com or GUID',
				description: 'The user to get the photo for',
			},
		],
	},

	// ── List User Sign-In Logs filters ──
	{
		displayName: 'Options',
		name: 'listUserSigninLogsFilters',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listUserSigninLogs'],
			},
		},
		options: [
			{
				displayName: 'Top',
				name: 'top',
				type: 'string',
				default: '',
				description: 'Limit the number of results returned from the API',
			},
			{
				displayName: 'User ID',
				name: 'UserID',
				type: 'string',
				default: '',
				placeholder: 'user@domain.com or GUID',
				description: 'Filter by a specific user',
			},
		],
	},

	// ── Patch User fields ──
	{
		displayName: 'User ID',
		name: 'patchUserId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['patchUser'],
			},
		},
		default: '',
		placeholder: 'user@domain.com or GUID',
		description: 'The user ID to patch',
	},
	{
		displayName: 'Patch Fields',
		name: 'patchFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['patchUser'],
			},
		},
		options: [
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
				placeholder: 'e.g. US, GB, DE',
			},
			{
				displayName: 'Department',
				name: 'department',
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
				displayName: 'First Name',
				name: 'givenName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Job Title',
				name: 'jobTitle',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Last Name',
				name: 'surname',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Mail Nickname',
				name: 'mailNickname',
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
				displayName: 'Usage Location',
				name: 'usageLocation',
				type: 'string',
				default: '',
				placeholder: 'e.g. US, GB, DE',
				description: 'ISO country code for license assignment',
			},
		],
	},

	// ── Add User Defaults fields ──
	{
		displayName: 'Options',
		name: 'addUserDefaultsFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addUserDefaults'],
			},
		},
		options: [
			{
				displayName: 'Added Aliases',
				name: 'addedAliases',
				type: 'string',
				default: '',
				description: 'Additional SMTP aliases, newline-delimited',
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
				displayName: 'Copy From',
				name: 'copyFrom',
				type: 'string',
				default: '',
				placeholder: '{"label":"user@domain.com","value":"user-ID"}',
				description: 'JSON LabelValue object for user to copy from',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Default For Tenant',
				name: 'defaultForTenant',
				type: 'string',
				default: '',
				description: 'Whether this is the default template for the tenant',
			},
			{
				displayName: 'Department',
				name: 'department',
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
				displayName: 'First Name',
				name: 'givenName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Job Title',
				name: 'jobTitle',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Last Name',
				name: 'surname',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Licenses',
				name: 'licenses',
				type: 'string',
				default: '',
				placeholder: 'e.g. SKU-ID-1,SKU-ID-2',
				description: 'Comma-separated license SKU IDs to assign',
			},
			{
				displayName: 'Mobile Phone',
				name: 'mobilePhone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Must Change Password',
				name: 'MustChangePass',
				type: 'boolean',
				default: true,
				description: 'Whether the user must change password at first sign-in',
			},
			{
				displayName: 'Other Emails',
				name: 'otherMails',
				type: 'string',
				default: '',
				placeholder: 'e.g. email1@domain.com,email2@domain.com',
				description: 'Comma-separated alternate email addresses',
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Default password for new users',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Primary Domain',
				name: 'primDomain',
				type: 'string',
				default: '',
				placeholder: '{"label":"domain.com","value":"domain.com"}',
				description: 'JSON LabelValue object for the primary domain',
			},
			{
				displayName: 'Remove Licenses',
				name: 'removeLicenses',
				type: 'boolean',
				default: false,
				description: 'Whether to remove existing licenses',
			},
			{
				displayName: 'Set Manager',
				name: 'setManager',
				type: 'string',
				default: '',
				placeholder: '{"label":"Name","value":"user-ID"}',
				description: 'JSON LabelValue object for the manager',
			},
			{
				displayName: 'Set Sponsor',
				name: 'setSponsor',
				type: 'string',
				default: '',
				placeholder: '{"label":"Name","value":"user-ID"}',
				description: 'JSON LabelValue object for the sponsor',
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
				displayName: 'Template Name',
				name: 'templateName',
				type: 'string',
				default: '',
				description: 'Name for this user default template',
			},
			{
				displayName: 'Usage Location',
				name: 'usageLocation',
				type: 'string',
				default: '',
				placeholder: '{"label":"US","value":"US"}',
				description: 'JSON LabelValue object for the usage location',
			},
			{
				displayName: 'Username Format',
				name: 'usernameFormat',
				type: 'string',
				default: '',
				description: 'Format string for generating usernames',
			},
		],
	},

	// ── Remove User Default Template fields ──
	{
		displayName: 'Template ID',
		name: 'removeUserDefaultTemplateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['removeUserDefaultTemplate'],
			},
		},
		default: '',
		description: 'The ID of the user default template to remove',
	},

	// ── List New User Defaults filters ──
	{
		displayName: 'Options',
		name: 'listNewUserDefaultsFilters',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['listNewUserDefaults'],
			},
		},
		options: [
			{
				displayName: 'ID',
				name: 'ID',
				type: 'string',
				default: '',
				description: 'Filter by a specific template ID',
			},
			{
				displayName: 'Include All Tenants',
				name: 'includeAllTenants',
				type: 'string',
				default: '',
				description: 'Whether to include templates from all tenants',
			},
		],
	},
];
