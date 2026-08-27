import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { cippApiRequest, getTenantFilter, listWithSlice, postAction } from '../GenericFunctions';
export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};
	const noTenantOps = [
		'listAppsRepository',
		'triggerAppUpload',
		'getAppApproval',
		'listAppApprovalTemplates',
		'deleteAppApprovalTemplate',
		'listAppIds',
		'listExcludedLicenses',
		'excludeLicenses',
		'listPotentialApps',
	];
	const tenantFilter = noTenantOps.includes(operation) ? '' : getTenantFilter(context, i);
	if (operation === 'addWin32Script') {
		const appName = context.getNodeParameter('appName', i) as string;
		const appDescription = context.getNodeParameter('appDescription', i, '') as string;
		const installScript = context.getNodeParameter('installScript', i) as string;
		const uninstallScript = context.getNodeParameter('uninstallScript', i) as string;
		const assignTo = context.getNodeParameter('assignTo', i) as string;
		const win32ScriptOptions = context.getNodeParameter('win32ScriptOptions', i, {}) as IDataObject;
		const body: IDataObject = {
			...win32ScriptOptions,
			selectedTenants: tenantFilter,
			applicationName: appName,
			description: appDescription,
			installScript,
			uninstallScript,
			AssignTo: assignTo,
		};
		if (assignTo === 'customGroup') {
			const customGroups = context.getNodeParameter('customGroupNames', i, '') as string;
			body.CustomGroup = customGroups;
		}
		responseData = await cippApiRequest.call(context, 'POST', '/api/AddWin32ScriptApp', body, {});
	} else if (operation === 'syncVpp') {
		responseData = await postAction(context, i, '/api/ExecSyncVPP', {});
	} else if (operation === 'triggerAppUpload') {
		responseData = await cippApiRequest.call(context, 'GET', '/api/ExecAppUpload', {}, {});
	} else if (operation === 'addMultiTenantApp') {
		const multiTenantOptions = context.getNodeParameter(
			'multiTenantAppOptions',
			i,
			{},
		) as IDataObject;
		const body: IDataObject = { tenantFilter };
		if (multiTenantOptions.AppId) body.AppId = multiTenantOptions.AppId;
		if (multiTenantOptions.configMode) body.configMode = multiTenantOptions.configMode;
		if (multiTenantOptions.CopyPermissions)
			body.CopyPermissions = multiTenantOptions.CopyPermissions;
		if (multiTenantOptions.permissions) body.permissions = multiTenantOptions.permissions;
		if (multiTenantOptions.selectedTemplate)
			body.selectedTemplate = multiTenantOptions.selectedTemplate;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ExecAddMultiTenantApp',
			body,
			{},
		);
	} else if (operation === 'getAppApproval') {
		const qs: IDataObject = {};
		const approvalOptions = context.getNodeParameter('appApprovalOptions', i, {}) as IDataObject;
		if (approvalOptions.ApplicationId) qs.ApplicationId = approvalOptions.ApplicationId;
		responseData = await cippApiRequest.call(context, 'GET', '/api/ExecAppApproval', {}, qs);
	} else if (operation === 'createAppTemplate') {
		const createTemplateOptions = context.getNodeParameter(
			'createAppTemplateOptions',
			i,
			{},
		) as IDataObject;
		const body: IDataObject = { TenantFilter: tenantFilter };
		if (createTemplateOptions.AppId) body.AppId = createTemplateOptions.AppId;
		if (createTemplateOptions.DisplayName) body.DisplayName = createTemplateOptions.DisplayName;
		if (createTemplateOptions.Overwrite) body.Overwrite = createTemplateOptions.Overwrite;
		if (createTemplateOptions.Type) body.Type = createTemplateOptions.Type;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ExecCreateAppTemplate',
			body,
			{},
		);
	} else if (operation === 'listAppApprovalTemplates') {
		const returnAll = context.getNodeParameter('returnAll', i) as boolean;
		const result = await cippApiRequest.call(
			context,
			'GET',
			'/api/ListAppApprovalTemplates',
			{},
			{},
		);
		if (!Array.isArray(result) && result !== null && typeof result === 'object') {
			const obj = result as IDataObject;
			if (obj.error || obj.Error) {
				throw new NodeOperationError(context.getNode(), (obj.error || obj.Error) as string, {
					itemIndex: i,
				});
			}
		}
		const items = Array.isArray(result) ? result : [result as IDataObject];
		if (returnAll) {
			responseData = items;
		} else {
			const limit = context.getNodeParameter('limit', i) as number;
			responseData = items.slice(0, limit);
		}
	} else if (operation === 'deleteAppApprovalTemplate') {
		const body: IDataObject = {};
		const templateFields = context.getNodeParameter('deleteTemplateFields', i, {}) as IDataObject;
		if (templateFields.Action) body.Action = templateFields.Action;
		if (templateFields.TemplateId) body.TemplateId = templateFields.TemplateId;
		if (templateFields.TemplateName) body.TemplateName = templateFields.TemplateName;
		responseData = await cippApiRequest.call(
			context,
			'DELETE',
			'/api/ExecAppApprovalTemplate',
			body,
			{},
		);
	} else if (operation === 'listAppIds') {
		const method = context.getNodeParameter('appIdMethod', i, 'GET') as string;
		responseData = await cippApiRequest.call(
			context,
			method as 'GET' | 'POST',
			'/api/ExecListAppId',
			{},
			{},
		);
	} else if (operation === 'patchApplication') {
		const body: IDataObject = { tenantFilter };
		const patchFields = context.getNodeParameter('patchApplicationFields', i, {}) as IDataObject;
		if (patchFields.Action) body.Action = patchFields.Action;
		if (patchFields.AppId) body.AppId = patchFields.AppId;
		if (patchFields.Id) body.Id = patchFields.Id;
		if (patchFields.KeyIds) body.KeyIds = patchFields.KeyIds;
		if (patchFields.Payload) body.Payload = patchFields.Payload;
		if (patchFields.Type) body.Type = patchFields.Type;
		responseData = await cippApiRequest.call(context, 'PATCH', '/api/ExecApplication', body, {});
	} else if (operation === 'listExcludedLicenses') {
		responseData = await listWithSlice(context, i, 'GET', '/api/ListExcludedLicenses', {}, {});
	} else if (operation === 'excludeLicenses') {
		const body: IDataObject = {};
		const excludeFields = context.getNodeParameter('excludeLicenseFields', i, {}) as IDataObject;
		if (excludeFields.Action) body.Action = excludeFields.Action;
		if (excludeFields.FullReset) body.FullReset = excludeFields.FullReset;
		if (excludeFields.GUID) body.GUID = excludeFields.GUID;
		if (excludeFields.SKUName) body.SKUName = excludeFields.SKUName;
		responseData = await cippApiRequest.call(context, 'POST', '/api/ExecExcludeLicenses', body, {});
	} else if (operation === 'listPotentialApps') {
		const body: IDataObject = {};
		const potentialAppFields = context.getNodeParameter('potentialAppFields', i, {}) as IDataObject;
		if (potentialAppFields.applicationName)
			body.applicationName = potentialAppFields.applicationName;
		if (potentialAppFields.searchQuery) body.searchQuery = potentialAppFields.searchQuery;
		if (potentialAppFields.SearchString) body.SearchString = potentialAppFields.SearchString;
		if (potentialAppFields.type) body.type = potentialAppFields.type;
		const returnAll = context.getNodeParameter('returnAll', i) as boolean;
		const result = await cippApiRequest.call(context, 'POST', '/api/ListPotentialApps', body, {});
		if (!Array.isArray(result) && result !== null && typeof result === 'object') {
			const obj = result as IDataObject;
			if (obj.error || obj.Error) {
				throw new NodeOperationError(context.getNode(), (obj.error || obj.Error) as string, {
					itemIndex: i,
				});
			}
		}
		const items = Array.isArray(result) ? result : [result as IDataObject];
		if (returnAll) {
			responseData = items;
		} else {
			const limit = context.getNodeParameter('limit', i) as number;
			responseData = items.slice(0, limit);
		}
	} else if (operation === 'listAppsRepository') {
		const filters = context.getNodeParameter('repoFilters', i, {}) as IDataObject;
		const body: IDataObject = {};
		if (filters.Search) body.Search = filters.Search;
		if (filters.Repository) body.Repository = filters.Repository;
		const returnAll = context.getNodeParameter('returnAll', i) as boolean;
		const result = await cippApiRequest.call(context, 'POST', '/api/ListAppsRepository', body, {});
		if (!Array.isArray(result) && result !== null && typeof result === 'object') {
			const obj = result as IDataObject;
			if (obj.error || obj.Error) {
				throw new NodeOperationError(context.getNode(), (obj.error || obj.Error) as string, {
					itemIndex: i,
				});
			}
		}
		const items = Array.isArray(result) ? result : [result as IDataObject];
		if (returnAll) {
			responseData = items;
		} else {
			const limit = context.getNodeParameter('limit', i) as number;
			responseData = items.slice(0, limit);
		}
	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}
	return responseData;
}
