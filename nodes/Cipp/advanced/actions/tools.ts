import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { cippApiRequest, getTenantFilter, listWithSlice } from '../GenericFunctions';
export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};
	if (operation === 'sendTestEmail') {
		const qs: IDataObject = {};
		responseData = await cippApiRequest.call(context, 'GET', '/api/ExecMailTest', {}, qs);
	} else if (operation === 'geoIpLookup') {
		const ip = context.getNodeParameter('ipAddress', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ExecGeoIPLookup',
			{ IP: ip },
			{},
		);
	} else if (operation === 'universalSearch') {
		const qs: IDataObject = {};
		const searchName = context.getNodeParameter('searchName', i, '') as string;
		if (searchName) qs.name = searchName;
		responseData = await cippApiRequest.call(context, 'GET', '/api/ExecUniversalSearch', {}, qs);
	} else if (operation === 'universalSearchV2') {
		const qs: IDataObject = {};
		const v2Options = context.getNodeParameter('universalSearchV2Options', i, {}) as IDataObject;
		if (v2Options.searchTerms) qs.searchTerms = v2Options.searchTerms;
		if (v2Options.type) qs.type = v2Options.type;
		if (v2Options.limit) qs.limit = v2Options.limit;
		responseData = await cippApiRequest.call(context, 'GET', '/api/ExecUniversalSearchV2', {}, qs);
	} else if (operation === 'listAllTenantDeviceCompliance') {
		const tenantFilter = getTenantFilter(context, i);
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListAllTenantDeviceCompliance',
			{},
			{ tenantFilter },
		);
	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}
	return responseData;
}
