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
	if (operation === 'listDetectedApps') {
		const qs: IDataObject = { tenantFilter };
		const opts = context.getNodeParameter('detectedAppsFilters', i, {}) as IDataObject;
		if (opts.DeviceID) qs.DeviceID = opts.DeviceID;
		if (opts.includeDevices) qs.includeDevices = opts.includeDevices;
		responseData = await listWithSlice(context, i, 'GET', '/api/ListDetectedApps', {}, qs);
	} else if (operation === 'listDetectedAppDevices') {
		const qs: IDataObject = { tenantFilter };
		const appId = context.getNodeParameter('appId', i, '') as string;
		if (appId) qs.AppID = appId;
		responseData = await listWithSlice(context, i, 'GET', '/api/ListDetectedAppDevices', {}, qs);
	} else if (operation === 'getDetails') {
		const qs: IDataObject = { tenantFilter };
		const opts = context.getNodeParameter('deviceDetailsFilters', i, {}) as IDataObject;
		if (opts.DeviceID) qs.DeviceID = opts.DeviceID;
		if (opts.DeviceName) qs.DeviceName = opts.DeviceName;
		if (opts.DeviceSerial) qs.DeviceSerial = opts.DeviceSerial;
		responseData = await cippApiRequest.call(context, 'GET', '/api/ListDeviceDetails', {}, qs);
		// ── Cloud Managed / Package Tag ──────────────────────────────────────
	} else if (operation === 'setCloudManaged') {
		const body: IDataObject = {};
		const opts = context.getNodeParameter('cloudManagedOptions', i, {}) as IDataObject;
		if (opts.displayName) body.displayName = opts.displayName;
		if (opts.ID) body.ID = opts.ID;
		if (opts.isCloudManaged) body.isCloudManaged = opts.isCloudManaged;
		if (opts.type) body.type = opts.type;
		responseData = await postAction(context, i, '/api/ExecSetCloudManaged', body);
	} else if (operation === 'setPackageTag') {
		const body: IDataObject = {};
		const opts = context.getNodeParameter('packageTagOptions', i, {}) as IDataObject;
		if (opts.GUID) body.GUID = opts.GUID;
		if (opts.Package) body.Package = opts.Package;
		if (opts.Remove) body.Remove = opts.Remove;
		responseData = await cippApiRequest.call(context, 'POST', '/api/ExecSetPackageTag', body, {});
	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}
	return responseData;
}
