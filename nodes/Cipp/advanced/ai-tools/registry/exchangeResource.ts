import type { ResourceConfig } from './types';
import { P, TENANT } from './types';

export const resourceConfig: ResourceConfig = {
	label: 'Exchange Resource',
	description: 'Manage room mailboxes, room lists, and equipment mailboxes',
	operations: {
		listRooms: {
			method: 'GET',
			endpoint: '/api/ListRooms',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {
				roomId: P.qs('Filter by room ID'),
			},
			description: 'List room mailboxes',
		},
		addRoom: {
			method: 'POST',
			endpoint: '/api/AddRoomMailbox',
			isWrite: true,
			isList: false,
			tenant: TENANT.bodyLower,
			params: {
				DisplayName: P.body('Display name', true),
				username: P.body('Username', true),
				domain: P.body('Domain', true),
			},
			description: 'Add room mailbox',
		},
		editRoom: {
			method: 'POST',
			endpoint: '/api/EditRoomMailbox',
			isWrite: true,
			isList: false,
			tenant: TENANT.bodyTenantID,
			params: {
				roomId: P.body('Room ID', true),
				DisplayName: P.body('Display name'),
				capacity: P.bodyNum('Capacity'),
				building: P.body('Building'),
			},
			description: 'Edit room mailbox',
		},
		listRoomLists: {
			method: 'GET',
			endpoint: '/api/ListRoomLists',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {
				groupID: P.qs('Group ID'),
				members: P.qsBool('Include members'),
				owners: P.qsBool('Include owners'),
			},
			description: 'List room lists',
		},
		addRoomList: {
			method: 'POST',
			endpoint: '/api/AddRoomList',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				displayName: P.body('Display name', true),
				username: P.body('Username', true),
				primDomain: P.body('Primary domain', true),
			},
			description: 'Add room list',
		},
		editRoomList: {
			method: 'POST',
			endpoint: '/api/EditRoomList',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				groupId: P.body('Group ID', true),
				displayName: P.body('Display name'),
				description: P.body('Description'),
			},
			description: 'Edit room list',
		},
		listEquipment: {
			method: 'GET',
			endpoint: '/api/ListEquipment',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {
				EquipmentId: P.qs('Equipment ID'),
			},
			description: 'List equipment mailboxes',
		},
		addEquipment: {
			method: 'POST',
			endpoint: '/api/AddEquipmentMailbox',
			isWrite: true,
			isList: false,
			tenant: TENANT.bodyTenantID,
			params: {
				displayName: P.body('Display name', true),
				username: P.body('Username', true),
				domain: P.body('Domain', true),
			},
			description: 'Add equipment mailbox',
		},
		editEquipment: {
			method: 'POST',
			endpoint: '/api/EditEquipmentMailbox',
			isWrite: true,
			isList: false,
			tenant: TENANT.bodyTenantID,
			params: {
				equipmentId: P.body('Equipment ID', true),
				DisplayName: P.body('Display name'),
				department: P.body('Department'),
			},
			description: 'Edit equipment mailbox',
		},
	},
};
