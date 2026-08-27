import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { cippApiRequest, getTenantFilter, parseJsonPayload } from '../GenericFunctions';
export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};
	if (operation === 'getPolicyDetails') {
		const tenantFilter = getTenantFilter(context, i);
		const qs: IDataObject = {};
		const filters = context.getNodeParameter('getPolicyDetailsFilters', i, {}) as IDataObject;
		if (filters.PolicyName) qs.PolicyName = filters.PolicyName;
		if (filters.RuleName) qs.RuleName = filters.RuleName;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ListSafeLinksPolicyDetails',
			{ tenantFilter },
			qs,
		);
	} else if (operation === 'getTemplateDetails') {
		const qs: IDataObject = {};
		const filters = context.getNodeParameter('getTemplateDetailsFilters', i, {}) as IDataObject;
		if (filters.ID) qs.ID = filters.ID;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ListSafeLinksPolicyTemplateDetails',
			{},
			qs,
		);
	} else if (operation === 'createTemplate') {
		const tenantFilter = getTenantFilter(context, i);
		const TemplateName = context.getNodeParameter('templateName', i) as string;
		const body: IDataObject = { tenantFilter, TemplateName };
		const fields = context.getNodeParameter('createTemplateFields', i, {}) as IDataObject;
		assignPolicyFields(body, fields);
		if (fields.TemplateDescription) body.TemplateDescription = fields.TemplateDescription;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/CreateSafeLinksPolicyTemplate',
			body,
			{},
		);
	} else if (operation === 'deployFromTemplate') {
		const tenantFilter = getTenantFilter(context, i);
		const TemplateList = parseJsonPayload(
			context.getNode(),
			context.getNodeParameter('templateList', i) as string,
			'Template List',
			i,
		);
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddSafeLinksPolicyFromTemplate',
			{ selectedTenants: tenantFilter, TemplateList },
			{},
		);
	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}
	return responseData;
}
/**
 * Assigns shared Safe Links policy fields from a collection to the request body.
 * Handles booleans, strings, integers, and array fields.
 */
function assignPolicyFields(body: IDataObject, fields: IDataObject): void {
	// Boolean settings
	for (const key of [
		'EnableSafeLinksForEmail',
		'EnableSafeLinksForTeams',
		'EnableSafeLinksForOffice',
		'TrackClicks',
		'AllowClickThrough',
		'ScanUrls',
		'EnableForInternalSenders',
		'DeliverMessageAfterScan',
		'DisableUrlRewrite',
		'EnableOrganizationBranding',
		'State',
	]) {
		if (fields[key] !== undefined) body[key] = fields[key];
	}
	// String settings
	for (const key of [
		'RuleName',
		'AdminDisplayName',
		'CustomNotificationText',
		'Comments',
		'PolicyName',
	]) {
		if (fields[key]) body[key] = fields[key];
	}
	// Integer settings
	if (fields.Priority !== undefined && fields.Priority !== '') {
		body.Priority = fields.Priority;
	}
	// Comma-separated → array fields (rule scoping)
	for (const key of [
		'DoNotRewriteUrls',
		'SentTo',
		'SentToMemberOf',
		'RecipientDomainIs',
		'ExceptIfSentTo',
		'ExceptIfSentToMemberOf',
		'ExceptIfRecipientDomainIs',
	]) {
		if (fields[key]) {
			const val = fields[key] as string;
			body[key] = val
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
		}
	}
}
