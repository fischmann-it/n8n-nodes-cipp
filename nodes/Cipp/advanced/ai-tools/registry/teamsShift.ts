import type { IExecuteFunctions, IDataObject, ISupplyDataFunctions } from 'n8n-workflow';
import type { ResourceConfig, OperationDef } from './types';
import { P, TENANT } from './types';
import { cippApiRequest } from '../../GenericFunctions';
import { wrapSuccess, wrapError, ERROR_TYPES, formatApiError } from '../error-formatter';

// ── Graph route definitions ──────────────────────────────────────────

interface GraphRoute {
	path: string;
	graphMethod: string;
	bodyBuilder?: (params: Record<string, unknown>) => Record<string, unknown>;
}

function parseJsonSafe(value: unknown): Record<string, unknown> {
	if (typeof value === 'string') {
		try { return JSON.parse(value) as Record<string, unknown>; }
		catch { return {}; }
	}
	return (value as Record<string, unknown>) ?? {};
}

const GRAPH_ROUTES: Record<string, GraphRoute> = {
	listShifts: { path: 'shifts', graphMethod: 'GET' },
	createShift: { path: 'shifts', graphMethod: 'POST', bodyBuilder: (p) => ({
		userId: p.userId as string,
		sharedShift: {
			startDateTime: p.startDateTime, endDateTime: p.endDateTime,
			...(p.displayName ? { displayName: p.displayName } : {}),
			...(p.notes ? { notes: p.notes } : {}),
			...(p.theme ? { theme: p.theme } : {}),
		},
	}) },
	updateShift: { path: 'shifts', graphMethod: 'PUT', bodyBuilder: (p) => parseJsonSafe(p.shiftUpdateData) },
	deleteShift: { path: 'shifts', graphMethod: 'DELETE' },
	listOpenShifts: { path: 'openShifts', graphMethod: 'GET' },
	createOpenShift: { path: 'openShifts', graphMethod: 'POST', bodyBuilder: (p) => ({
		schedulingGroupId: p.schedulingGroupId as string,
		sharedOpenShift: {
			startDateTime: p.startDateTime, endDateTime: p.endDateTime,
			openSlotCount: p.openSlotCount,
			...(p.displayName ? { displayName: p.displayName } : {}),
			...(p.notes ? { notes: p.notes } : {}),
		},
	}) },
	updateOpenShift: { path: 'openShifts', graphMethod: 'PUT', bodyBuilder: (p) => parseJsonSafe(p.openShiftUpdateData) },
	deleteOpenShift: { path: 'openShifts', graphMethod: 'DELETE' },
	listSchedulingGroups: { path: 'schedulingGroups', graphMethod: 'GET' },
	createSchedulingGroup: { path: 'schedulingGroups', graphMethod: 'POST', bodyBuilder: (p) => ({
		displayName: p.displayName as string,
		userIds: (p.userIds as string).split(',').map((s: string) => s.trim()).filter(Boolean),
		isActive: true,
	}) },
	updateSchedulingGroup: { path: 'schedulingGroups', graphMethod: 'PUT', bodyBuilder: (p) => parseJsonSafe(p.schedulingGroupUpdateData) },
	deleteSchedulingGroup: { path: 'schedulingGroups', graphMethod: 'DELETE' },
	listTimeOffReasons: { path: 'timeOffReasons', graphMethod: 'GET' },
	createTimeOffReason: { path: 'timeOffReasons', graphMethod: 'POST', bodyBuilder: (p) => ({
		displayName: p.displayName as string, iconType: p.iconType as string, isActive: true,
	}) },
	updateTimeOffReason: { path: 'timeOffReasons', graphMethod: 'PUT', bodyBuilder: (p) => parseJsonSafe(p.timeOffReasonUpdateData) },
	deleteTimeOffReason: { path: 'timeOffReasons', graphMethod: 'PUT', bodyBuilder: () => ({ isActive: false }) },
	listTimeOffRequests: { path: 'timeOffRequests', graphMethod: 'GET' },
	createTimeOffRequest: { path: 'timeOffRequests', graphMethod: 'POST', bodyBuilder: (p) => ({
		startDateTime: p.startDateTime as string, endDateTime: p.endDateTime as string, timeOffReasonId: p.timeOffReasonId as string,
	}) },
	approveTimeOffRequest: { path: 'timeOffRequests', graphMethod: 'POST', bodyBuilder: (p) => (p.message ? { message: p.message } : {}) },
	declineTimeOffRequest: { path: 'timeOffRequests', graphMethod: 'POST', bodyBuilder: (p) => (p.message ? { message: p.message } : {}) },
	listSwapShiftRequests: { path: 'swapShiftsChangeRequests', graphMethod: 'GET' },
	createSwapShiftRequest: { path: 'swapShiftsChangeRequests', graphMethod: 'POST', bodyBuilder: (p) => ({
		senderShiftId: p.senderShiftId as string, recipientShiftId: p.recipientShiftId as string, recipientUserId: p.recipientUserId as string,
	}) },
	approveSwapShiftRequest: { path: 'swapShiftsChangeRequests', graphMethod: 'POST', bodyBuilder: (p) => (p.message ? { message: p.message } : {}) },
	declineSwapShiftRequest: { path: 'swapShiftsChangeRequests', graphMethod: 'POST', bodyBuilder: (p) => (p.message ? { message: p.message } : {}) },
	listOfferShiftRequests: { path: 'offerShiftRequests', graphMethod: 'GET' },
	createOfferShiftRequest: { path: 'offerShiftRequests', graphMethod: 'POST', bodyBuilder: (p) => ({
		senderShiftId: p.senderShiftId as string, recipientUserId: p.recipientUserId as string,
	}) },
	approveOfferShiftRequest: { path: 'offerShiftRequests', graphMethod: 'POST', bodyBuilder: (p) => (p.message ? { message: p.message } : {}) },
	declineOfferShiftRequest: { path: 'offerShiftRequests', graphMethod: 'POST', bodyBuilder: (p) => (p.message ? { message: p.message } : {}) },
};

