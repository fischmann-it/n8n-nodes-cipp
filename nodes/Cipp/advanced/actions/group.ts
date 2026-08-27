import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { listWithSlice, getTenantFilter, cippApiRequest } from '../GenericFunctions';
export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};
	const tenantFilter = getTenantFilter(context, i);
	if (operation === 'addTeam') {
		const groupId = context.getNodeParameter('teamGroupId', i) as string;
		const teamSettings = context.getNodeParameter('teamSettings', i, '') as string;
		const body: IDataObject = {
			TenantFilter: tenantFilter,
			GroupId: groupId,
		};
		if (teamSettings) body.TeamSettings = teamSettings;
		responseData = await cippApiRequest.call(context, 'POST', '/api/AddGroupTeam', body, {});
	} else if (operation === 'addTemplate') {
		const displayname = context.getNodeParameter('templateDisplayName', i) as string;
		const groupType = context.getNodeParameter('templateGroupType', i) as string;
		const templateOptions = context.getNodeParameter('templateOptions', i, {}) as IDataObject;
		const body: IDataObject = {
			displayname,
			groupType,
		};
		if (templateOptions.GUID) body.GUID = templateOptions.GUID;
		if (templateOptions.username) body.username = templateOptions.username;
		if (templateOptions.allowExternal !== undefined)
			body.allowExternal = templateOptions.allowExternal;
		if (templateOptions.subscribeMembers !== undefined)
			body.subscribeMembers = templateOptions.subscribeMembers;
		if (templateOptions.membershipRules) body.membershipRules = templateOptions.membershipRules;
		if (templateOptions.Description) body.Description = templateOptions.Description;
		responseData = await cippApiRequest.call(context, 'POST', '/api/AddGroupTemplate', body, {});
	} else if (operation === 'removeTemplate') {
		const templateId = context.getNodeParameter('templateId', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/RemoveGroupTemplate',
			{ ID: templateId },
			{},
		);
	} else if (operation === 'listTemplates') {
		const options = context.getNodeParameter('listTemplateOptions', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (options.id) qs.id = options.id;
		const result = await cippApiRequest.call(context, 'GET', '/api/ListGroupTemplates', {}, qs);
		if (!Array.isArray(result) && result !== null && typeof result === 'object') {
			const obj = result as IDataObject;
			if (obj.error || obj.Error) {
				throw new NodeOperationError(context.getNode(), (obj.error || obj.Error) as string, {
					itemIndex: i,
				});
			}
		}
		const items = Array.isArray(result) ? result : [result];
		const returnAll = context.getNodeParameter('returnAll', i) as boolean;
		if (returnAll) {
			responseData = items;
		} else {
			const limit = context.getNodeParameter('limit', i) as number;
			responseData = items.slice(0, limit);
		}
	} else if (operation === 'listSenderAuthentication') {
		const options = context.getNodeParameter('senderAuthOptions', i, {}) as IDataObject;
		const qs: IDataObject = { tenantFilter };
		if (options.groupid) qs.groupid = options.groupid;
		if (options.Type) qs.Type = options.Type;
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListGroupSenderAuthentication',
			{},
			qs,
		);
	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}
	return responseData;
}
