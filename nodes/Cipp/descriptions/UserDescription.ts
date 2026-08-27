import type { INodeProperties } from 'n8n-workflow';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
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
				description: 'Add a guest user to the tenant',
				action: 'Add a guest user',
			},
			{
				name: 'Bulk License',
				value: 'bulkLicense',
				description: 'Apply license changes in bulk',
				action: 'Bulk license assignment',
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
				name: 'List Per-User MFA',
				value: 'listPerUserMfa',
				description: 'List per-user MFA settings for the tenant',
				action: 'List per user MFA',
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
				name: 'List MFA Users',
				value: 'listMfaUsers',
				description: 'List users with their MFA status',
				action: 'List MFA users',
			},
			{
				name: 'List User CA Policies',
				value: 'listUserCAPolicies',
				description: 'List conditional access policies applied to a user',
				action: 'List user CA policies',
			},
			{
				name: 'List User Counts',
				value: 'listUserCounts',
				description: 'Get user count statistics for a tenant',
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
				description: 'Get mailbox details for a user',
				action: 'List user mailbox details',
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
				description: 'Get account settings for a user',
				action: 'List user settings',
			},
			{
				name: 'List Sign-Ins',
				value: 'listSignIns',
				description: 'List user sign-in events for security monitoring',
				action: 'List sign ins',
			},
			{
				name: 'Offboard',
				value: 'offboard',
				description: 'Offboard a user with all offboarding tasks',
				action: 'Offboard a user',
			},
			{
				name: 'Remove',
				value: 'remove',
				description: 'Delete a user',
				action: 'Remove a user',
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
				name: 'Set Per-User MFA',
				value: 'setPerUserMfa',
				description: 'Set per-user MFA state',
				action: 'Set per user mfa',
			},
			{
				name: 'Set User Photo',
				value: 'setUserPhoto',
				description: 'Set the profile photo for a user',
				action: 'Set user photo',
			},
		],
		default: 'getAll',
	},
];