// ── Custom executor ──────────────────────────────────────────────────

async function teamsShiftExecutor(
	context: ISupplyDataFunctions,
	operation: string,
	tenantFilter: string,
	params: Record<string, unknown>,
	opDef: OperationDef,
): Promise<string> {
	const route = GRAPH_ROUTES[operation];
	if (!route) {
		return JSON.stringify(wrapError('teamsShift', operation, ERROR_TYPES.INVALID_OPERATION,
			`Unknown teamsShift operation: ${operation}`,
			`Use one of: ${Object.keys(GRAPH_ROUTES).join(', ')}`));
	}

	const teamId = params.teamId as string;
	if (!teamId) {
		return JSON.stringify(wrapError('teamsShift', operation, ERROR_TYPES.MISSING_REQUIRED_FIELD,
			"Required parameter 'teamId' is missing.",
			'Provide the Teams team ID.'));
	}

	// Build Graph endpoint path with ID interpolation
	let graphPath = `teams/${teamId}/schedule/${route.path}`;

	// Append entity IDs for operations targeting specific entities
	const entityIdMap: Record<string, string | undefined> = {
		updateShift: params.shiftId as string,
		deleteShift: params.shiftId as string,
		updateOpenShift: params.openShiftId as string,
		deleteOpenShift: params.openShiftId as string,
		updateSchedulingGroup: params.schedulingGroupId as string,
		deleteSchedulingGroup: params.schedulingGroupId as string,
		updateTimeOffReason: params.timeOffReasonId as string,
		deleteTimeOffReason: params.timeOffReasonId as string,
	};
	const entityId = entityIdMap[operation];
	if (entityId) {
		graphPath = `teams/${teamId}/schedule/${route.path}/${entityId}`;
	}

	// Append action suffix for approve/decline operations
	const actionSuffix: Record<string, string | undefined> = {
		approveTimeOffRequest: 'approve',
		declineTimeOffRequest: 'decline',
		approveSwapShiftRequest: 'approve',
		declineSwapShiftRequest: 'decline',
		approveOfferShiftRequest: 'approve',
		declineOfferShiftRequest: 'decline',
	};
	const suffix = actionSuffix[operation];
	if (suffix) {
		const requestId = params.requestId as string;
		if (!requestId) {
			return JSON.stringify(wrapError('teamsShift', operation, ERROR_TYPES.MISSING_REQUIRED_FIELD,
				"Required parameter 'requestId' is missing.",
				'Provide the request ID.'));
		}
		graphPath = `teams/${teamId}/schedule/${route.path}/${requestId}/${suffix}`;
	}

	// Build ExecGraphRequest payload
	const payload: IDataObject = {
		tenantFilter,
		endpoint: graphPath,
		method: route.graphMethod,
	};

	if (route.bodyBuilder) {
		const graphBody = route.bodyBuilder(params);
		if (graphBody && Object.keys(graphBody).length > 0) {
			payload.body = graphBody;
		}
	}

	try {
		const result = await cippApiRequest.call(
			context as unknown as IExecuteFunctions,
			'POST',
			'/api/ExecGraphRequest',
			payload,
			{},
		);

		if (!opDef.isWrite) {
			const items = Array.isArray(result) ? result
				: (result as IDataObject)?.value ? (result as IDataObject).value as IDataObject[]
				: [result as IDataObject];
			return JSON.stringify(wrapSuccess('teamsShift', operation, { items, count: (items as IDataObject[]).length }));
		}
		return JSON.stringify(wrapSuccess('teamsShift', operation, result));
	} catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		return JSON.stringify(formatApiError(msg, 'teamsShift', operation));
	}
}

