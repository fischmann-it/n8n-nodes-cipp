// ai-tools/tool-executor.ts
// Generic executor — reads from operation registry and calls cippApiRequest.
// Resources with non-standard API patterns provide a customExecutor in their registry config.
import type { ISupplyDataFunctions, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { wrapSuccess, wrapError, ERROR_TYPES, formatApiError } from './error-formatter';
import { RESOURCE_REGISTRY } from './registry';
import { N8N_METADATA_FIELDS, TENANT_FIELD_ALIASES } from './registry/types';
import type { OperationDef } from './registry/types';
import { cippApiRequest } from '../GenericFunctions';
import { executeComposite } from './composite-executor';
import {
	buildGraphRequestQuery,
	extractGraphPage,
	GRAPH_MAX_PAGES_DEFAULT,
	GRAPH_REQUEST_TIMEOUT_MS,
	paginateGraphRequest,
	parseGraphMaxPages,
	withGraphRequestDeadline,
} from '../../GraphRequestUtils';

const N8N_METADATA_PREFIXES = ['Prompt__'];

/**
 * Execute a CIPP AI tool operation using the registry.
 * Called from both func() (MCP Trigger path) and execute() (AI Agent path).
 */
export async function executeAiTool(
	context: ISupplyDataFunctions,
	resource: string,
	operation: string,
	rawParams: Record<string, unknown>,
): Promise<string> {
	// Strip n8n framework metadata at entry — before any routing
	const params: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(rawParams)) {
		if (N8N_METADATA_FIELDS.has(key)) continue;
		if (N8N_METADATA_PREFIXES.some((p) => key.startsWith(p))) continue;
		params[key] = value;
	}

	// Look up resource in registry
	const resourceConfig = RESOURCE_REGISTRY[resource];
	if (!resourceConfig) {
		return JSON.stringify(wrapError(resource, operation, ERROR_TYPES.INVALID_OPERATION,
			`Unknown resource: ${resource}`,
			'Check available resources and try again.'));
	}

	const opDef = resourceConfig.operations[operation];
	if (!opDef) {
		const validOps = Object.keys(resourceConfig.operations);
		return JSON.stringify(wrapError(resource, operation, ERROR_TYPES.INVALID_OPERATION,
			`Unknown operation: ${operation}`,
			`Use one of: ${validOps.join(', ')}`));
	}

	// Extract tenantFilter from params (LLM provides it as 'tenantFilter')
	const tenantFilter = typeof params.tenantFilter === 'string' ? params.tenantFilter.trim() : '';
	delete params.tenantFilter;
	if (opDef.tenant.location !== 'none' && !tenantFilter) {
		return JSON.stringify(wrapError(resource, operation, ERROR_TYPES.MISSING_REQUIRED_FIELD,
			"Required parameter 'tenantFilter' is missing.",
			"Provide 'tenantFilter': the tenant domain or default domain name to target."));
	}

	// `limit` is framework output truncation only for list operations. Non-list
	// endpoints may define their own business/API parameter named `limit`.
	let resultLimit = 25;
	if (opDef.isList) {
		resultLimit = typeof params.limit === 'number' ? params.limit
			: typeof params.limit === 'string' ? parseInt(params.limit as string, 10) || 25
			: 25;
		delete params.limit;
	}

	// Extract failMode — must happen before param mapping so it isn't serialised into API calls
	const failMode = ((params.failMode as string) ?? 'bestEffort') as 'fast' | 'bestEffort';
	delete params.failMode;

	// Check required params
	for (const [paramName, paramDef] of Object.entries(opDef.params)) {
		if (paramDef.required && (params[paramName] === undefined || params[paramName] === '')) {
			return JSON.stringify(wrapError(resource, operation, ERROR_TYPES.MISSING_REQUIRED_FIELD,
				`Required parameter '${paramName}' is missing.`,
				`Provide '${paramName}': ${paramDef.description}`));
		}
		if (
			paramDef.enumValues &&
			params[paramName] !== undefined &&
			!paramDef.enumValues.includes(String(params[paramName]))
		) {
			return JSON.stringify(wrapError(resource, operation, ERROR_TYPES.VALIDATION_ERROR,
				`Parameter '${paramName}' must be one of: ${paramDef.enumValues.join(', ')}.`,
				`Retry with a valid '${paramName}' value for the '${operation}' operation.`));
		}
	}

	// Dispatch composite operations before generic HTTP path — composites make multiple internal calls
	if ('isComposite' in opDef && opDef.isComposite) {
		return executeComposite(context, resource, operation, tenantFilter, params, failMode);
	}

	// After composite guard: opDef is a regular OperationDef from here on
	const regularOpDef = opDef as OperationDef;

	// Graph Request has query parsing and explicit bounded pagination semantics
	// shared with the regular CIPP node. Keep this before custom/generic dispatch
	// so embedded OData is never forwarded as part of Endpoint.
	if (resource === 'tools' && operation === 'graphRequest') {
		try {
			const endpoint = typeof params.Endpoint === 'string' ? params.Endpoint : '';
			const graphOptions: IDataObject = {};
			const optionMappings: Array<[string, string]> = [
				['$select', 'select'],
				['$filter', 'filter'],
				['$orderby', 'orderby'],
				['$search', 'search'],
				['$expand', 'expand'],
				['$format', 'format'],
				['$top', 'top'],
				['$count', 'count'],
			];
			for (const [paramName, optionName] of optionMappings) {
				const value = params[paramName];
				if (value !== undefined && value !== null && value !== '') graphOptions[optionName] = value;
			}

			const returnAll = params.returnAll === true || params.returnAll === 'true';

			const query = buildGraphRequestQuery(tenantFilter, endpoint, graphOptions);
			if (!returnAll) {
				query.manualPagination = true;
				query.NoPagination = true;
				const response = await withGraphRequestDeadline(
					async () => await cippApiRequest.call(
						context as unknown as IExecuteFunctions,
						'GET',
						regularOpDef.endpoint,
						{},
						query,
					),
					GRAPH_REQUEST_TIMEOUT_MS,
				);
				const items = extractGraphPage(response).items;
				return JSON.stringify(wrapSuccess(resource, operation, { items, count: items.length }));
			}

			const maxPages = parseGraphMaxPages(params.maxPages ?? GRAPH_MAX_PAGES_DEFAULT);
			const items = await paginateGraphRequest(
				query,
				async (pageQuery) => await cippApiRequest.call(
					context as unknown as IExecuteFunctions,
					'GET',
					regularOpDef.endpoint,
					{},
					pageQuery,
				),
				{ maxPages },
			);

			return JSON.stringify(wrapSuccess(resource, operation, {
				items,
				count: items.length,
			}));
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			return JSON.stringify(formatApiError(msg, resource, operation));
		}
	}

	// Delegate to customExecutor if the resource provides one (e.g., teamsShift Graph routing)
	if (resourceConfig.customExecutor) {
		return resourceConfig.customExecutor(context, operation, tenantFilter, params, regularOpDef);
	}

	// ── Generic execution path ──────────────────────────────────────
	try {
		const body: IDataObject = {};
		const qs: IDataObject = {};

		// Extract local (post-processing) params — not sent to API
		const localParams: Record<string, unknown> = {};
		for (const [paramName, paramDef] of Object.entries(regularOpDef.params)) {
			if (paramDef.location === 'local' && params[paramName] !== undefined) {
				localParams[paramName] = params[paramName];
				delete params[paramName];
			}
		}

		// Merge hardcoded defaults first (before param mapping so params can override)
		if (regularOpDef.defaults?.body) Object.assign(body, regularOpDef.defaults.body);
		if (regularOpDef.defaults?.qs) Object.assign(qs, regularOpDef.defaults.qs);

		// Add tenant filter to the correct location
		if (regularOpDef.tenant.location === 'qs' && tenantFilter) {
			qs[regularOpDef.tenant.field] = tenantFilter;
		} else if (regularOpDef.tenant.location === 'body' && tenantFilter) {
			body[regularOpDef.tenant.field] = tenantFilter;
		}

		// Map params to body/qs based on registry
		for (const [paramName, paramDef] of Object.entries(regularOpDef.params)) {
			const value = params[paramName];
			if (value === undefined || value === null || value === '') continue;
			if (paramDef.location === 'local') continue;

			const apiName = paramDef.apiName ?? paramName;
			let processedValue = value;

			// Type coercion
			if (paramDef.type === 'json' && typeof value === 'string') {
				try { processedValue = JSON.parse(value as string); }
				catch { /* pass as-is */ }
			}
			if (paramDef.type === 'number' && typeof value === 'string') {
				const parsed = Number(value);
				if (!isNaN(parsed)) processedValue = parsed;
			}
			if (paramDef.type === 'boolean' && typeof value === 'string') {
				processedValue = value === 'true' || value === '1';
			}

			if (paramDef.location === 'qs') {
				qs[apiName] = processedValue as string | number | boolean;
			} else {
				body[apiName] = processedValue;
			}
		}

		// Spread remaining params into body (handles optional fields not in registry)
		for (const [key, value] of Object.entries(params)) {
			if (key in regularOpDef.params) continue;
			if (
				regularOpDef.tenant.location !== 'none' &&
				TENANT_FIELD_ALIASES.has(key)
			) continue;
			if (value !== undefined && value !== null && value !== '') {
				body[key] = value;
			}
		}

		// Re-establish the trusted tenant at the final request boundary. Remove
		// every alternate spelling first so an endpoint cannot prefer an
		// unregistered alias supplied by the caller.
		if (regularOpDef.tenant.location !== 'none') {
			for (const alias of TENANT_FIELD_ALIASES) {
				delete body[alias];
				delete qs[alias];
			}
			const tenantTarget = regularOpDef.tenant.location === 'body' ? body : qs;
			tenantTarget[regularOpDef.tenant.field] = tenantFilter;
		}

		// Execute the API call
		let result: IDataObject | IDataObject[];

		if (regularOpDef.isList) {
			result = await cippApiRequest.call(
				context as unknown as IExecuteFunctions,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				regularOpDef.method as any,
				regularOpDef.endpoint,
				Object.keys(body).length > 0 ? body : {},
				qs,
			);

			// Unwrap response — use per-operation config or standard wrappers
			if (result && !Array.isArray(result)) {
				const obj = result as IDataObject;
				if (regularOpDef.responseUnwrap && Array.isArray(obj[regularOpDef.responseUnwrap])) {
					result = obj[regularOpDef.responseUnwrap] as IDataObject[];
				} else if (Array.isArray(obj.Results)) {
					result = obj.Results as IDataObject[];
				} else if (Array.isArray(obj.value)) {
					result = obj.value as IDataObject[];
				} else {
					result = [obj];
				}
			}

			const arr = Array.isArray(result) ? result : [];

			// Apply post-processing transform if defined (e.g. getSecureScore output modes)
			if (regularOpDef.transform) {
				const transformed = regularOpDef.transform(arr, localParams);
				if (Array.isArray(transformed)) {
					const items = (transformed as IDataObject[]).slice(0, resultLimit);
					return JSON.stringify(wrapSuccess(resource, operation, { items, count: items.length }));
				}
				return JSON.stringify(wrapSuccess(resource, operation, transformed));
			}

			const hasFilters = Object.keys(qs).some((k) => k !== regularOpDef.tenant.field) ||
				Object.keys(body).some((k) => k !== regularOpDef.tenant.field);

			// Filtered empty guard — prevents LLM fabrication
			if (arr.length === 0 && hasFilters) {
				const filtersUsed: Record<string, unknown> = {};
				for (const [k, v] of Object.entries(qs)) {
					if (k !== regularOpDef.tenant.field) filtersUsed[k] = v;
				}
				return JSON.stringify(wrapError(resource, operation, ERROR_TYPES.NO_RESULTS_FOUND,
					`No ${resourceConfig.label} records matched the provided filters.`,
					'Broaden your search criteria, check for typos, or verify the record exists.',
					{ filtersUsed }));
			}

			const items = arr.slice(0, resultLimit);
			const resultPayload: Record<string, unknown> = { items, count: items.length };
			if (arr.length > resultLimit) {
				resultPayload.truncated = true;
				resultPayload.totalAvailable = arr.length;
				resultPayload.note = `Results capped at ${resultLimit}. Increase 'limit' or use filters.`;
			}
			return JSON.stringify(wrapSuccess(resource, operation, resultPayload));
		} else {
			result = await cippApiRequest.call(
				context as unknown as IExecuteFunctions,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				regularOpDef.method as any,
				regularOpDef.endpoint,
				Object.keys(body).length > 0 ? body : {},
				Object.keys(qs).length > 0 ? qs : {},
			);

			// Null get guard — prevents LLM hallucination
			const isMissing = result === null
				|| result === undefined
				|| (Array.isArray(result) && result.length === 0)
				|| (typeof result === 'object' && !Array.isArray(result) && Object.keys(result).length === 0);

			if (isMissing && !regularOpDef.isWrite) {
				return JSON.stringify(wrapError(resource, operation, ERROR_TYPES.ENTITY_NOT_FOUND,
					`No ${resourceConfig.label} record found.`,
					`Use cipp_${resource} with a list operation and filters to find the record.`));
			}

			return JSON.stringify(wrapSuccess(resource, operation, result));
		}
	} catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		return JSON.stringify(formatApiError(msg, resource, operation));
	}
}