export const userFields: INodeProperties[] = [
	// Tenant selector for all user operations
	{
		displayName: 'Tenant',
		name: 'tenantFilter',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The tenant to perform the operation on',
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'tenantSearch',
					searchable: true,
				},
			},
			{
				displayName: 'By Domain',
				name: 'domain',
				type: 'string',
				placeholder: 'e.g. contoso.onmicrosoft.com',
				hint: 'Enter the tenant default domain',
			},
		],
	},

	// Get Many fields
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getAll', 'listInactiveAccounts', 'listSignIns', 'listMfaUsers', 'listJitAdmin', 'listUserDevices', 'listUserGroups', 'listUserMailboxDetails', 'listUserPhoto', 'listUserCAPolicies', 'listUserSettings', 'listPerUserMfa', 'listUserCounts'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getAll', 'listInactiveAccounts', 'listSignIns', 'listMfaUsers', 'listJitAdmin', 'listUserDevices', 'listUserGroups', 'listUserMailboxDetails', 'listUserPhoto', 'listUserCAPolicies', 'listUserSettings', 'listPerUserMfa', 'listUserCounts'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 999,
		},
		default: 50,
		description: 'Max number of results to return',
	},

	// User ID for single-user operations
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: [
					'disable',
					'dismissRiskyUser',
					'enable',
					'execJitAdmin',
					'listUserDevices',
					'listUserGroups',
					'listUserMailboxDetails',
					'listUserPhoto',
					'listUserCAPolicies',
					'listUserSettings',
					'resetMfa',
					'resetPassword',
					'revokeSessions',
					'remove',
					'clearImmutableId',
					'createTap',
					'sendMfaPush',
					'setPerUserMfa',
					'setUserPhoto',
				],
			},
		},
		default: '',
		placeholder: 'user@domain.com or GUID',
		description: 'The User Principal Name (UPN) or Object ID of the user',
	},

	// Per-User MFA state
	{
		displayName: 'MFA State',
		name: 'mfaState',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['user'],
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

	// JIT Admin role
	{
		displayName: 'JIT Admin Role',
		name: 'jitAdminRole',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['execJitAdmin'],
			},
		},
		default: '',
		placeholder: 'e.g. Global Administrator',
		description: 'The admin role to request for just-in-time access',
	},

	// Reset Password options
	{
		displayName: 'Additional Options',
		name: 'passwordOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['user'],
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

	// Add User fields
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
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
				resource: ['user'],
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
				resource: ['user'],
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
				resource: ['user'],
				operation: ['add'],
			},
		},
		options: [
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'City from address',
			},
			{
				displayName: 'Company Name',
				name: 'companyName',
				type: 'string',
				default: '',
				description: 'Company name on the user profile',
			},
			{
				displayName: 'Copy Groups From User',
				name: 'copyFrom',
				type: 'string',
				default: '',
				placeholder: 'e.g. user GUID',
				description: 'Copy group memberships from this user (GUID). CIPP wraps as {value: ID}.',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				description: 'Country/region code (e.g. US, GB)',
			},
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
				description: 'Department name',
			},
			{
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
				description: 'Custom display name (defaults to First Last)',
			},
			{
				displayName: 'Job Title',
				name: 'jobTitle',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Mail Nickname',
				name: 'mailNickname',
				type: 'string',
				default: '',
				description: 'Mail alias (defaults to first.last)',
			},
			{
				displayName: 'Mobile Phone',
				name: 'mobilePhone',
				type: 'string',
				default: '',
				description: 'Mobile phone number',
			},
			{
				displayName: 'Must Change Password',
				name: 'mustChangePassword',
				type: 'boolean',
				default: true,
				description:
					'Whether the user must change their password at next sign-in. Maps to CIPP MustChangePass.',
			},
			{
				displayName: 'Office Location',
				name: 'officeLocation',
				type: 'string',
				default: '',
				description: 'Office location / building name',
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description:
					'Custom initial password. If omitted, CIPP generates a random one. Maps to CIPP password (New-CIPPUser).',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
				description: 'Postal/ZIP code',
			},
			{
				displayName: 'Set Manager',
				name: 'setManager',
				type: 'string',
				default: '',
				placeholder: 'e.g. manager GUID',
				description: 'Set manager for the new user (GUID). CIPP wraps as {value: ID}.',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
				description: 'State or province',
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
				default: 'US',
				placeholder: 'e.g. US, GB, DE',
				description: 'ISO country code for license assignment',
			},
			{
				displayName: 'Username',
				name: 'username',
				type: 'string',
				default: '',
				description: 'Username / UPN prefix (overrides default from first name)',
			},
		],
	},

	// Offboard User fields
	{
		displayName: 'Users to Offboard',
		name: 'usersToOffboard',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
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
				resource: ['user'],
				operation: ['offboard'],
			},
		},
		default: false,
		description: 'Whether to schedule the offboarding for later',
	},
	{
		displayName: 'Scheduled Time',
		name: 'scheduledOffboardDate',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['offboard'],
				scheduledOffboard: [true],
			},
		},
		default: '',
		description: 'When to run the scheduled offboarding task',
	},
	{
		displayName: 'Offboard Options',
		name: 'offboardOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['offboard'],
			},
		},
		options: [
			{
				displayName: 'Cancel Calendar Invites',
				name: 'removeCalendarInvites',
				type: 'boolean',
				default: false,
				description: 'Cancel all calendar meetings organized by the user',
			},
			{
				displayName: 'Remove Mailbox Permissions',
				name: 'removePermissions',
				type: 'boolean',
				default: false,
				description: 'Remove the user from other mailboxes where they have permissions',
			},
			{
				displayName: 'Remove Calendar Permissions',
				name: 'removeCalendarPermissions',
				type: 'boolean',
				default: false,
				description: 'Remove the user from other calendars where they have permissions',
			},
			{
				displayName: 'Remove Mailbox Rules',
				name: 'RemoveRules',
				type: 'boolean',
				default: false,
				description: 'Remove all mailbox rules for the user',
			},
			{
				displayName: 'Block Sign-In',
				name: 'DisableSignIn',
				type: 'boolean',
				default: false,
				description: 'Immediately block the user from signing in',
			},
			{
				displayName: 'Revoke Sessions',
				name: 'RevokeSessions',
				type: 'boolean',
				default: false,
				description: 'Revoke all active sessions',
			},
			{
				displayName: 'Reset Password',
				name: 'ResetPass',
				type: 'boolean',
				default: false,
				description: 'Reset the user password',
			},
			{
				displayName: 'Remove Groups',
				name: 'RemoveGroups',
				type: 'boolean',
				default: false,
				description: 'Remove user from all groups',
			},
			{
				displayName: 'Remove Licenses',
				name: 'RemoveLicenses',
				type: 'boolean',
				default: false,
				description: 'Remove all license assignments',
			},
			{
				displayName: 'Remove Mobile Devices',
				name: 'RemoveMobile',
				type: 'boolean',
				default: false,
				description: 'Remove all mobile device partnerships for the user',
			},
			{
				displayName: 'Convert to Shared Mailbox',
				name: 'ConvertToShared',
				type: 'boolean',
				default: false,
				description: 'Convert the mailbox to a shared mailbox',
			},
			{
				displayName: 'Hide From GAL',
				name: 'HideFromGAL',
				type: 'boolean',
				default: false,
				description: 'Hide user from the Global Address List',
			},
			{
				displayName: 'Clear Immutable ID',
				name: 'ClearImmutableId',
				type: 'boolean',
				default: false,
				description: 'Clear the user immutable ID used for directory synchronization',
			},
			{
				displayName: 'Remove MFA Devices',
				name: 'RemoveMFADevices',
				type: 'boolean',
				default: false,
				description: 'Remove all registered MFA authentication methods from the user',
			},
			{
				displayName: 'Remove Teams Phone DID',
				name: 'RemoveTeamsPhoneDID',
				type: 'boolean',
				default: false,
				description: 'Remove Teams Phone direct-inward-dialing assignments from the user',
			},
			{
				displayName: 'Disable OneDrive Sharing Links',
				name: 'DisableOneDriveSharing',
				type: 'boolean',
				default: false,
				description: 'Disable sharing capability for the user OneDrive',
			},
			{
				displayName: 'Delete User',
				name: 'DeleteUser',
				type: 'boolean',
				default: false,
				description: 'Delete the user after the selected offboarding actions run',
			},
			{
				displayName: 'Out-of-Office Message',
				name: 'OOO',
				type: 'string',
				default: '',
				description: 'Set an out-of-office auto-reply message',
			},
			{
				displayName: 'Disable Email Forwarding',
				name: 'disableForwarding',
				type: 'boolean',
				default: false,
				description: 'Disable any existing email forwarding for the user',
			},
			{
				displayName: 'Forward Email To',
				name: 'forward',
				type: 'string',
				default: '',
				description: 'UPN or GUID of user to forward email to',
			},
			{
				displayName: 'Keep Copy of Forwarded Mail',
				name: 'KeepCopy',
				type: 'boolean',
				default: false,
				description: 'Whether to retain a copy in the offboarded user mailbox when forwarding',
			},
			{
				displayName: 'OneDrive Access To',
				name: 'OnedriveAccess',
				type: 'string',
				default: '',
				description: 'Comma-separated UPNs or GUIDs of users to grant OneDrive access',
			},
			{
				displayName: 'Mailbox Access (Automap)',
				name: 'AccessAutomap',
				type: 'string',
				default: '',
				description: 'Comma-separated UPNs or GUIDs of users to grant mailbox access with automapping',
			},
			{
				displayName: 'Mailbox Access (No Automap)',
				name: 'AccessNoAutomap',
				type: 'string',
				default: '',
				description: 'Comma-separated UPNs or GUIDs of users to grant mailbox access without automapping',
			},
		],
	},
	{
		displayName: 'Post-Execution Notifications',
		name: 'offboardPostExecution',
		type: 'collection',
		placeholder: 'Add Notification',
		default: {},
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['offboard'],
			},
		},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'boolean',
				default: false,
				description: 'Whether to send results through configured email notifications',
			},
			{
				displayName: 'PSA',
				name: 'psa',
				type: 'boolean',
				default: false,
				description: 'Whether to send results through configured PSA notifications',
			},
			{
				displayName: 'Webhook',
				name: 'webhook',
				type: 'boolean',
				default: false,
				description: 'Whether to send results through configured webhook notifications',
			},
		],
	},
	{
		displayName: 'Reference',
		name: 'offboardReference',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['offboard'],
			},
		},
		description: 'Reference added to the notification title and scheduled task',
	},

	// Get Many - Fields to return
	{
		displayName: 'Fields to Return',
		name: 'userFields',
		type: 'multiOptions',
		displayOptions: {
			show: {
				resource: ['user'],
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

	// Get Many filters
	{
		displayName: 'Options',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['user'],
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

	// Add Guest fields
	{
		displayName: 'Display Name',
		name: 'guestDisplayName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['addGuest'],
			},
		},
		default: '',
		description: 'The display name of the guest user',
	},
	{
		displayName: 'Email',
		name: 'guestMail',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['addGuest'],
			},
		},
		default: '',
		placeholder: 'e.g. guest@external.com',
		description: 'The email address of the guest user to invite',
	},

	// Set User Photo fields
	{
		displayName: 'Photo (Base64)',
		name: 'photo',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['setUserPhoto'],
			},
		},
		default: '',
		description: 'The photo data encoded as a Base64 string',
	},

	// Bulk License fields
	{
		displayName: 'License JSON',
		name: 'licenseJson',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['bulkLicense'],
			},
		},
		default: '[]',
		description: 'JSON array of license assignment request objects',
	},
];