// ── Resource config ──────────────────────────────────────────────────

export const resourceConfig: ResourceConfig = {
	label: 'Teams Shift',
	description: 'Manage Teams Shifts (requires custom CIPP-API fork with ExecGraphRequest)',
	customExecutor: teamsShiftExecutor,
	operations: {
		listShifts: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: false,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
			},
			description: 'List shifts (via Graph) (requires custom CIPP-API fork)',
		},
		createShift: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				userId: P.body('User ID', true),
				startDateTime: P.body('Start date-time', true),
				endDateTime: P.body('End date-time', true),
				displayName: P.body('Shift name'),
				notes: P.body('Notes'),
				theme: P.bodyEnum('Theme', ['blue', 'purple', 'pink', 'green', 'orange', 'cyan']),
			},
			description: 'Create shift (requires custom CIPP-API fork)',
		},
		updateShift: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				shiftId: P.body('Shift ID', true),
				shiftUpdateData: P.bodyJson('Update data JSON', true),
			},
			description: 'Update shift (requires custom CIPP-API fork)',
		},
		deleteShift: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				shiftId: P.body('Shift ID', true),
			},
			description: 'Delete shift (requires custom CIPP-API fork)',
		},
		listOpenShifts: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: false,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
			},
			description: 'List open shifts (requires custom CIPP-API fork)',
		},
		createOpenShift: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				schedulingGroupId: P.body('Scheduling group ID', true),
				startDateTime: P.body('Start', true),
				endDateTime: P.body('End', true),
				openSlotCount: P.bodyNum('Open slots', true),
			},
			description: 'Create open shift (requires custom CIPP-API fork)',
		},
		updateOpenShift: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				openShiftId: P.body('Open shift ID', true),
				openShiftUpdateData: P.bodyJson('Update data JSON', true),
			},
			description: 'Update open shift (requires custom CIPP-API fork)',
		},
		deleteOpenShift: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				openShiftId: P.body('Open shift ID', true),
			},
			description: 'Delete open shift (requires custom CIPP-API fork)',
		},
		listSchedulingGroups: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: false,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
			},
			description: 'List scheduling groups (requires custom CIPP-API fork)',
		},
		createSchedulingGroup: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				displayName: P.body('Group name', true),
				userIds: P.body('User IDs (comma-separated)', true),
			},
			description: 'Create scheduling group (requires custom CIPP-API fork)',
		},
		updateSchedulingGroup: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				schedulingGroupId: P.body('Group ID', true),
				schedulingGroupUpdateData: P.bodyJson('Update data JSON', true),
			},
			description: 'Update scheduling group (requires custom CIPP-API fork)',
		},
		deleteSchedulingGroup: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				schedulingGroupId: P.body('Group ID', true),
			},
			description: 'Delete scheduling group (requires custom CIPP-API fork)',
		},
		listTimeOffReasons: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: false,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
			},
			description: 'List time-off reasons (requires custom CIPP-API fork)',
		},
		createTimeOffReason: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				displayName: P.body('Reason name', true),
				iconType: P.body('Icon type', true),
			},
			description: 'Create time-off reason (requires custom CIPP-API fork)',
		},
		updateTimeOffReason: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				timeOffReasonId: P.body('Reason ID', true),
				timeOffReasonUpdateData: P.bodyJson('Update data JSON', true),
			},
			description: 'Update time-off reason (requires custom CIPP-API fork)',
		},
		deleteTimeOffReason: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				timeOffReasonId: P.body('Reason ID', true),
			},
			description: 'Delete time-off reason (requires custom CIPP-API fork)',
		},
		listTimeOffRequests: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: false,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
			},
			description: 'List time-off requests (requires custom CIPP-API fork)',
		},
		createTimeOffRequest: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				startDateTime: P.body('Start', true),
				endDateTime: P.body('End', true),
				timeOffReasonId: P.body('Reason ID', true),
			},
			description: 'Create time-off request (requires custom CIPP-API fork)',
		},
		approveTimeOffRequest: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				requestId: P.body('Request ID', true),
				message: P.body('Approval message'),
			},
			description: 'Approve time-off request (requires custom CIPP-API fork)',
		},
		declineTimeOffRequest: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				requestId: P.body('Request ID', true),
				message: P.body('Decline message'),
			},
			description: 'Decline time-off request (requires custom CIPP-API fork)',
		},
		listSwapShiftRequests: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: false,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
			},
			description: 'List swap shift requests (requires custom CIPP-API fork)',
		},
		createSwapShiftRequest: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				senderShiftId: P.body('Sender shift ID', true),
				recipientShiftId: P.body('Recipient shift ID', true),
				recipientUserId: P.body('Recipient user ID', true),
			},
			description: 'Create swap shift request (requires custom CIPP-API fork)',
		},
		approveSwapShiftRequest: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				requestId: P.body('Request ID', true),
				message: P.body('Message'),
			},
			description: 'Approve swap shift request (requires custom CIPP-API fork)',
		},
		declineSwapShiftRequest: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				requestId: P.body('Request ID', true),
				message: P.body('Message'),
			},
			description: 'Decline swap shift request (requires custom CIPP-API fork)',
		},
		listOfferShiftRequests: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: false,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
			},
			description: 'List offer shift requests (requires custom CIPP-API fork)',
		},
		createOfferShiftRequest: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				senderShiftId: P.body('Sender shift ID', true),
				recipientUserId: P.body('Recipient user ID', true),
			},
			description: 'Create offer shift request (requires custom CIPP-API fork)',
		},
		approveOfferShiftRequest: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				requestId: P.body('Request ID', true),
				message: P.body('Message'),
			},
			description: 'Approve offer shift request (requires custom CIPP-API fork)',
		},
		declineOfferShiftRequest: {
			method: 'POST',
			endpoint: '/api/ExecGraphRequest',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				teamId: P.body('Teams team ID', true),
				requestId: P.body('Request ID', true),
				message: P.body('Message'),
			},
			description: 'Decline offer shift request (requires custom CIPP-API fork)',
		},
	},
};
