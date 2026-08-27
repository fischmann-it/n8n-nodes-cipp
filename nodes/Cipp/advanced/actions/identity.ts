import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { cippApiRequest, getTenantFilter, listWithSlice } from '../GenericFunctions';
export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};
	const tenantFilter = getTenantFilter(context, i);
	if (operation === 'listOrg') {
		responseData = await listWithSlice(context, i, 'GET', '/api/ListOrg', {}, { tenantFilter });
	} else if (operation === 'listPartnerRelationships') {
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListPartnerRelationships',
			{},
			{ tenantFilter },
		);
	} else if (operation === 'listDirectoryObjects') {
		const filters = context.getNodeParameter('directoryObjectsFilters', i, {}) as IDataObject;
		const body: IDataObject = { tenantFilter };
		if (filters.ids) body.ids = filters.ids;
		if (filters.asApp) body.asApp = filters.asApp;
		if (filters.partnerLookup) body.partnerLookup = filters.partnerLookup;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ListDirectoryObjects',
			body,
			{},
		);
	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}
	return responseData;
}
