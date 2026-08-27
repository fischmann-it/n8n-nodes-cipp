import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	cippApiRequest,
	getTenantFilter,
	listWithSlice,
	parseJsonObjectPayload,
} from '../GenericFunctions';

export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {

	// ══════════════════════════════════════════════════════════════
	// Diagnostics
	// ══════════════════════════════════════════════════════════════

	if (operation === 'getVersion') {
		const fields = context.getNodeParameter('versionFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (fields.LocalVersion) qs.LocalVersion = fields.LocalVersion;
		return cippApiRequest.call(context, 'GET', '/api/GetVersion', {}, qs);
	}

	if (operation === 'getAppStatus') {
		const tenantFilter = getTenantFilter(context, i);
		const filters = context.getNodeParameter('appStatusFilters', i, {}) as IDataObject;
		const qs: IDataObject = { tenantFilter };
		if (filters.AppFilter) qs.AppFilter = filters.AppFilter;
		return listWithSlice(context, i, 'GET', '/api/ListAppStatus', {}, qs);
	}

	if (operation === 'getExternalTenantInfo') {
		const tenant = context.getNodeParameter('tenant', i) as string;
		return cippApiRequest.call(context, 'GET', '/api/ListExternalTenantInfo', {}, { tenant });
	}

	if (operation === 'testFunction') {
		return cippApiRequest.call(context, 'GET', '/api/ListGenericTestFunction');
	}

	if (operation === 'manageDurableFunctions') {
		const fields = context.getNodeParameter('durableFunctionsFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (fields.Action) qs.Action = fields.Action;
		if (fields.PartitionKey) qs.PartitionKey = fields.PartitionKey;
		return cippApiRequest.call(context, 'GET', '/api/ExecDurableFunctions', {}, qs);
	}

	// ══════════════════════════════════════════════════════════════
	// Functions
	// ══════════════════════════════════════════════════════════════

	if (operation === 'execCippFunction') {
		const FunctionName = context.getNodeParameter('FunctionName', i) as string;
		const Parameters = context.getNodeParameter('Parameters', i, '') as string;
		const body: IDataObject = { FunctionName };
		if (Parameters) body.Parameters = Parameters;
		return cippApiRequest.call(context, 'POST', '/api/ExecCippFunction', body);
	}

	if (operation === 'listFunctionParameters') {
		const fields = context.getNodeParameter('functionParamsFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (fields.Compliance) qs.Compliance = fields.Compliance;
		if (fields.Function) qs.Function = fields.Function;
		if (fields.Module) qs.Module = fields.Module;
		return cippApiRequest.call(context, 'GET', '/api/ListFunctionParameters', {}, qs);
	}

	if (operation === 'listFunctionStats') {
		const tenantFilter = getTenantFilter(context, i);
		const filters = context.getNodeParameter('functionStatsFilters', i, {}) as IDataObject;
		const qs: IDataObject = { tenantFilter };
		if (filters.FunctionType) qs.FunctionType = filters.FunctionType;
		if (filters.Interval) qs.Interval = filters.Interval;
		if (filters.Time) qs.Time = filters.Time;
		return listWithSlice(context, i, 'GET', '/api/ListFunctionStats', {}, qs);
	}

	if (operation === 'offloadFunctions') {
		const fields = context.getNodeParameter('offloadFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		const body: IDataObject = {};
		if (fields.Action) qs.Action = fields.Action;
		if (fields.OffloadFunctions !== undefined) body.OffloadFunctions = fields.OffloadFunctions;
		return cippApiRequest.call(context, 'POST', '/api/ExecOffloadFunctions', body, qs);
	}

	// ══════════════════════════════════════════════════════════════
	// GitHub
	// ══════════════════════════════════════════════════════════════

	if (operation === 'execGitHubAction') {
		const Action = context.getNodeParameter('Action', i) as string;
		const fields = context.getNodeParameter('gitHubFields', i, {}) as IDataObject;
		const qs: IDataObject = { Action };
		const body: IDataObject = { Action };
		if (fields.Description) body.Description = fields.Description;
		if (fields.includeforks !== undefined) body.includeforks = fields.includeforks;
		if (fields.orgName) {
			body.orgName = parseJsonObjectPayload(
				context.getNode(), fields.orgName, 'Org Name', i,
			);
		}
		if (fields.policySource) {
			body.policySource = parseJsonObjectPayload(
				context.getNode(), fields.policySource, 'Policy Source', i,
			);
		}
		if (fields.Private !== undefined) body.Private = fields.Private;
		if (fields.repoName) body.repoName = fields.repoName;
		if (fields.searchTerm) {
			body.searchTerm = parseJsonObjectPayload(
				context.getNode(), fields.searchTerm, 'Search Term', i,
			);
		}
		return cippApiRequest.call(context, 'POST', '/api/ExecGitHubAction', body, qs);
	}

	if (operation === 'listGitHubReleaseNotes') {
		const fields = context.getNodeParameter('releaseNotesFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (fields.Owner) qs.Owner = fields.Owner;
		if (fields.Repository) qs.Repository = fields.Repository;
		return cippApiRequest.call(context, 'GET', '/api/ListGitHubReleaseNotes', {}, qs);
	}

	// ══════════════════════════════════════════════════════════════
	// Monitoring
	// ══════════════════════════════════════════════════════════════

	if (operation === 'getCippAlerts') {
		const fields = context.getNodeParameter('cippAlertsFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (fields.localversion) qs.localversion = fields.localversion;
		return listWithSlice(context, i, 'GET', '/api/GetCippAlerts', {}, qs);
	}

	if (operation === 'listLogs') {
		const filters = context.getNodeParameter('logFilters', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (filters.Tenant) qs.Tenant = filters.Tenant;
		if (filters.Severity) qs.Severity = filters.Severity;
		if (filters.StartDate) qs.StartDate = filters.StartDate;
		if (filters.EndDate) qs.EndDate = filters.EndDate;
		if (filters.API) qs.API = filters.API;
		if (filters.User) qs.User = filters.User;
		if (filters.Filter) qs.Filter = filters.Filter;
		if (filters.DateFilter) qs.DateFilter = filters.DateFilter;
		if (filters.logentryid) qs.logentryid = filters.logentryid;
		if (filters.ScheduledTaskId) qs.ScheduledTaskId = filters.ScheduledTaskId;
		if (filters.StandardTemplateId) qs.StandardTemplateId = filters.StandardTemplateId;
		if (filters.ListLogs) qs.ListLogs = filters.ListLogs;
		return listWithSlice(context, i, 'GET', '/api/ListLogs', {}, qs);
	}

	if (operation === 'listKnownIpDb') {
		const tenantFilter = getTenantFilter(context, i);
		return listWithSlice(context, i, 'GET', '/api/ListKnownIPDb', {}, { tenantFilter });
	}

	throw new NodeOperationError(
		context.getNode(), `Unknown operation: ${operation}`, { itemIndex: i },
	);
}
