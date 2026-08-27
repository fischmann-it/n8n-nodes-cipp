import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

export const deviceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['device'],
			},
		},
		options: [
			{
				name: 'Execute Action',
				value: 'executeAction',
				description: 'Execute an action on a device (reboot, wipe, sync, etc.)',
				action: 'Execute device action',
			},
			{
				name: 'Get Details',
				value: 'getDetails',
				description: 'Get detailed information about a device',
				action: 'Get device details',
			},
			{
				name: 'Get LAPS Password',
				value: 'getLapsPassword',
				description: 'Get the Local Admin Password (LAPS)',
				action: 'Get LAPS password',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get a list of devices',
				action: 'Get many devices',
			},
			{
				name: 'Get Recovery Key',
				value: 'getRecoveryKey',
				description: 'Get BitLocker recovery keys',
				action: 'Get recovery key',
			},
			{
				name: 'List Detected App Devices',
				value: 'listDetectedAppDevices',
				description: 'List devices that have a specific detected app installed',
				action: 'List detected app devices',
			},
			{
				name: 'List Detected Apps',
				value: 'listDetectedApps',
				description: 'List Intune detected applications',
				action: 'List detected apps',
			},
			{
				name: 'Manage',
				value: 'manage',
				description: 'Enable, disable, or delete a device',
				action: 'Manage device',
			},
			{
				name: 'Set Cloud Managed',
				value: 'setCloudManaged',
				description: 'Set the cloud-managed status of a user, group, or contact',
				action: 'Set cloud managed',
			},
			{
				name: 'Set Package Tag',
				value: 'setPackageTag',
				description: 'Set a package or app tag on a device',
				action: 'Set package tag',
			},
		],
		default: 'getAll',
	},
];

// Operations needing tenant selector (all except setPackageTag)
const tenantOps = [
	'executeAction',
	'getAll',
	'getDetails',
	'getLapsPassword',
	'getRecoveryKey',
	'listDetectedAppDevices',
	'listDetectedApps',
	'manage',
	'setCloudManaged',
];

// Operations needing returnAll / limit
const listOps = ['getAll', 'listDetectedApps', 'listDetectedAppDevices'];

