// ai-tools/description-builders.ts
// Generates LLM-optimised tool descriptions from the operation registry.
import { RESOURCE_REGISTRY } from './registry';
import type { AnyOperationDef, OperationDef } from './registry';

export function dateTimeReferenceSnippet(referenceUtc: string): string {
	return `Reference: current UTC is ${referenceUtc}. `;
}

/** Classify an operation name into a safety category for description text */
function getOperationSafety(opName: string, opDef: AnyOperationDef): 'delete' | 'mutate' | 'read' {
	if (!opDef.isWrite) return 'read';
	const lower = opName.toLowerCase();
	if (lower.includes('delete') || lower.includes('remove') || lower === 'deny') return 'delete';
	return 'mutate';
}

function describeOperation(opName: string, opDef: AnyOperationDef): string {
	const requiredParams = Object.entries(opDef.params)
		.filter(([, p]) => p.required)
		.map(([name, p]) => {
			if (p.enumValues?.length) return `${name} (${p.enumValues.join('|')})`;
			return `${name} (${p.type})`;
		});

	const reqSummary = requiredParams.length > 0
		? ` Required: ${requiredParams.join(', ')}.`
		: '';

	const tenantNote = opDef.tenant.location !== 'none'
		? ' Requires tenantFilter.'
		: '';

	const listNote = opDef.isList ? ' Returns a list; use limit param.' : '';

	// Per-operation safety text per skill spec
	const safety = getOperationSafety(opName, opDef);
	let safetyNote = '';
	if (safety === 'delete') {
		safetyNote = ' ONLY on explicit user intent — do not infer. Confirm ID before proceeding.';
	} else if (safety === 'mutate') {
		safetyNote = ' Confirm values with user before executing.';
	}

	const opLabel = ('operationLabel' in opDef ? (opDef as OperationDef).operationLabel : undefined) ?? opDef.description;
	return `- ${opName}: ${opLabel}${reqSummary}${tenantNote}${listNote}${safetyNote}`;
}

export function buildUnifiedDescription(
	resource: string,
	operations: string[],
	referenceUtc: string,
): string {
	const config = RESOURCE_REGISTRY[resource];
	if (!config) return `Manage ${resource} records.`;

	const enabledOps = operations.filter((op) => op in config.operations);

	const operationLines = enabledOps.map((op) => {
		const opDef = config.operations[op];
		if (!opDef) return `- ${op}: Operation available.`;
		return describeOperation(op, opDef);
	});

	const writeOps = enabledOps.filter((op) => config.operations[op]?.isWrite);
	const safetyNote = writeOps.length > 0
		? '\nWrite operations require explicit user intent. Confirm before executing destructive actions.'
		: '';

	const lines = [
		`${dateTimeReferenceSnippet(referenceUtc)}${config.description}.`,
		'Pass one of the following values in the required "operation" field:',
		...operationLines,
		safetyNote,
	].filter(Boolean);

	// Token budget: keep under ~2000 chars per tool
	const joined = lines.join('\n');
	if (joined.length > 2200) {
		// Truncate to short format but keep safety notes
		const shortLines = enabledOps.map((op) => {
			const opDef = config.operations[op];
			if (!opDef) return `- ${op}: Available.`;
			const safety = getOperationSafety(op, opDef);
			const safetySuffix = safety === 'delete' ? ' [DESTRUCTIVE — confirm first]'
				: safety === 'mutate' ? ' [confirm values]'
				: '';
			const label = ('operationLabel' in opDef ? (opDef as OperationDef).operationLabel : undefined) ?? opDef.description;
			return `- ${op}: ${label}${safetySuffix}`;
		});
		return [
			`${dateTimeReferenceSnippet(referenceUtc)}${config.description}.`,
			'Pass "operation" field with one of:',
			...shortLines,
			safetyNote,
		].filter(Boolean).join('\n');
	}

	return joined;
}
