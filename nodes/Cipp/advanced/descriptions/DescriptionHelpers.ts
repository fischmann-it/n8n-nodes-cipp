import type { INodeProperties } from 'n8n-workflow';

/**
 * Generates the standard tenantFilter resourceLocator field for a resource.
 * Replaces ~30 lines of identical boilerplate per description file.
 */
export function tenantField(resource: string, operations?: string[]): INodeProperties {
	const show: Record<string, string[]> = { resource: [resource] };
	if (operations) show.operation = operations;
	return {
		displayName: 'Tenant',
		name: 'tenantFilter',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The tenant to perform the operation on',
		displayOptions: { show },
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'tenantSearch',
					searchable: true,
				},
			},
			{
				displayName: 'By Domain',
				name: 'domain',
				type: 'string',
				placeholder: 'e.g. contoso.onmicrosoft.com',
			},
		],
	};
}

/**
 * Generates the standard returnAll boolean field.
 */
export function returnAllField(resource: string, operations: string[]): INodeProperties {
	return {
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [resource],
				operation: operations,
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	};
}

/**
 * Generates the standard limit number field, gated by returnAll: [false].
 */
export function limitField(resource: string, operations: string[]): INodeProperties {
	return {
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: [resource],
				operation: operations,
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 999,
		},
		default: 50,
		description: 'Max number of results to return',
	};
}

/**
 * Generates a standard string ID field shown for specific operations.
 */
export function idField(
	resource: string,
	operations: string[],
	displayName: string,
	description: string,
): INodeProperties {
	return {
		displayName,
		name: displayName.charAt(0).toLowerCase() + displayName.slice(1).replace(/\s+/g, ''),
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [resource],
				operation: operations,
			},
		},
		default: '',
		description,
	};
}
