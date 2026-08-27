import type { INodeProperties } from 'n8n-workflow';
import { limitField, returnAllField, tenantField } from './DescriptionHelpers';

const resource = 'exchangeResource';

// ══════════════════════════════════════════════════════════════
// Operations (alphabetical by name)
// ══════════════════════════════════════════════════════════════

export const exchangeResourceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [resource] } },
		options: [
			{
				name: 'Add Equipment Mailbox',
				value: 'addEquipment',
				action: 'Add equipment mailbox',
				description: 'Create a new equipment mailbox',
			},
			{
				name: 'Add Room List',
				value: 'addRoomList',
				action: 'Add room list',
				description: 'Create a new room list group',
			},
			{
				name: 'Add Room Mailbox',
				value: 'addRoom',
				action: 'Add room mailbox',
				description: 'Create a new room mailbox',
			},
			{
				name: 'Edit Equipment Mailbox',
				value: 'editEquipment',
				action: 'Edit equipment mailbox',
				description: 'Edit equipment mailbox properties and booking settings',
			},
			{
				name: 'Edit Room List',
				value: 'editRoomList',
				action: 'Edit room list',
				description: 'Edit a room list group membership and settings',
			},
			{
				name: 'Edit Room Mailbox',
				value: 'editRoom',
				action: 'Edit room mailbox',
				description: 'Edit room mailbox properties and calendar booking settings',
			},
			{
				name: 'List Equipment',
				value: 'listEquipment',
				action: 'List equipment',
				description: 'List equipment mailboxes for a tenant',
			},
			{
				name: 'List Room Lists',
				value: 'listRoomLists',
				action: 'List room lists',
				description: 'List room list groups for a tenant',
			},
			{
				name: 'List Rooms',
				value: 'listRooms',
				action: 'List rooms',
				description: 'List room mailboxes for a tenant',
			},
		],
		default: 'listRooms',
	},
];

// ══════════════════════════════════════════════════════════════
// Fields
// ══════════════════════════════════════════════════════════════

const listOps = ['listRooms', 'listRoomLists', 'listEquipment'];
const allOps = [
	'addEquipment', 'addRoom', 'addRoomList',
	'editEquipment', 'editRoom', 'editRoomList',
	'listEquipment', 'listRoomLists', 'listRooms',
];

