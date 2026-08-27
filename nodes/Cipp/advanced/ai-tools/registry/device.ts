import type { ResourceConfig } from './types';
import { P, TENANT } from './types';

export const resourceConfig: ResourceConfig = {
	label: 'Device',
	description: 'Manage Intune devices, actions, keys, and detected apps',
	operations: {
		getAll: {
			method: 'GET',
			endpoint: '/api/ListDevices',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {},
			description: 'List all devices',
		},
		manage: {
			method: 'POST',
			endpoint: '/api/ExecDeviceDelete',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				ID: P.body('Device ID', true),
				managementAction: {
					...P.bodyEnum('Management action', ['Enable', 'Disable', 'Delete'], true),
					apiName: 'action',
				},
			},
			description: 'Manage device (enable, disable, or delete)',
		},
		executeAction: {
			method: 'POST',
			endpoint: '/api/ExecDeviceAction',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				GUID: P.body('Device GUID', true),
				Action: P.bodyEnum('Device action', ['Rename', 'Wipe', 'Retire', 'Lock', 'Sync', 'Reboot'], true),
				input: P.body('New name (for Rename action)'),
			},
			description: 'Execute action on device',
		},
		getRecoveryKey: {
			method: 'POST',
			endpoint: '/api/ExecGetRecoveryKey',
			isWrite: false,
			isList: false,
			tenant: TENANT.body,
			params: {
				GUID: P.body('Device GUID', true),
				RecoveryKeyType: P.body('Key type'),
			},
			description: 'Get device recovery key',
		},
		getLapsPassword: {
			method: 'POST',
			endpoint: '/api/ExecGetLocalAdminPassword',
			isWrite: false,
			isList: false,
			tenant: TENANT.bodyPascal,
			params: {
				guid: P.body('Device GUID', true),
			},
			description: 'Get local admin password (LAPS)',
		},
		listDetectedApps: {
			method: 'GET',
			endpoint: '/api/ListDetectedApps',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {
				DeviceID: P.qs('Device ID'),
				includeDevices: P.qsBool('Include device list'),
			},
			description: 'List detected apps on devices',
		},
		listDetectedAppDevices: {
			method: 'GET',
			endpoint: '/api/ListDetectedAppDevices',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {
				AppID: P.qs('App ID'),
			},
			description: 'List devices with a detected app',
		},
		getDetails: {
			method: 'GET',
			endpoint: '/api/ListDeviceDetails',
			isWrite: false,
			isList: false,
			tenant: TENANT.qs,
			params: {
				DeviceID: P.qs('Device ID'),
				DeviceName: P.qs('Device name'),
				DeviceSerial: P.qs('Serial number'),
			},
			description: 'Get device details',
		},
		setCloudManaged: {
			method: 'POST',
			endpoint: '/api/ExecSetCloudManaged',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				displayName: P.body('Display name'),
				ID: P.body('Device ID'),
				isCloudManaged: P.body('Cloud managed flag'),
				type: P.body('Type'),
			},
			description: 'Set device as cloud managed',
		},
		setPackageTag: {
			method: 'POST',
			endpoint: '/api/ExecSetPackageTag',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				GUID: P.body('Device GUID'),
				Package: P.body('Package name'),
				Remove: P.bodyBool('Remove tag'),
			},
			description: 'Set or remove package tag on device',
		},
	},
};
