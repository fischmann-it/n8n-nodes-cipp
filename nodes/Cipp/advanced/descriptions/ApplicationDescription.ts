import type { INodeProperties } from 'n8n-workflow';
import { tenantField, returnAllField, limitField } from './DescriptionHelpers';

export const applicationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['application'],
			},
		},
		options: [
			{
				name: 'Add Chocolatey App',
				value: 'addChocolatey',
				description: 'Add a Chocolatey application',
				action: 'Add chocolatey app',
			},
			{
				name: 'Add MSP App',
				value: 'addMsp',
				description: 'Add an MSP/RMM application',
				action: 'Add MSP app',
			},
			{
				name: 'Add Multi-Tenant App',
				value: 'addMultiTenantApp',
				description: 'Add an application across multiple tenants',
				action: 'Add multi tenant app',
			},
			{
				name: 'Add Office App',
				value: 'addOffice',
				description: 'Add Microsoft 365 Apps',
				action: 'Add office app',
			},
			{
				name: 'Add Store App',
				value: 'addStore',
				description: 'Add a Microsoft Store application',
				action: 'Add store app',
			},
			{
				name: 'Add Win32 Script App',
				value: 'addWin32Script',
				description: 'Add a Win32 application with custom install/uninstall scripts',
				action: 'Add win32 script app',
			},
			{
				name: 'Add WinGet App',
				value: 'addWinget',
				description: 'Add a WinGet application',
				action: 'Add win get app',
			},
			{
				name: 'Assign',
				value: 'assign',
				description: 'Assign an application to users or devices',
				action: 'Assign application',
			},
			{
				name: 'Create App Template',
				value: 'createAppTemplate',
				description: 'Create an app approval template from tenant apps',
				action: 'Create app template',
			},
			{
				name: 'Delete App Approval Template',
				value: 'deleteAppApprovalTemplate',
				description: 'Delete an app approval template',
				action: 'Delete app approval template',
			},
			{
				name: 'Exclude Licenses',
				value: 'excludeLicenses',
				description: 'Exclude licenses from processing',
				action: 'Exclude licenses',
			},
			{
				name: 'Get App Approval',
				value: 'getAppApproval',
				description: 'Get application approval status',
				action: 'Get app approval',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get a list of applications',
				action: 'Get many applications',
			},
			{
				name: 'Get Queue',
				value: 'getQueue',
				description: 'Get the application deployment queue',
				action: 'Get application queue',
			},
			{
				name: 'List App Approval Templates',
				value: 'listAppApprovalTemplates',
				description: 'List all app approval templates',
				action: 'List app approval templates',
			},
			{
				name: 'List App IDs',
				value: 'listAppIds',
				description: 'List or resolve application IDs',
				action: 'List app i ds',
			},
			{
				name: 'List Apps Repository',
				value: 'listAppsRepository',
				description: 'Browse available applications in the CIPP apps repository',
				action: 'List apps repository',
			},
			{
				name: 'List Excluded Licenses',
				value: 'listExcludedLicenses',
				description: 'List licenses excluded from processing',
				action: 'List excluded licenses',
			},
			{
				name: 'List Potential Apps',
				value: 'listPotentialApps',
				description: 'List potential application candidates',
				action: 'List potential apps',
			},
			{
				name: 'Patch Application',
				value: 'patchApplication',
				description: 'Update or modify an application',
				action: 'Patch application',
			},
			{
				name: 'Remove',
				value: 'remove',
				description: 'Remove an application',
				action: 'Remove application',
			},
			{
				name: 'Remove From Queue',
				value: 'removeFromQueue',
				description: 'Remove an application from the queue',
				action: 'Remove from queue',
			},
			{
				name: 'Sync VPP',
				value: 'syncVpp',
				description: 'Sync Apple Volume Purchase Program tokens',
				action: 'Sync VPP',
			},
			{
				name: 'Trigger App Upload',
				value: 'triggerAppUpload',
				description: 'Trigger the application upload process',
				action: 'Trigger app upload',
			},
		],
		default: 'getAll',
	},
];