export const exchangeResourceFields: INodeProperties[] = [
	// ── Shared tenant field for all operations ──
	tenantField(resource, allOps),
	returnAllField(resource, listOps),
	limitField(resource, listOps),

	// ══════════════════════════════════════════════════════════════
	// List Rooms — filters
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Filters',
		name: 'listRoomsFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: [resource], operation: ['listRooms'] } },
		options: [
			{
				displayName: 'Room ID',
				name: 'roomId',
				type: 'string',
				default: '',
				description: 'Filter by specific room ID',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Add Room Mailbox
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Display Name',
		name: 'displayName',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: [resource], operation: ['addRoom', 'addRoomList', 'addEquipment'] } },
		default: '',
		description: 'Display name for the mailbox or room list',
	},
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: [resource], operation: ['addRoom', 'addRoomList', 'addEquipment'] } },
		default: '',
		description: 'Username (alias) for the mailbox or room list',
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: [resource], operation: ['addRoom', 'addEquipment'] } },
		default: '',
		description: 'Domain for the mailbox (e.g. contoso.com)',
	},
	{
		displayName: 'Additional Fields',
		name: 'addRoomFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [resource], operation: ['addRoom'] } },
		options: [
			{
				displayName: 'Resource Capacity',
				name: 'ResourceCapacity',
				type: 'string',
				default: '',
				description: 'Room capacity (number of seats)',
			},
			{
				displayName: 'User Principal Name',
				name: 'userPrincipalName',
				type: 'string',
				default: '',
				description: 'Full UPN for the room mailbox (overrides username@domain)',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Edit Room Mailbox
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Room ID',
		name: 'roomId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: [resource], operation: ['editRoom'] } },
		default: '',
		description: 'ID of the room mailbox to edit',
	},
	{
		displayName: 'Room Properties',
		name: 'editRoomFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [resource], operation: ['editRoom'] } },
		options: [
			{
				displayName: 'Audio Device Name',
				name: 'audioDeviceName',
				type: 'string',
				default: '',
				description: 'Name of the audio device in the room',
			},
			{
				displayName: 'Building',
				name: 'building',
				type: 'string',
				default: '',
				description: 'Building name or number',
			},
			{
				displayName: 'Capacity',
				name: 'capacity',
				type: 'number',
				default: 0,
				description: 'Room capacity (number of seats)',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'City of the room location',
			},
			{
				displayName: 'Country or Region',
				name: 'countryOrRegion',
				type: 'string',
				default: '',
				description: 'Country or region of the room location',
			},
			{
				displayName: 'Display Device Name',
				name: 'displayDeviceName',
				type: 'string',
				default: '',
				description: 'Name of the display device in the room',
			},
			{
				displayName: 'Display Name',
				name: 'DisplayName',
				type: 'string',
				default: '',
				description: 'Display name for the room',
			},
			{
				displayName: 'Floor',
				name: 'floor',
				type: 'number',
				default: 0,
				description: 'Floor number',
			},
			{
				displayName: 'Floor Label',
				name: 'floorLabel',
				type: 'string',
				default: '',
				description: 'Floor label or name',
			},
			{
				displayName: 'Hidden From Address Lists',
				name: 'hiddenFromAddressListsEnabled',
				type: 'boolean',
				default: false,
				description: 'Whether the room is hidden from address lists',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number for the room',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
				description: 'Postal/ZIP code',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
				description: 'State or province',
			},
			{
				displayName: 'Street',
				name: 'street',
				type: 'string',
				default: '',
				description: 'Street address',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags',
			},
			{
				displayName: 'User Principal Name',
				name: 'userPrincipalName',
				type: 'string',
				default: '',
				description: 'UPN of the room mailbox',
			},
			{
				displayName: 'Video Device Name',
				name: 'videoDeviceName',
				type: 'string',
				default: '',
				description: 'Name of the video device in the room',
			},
			{
				displayName: 'Wheelchair Accessible',
				name: 'isWheelChairAccessible',
				type: 'boolean',
				default: false,
				description: 'Whether the room is wheelchair accessible',
			},
		],
	},
	{
		displayName: 'Calendar Booking Settings',
		name: 'editRoomBookingFields',
		type: 'collection',
		placeholder: 'Add Setting',
		default: {},
		displayOptions: { show: { resource: [resource], operation: ['editRoom'] } },
		options: [
			{
				displayName: 'Add Organizer to Subject',
				name: 'AddOrganizerToSubject',
				type: 'boolean',
				default: true,
				description: 'Whether to add the organizer name to the meeting subject',
			},
			{
				displayName: 'Allow Conflicts',
				name: 'AllowConflicts',
				type: 'boolean',
				default: false,
				description: 'Whether to allow conflicting meeting requests',
			},
			{
				displayName: 'Allow Recurring Meetings',
				name: 'AllowRecurringMeetings',
				type: 'boolean',
				default: true,
				description: 'Whether to allow recurring meetings',
			},
			{
				displayName: 'Automate Processing',
				name: 'AutomateProcessing',
				type: 'options',
				options: [
					{ name: 'Auto Accept', value: 'AutoAccept' },
					{ name: 'Auto Update', value: 'AutoUpdate' },
					{ name: 'None', value: 'None' },
				],
				default: 'AutoAccept',
				description: 'How the room processes meeting requests',
			},
			{
				displayName: 'Booking Window (Days)',
				name: 'BookingWindowInDays',
				type: 'number',
				default: 180,
				description: 'Number of days in advance the room can be booked',
			},
			{
				displayName: 'Delete Subject',
				name: 'DeleteSubject',
				type: 'boolean',
				default: true,
				description: 'Whether to delete the meeting subject',
			},
			{
				displayName: 'Enforce Capacity',
				name: 'EnforceCapacity',
				type: 'boolean',
				default: false,
				description: 'Whether to enforce room capacity limits',
			},
			{
				displayName: 'Forward Requests to Delegates',
				name: 'ForwardRequestsToDelegates',
				type: 'boolean',
				default: true,
				description: 'Whether to forward meeting requests to delegates',
			},
			{
				displayName: 'Maximum Duration (Minutes)',
				name: 'MaximumDurationInMinutes',
				type: 'number',
				default: 1440,
				description: 'Maximum meeting duration in minutes',
			},
			{
				displayName: 'Process External Meeting Messages',
				name: 'ProcessExternalMeetingMessages',
				type: 'boolean',
				default: false,
				description: 'Whether to process meeting messages from external senders',
			},
			{
				displayName: 'Remove Canceled Meetings',
				name: 'RemoveCanceledMeetings',
				type: 'boolean',
				default: true,
				description: 'Whether to automatically remove canceled meetings',
			},
			{
				displayName: 'Schedule Only During Work Hours',
				name: 'ScheduleOnlyDuringWorkHours',
				type: 'boolean',
				default: false,
				description: 'Whether to only allow booking during work hours',
			},
			{
				displayName: 'Work Days',
				name: 'WorkDays',
				type: 'string',
				default: '',
				description: 'Work days (e.g. "Monday,Tuesday,Wednesday,Thursday,Friday")',
			},
			{
				displayName: 'Work Hours End Time',
				name: 'WorkHoursEndTime',
				type: 'string',
				default: '',
				description: 'Work hours end time (e.g. "17:00:00")',
			},
			{
				displayName: 'Work Hours Start Time',
				name: 'WorkHoursStartTime',
				type: 'string',
				default: '',
				description: 'Work hours start time (e.g. "08:00:00")',
			},
			{
				displayName: 'Working Hours Time Zone',
				name: 'WorkingHoursTimeZone',
				type: 'string',
				default: '',
				description: 'Time zone for work hours (e.g. "Pacific Standard Time")',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// List Room Lists — filters
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Filters',
		name: 'listRoomListsFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: [resource], operation: ['listRoomLists'] } },
		options: [
			{
				displayName: 'Group ID',
				name: 'groupID',
				type: 'string',
				default: '',
				description: 'Filter by room list group ID',
			},
			{
				displayName: 'Members',
				name: 'members',
				type: 'string',
				default: '',
				description: 'Include member information',
			},
			{
				displayName: 'Owners',
				name: 'owners',
				type: 'string',
				default: '',
				description: 'Include owner information',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Add Room List
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Primary Domain',
		name: 'primDomain',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: [resource], operation: ['addRoomList'] } },
		default: '',
		description: 'Primary domain for the room list (e.g. contoso.com)',
	},

	// ══════════════════════════════════════════════════════════════
	// Edit Room List
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: [resource], operation: ['editRoomList'] } },
		default: '',
		description: 'ID of the room list group to edit',
	},
	{
		displayName: 'Properties',
		name: 'editRoomListFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [resource], operation: ['editRoomList'] } },
		options: [
			{
				displayName: 'Add Member',
				name: 'AddMember',
				type: 'string',
				default: '',
				description: 'Comma-separated list of members to add',
			},
			{
				displayName: 'Add Owner',
				name: 'AddOwner',
				type: 'string',
				default: '',
				description: 'Comma-separated list of owners to add',
			},
			{
				displayName: 'Allow External',
				name: 'allowExternal',
				type: 'boolean',
				default: false,
				description: 'Whether to allow external senders',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the room list',
			},
			{
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
				description: 'Display name for the room list',
			},
			{
				displayName: 'Mail Nickname',
				name: 'mailNickname',
				type: 'string',
				default: '',
				description: 'Mail nickname (alias) for the room list',
			},
			{
				displayName: 'Remove Member',
				name: 'RemoveMember',
				type: 'string',
				default: '',
				description: 'Comma-separated list of members to remove',
			},
			{
				displayName: 'Remove Owner',
				name: 'RemoveOwner',
				type: 'string',
				default: '',
				description: 'Comma-separated list of owners to remove',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// List Equipment — filters
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Filters',
		name: 'listEquipmentFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: [resource], operation: ['listEquipment'] } },
		options: [
			{
				displayName: 'Equipment ID',
				name: 'EquipmentId',
				type: 'string',
				default: '',
				description: 'Filter by specific equipment ID',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Add Equipment Mailbox
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Additional Fields',
		name: 'addEquipmentFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [resource], operation: ['addEquipment'] } },
		options: [
			{
				displayName: 'User Principal Name',
				name: 'userPrincipalName',
				type: 'string',
				default: '',
				description: 'Full UPN for the equipment mailbox (overrides username@domain)',
			},
		],
	},

	// ══════════════════════════════════════════════════════════════
	// Edit Equipment Mailbox
	// ══════════════════════════════════════════════════════════════
	{
		displayName: 'Equipment ID',
		name: 'equipmentId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: [resource], operation: ['editEquipment'] } },
		default: '',
		description: 'ID of the equipment mailbox to edit',
	},
	{
		displayName: 'Equipment Properties',
		name: 'editEquipmentFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [resource], operation: ['editEquipment'] } },
		options: [
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'City of the equipment location',
			},
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				description: 'Company name',
			},
			{
				displayName: 'Country or Region',
				name: 'countryOrRegion',
				type: 'string',
				default: '',
				description: 'Country or region of the equipment location',
			},
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
				description: 'Department the equipment belongs to',
			},
			{
				displayName: 'Display Name',
				name: 'DisplayName',
				type: 'string',
				default: '',
				description: 'Display name for the equipment',
			},
			{
				displayName: 'Hidden From Address Lists',
				name: 'hiddenFromAddressListsEnabled',
				type: 'boolean',
				default: false,
				description: 'Whether the equipment is hidden from address lists',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number for the equipment',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
				description: 'Postal/ZIP code',
			},
			{
				displayName: 'State or Province',
				name: 'stateOrProvince',
				type: 'string',
				default: '',
				description: 'State or province of the equipment location',
			},
			{
				displayName: 'Street Address',
				name: 'streetAddress',
				type: 'string',
				default: '',
				description: 'Street address of the equipment location',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags',
			},
			{
				displayName: 'User Principal Name',
				name: 'userPrincipalName',
				type: 'string',
				default: '',
				description: 'UPN of the equipment mailbox',
			},
		],
	},
	{
		displayName: 'Calendar Booking Settings',
		name: 'editEquipmentBookingFields',
		type: 'collection',
		placeholder: 'Add Setting',
		default: {},
		displayOptions: { show: { resource: [resource], operation: ['editEquipment'] } },
		options: [
			{
				displayName: 'Allow Conflicts',
				name: 'allowConflicts',
				type: 'boolean',
				default: false,
				description: 'Whether to allow conflicting booking requests',
			},
			{
				displayName: 'Allow Recurring Meetings',
				name: 'allowRecurringMeetings',
				type: 'boolean',
				default: true,
				description: 'Whether to allow recurring meetings',
			},
			{
				displayName: 'Automate Processing',
				name: 'automateProcessing',
				type: 'options',
				options: [
					{ name: 'Auto Accept', value: 'AutoAccept' },
					{ name: 'Auto Update', value: 'AutoUpdate' },
					{ name: 'None', value: 'None' },
				],
				default: 'AutoAccept',
				description: 'How the equipment processes booking requests',
			},
			{
				displayName: 'Booking Window (Days)',
				name: 'bookingWindowInDays',
				type: 'number',
				default: 180,
				description: 'Number of days in advance the equipment can be booked',
			},
			{
				displayName: 'Forward Requests to Delegates',
				name: 'forwardRequestsToDelegates',
				type: 'boolean',
				default: true,
				description: 'Whether to forward booking requests to delegates',
			},
			{
				displayName: 'Maximum Duration (Minutes)',
				name: 'maximumDurationInMinutes',
				type: 'number',
				default: 1440,
				description: 'Maximum booking duration in minutes',
			},
			{
				displayName: 'Process External Meeting Messages',
				name: 'processExternalMeetingMessages',
				type: 'boolean',
				default: false,
				description: 'Whether to process meeting messages from external senders',
			},
			{
				displayName: 'Schedule Only During Work Hours',
				name: 'scheduleOnlyDuringWorkHours',
				type: 'boolean',
				default: false,
				description: 'Whether to only allow booking during work hours',
			},
			{
				displayName: 'Work Days',
				name: 'workDays',
				type: 'string',
				default: '',
				description: 'Work days (e.g. "Monday,Tuesday,Wednesday,Thursday,Friday")',
			},
			{
				displayName: 'Work Hours End Time',
				name: 'workHoursEndTime',
				type: 'string',
				default: '',
				description: 'Work hours end time (e.g. "17:00:00")',
			},
			{
				displayName: 'Work Hours Start Time',
				name: 'workHoursStartTime',
				type: 'string',
				default: '',
				description: 'Work hours start time (e.g. "08:00:00")',
			},
			{
				displayName: 'Working Hours Time Zone',
				name: 'workingHoursTimeZone',
				type: 'string',
				default: '',
				description: 'Time zone for work hours (e.g. "Pacific Standard Time")',
			},
		],
	},
];
