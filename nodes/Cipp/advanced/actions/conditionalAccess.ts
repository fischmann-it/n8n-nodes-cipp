import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { cippApiRequest, getTenantFilter, parseJsonPayload, postAction } from '../GenericFunctions';
export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};
	if (operation === 'editNamedLocation') {
		// ExecNamedLocation uses query params
		const tenantFilter = getTenantFilter(context, i);
		const namedLocationId = context.getNodeParameter('namedLocationId', i) as string;
		const change = context.getNodeParameter('change', i) as string;
		const input = context.getNodeParameter('input', i, '') as string;
		const qs: IDataObject = {
			tenantFilter,
			namedLocationId,
			change,
		};
		if (input) qs.input = input;
		responseData = await cippApiRequest.call(context, 'POST', '/api/ExecNamedLocation', {}, qs);
	} else if (operation === 'checkPolicy') {
		const userID = context.getNodeParameter('userID', i) as string;
		const additionalFields = context.getNodeParameter('checkPolicyFields', i, {}) as IDataObject;
		const body: IDataObject = { userID };
		// Parse LabelValue JSON fields
		const labelValueFields = [
			'ClientAppType',
			'Country',
			'DevicePlatform',
			'IncludeApplications',
			'SignInRiskLevel',
			'UserRiskLevel',
		];
		for (const field of labelValueFields) {
			if (additionalFields[field]) {
				body[field] = parseJsonPayload(context.getNode(), additionalFields[field], field, i);
			}
		}
		if (additionalFields.IpAddress) body.IpAddress = additionalFields.IpAddress;
		responseData = await postAction(context, i, '/api/ExecCACheck', body);
	} else if (operation === 'addExclusion') {
		const userID = context.getNodeParameter('exclusionUserId', i) as string;
		const policyId = context.getNodeParameter('exclusionPolicyId', i) as string;
		const additionalFields = context.getNodeParameter('exclusionFields', i, {}) as IDataObject;
		const body: IDataObject = {
			UserID: userID,
			PolicyId: policyId,
		};
		// Copy simple fields
		const simpleFields = [
			'EndDate',
			'StartDate',
			'excludeLocationAuditAlerts',
			'ExclusionType',
			'reference',
			'Username',
			'vacation',
			'value',
			'addedFields',
		];
		for (const field of simpleFields) {
			if (additionalFields[field] !== undefined && additionalFields[field] !== '') {
				body[field] = additionalFields[field];
			}
		}
		// Parse JSON array fields
		if (additionalFields.Users) {
			body.Users = parseJsonPayload(context.getNode(), additionalFields.Users, 'Users', i);
		}
		if (additionalFields.postExecution) {
			body.postExecution = parseJsonPayload(
				context.getNode(),
				additionalFields.postExecution,
				'Post Execution',
				i,
			);
		}
		responseData = await postAction(context, i, '/api/ExecCAExclusion', body);
	} else if (operation === 'addServiceExclusion') {
		const guid = context.getNodeParameter('serviceExclusionGuid', i) as string;
		responseData = await postAction(context, i, '/api/ExecCAServiceExclusion', { GUID: guid });
	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}
	return responseData;
}
