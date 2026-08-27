// ai-tools/registry/types.ts
// Shared interfaces for the operation registry.

import type { ISupplyDataFunctions, IDataObject } from 'n8n-workflow';

export interface ParamDef {
	/** API field name if different from tool param name */
	apiName?: string;
	location: 'body' | 'qs' | 'local';
	type: 'string' | 'number' | 'boolean' | 'json';
	required: boolean;
	description: string;
	enumValues?: string[];
}

export interface OperationDef {
	method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
	endpoint: string;
	isWrite: boolean;
	isList: boolean;
	/** How the tenant identifier is sent. field = exact API field name. */
	tenant: { location: 'qs' | 'body' | 'none'; field: string };
	params: Record<string, ParamDef>;
	description: string;
	/** Hardcoded values injected into body/qs regardless of LLM input */
	defaults?: { body?: Record<string, unknown>; qs?: Record<string, unknown> };
	/** Response unwrap path — the key containing the result array (e.g., 'Results', 'value') */
	responseUnwrap?: string;
	/** Custom label for this operation in descriptions (overrides auto-generated) */
	operationLabel?: string;
	/** Post-processing transform applied after API response, before result wrapping.
	 *  Return IDataObject for single-object output, IDataObject[] for list output.
	 *  Receives raw unwrapped results array and any params declared with location 'local'. */
	transform?: (results: IDataObject[], localParams: Record<string, unknown>) => IDataObject | IDataObject[];
}

/** Named alias for the tenant descriptor shape used in both OperationDef and CompositeOperationDef */
export type TenantDef = { location: 'qs' | 'body' | 'none'; field: string };

/**
 * Multi-step composite operation — makes several internal API calls and returns a shaped report.
 * No method/endpoint: dispatch is handled entirely by composite-executor.ts.
 */
export interface CompositeOperationDef {
	isComposite: true;
	isWrite: boolean;
	isList: false;
	/** Used by schema-generator to add tenantFilter param. Use TENANT.qs for single-tenant ops, TENANT.none for cross-tenant sweep. */
	tenant: TenantDef;
	params: Record<string, ParamDef>;
	description: string;
}

/** Union of all operation definition types */
export type AnyOperationDef = OperationDef | CompositeOperationDef;

export interface ResourceConfig {
	label: string;
	description: string;
	operations: Record<string, AnyOperationDef>;
	/**
	 * Custom executor — overrides the generic executor for this entire resource.
	 * Use for resources with non-standard API call patterns (e.g., Graph-routed requests).
	 * Receives stripped params (no n8n metadata), tenant filter, and the operation definition.
	 * Only called for non-composite operations (composites are dispatched before customExecutor).
	 */
	customExecutor?: (
		context: ISupplyDataFunctions,
		operation: string,
		tenantFilter: string,
		params: Record<string, unknown>,
		opDef: OperationDef,
	) => Promise<string>;
}

/** Shorthand helpers for compact param definitions */
export const P = {
	qs: (desc: string, required = false): ParamDef =>
		({ location: 'qs', type: 'string', required, description: desc }),
	qsNum: (desc: string, required = false): ParamDef =>
		({ location: 'qs', type: 'number', required, description: desc }),
	qsBool: (desc: string, required = false): ParamDef =>
		({ location: 'qs', type: 'boolean', required, description: desc }),
	body: (desc: string, required = false): ParamDef =>
		({ location: 'body', type: 'string', required, description: desc }),
	bodyNum: (desc: string, required = false): ParamDef =>
		({ location: 'body', type: 'number', required, description: desc }),
	bodyBool: (desc: string, required = false): ParamDef =>
		({ location: 'body', type: 'boolean', required, description: desc }),
	bodyJson: (desc: string, required = false): ParamDef =>
		({ location: 'body', type: 'json', required, description: desc }),
	bodyEnum: (desc: string, values: string[], required = false): ParamDef =>
		({ location: 'body', type: 'string', required, description: desc, enumValues: values }),
	qsEnum: (desc: string, values: string[], required = false): ParamDef =>
		({ location: 'qs', type: 'string', required, description: desc, enumValues: values }),
	localEnum: (desc: string, values: string[], required = false): ParamDef =>
		({ location: 'local', type: 'string', required, description: desc, enumValues: values }),
	localBool: (desc: string, required = false): ParamDef =>
		({ location: 'local', type: 'boolean', required, description: desc }),
	localNum: (desc: string, required = false): ParamDef =>
		({ location: 'local', type: 'number', required, description: desc }),
} as const;

/** Standard tenant patterns */
export const TENANT = {
	qs: { location: 'qs' as const, field: 'tenantFilter' },
	body: { location: 'body' as const, field: 'tenantFilter' },
	bodyPascal: { location: 'body' as const, field: 'TenantFilter' },
	bodyLower: { location: 'body' as const, field: 'tenantid' },
	bodyLowerAll: { location: 'body' as const, field: 'tenantfilter' },
	bodyTenantID: { location: 'body' as const, field: 'tenantID' },
	bodySelected: { location: 'body' as const, field: 'selectedTenants' },
	bodyTenant: { location: 'body' as const, field: 'tenant' },
	bodyTenantId: { location: 'body' as const, field: 'tenantId' },
	bodyTenantIdPascal: { location: 'body' as const, field: 'TenantId' },
	none: { location: 'none' as const, field: '' },
} as const;

/**
 * Tenant field spellings used across CIPP endpoints. For tenant-scoped
 * operations, only the registry-selected spelling may cross the final request
 * boundary; unregistered aliases must not compete with the trusted selection.
 */
export const TENANT_FIELD_ALIASES = new Set([
	'tenantFilter',
	'TenantFilter',
	'selectedTenants',
	'tenantid',
	'tenantfilter',
	'tenantID',
	'tenant',
	'tenantId',
	'TenantId',
]);

// ── Shared constants ────────────────────────────────────────────────

/** n8n framework metadata fields to strip from all tool invocations */
export const N8N_METADATA_FIELDS = new Set([
	'sessionId', 'action', 'chatInput',
	'root',  // canvas UUID
	'tool', 'toolName', 'toolCallId',
	'operation',  // stripped by func(), but defense-in-depth for execute() path
	'resource',   // only in execute() path
]);

/** Operation names that are considered write/mutating */
export function isWriteOperation(opName: string, resourceConfig: ResourceConfig): boolean {
	return resourceConfig.operations[opName]?.isWrite ?? false;
}
