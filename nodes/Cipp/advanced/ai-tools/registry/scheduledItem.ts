import type { ResourceConfig } from './types'
import { P, TENANT } from './types'

export const resourceConfig: ResourceConfig = {
	label: 'Scheduled Item',
	description: 'Manage CIPP scheduled jobs',
	operations: {
		getAll: {
			method: 'POST',
			endpoint: '/api/ListScheduledItems',
			isWrite: false,
			isList: true,
			tenant: TENANT.none,
			params: {
				ShowHidden: P.qsBool('Show hidden items'),
				Name: P.qs('Filter by name'),
			},
			description: 'List scheduled items',
		},
		add: {
			method: 'POST',
			endpoint: '/api/AddScheduledItem',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				Name: P.body('Job name', true),
				command: P.body('CIPP command', true),
				Recurrence: P.body('Recurrence pattern', true),
				parameters: P.bodyJson('Parameters JSON', true),
				postExecution: P.body('Post-execution action'),
				ScheduledTime: P.body('Scheduled time (ISO 8601)'),
			},
			description: 'Add a scheduled item',
		},
		getDetails: {
			method: 'POST',
			endpoint: '/api/ListScheduledItemDetails',
			isWrite: false,
			isList: false,
			tenant: TENANT.none,
			params: {
				RowKey: P.body('Row key'),
			},
			description: 'Get scheduled item details',
		},
		remove: {
			method: 'POST',
			endpoint: '/api/RemoveScheduledItem',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				id: P.body('Item ID', true),
			},
			description: 'Remove a scheduled item',
		},
		triggerBillingRun: {
			method: 'GET',
			endpoint: '/api/ExecSchedulerBillingRun',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {},
			description: 'Trigger a scheduler billing run',
		},
	},
}
