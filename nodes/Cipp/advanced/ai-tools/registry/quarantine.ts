import type { ResourceConfig } from './types'
import { P, TENANT } from './types'

export const resourceConfig: ResourceConfig = {
	label: 'Quarantine',
	description: 'Manage quarantined email messages',
	operations: {
		getMany: {
			method: 'GET',
			endpoint: '/api/ListMailQuarantine',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {},
			description: 'List quarantined messages',
		},
		release: {
			method: 'POST',
			endpoint: '/api/ExecQuarantineManagement',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				Identity: P.body('Message identity', true),
				AllowSender: P.body('Allow sender (true/false)'),
			},
			defaults: { body: { Type: 'Release' } },
			description: 'Release a quarantined message',
		},
		deny: {
			method: 'POST',
			endpoint: '/api/ExecQuarantineManagement',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				Identity: P.body('Message identity', true),
			},
			defaults: { body: { Type: 'Deny' } },
			description: 'Deny a quarantined message',
		},
		getMessage: {
			method: 'GET',
			endpoint: '/api/ListMailQuarantineMessage',
			isWrite: false,
			isList: false,
			tenant: TENANT.qs,
			params: {
				Identity: P.qs('Message identity', true),
			},
			description: 'Get a specific quarantined message',
		},
	},
}
