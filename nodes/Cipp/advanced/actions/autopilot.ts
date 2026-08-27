import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { cippApiRequest, getTenantFilter, postAction } from '../GenericFunctions';
export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};
	const tenantFilter = getTenantFilter(context, i);
	if (operation === 'addDevice') {
		const body: IDataObject = {
			TenantFilter: tenantFilter,
		};
		const autopilotData = context.getNodeParameter('autopilotData', i, '') as string;
		if (autopilotData) body.autopilotData = autopilotData;
		const groupname = context.getNodeParameter('groupname', i, '') as string;
		if (groupname) body.Groupname = groupname;
		responseData = (await cippApiRequest.call(context, 'POST', '/api/AddAPDevice', body, {})) as
			| IDataObject
			| IDataObject[];
	} else if (operation === 'addConfig') {
		const body: IDataObject = {
			selectedTenants: tenantFilter,
			DisplayName: context.getNodeParameter('displayName', i) as string,
		};
		const opts = context.getNodeParameter('configOptions', i, {}) as IDataObject;
		if (opts.Description !== undefined) body.Description = opts.Description;
		if (opts.DeviceNameTemplate !== undefined) body.DeviceNameTemplate = opts.DeviceNameTemplate;
		if (opts.languages !== undefined) body.languages = opts.languages;
		if (opts.allowWhiteGlove !== undefined) body.allowWhiteGlove = opts.allowWhiteGlove;
		if (opts.Assignto !== undefined) body.Assignto = opts.Assignto;
		if (opts.Autokeyboard !== undefined) body.Autokeyboard = opts.Autokeyboard;
		if (opts.CollectHash !== undefined) body.CollectHash = opts.CollectHash;
		if (opts.DeploymentMode !== undefined) body.DeploymentMode = opts.DeploymentMode;
		if (opts.HideChangeAccount !== undefined) body.HideChangeAccount = opts.HideChangeAccount;
		if (opts.HidePrivacy !== undefined) body.HidePrivacy = opts.HidePrivacy;
		if (opts.HideTerms !== undefined) body.HideTerms = opts.HideTerms;
		if (opts.NotLocalAdmin !== undefined) body.NotLocalAdmin = opts.NotLocalAdmin;
		responseData = (await cippApiRequest.call(
			context,
			'POST',
			'/api/AddAutopilotConfig',
			body,
			{},
		)) as IDataObject | IDataObject[];
	} else if (operation === 'addEnrollment') {
		const body: IDataObject = {
			selectedTenants: tenantFilter,
		};
		const opts = context.getNodeParameter('enrollmentOptions', i, {}) as IDataObject;
		if (opts.AllowFail !== undefined) body.AllowFail = opts.AllowFail;
		if (opts.AllowReset !== undefined) body.AllowReset = opts.AllowReset;
		if (opts.blockDevice !== undefined) body.blockDevice = opts.blockDevice;
		if (opts.EnableLog !== undefined) body.EnableLog = opts.EnableLog;
		if (opts.InstallWindowsUpdates !== undefined)
			body.InstallWindowsUpdates = opts.InstallWindowsUpdates;
		if (opts.OBEEOnly !== undefined) body.OBEEOnly = opts.OBEEOnly;
		if (opts.ShowProgress !== undefined) body.ShowProgress = opts.ShowProgress;
		if (opts.ErrorMessage !== undefined) body.ErrorMessage = opts.ErrorMessage;
		if (opts.TimeOutInMinutes !== undefined) body.TimeOutInMinutes = opts.TimeOutInMinutes;
		responseData = (await cippApiRequest.call(context, 'POST', '/api/AddEnrollment', body, {})) as
			| IDataObject
			| IDataObject[];
	} else if (operation === 'renameDevice') {
		const body: IDataObject = {};
		const apDeviceId = context.getNodeParameter('apDeviceId', i, '') as string;
		if (apDeviceId) body.deviceId = apDeviceId;
		const serialNumber = context.getNodeParameter('apSerialNumber', i, '') as string;
		if (serialNumber) body.serialNumber = serialNumber;
		body.displayName = context.getNodeParameter('newDisplayName', i) as string;
		responseData = await postAction(context, i, '/api/ExecRenameAPDevice', body);
	} else if (operation === 'setGroupTag') {
		const body: IDataObject = {};
		const apDeviceId = context.getNodeParameter('apDeviceId', i, '') as string;
		if (apDeviceId) body.deviceId = apDeviceId;
		const serialNumber = context.getNodeParameter('apSerialNumber', i, '') as string;
		if (serialNumber) body.serialNumber = serialNumber;
		body.groupTag = context.getNodeParameter('groupTag', i) as string;
		responseData = await postAction(context, i, '/api/ExecSetAPDeviceGroupTag', body);
	} else if (operation === 'removeConfig') {
		const body: IDataObject = {
			ID: context.getNodeParameter('configId', i) as string,
		};
		const opts = context.getNodeParameter('removeConfigOptions', i, {}) as IDataObject;
		if (opts.displayName !== undefined) body.displayName = opts.displayName;
		if (opts.assignments !== undefined) body.assignments = opts.assignments;
		responseData = await postAction(context, i, '/api/RemoveAutopilotConfig', body);
	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}
	return responseData;
}
