import type { ResourceConfig } from './types'
import { P, TENANT } from './types'

export const resourceConfig: ResourceConfig = {
	label: 'Backup',
	description: 'Manage CIPP backups and auto-backup settings',
	operations: {
		getAll: {
			method: 'GET',
			endpoint: '/api/ExecListBackup',
			isWrite: false,
			isList: true,
			tenant: TENANT.none,
			params: {
				NameOnly: P.qsBool('Return names only'),
				BackupName: P.qs('Filter by backup name'),
				Type: P.qs('Filter by backup type'),
			},
			description: 'List backups',
		},
		run: {
			method: 'GET',
			endpoint: '/api/ExecRunBackup',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {},
			description: 'Run backup now',
		},
		restore: {
			method: 'POST',
			endpoint: '/api/ExecRestoreBackup',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				BackupName: P.body('Backup name to restore', true),
			},
			description: 'Restore backup',
		},
		setAutoBackup: {
			method: 'POST',
			endpoint: '/api/ExecSetCIPPAutoBackup',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				Enabled: P.bodyBool('Enable auto-backup', true),
			},
			description: 'Set auto-backup',
		},
	},
}
