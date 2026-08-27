import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { cippApiRequest, getTenantFilter, listWithSlice, postAction } from '../GenericFunctions';
export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};
	const tenantFilter = getTenantFilter(context, i);
	if (operation === 'deleteSite') {
		const siteOptions = context.getNodeParameter('deleteSiteOptions', i, {}) as IDataObject;
		const body: IDataObject = {};
		if (siteOptions.SiteId) body.SiteId = siteOptions.SiteId;
		responseData = await postAction(context, i, '/api/DeleteSharepointSite', body);
	} else if (operation === 'getAdminUrl') {
		const qs: IDataObject = { tenantFilter };
		const adminUrlOptions = context.getNodeParameter('adminUrlOptions', i, {}) as IDataObject;
		if (adminUrlOptions.ReturnUrl) qs.ReturnUrl = adminUrlOptions.ReturnUrl;
		responseData = await cippApiRequest.call(context, 'GET', '/api/ListSharepointAdminUrl', {}, qs);
	} else if (operation === 'getSharepointQuota') {
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListSharepointQuota',
			{},
			{ tenantFilter },
		);
	} else if (operation === 'getSharepointSettings') {
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListSharepointSettings',
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