export const deviceFields: INodeProperties[] = [
	tenantField('device', tenantOps),
	returnAllField('device', listOps),
	limitField('device', listOps),

	// Device ID for single-device operations
	{
		displayName: 'Device ID',
		name: 'deviceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['manage', 'executeAction', 'getRecoveryKey', 'getLapsPassword'],
			},
		},
		default: '',
		description: 'The ID of the device',
	},

	// Manage Device action
	{
		displayName: 'Action',
		name: 'manageAction',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['manage'],
			},
		},
		options: [
			{ name: 'Enable', value: 'Enable' },
			{ name: 'Disable', value: 'Disable' },
			{ name: 'Delete', value: 'Delete' },
		],
		default: 'Enable',
	},

	// Execute Action options
	{
		displayName: 'Action',
		name: 'executeDeviceAction',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['executeAction'],
			},
		},
		options: [
			{ name: 'Fresh Start', value: 'FreshStart' },
			{ name: 'Full Scan', value: 'FullScan' },
			{ name: 'Quick Scan', value: 'QuickScan' },
			{ name: 'Reboot', value: 'Reboot' },
			{ name: 'Remove From Autopilot', value: 'RemoveFromAutopilot' },
			{ name: 'Remove From Azure AD', value: 'RemoveFromAzure' },
			{ name: 'Remove From Defender', value: 'RemoveFromDefender' },
			{ name: 'Remove From Everywhere', value: 'RemoveFromEverywhere' },
			{ name: 'Remove From Intune', value: 'RemoveFromIntune' },
			{ name: 'Rename', value: 'Rename' },
			{ name: 'Reset to Autopilot', value: 'Autopilot' },
			{ name: 'Sync Device', value: 'SyncDevice' },
			{ name: 'Windows Update - All', value: 'WindowsUpdateAll' },
			{ name: 'Windows Update - Drivers', value: 'WindowsUpdateDrivers' },
			{ name: 'Windows Update - Features', value: 'WindowsUpdateFeatures' },
			{ name: 'Windows Update - Other', value: 'WindowsUpdateOther' },
			{ name: 'Windows Update - Reboot', value: 'WindowsUpdateReboot' },
			{ name: 'Windows Update - Scan', value: 'WindowsUpdateScan' },
			{ name: 'Wipe', value: 'Wipe' },
		],
		default: 'SyncDevice',
		description: 'The action to execute on the device',
	},

	// Recovery Key Type (optional)
	{
		displayName: 'Recovery Key Type',
		name: 'recoveryKeyType',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['getRecoveryKey'],
			},
		},
		default: '',
		description: 'The type of recovery key to retrieve (leave empty for default)',
	},

	// Rename device name
	{
		displayName: 'New Device Name',
		name: 'newDeviceName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['executeAction'],
				executeDeviceAction: ['Rename'],
			},
		},
		default: '',
		description: 'The new name for the device',
	},

	// ── List Detected Apps filters ───────────────────────────────────────
	{
		displayName: 'Filters',
		name: 'detectedAppsFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['listDetectedApps'],
			},
		},
		options: [
			{
				displayName: 'Device ID',
				name: 'DeviceID',
				type: 'string',
				default: '',
				description: 'Filter by a specific device ID',
			},
			{
				displayName: 'Include Devices',
				name: 'includeDevices',
				type: 'string',
				default: '',
				description: 'Whether to include device details in the response',
			},
		],
	},

	// ── List Detected App Devices ────────────────────────────────────────
	{
		displayName: 'App ID',
		name: 'appId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['listDetectedAppDevices'],
			},
		},
		default: '',
		description: 'The ID of the detected app to list devices for',
	},

	// ── Get Device Details filters ───────────────────────────────────────
	{
		displayName: 'Filters',
		name: 'deviceDetailsFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['getDetails'],
			},
		},
		options: [
			{
				displayName: 'Device ID',
				name: 'DeviceID',
				type: 'string',
				default: '',
				description: 'Filter by device ID',
			},
			{
				displayName: 'Device Name',
				name: 'DeviceName',
				type: 'string',
				default: '',
				description: 'Filter by device name',
			},
			{
				displayName: 'Device Serial',
				name: 'DeviceSerial',
				type: 'string',
				default: '',
				description: 'Filter by device serial number',
			},
		],
	},

	// ── Set Cloud Managed ────────────────────────────────────────────────
	{
		displayName: 'Options',
		name: 'cloudManagedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['setCloudManaged'],
			},
		},
		options: [
			{
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
				description: 'The display name of the object',
			},
			{
				displayName: 'ID',
				name: 'ID',
				type: 'string',
				default: '',
				description: 'The ID of the object to set as cloud-managed',
			},
			{
				displayName: 'Is Cloud Managed',
				name: 'isCloudManaged',
				type: 'string',
				default: '',
				description: 'Whether the object should be cloud-managed (true/false)',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'string',
				default: '',
				description: 'The type of object (user, group, or contact)',
			},
		],
	},

	// ── Set Package Tag ──────────────────────────────────────────────────
	{
		displayName: 'Options',
		name: 'packageTagOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['setPackageTag'],
			},
		},
		options: [
			{
				displayName: 'GUID',
				name: 'GUID',
				type: 'string',
				default: '',
				description: 'The GUID of the package',
			},
			{
				displayName: 'Package',
				name: 'Package',
				type: 'string',
				default: '',
				description: 'The package name or identifier',
			},
			{
				displayName: 'Remove',
				name: 'Remove',
				type: 'string',
				default: '',
				description: 'Whether to remove the tag instead of setting it',
			},
		],
	},
];