export const applicationFields: INodeProperties[] = [
	tenantField('application', [
		'addChocolatey',
		'addMsp',
		'addMultiTenantApp',
		'addOffice',
		'addStore',
		'addWin32Script',
		'addWinget',
		'assign',
		'createAppTemplate',
		'getAll',
		'getQueue',
		'patchApplication',
		'remove',
		'removeFromQueue',
		'syncVpp',
	]),
	returnAllField('application', ['getAll', 'getQueue', 'listAppApprovalTemplates', 'listAppsRepository', 'listExcludedLicenses', 'listPotentialApps']),
	limitField('application', ['getAll', 'getQueue', 'listAppApprovalTemplates', 'listAppsRepository', 'listExcludedLicenses', 'listPotentialApps']),

	// Application ID for operations
	{
		displayName: 'Application ID',
		name: 'appId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['assign', 'remove'],
			},
		},
		default: '',
		description: 'The ID of the application',
	},

	// Queue Item ID
	{
		displayName: 'Queue Item ID',
		name: 'queueId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['removeFromQueue'],
			},
		},
		default: '',
		description: 'The ID of the queue item to remove',
	},

	// Assignment target
	{
		displayName: 'Assign To',
		name: 'assignTo',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['assign', 'addWinget', 'addStore', 'addChocolatey', 'addMsp', 'addOffice', 'addWin32Script'],
			},
		},
		options: [
			{ name: 'All Devices', value: 'AllDevices' },
			{ name: 'All Users', value: 'AllUsers' },
			{ name: 'Both', value: 'Both' },
			{ name: 'Custom Group', value: 'customGroup' },
			{ name: 'Do Not Assign', value: 'On' },
		],
		default: 'AllDevices',
		description: 'Who to assign the application to',
	},
	{
		displayName: 'Custom Group Names',
		name: 'customGroupNames',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['assign', 'addWinget', 'addStore', 'addChocolatey', 'addMsp', 'addOffice', 'addWin32Script'],
				assignTo: ['customGroup'],
			},
		},
		default: '',
		placeholder: 'Group1,Group2',
		description: 'Comma-separated list of group names to assign to',
	},

	// WinGet/Store App fields
	{
		displayName: 'Package ID',
		name: 'packageId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addWinget', 'addStore'],
			},
		},
		default: '',
		placeholder: 'e.g. Google.Chrome or 9WZDNCRFJ3TJ',
		description: 'The WinGet package ID or Store product ID',
	},
	{
		displayName: 'Application Name',
		name: 'appName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addWinget', 'addStore', 'addChocolatey', 'addWin32Script'],
			},
		},
		default: '',
		description: 'The display name for the application',
	},
	{
		displayName: 'Description',
		name: 'appDescription',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addWinget', 'addStore', 'addChocolatey', 'addWin32Script'],
			},
		},
		default: '',
		description: 'Description of the application',
	},
	{
		displayName: 'Mark for Uninstall',
		name: 'uninstall',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addWinget', 'addStore', 'addChocolatey'],
			},
		},
		default: false,
		description: 'Whether to mark the app for uninstallation instead of installation',
	},

	// Chocolatey specific
	{
		displayName: 'Package Name',
		name: 'packageName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addChocolatey'],
			},
		},
		default: '',
		placeholder: 'e.g. googlechrome',
		description: 'The Chocolatey package name',
	},
	{
		displayName: 'Additional Options',
		name: 'chocoOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addChocolatey'],
			},
		},
		options: [
			{
				displayName: 'Custom Repository URL',
				name: 'CustomRepo',
				type: 'string',
				default: '',
				description: 'Custom Chocolatey repository URL',
			},
			{
				displayName: 'Disable Restart',
				name: 'DisableRestart',
				type: 'boolean',
				default: false,
				description: 'Whether to disable automatic restart',
			},
			{
				displayName: 'Install as System',
				name: 'InstallAsSystem',
				type: 'boolean',
				default: true,
				description: 'Whether to install as SYSTEM user',
			},
		],
	},

	// MSP App fields
	{
		displayName: 'RMM Tool',
		name: 'rmmTool',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addMsp'],
			},
		},
		default: '',
		description: 'The RMM tool identifier',
	},
	{
		displayName: 'Display Name',
		name: 'mspDisplayName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addMsp'],
			},
		},
		default: '',
		description: 'The display name for the application',
	},
	{
		displayName: 'RMM Parameters',
		name: 'rmmParameters',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addMsp'],
			},
		},
		default: '{}',
		description: 'RMM-specific parameters as JSON',
	},

	// Office App fields
	{
		displayName: 'Excluded Apps',
		name: 'excludedApps',
		type: 'multiOptions',
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addOffice'],
			},
		},
		options: [
			{ name: 'Access', value: 'access' },
			{ name: 'Excel', value: 'excel' },
			{ name: 'Groove', value: 'groove' },
			{ name: 'Lync', value: 'lync' },
			{ name: 'OneDrive', value: 'oneDrive' },
			{ name: 'OneNote', value: 'oneNote' },
			{ name: 'Outlook', value: 'outlook' },
			{ name: 'PowerPoint', value: 'powerPoint' },
			{ name: 'Publisher', value: 'publisher' },
			{ name: 'Teams', value: 'teams' },
			{ name: 'Word', value: 'word' },
		],
		default: [],
		description: 'Apps to exclude from the installation',
	},
	{
		displayName: 'Update Channel',
		name: 'updateChannel',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addOffice'],
			},
		},
		options: [
			{ name: 'Current', value: 'Current' },
			{ name: 'Monthly Enterprise', value: 'MonthlyEnterprise' },
			{ name: 'Semi-Annual', value: 'SemiAnnual' },
		],
		default: 'Current',
		description: 'The update channel for Office',
	},
	{
		displayName: 'Additional Options',
		name: 'officeOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addOffice'],
			},
		},
		options: [
			{
				displayName: 'Accept License',
				name: 'AcceptLicense',
				type: 'boolean',
				default: true,
				description: 'Whether to auto-accept the license',
			},
			{
				displayName: 'Architecture',
				name: 'arch',
				type: 'options',
				options: [
					{ name: '64-Bit', value: 'x64' },
					{ name: '32-Bit', value: 'x86' },
				],
				default: 'x64',
				description: 'The architecture to install',
			},
			{
				displayName: 'Languages',
				name: 'languages',
				type: 'string',
				default: 'en-us',
				placeholder: 'en-us,es-es',
				description: 'Comma-separated list of language codes',
			},
			{
				displayName: 'Remove Other Versions',
				name: 'RemoveVersions',
				type: 'boolean',
				default: true,
				description: 'Whether to remove other Office versions',
			},
			{
				displayName: 'Shared Computer Activation',
				name: 'SharedComputerActivation',
				type: 'boolean',
				default: false,
				description: 'Whether to enable shared computer activation',
			},
		],
	},

	// Win32 Script App fields
	{
		displayName: 'Install Script',
		name: 'installScript',
		type: 'string',
		required: true,
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addWin32Script'],
			},
		},
		default: '',
		description: 'The PowerShell install script content',
	},
	{
		displayName: 'Uninstall Script',
		name: 'uninstallScript',
		type: 'string',
		required: true,
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addWin32Script'],
			},
		},
		default: '',
		description: 'The PowerShell uninstall script content',
	},
	{
		displayName: 'Additional Options',
		name: 'win32ScriptOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addWin32Script'],
			},
		},
		options: [
			{
				displayName: 'Detection File',
				name: 'detectionFile',
				type: 'string',
				default: '',
				description: 'File name to detect for installation status',
			},
			{
				displayName: 'Detection Path',
				name: 'detectionPath',
				type: 'string',
				default: '',
				description: 'File path to detect for installation status',
			},
			{
				displayName: 'Disable Restart',
				name: 'DisableRestart',
				type: 'string',
				default: '',
				description: 'Whether to disable automatic restart (as string)',
			},
			{
				displayName: 'Enforce Signature Check',
				name: 'enforceSignatureCheck',
				type: 'string',
				default: '',
				description: 'Whether to enforce script signature checks (as string)',
			},
			{
				displayName: 'Install as System',
				name: 'InstallAsSystem',
				type: 'string',
				default: '',
				description: 'Whether to install as SYSTEM user (as string)',
			},
			{
				displayName: 'Installation Intent',
				name: 'InstallationIntent',
				type: 'string',
				default: '',
				description: 'The installation intent (e.g. required, available)',
			},
			{
				displayName: 'Publisher',
				name: 'publisher',
				type: 'string',
				default: '',
				description: 'The publisher name for the application',
			},
			{
				displayName: 'Run as 32-Bit',
				name: 'runAs32Bit',
				type: 'string',
				default: '',
				description: 'Whether to run the script in 32-bit mode (as string)',
			},
		],
	},

	// Add Multi-Tenant App options
	{
		displayName: 'Options',
		name: 'multiTenantAppOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['addMultiTenantApp'],
			},
		},
		options: [
			{
				displayName: 'App ID',
				name: 'AppId',
				type: 'string',
				default: '',
				description: 'Azure AD application ID',
			},
			{
				displayName: 'Config Mode',
				name: 'configMode',
				type: 'string',
				default: '',
				description: 'Configuration mode for the app',
			},
			{
				displayName: 'Copy Permissions',
				name: 'CopyPermissions',
				type: 'string',
				default: '',
				description: 'Copy permissions setting',
			},
			{
				displayName: 'Permissions',
				name: 'permissions',
				type: 'string',
				default: '',
				description: 'Permissions specification',
			},
			{
				displayName: 'Selected Template',
				name: 'selectedTemplate',
				type: 'string',
				default: '',
				description: 'Selected template ID',
			},
		],
	},

	// Get App Approval options
	{
		displayName: 'Options',
		name: 'appApprovalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['getAppApproval'],
			},
		},
		options: [
			{
				displayName: 'Application ID',
				name: 'ApplicationId',
				type: 'string',
				default: '',
				description: 'Azure AD application ID to check approval status',
			},
		],
	},

	// Create App Template options
	{
		displayName: 'Options',
		name: 'createAppTemplateOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['createAppTemplate'],
			},
		},
		options: [
			{
				displayName: 'App ID',
				name: 'AppId',
				type: 'string',
				default: '',
				description: 'Azure AD application ID',
			},
			{
				displayName: 'Display Name',
				name: 'DisplayName',
				type: 'string',
				default: '',
				description: 'Template display name',
			},
			{
				displayName: 'Overwrite',
				name: 'Overwrite',
				type: 'string',
				default: '',
				description: 'Whether to overwrite an existing template',
			},
			{
				displayName: 'Type',
				name: 'Type',
				type: 'string',
				default: '',
				description: 'Template type',
			},
		],
	},

	// List Apps Repository filters
	{
		displayName: 'Filters',
		name: 'repoFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['listAppsRepository'],
			},
		},
		options: [
			{
				displayName: 'Repository',
				name: 'Repository',
				type: 'string',
				default: '',
				description: 'Repository name or identifier to filter by',
			},
			{
				displayName: 'Search',
				name: 'Search',
				type: 'string',
				default: '',
				description: 'Search term to filter applications',
			},
		],
	},

	// ── Delete App Approval Template ──
	{
		displayName: 'Fields',
		name: 'deleteTemplateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['deleteAppApprovalTemplate'],
			},
		},
		options: [
			{
				displayName: 'Action',
				name: 'Action',
				type: 'string',
				default: '',
				description: 'Approval template deletion action (e.g. delete, archive)',
			},
			{
				displayName: 'Template ID',
				name: 'TemplateId',
				type: 'string',
				default: '',
				description: 'The ID of the template to delete',
			},
			{
				displayName: 'Template Name',
				name: 'TemplateName',
				type: 'string',
				default: '',
				description: 'The name of the template to delete',
			},
		],
	},

	// ── List App IDs ──
	{
		displayName: 'Method',
		name: 'appIdMethod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['listAppIds'],
			},
		},
		options: [
			{ name: 'GET', value: 'GET' },
			{ name: 'POST', value: 'POST' },
		],
		default: 'GET',
		description: 'HTTP method to use (GET to list, POST to resolve)',
	},

	// ── Patch Application ──
	{
		displayName: 'Fields',
		name: 'patchApplicationFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['patchApplication'],
			},
		},
		options: [
			{
				displayName: 'Action',
				name: 'Action',
				type: 'string',
				default: '',
				description: 'Application patch action (e.g. approve, reject, rotate credentials)',
			},
			{
				displayName: 'App ID',
				name: 'AppId',
				type: 'string',
				default: '',
				description: 'Azure AD application ID',
			},
			{
				displayName: 'ID',
				name: 'Id',
				type: 'string',
				default: '',
				description: 'The application object ID',
			},
			{
				displayName: 'Key IDs',
				name: 'KeyIds',
				type: 'string',
				default: '',
				description: 'Key IDs for the application',
			},
			{
				displayName: 'Payload',
				name: 'Payload',
				type: 'string',
				default: '',
				description: 'Payload data for the application update',
			},
			{
				displayName: 'Type',
				name: 'Type',
				type: 'string',
				default: '',
				description: 'The type of application operation',
			},
		],
	},

	// ── Exclude Licenses ──
	{
		displayName: 'Fields',
		name: 'excludeLicenseFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['excludeLicenses'],
			},
		},
		options: [
			{
				displayName: 'Action',
				name: 'Action',
				type: 'string',
				default: '',
				description: 'License exclusion action (e.g. add, remove, reset)',
			},
			{
				displayName: 'Full Reset',
				name: 'FullReset',
				type: 'string',
				default: '',
				description: 'Whether to perform a full reset of exclusions',
			},
			{
				displayName: 'GUID',
				name: 'GUID',
				type: 'string',
				default: '',
				description: 'The GUID of the license SKU to exclude',
			},
			{
				displayName: 'SKU Name',
				name: 'SKUName',
				type: 'string',
				default: '',
				description: 'The SKU name of the license to exclude',
			},
		],
	},

	// ── List Potential Apps ──
	{
		displayName: 'Fields',
		name: 'potentialAppFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['listPotentialApps'],
			},
		},
		options: [
			{
				displayName: 'Application Name',
				name: 'applicationName',
				type: 'string',
				default: '',
				description: 'Filter by application name',
			},
			{
				displayName: 'Search Query',
				name: 'searchQuery',
				type: 'string',
				default: '',
				description: 'Search query to filter potential apps',
			},
			{
				displayName: 'Search String',
				name: 'SearchString',
				type: 'string',
				default: '',
				description: 'Alternative search string for filtering',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'string',
				default: '',
				description: 'Filter by application type',
			},
		],
	},
];
