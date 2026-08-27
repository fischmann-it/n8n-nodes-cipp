import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getTenantFilter } from '../GenericFunctions';
import { executeComposite } from '../ai-tools/composite-executor';

export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const failMode = context.getNodeParameter('failMode', i, 'bestEffort') as 'fast' | 'bestEffort';

	let tenantFilter = '';
	let params: Record<string, unknown> = {};

	if (operation === 'licenseAudit') {
		tenantFilter = getTenantFilter(context, i);
		const inactiveDays = context.getNodeParameter('inactiveDays', i, 90) as number;
		params = { inactiveDays };
	} else if (operation === 'securityPosture') {
		tenantFilter = getTenantFilter(context, i);
		params = {};
	} else if (operation === 'becInvestigation') {
		tenantFilter = getTenantFilter(context, i);
		const userId = context.getNodeParameter('userId', i, '') as string;
		const days = context.getNodeParameter('days', i, 30) as number;
		params = { days };
		if (userId) params.userId = userId;
	} else if (operation === 'user360') {
		tenantFilter = getTenantFilter(context, i);
		const userId = context.getNodeParameter('userId', i, '') as string;
		if (!userId) {
			throw new NodeOperationError(context.getNode(), 'User ID or UPN is required for User 360', { itemIndex: i });
		}
		params = { userId };
	} else if (operation === 'crossTenantSweep') {
		// sweepComposite UI field → composite param key
		const composite = context.getNodeParameter('sweepComposite', i) as string;
		const tenantIds = context.getNodeParameter('tenantIds', i, '') as string;
		const maxTenants = context.getNodeParameter('maxTenants', i, 20) as number;
		params = { composite, maxTenants };
		if (tenantIds) params.tenantIds = tenantIds;
		tenantFilter = ''; // crossTenantSweep is not tenant-scoped
	} else {
		throw new NodeOperationError(context.getNode(), `Unknown workflows operation: ${operation}`, { itemIndex: i });
	}

	const resultStr = await executeComposite(context, 'workflows', operation, tenantFilter, params, failMode);
	const result = JSON.parse(resultStr) as IDataObject;
	if (result.success === false) {
		const error = result.error as IDataObject | undefined;
		const message =
			typeof error?.message === 'string'
				? error.message
				: `Composite workflow ${operation} failed`;
		throw new NodeOperationError(context.getNode(), message, { itemIndex: i });
	}
	return result;
}