// Autopilot operations
export const autopilotOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['autopilot'],
			},
		},
		options: [
			{
				name: 'Add Configuration',
				value: 'addConfig',
				description: 'Add an Autopilot configuration profile or ESP',
				action: 'Add autopilot configuration',
			},
			{
				name: 'Add Device',
				value: 'addDevice',
				description: 'Add a device to Autopilot',
				action: 'Add autopilot device',
			},
			{
				name: 'Add Enrollment',
				value: 'addEnrollment',
				description: 'Add an enrollment status page configuration',
				action: 'Add enrollment configuration',
			},
			{
				name: 'Assign',
				value: 'assign',
				description: 'Assign an Autopilot device to a user',
				action: 'Assign autopilot device',
			},
			{
				name: 'Get Configurations',
				value: 'getConfigurations',
				description: 'Get Autopilot configurations (ESP or profiles)',
				action: 'Get autopilot configurations',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get a list of Autopilot devices',
				action: 'Get many autopilot devices',
			},
			{
				name: 'Remove',
				value: 'remove',
				description: 'Remove an Autopilot device',
				action: 'Remove autopilot device',
			},
			{
				name: 'Remove Configuration',
				value: 'removeConfig',
				description: 'Remove an Autopilot configuration profile or ESP',
				action: 'Remove autopilot configuration',
			},
			{
				name: 'Rename Device',
				value: 'renameDevice',
				description: 'Rename an Autopilot device',
				action: 'Rename autopilot device',
			},
			{
				name: 'Set Group Tag',
				value: 'setGroupTag',
				description: 'Set the group tag on an Autopilot device',
				action: 'Set autopilot device group tag',
			},
			{
				name: 'Sync',
				value: 'sync',
				description: 'Sync Autopilot devices',
				action: 'Sync autopilot devices',
			},
			{
				name: 'Sync DEP',
				value: 'syncDep',
				description: 'Sync Apple Business Manager (DEP) devices to Intune (CIPP v10.1.0+)',
				action: 'Sync DEP devices',
			},
		],
		default: 'getAll',
	},
];

