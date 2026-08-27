// ai-tools/schema-generator.ts
// Generates Zod schemas dynamically from the operation registry.
// Zod is provided by n8n at runtime so the schema uses the same class identity as
// n8n's AI nodes. Keeping this import type-only prevents a package-local Zod from
// becoming a load-time dependency of the community node.
import type { z } from 'zod';
import type { RuntimeZod } from './runtime';
import type { AnyOperationDef, ParamDef } from './registry';
import { RESOURCE_REGISTRY } from './registry';

const OPERATION_LABELS: Record<string, string> = {
	get: 'Get by ID',
	getAll: 'List all',
	getMany: 'List all',
	add: 'Add/Create',
	edit: 'Edit/Update',
	remove: 'Remove/Delete',
	delete: 'Delete',
	assign: 'Assign',
	sync: 'Sync',
};

function paramToZodField(param: ParamDef, schemaZ: RuntimeZod): z.ZodTypeAny {
	let field: z.ZodTypeAny;

	if (param.enumValues && param.enumValues.length > 0) {
		field = schemaZ.enum(param.enumValues as [string, ...string[]]);
	} else {
		switch (param.type) {
			case 'number':
				field = schemaZ.number();
				break;
			case 'boolean':
				field = schemaZ.boolean();
				break;
			case 'json':
				// Accept string (JSON) or object — LLMs may send either
				field = schemaZ.union([
					schemaZ.string(),
					schemaZ.record(schemaZ.unknown()),
					schemaZ.array(schemaZ.unknown()),
				]);
				break;
			case 'string':
			default:
				field = schemaZ.string();
				break;
		}
	}

	return field.describe(param.description);
}

function getSchemaForOperation(
	opDef: AnyOperationDef,
	schemaZ: RuntimeZod,
): z.ZodObject<z.ZodRawShape> {
	const shape: z.ZodRawShape = {};

	// Add tenantFilter if the operation uses it
	if (opDef.tenant.location !== 'none') {
		shape.tenantFilter = schemaZ.string().describe(
			'Tenant domain or default domain name to target. Required for tenant-scoped operations.',
		);
	}

	// Add operation-specific params
	for (const [paramName, paramDef] of Object.entries(opDef.params)) {
		const zodField = paramToZodField(paramDef, schemaZ);
		shape[paramName] = paramDef.required ? zodField : zodField.optional();
	}

	// Add limit for list operations
	if (opDef.isList) {
		shape.limit = schemaZ.number().int().min(1).max(500).optional().describe(
			'Maximum records to return (default 25, max 500). Increase if you expect many results.',
		);
	}

	return schemaZ.object(shape);
}

export function buildUnifiedSchema(
	resource: string,
	operations: string[],
	schemaZ: RuntimeZod,
): z.ZodObject<z.ZodRawShape> {
	const config = RESOURCE_REGISTRY[resource];
	if (!config) {
		return schemaZ.object({ operation: schemaZ.string().describe('Operation to perform') });
	}

	const enabledOps = operations.filter((op) => op in config.operations);
	if (enabledOps.length === 0) {
		return schemaZ.object({ operation: schemaZ.string().describe('Operation to perform') });
	}

	const operationEnum = schemaZ
		.enum(enabledOps as [string, ...string[]])
		.describe(`Operation to perform. Allowed: ${enabledOps.join(', ')}.`);

	// Keep a flat object schema because n8n/LangChain structured tools require an
	// object at the schema root. When operations share a field, retain every
	// operation-specific variant instead of letting the first operation win.
	// executeAiTool performs the final operation-specific required/enum checks.
	const fieldSources = new Map<string, z.ZodTypeAny[]>();
	const fieldOps = new Map<string, Set<string>>();

	for (const op of enabledOps) {
		const opDef = config.operations[op];
		if (!opDef) continue;
		const schema = getSchemaForOperation(opDef, schemaZ);
		for (const [field, fieldSchema] of Object.entries(schema.shape)) {
			if (!fieldSources.has(field)) fieldSources.set(field, []);
			fieldSources.get(field)?.push(fieldSchema as z.ZodTypeAny);
			if (!fieldOps.has(field)) fieldOps.set(field, new Set<string>());
			fieldOps.get(field)?.add(op);
		}
	}

	const mergedShape: Record<string, z.ZodTypeAny> = { operation: operationEnum };

	for (const [field, fieldSchemas] of fieldSources.entries()) {
		const opsForField = Array.from(fieldOps.get(field) ?? []);
		const baseDescription = fieldSchemas.find((schema) => schema.description)?.description ?? '';
		const label = (op: string) => OPERATION_LABELS[op] ?? op;
		const opsDescription = `Used by: ${opsForField.map(label).join(', ')}.`;
		const description = baseDescription ? `${baseDescription} ${opsDescription}` : opsDescription;
		const fieldSchema = fieldSchemas.length === 1
			? fieldSchemas[0]!
			: schemaZ.union(fieldSchemas as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
		mergedShape[field] = fieldSchema.optional().describe(description);
	}

	return schemaZ.object(mergedShape);
}

export function getRuntimeSchemaBuilders(runtimeZ: RuntimeZod) {
	return {
		buildUnifiedSchema: (resource: string, operations: string[]) =>
			buildUnifiedSchema(resource, operations, runtimeZ),
	};
}
