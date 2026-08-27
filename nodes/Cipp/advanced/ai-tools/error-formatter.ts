// nodes/CippAdvanced/ai-tools/error-formatter.ts
// Structured success/error envelopes with nextAction guidance to help the LLM self-correct.

interface ToolEnvelope {
	schemaVersion: string;
	success: boolean;
	operation: string;
	resource: string;
}

interface SuccessEnvelope extends ToolEnvelope {
	success: true;
	result: unknown;
}

interface ErrorEnvelope extends ToolEnvelope {
	success: false;
	error: {
		errorType: string;
		message: string;
		nextAction: string;
		context?: Record<string, unknown>;
	};
}

export const ERROR_TYPES = {
	API_ERROR: 'API_ERROR',
	ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
	NO_RESULTS_FOUND: 'NO_RESULTS_FOUND',
	MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
	INVALID_OPERATION: 'INVALID_OPERATION',
	WRITE_OPERATION_BLOCKED: 'WRITE_OPERATION_BLOCKED',
	PERMISSION_DENIED: 'PERMISSION_DENIED',
	VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export function wrapSuccess(
	resource: string,
	operation: string,
	result: unknown,
): SuccessEnvelope {
	return { schemaVersion: '1', success: true, operation, resource, result };
}

export function wrapError(
	resource: string,
	operation: string,
	errorType: string,
	message: string,
	nextAction: string,
	context?: Record<string, unknown>,
): ErrorEnvelope {
	return {
		schemaVersion: '1',
		success: false,
		operation,
		resource,
		error: { errorType, message, nextAction, ...(context ? { context } : {}) },
	};
}

export function formatApiError(
	message: string,
	resource: string,
	operation: string,
): ErrorEnvelope {
	const lower = message.toLowerCase();

	if (
		lower.includes('forbidden') ||
		lower.includes('unauthor') ||
		lower.includes('permission')
	) {
		return wrapError(
			resource,
			operation,
			ERROR_TYPES.PERMISSION_DENIED,
			message,
			'Verify API credentials and permissions, then retry.',
		);
	}
	if (
		lower.includes('not found') ||
		lower.includes('does not exist') ||
		lower.includes('404')
	) {
		return wrapError(
			resource,
			operation,
			ERROR_TYPES.ENTITY_NOT_FOUND,
			message,
			`Use cipp_${resource} with a list operation and appropriate filters to find the record, then retry with the correct identifier.`,
		);
	}
	if (
		lower.includes('required') ||
		lower.includes('missing') ||
		lower.includes('blank')
	) {
		return wrapError(
			resource,
			operation,
			ERROR_TYPES.MISSING_REQUIRED_FIELD,
			message,
			'Check required fields for this resource and retry with all required parameters.',
		);
	}
	if (
		lower.includes('validation') ||
		lower.includes('invalid') ||
		lower.includes('unprocessable')
	) {
		return wrapError(
			resource,
			operation,
			ERROR_TYPES.VALIDATION_ERROR,
			message,
			'Check the field values and types, then retry with corrected parameters.',
		);
	}

	return wrapError(
		resource,
		operation,
		ERROR_TYPES.API_ERROR,
		message,
		'Verify parameter names and values, then retry.',
	);
}