export const autopilotFields: INodeProperties[] = [
	tenantField('autopilot'),
	returnAllField('autopilot', ['getAll']),
	limitField('autopilot', ['getAll']),

	// Device ID for single operations
	{
		displayName: 'Device ID',
		name: 'deviceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['assign', 'remove'],
			},
		},
		default: '',
		description: 'The ID of the Autopilot device',
	},

	// Assign fields
	{
		displayName: 'Serial Number',
		name: 'serialNumber',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['assign'],
			},
		},
		default: '',
		description: 'The serial number of the device',
	},
	{
		displayName: 'User Principal Name',
		name: 'userPrincipalName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['assign'],
			},
		},
		default: '',
		placeholder: 'user@domain.com',
		description: 'The UPN of the user to assign the device to',
	},

	// Get Configurations type
	{
		displayName: 'Configuration Type',
		name: 'configType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['getConfigurations'],
			},
		},
		options: [
			{ name: 'Enrollment Status Page', value: 'ESP' },
			{ name: 'Autopilot Profile', value: 'ApProfile' },
		],
		default: 'ApProfile',
		description: 'The type of configuration to retrieve',
	},

	// ── Add Device ──
	{
		displayName: 'Autopilot Data',
		name: 'autopilotData',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['addDevice'],
			},
		},
		default: '',
		description: 'Bulk device CSV or JSON data to import',
	},
	{
		displayName: 'Group Name',
		name: 'groupname',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['addDevice'],
			},
		},
		default: '',
		description: 'Group assignment for the device',
	},

	// ── Add Configuration ──
	{
		displayName: 'Display Name',
		name: 'displayName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['addConfig'],
			},
		},
		default: '',
		description: 'Display name for the Autopilot configuration',
	},
	{
		displayName: 'Configuration Options',
		name: 'configOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['addConfig'],
			},
		},
		options: [
			{
				displayName: 'Allow White Glove',
				name: 'allowWhiteGlove',
				type: 'boolean',
				default: false,
				description: 'Whether to allow white glove OOBE',
			},
			{
				displayName: 'Assign To',
				name: 'Assignto',
				type: 'boolean',
				default: false,
				description: 'Whether to assign the device to a user',
			},
			{
				displayName: 'Auto Keyboard',
				name: 'Autokeyboard',
				type: 'boolean',
				default: false,
				description: 'Whether to auto-detect keyboard layout',
			},
			{
				displayName: 'Collect Hash',
				name: 'CollectHash',
				type: 'boolean',
				default: false,
				description: 'Whether to collect the hardware hash',
			},
			{
				displayName: 'Deployment Mode',
				name: 'DeploymentMode',
				type: 'boolean',
				default: false,
				description: 'Whether to enable self-deploying mode',
			},
			{
				displayName: 'Description',
				name: 'Description',
				type: 'string',
				default: '',
				description: 'Description for the configuration',
			},
			{
				displayName: 'Device Name Template',
				name: 'DeviceNameTemplate',
				type: 'string',
				default: '',
				description: 'Template for auto-naming devices (e.g. %SERIAL%)',
			},
			{
				displayName: 'Hide Change Account',
				name: 'HideChangeAccount',
				type: 'boolean',
				default: false,
				description: 'Whether to hide the change account option during OOBE',
			},
			{
				displayName: 'Hide Privacy',
				name: 'HidePrivacy',
				type: 'boolean',
				default: false,
				description: 'Whether to hide the privacy settings during OOBE',
			},
			{
				displayName: 'Hide Terms',
				name: 'HideTerms',
				type: 'boolean',
				default: false,
				description: 'Whether to hide EULA during OOBE',
			},
			{
				displayName: 'Languages (JSON)',
				name: 'languages',
				type: 'string',
				default: '',
				description: 'Language selection as LabelValue JSON (e.g. {"label":"English","value":"en-US"})',
			},
			{
				displayName: 'Not Local Admin',
				name: 'NotLocalAdmin',
				type: 'boolean',
				default: false,
				description: 'Whether the user should not be a local admin',
			},
		],
	},

	// ── Add Enrollment ──
	{
		displayName: 'Enrollment Options',
		name: 'enrollmentOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['addEnrollment'],
			},
		},
		options: [
			{
				displayName: 'Allow Fail',
				name: 'AllowFail',
				type: 'boolean',
				default: false,
				description: 'Whether to allow the user to proceed if app install fails',
			},
			{
				displayName: 'Allow Reset',
				name: 'AllowReset',
				type: 'boolean',
				default: false,
				description: 'Whether to allow the user to reset the device',
			},
			{
				displayName: 'Block Device',
				name: 'blockDevice',
				type: 'boolean',
				default: false,
				description: 'Whether to block device use until all apps are installed',
			},
			{
				displayName: 'Enable Log',
				name: 'EnableLog',
				type: 'boolean',
				default: false,
				description: 'Whether to enable logging',
			},
			{
				displayName: 'Error Message',
				name: 'ErrorMessage',
				type: 'string',
				default: '',
				description: 'Custom error message to display on failure',
			},
			{
				displayName: 'Install Windows Updates',
				name: 'InstallWindowsUpdates',
				type: 'boolean',
				default: false,
				description: 'Whether to install Windows updates during ESP',
			},
			{
				displayName: 'OOBE Only',
				name: 'OBEEOnly',
				type: 'boolean',
				default: false,
				description: 'Whether to show the ESP only during OOBE',
			},
			{
				displayName: 'Show Progress',
				name: 'ShowProgress',
				type: 'boolean',
				default: false,
				description: 'Whether to show installation progress to the user',
			},
			{
				displayName: 'Timeout (Minutes)',
				name: 'TimeOutInMinutes',
				type: 'string',
				default: '',
				description: 'Timeout in minutes before the ESP fails',
			},
		],
	},

	// ── Rename Device / Set Group Tag shared fields ──
	{
		displayName: 'Device ID',
		name: 'apDeviceId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['renameDevice', 'setGroupTag'],
			},
		},
		default: '',
		description: 'The Autopilot device ID (provide this or Serial Number)',
	},
	{
		displayName: 'Serial Number',
		name: 'apSerialNumber',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['renameDevice', 'setGroupTag'],
			},
		},
		default: '',
		description: 'The device serial number (provide this or Device ID)',
	},

	// ── Rename Device ──
	{
		displayName: 'New Display Name',
		name: 'newDisplayName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['renameDevice'],
			},
		},
		default: '',
		description: 'The new display name for the device',
	},

	// ── Set Group Tag ──
	{
		displayName: 'Group Tag',
		name: 'groupTag',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['setGroupTag'],
			},
		},
		default: '',
		description: 'The group tag to assign to the device',
	},

	// ── Remove Configuration ──
	{
		displayName: 'Configuration ID',
		name: 'configId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['removeConfig'],
			},
		},
		default: '',
		description: 'The ID of the Autopilot configuration to remove',
	},
	{
		displayName: 'Additional Options',
		name: 'removeConfigOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['autopilot'],
				operation: ['removeConfig'],
			},
		},
		options: [
			{
				displayName: 'Assignments',
				name: 'assignments',
				type: 'string',
				default: '',
				description: 'Comma-separated assignment IDs or JSON',
			},
			{
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
				description: 'Display name of the configuration being removed',
			},
		],
	},
];
