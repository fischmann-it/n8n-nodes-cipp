import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	cippApiRequest,
	getTenantFilter,
	listWithSlice,
	parseJsonObjectPayload,
	postAction,
} from '../GenericFunctions';
export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};
	if (operation === 'deployStandards') {
		// Uses `tenant` not `tenantFilter` — cannot use postAction
		const tenantFilter = getTenantFilter(context, i);
		const additionalFields = context.getNodeParameter(
			'deployStandardsFields',
			i,
			{},
		) as IDataObject;
		const body: IDataObject = { tenant: tenantFilter };
		if (additionalFields.standardsJson) {
			const parsed = parseJsonObjectPayload(
				context.getNode(),
				additionalFields.standardsJson,
				'Standards JSON',
				i,
			);
			Object.assign(body, parsed);
		}
		responseData = await cippApiRequest.call(context, 'POST', '/api/AddStandardsDeploy', body, {});
	} else if (operation === 'addStandardsTemplate') {
		const templateName = context.getNodeParameter('templateName', i) as string;
		const additionalFields = context.getNodeParameter(
			'addStandardsTemplateFields',
			i,
			{},
		) as IDataObject;
		const body: IDataObject = { templateName };
		if (additionalFields.createdAt) body.createdAt = additionalFields.createdAt;
		if (additionalFields.GUID) body.GUID = additionalFields.GUID;
		responseData = await postAction(context, i, '/api/AddStandardsTemplate', body);
	} else if (operation === 'runAllStandards') {
		responseData = await cippApiRequest.call(context, 'GET', '/api/CIPPStandardsRun', {}, {});
	} else if (operation === 'convertStandards') {
		responseData = await cippApiRequest.call(context, 'GET', '/api/ExecStandardConvert', {}, {});
		// ── BPA ──
	} else if (operation === 'listBpa') {
		const tenantFilter = getTenantFilter(context, i);
		const filters = context.getNodeParameter('listBpaFilters', i, {}) as IDataObject;
		const qs: IDataObject = { tenantFilter };
		if (filters.Report) qs.Report = filters.Report;
		responseData = await listWithSlice(context, i, 'GET', '/api/ListBPA', {}, qs);
	} else if (operation === 'listBpaResults') {
		// No params — direct GET
		const returnAll = context.getNodeParameter('returnAll', i) as boolean;
		responseData = await cippApiRequest.call(
			context,
			'GET',
			'/api/BestPracticeAnalyser_List',
			{},
			{},
		);
		if (Array.isArray(responseData) && !returnAll) {
			const limit = context.getNodeParameter('limit', i) as number;
			responseData = responseData.slice(0, limit);
		}
	} else if (operation === 'runBpa') {
		// POST with `tenantfilter` (all lowercase) in body — cannot use postAction
		const tenantFilter = getTenantFilter(context, i);
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ExecBPA',
			{ tenantfilter: tenantFilter },
			{},
		);
	} else if (operation === 'listBpaTemplates') {
		// No tenant — optional RawJson filter
		const returnAll = context.getNodeParameter('returnAll', i) as boolean;
		const filters = context.getNodeParameter('listBpaTemplatesFilters', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (filters.RawJson) qs.RawJson = filters.RawJson;
		responseData = await cippApiRequest.call(context, 'GET', '/api/ListBPATemplates', {}, qs);
		if (Array.isArray(responseData) && !returnAll) {
			const limit = context.getNodeParameter('limit', i) as number;
			responseData = responseData.slice(0, limit);
		}
	} else if (operation === 'addBpaTemplate') {
		// POST, no tenant
		const name = context.getNodeParameter('bpaTemplateName', i) as string;
		const style = context.getNodeParameter('bpaTemplateStyle', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddBPATemplate',
			{ name, style },
			{},
		);
	} else if (operation === 'removeBpaTemplate') {
		// POST, no tenant — uses TemplateName
		const templateName = context.getNodeParameter('bpaRemoveTemplateName', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/RemoveBPATemplate',
			{ TemplateName: templateName },
			{},
		);
		// ── Domain Analyser ──
	} else if (operation === 'runDomainAnalyser') {
		// No params
		responseData = await cippApiRequest.call(context, 'GET', '/api/ExecDomainAnalyser', {}, {});
	} else if (operation === 'getDomainHealth') {
		const domain = context.getNodeParameter('domain', i) as string;
		const additionalFields = context.getNodeParameter('domainHealthFields', i, {}) as IDataObject;
		const qs: IDataObject = { Domain: domain };
		if (additionalFields.Action) qs.Action = additionalFields.Action;
		if (additionalFields.ExpectedInclude) qs.ExpectedInclude = additionalFields.ExpectedInclude;
		if (additionalFields.Record) qs.Record = additionalFields.Record;
		if (additionalFields.Selector) qs.Selector = additionalFields.Selector;
		if (additionalFields.Subdomains) qs.Subdomains = additionalFields.Subdomains;
		const returnAll = context.getNodeParameter('returnAll', i) as boolean;
		responseData = await cippApiRequest.call(context, 'GET', '/api/ListDomainHealth', {}, qs);
		if (Array.isArray(responseData) && !returnAll) {
			const limit = context.getNodeParameter('limit', i) as number;
			responseData = responseData.slice(0, limit);
		}
		// ── Drift ──
	} else if (operation === 'cloneDrift') {
		// POST, no tenant — uses id in body
		const driftId = context.getNodeParameter('driftId', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ExecDriftClone',
			{ id: driftId },
			{},
		);
	} else if (operation === 'compareStandards') {
		const tenantFilter = getTenantFilter(context, i);
		const filters = context.getNodeParameter('compareStandardsFilters', i, {}) as IDataObject;
		const qs: IDataObject = { tenantFilter };
		if (filters.templateId) qs.templateId = filters.templateId;
		responseData = await listWithSlice(context, i, 'GET', '/api/ListStandardsCompare', {}, qs);
	} else if (operation === 'updateDriftDeviation') {
		// POST with TenantFilter (PascalCase) — cannot use postAction
		const tenantFilter = getTenantFilter(context, i);
		const additionalFields = context.getNodeParameter('updateDriftFields', i, {}) as IDataObject;
		const body: IDataObject = { TenantFilter: tenantFilter };
		if (additionalFields.deviations) body.deviations = additionalFields.deviations;
		if (additionalFields.reason) body.reason = additionalFields.reason;
		if (additionalFields.RemoveDriftCustomization) {
			body.RemoveDriftCustomization = additionalFields.RemoveDriftCustomization;
		}
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ExecUpdateDriftDeviation',
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
