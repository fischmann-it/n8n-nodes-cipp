import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

import {
	operationFields as advancedOperationFields,
	resourceFields as advancedResourceFields,
} from '../advanced/descriptions';

const resourceAliases: Record<string, string> = {
	standard: 'standards',
};

function getResources(field: INodeProperties): string[] {
	const resources = field.displayOptions?.show?.resource;
	return Array.isArray(resources) ? (resources as string[]) : [];
}

function mapResource(resource: string): string {
	return resourceAliases[resource] ?? resource;
}

function getOperationValues(field: INodeProperties): string[] {
	if (!Array.isArray(field.options)) return [];
	return (field.options as INodePropertyOptions[])
		.map((option) => option.value)
		.filter((value): value is string => typeof value === 'string');
}

function isVisibleForOperation(
	field: INodeProperties,
	resource: string,
	operation: string,
): boolean {
	const show = field.displayOptions?.show;
	const hide = field.displayOptions?.hide;
	const shownResources = show?.resource;
	const shownOperations = show?.operation;
	const hiddenResources = hide?.resource;
	const hiddenOperations = hide?.operation;

	return (
		(!Array.isArray(shownResources) || shownResources.includes(resource)) &&
		(!Array.isArray(shownOperations) || shownOperations.includes(operation)) &&
		(!Array.isArray(hiddenResources) || !hiddenResources.includes(resource)) &&
		(!Array.isArray(hiddenOperations) || !hiddenOperations.includes(operation))
	);
}

function hasAdditionalVisibilityConditions(field: INodeProperties): boolean {
	const conditionKeys = [
		...Object.keys(field.displayOptions?.show ?? {}),
		...Object.keys(field.displayOptions?.hide ?? {}),
	];

	return conditionKeys.some((key) => key !== 'resource' && key !== 'operation');
}

/**
 * A base field shadows an imported field when it has the same parameter name
 * and is unconditionally visible for the selected resource and operation.
 * Conditions on other parameters are deliberately not treated as coverage:
 * both fields could still be visible for some values of those parameters.
 */
function isCoveredByBaseField(
	baseFields: INodeProperties[],
	advancedField: INodeProperties,
	resource: string,
	operation: string,
): boolean {
	return baseFields.some(
		(baseField) =>
			baseField.name === advancedField.name &&
			!hasAdditionalVisibilityConditions(baseField) &&
			isVisibleForOperation(baseField, resource, operation),
	);
}

function normalizeOptionName(name: string): string {
	return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function cloneForMappedResource(field: INodeProperties): INodeProperties {
	const resources = getResources(field);
	if (resources.length === 0) return { ...field };

	return {
		...field,
		displayOptions: {
			...field.displayOptions,
			show: {
				...field.displayOptions?.show,
				resource: resources.map(mapResource),
			},
		},
	};
}

export const advancedOnlyOperations = new Map<string, Set<string>>();

export function mergeAdvancedOperationFields(baseFields: INodeProperties[]): INodeProperties[] {
	advancedOnlyOperations.clear();
	const merged = baseFields.map((field) => ({ ...field }));

	for (const rawAdvancedField of advancedOperationFields) {
		const advancedField = cloneForMappedResource(rawAdvancedField);
		const resource = getResources(advancedField)[0];
		if (!resource) continue;

		const existingIndex = merged.findIndex(
			(field) => field.name === 'operation' && getResources(field).includes(resource),
		);
		const advancedOptions = Array.isArray(advancedField.options)
			? (advancedField.options as INodePropertyOptions[])
			: [];

		if (existingIndex === -1) {
			merged.push(advancedField);
			advancedOnlyOperations.set(resource, new Set(getOperationValues(advancedField)));
			continue;
		}

		const existing = merged[existingIndex];
		const existingOptions = Array.isArray(existing.options)
			? (existing.options as INodePropertyOptions[])
			: [];
		const existingValues = new Set(existingOptions.map((option) => option.value));
		const existingNames = new Set(
			existingOptions.map((option) => normalizeOptionName(option.name)),
		);
		const additions = advancedOptions.filter(
			(option) =>
				!existingValues.has(option.value) && !existingNames.has(normalizeOptionName(option.name)),
		);
		if (additions.length === 0) continue;

		advancedOnlyOperations.set(
			resource,
			new Set(
				additions
					.map((option) => option.value)
					.filter((value): value is string => typeof value === 'string'),
			),
		);
		merged[existingIndex] = {
			...existing,
			options: [...existingOptions, ...additions].sort((a, b) => a.name.localeCompare(b.name)),
		};
	}

	return merged;
}

export function getAdvancedOnlyResourceFields(baseFields: INodeProperties[]): INodeProperties[] {
	const fields: INodeProperties[] = [];

	for (const rawField of advancedResourceFields) {
		const field = cloneForMappedResource(rawField);
		const resource = getResources(field)[0];
		const missing = resource ? advancedOnlyOperations.get(resource) : undefined;
		if (!resource || !missing || missing.size === 0) continue;

		const operationCondition = field.displayOptions?.show?.operation;
		const candidateOperations = Array.isArray(operationCondition)
			? (operationCondition as string[]).filter((operation) => missing.has(operation))
			: [...missing];
		const operations = candidateOperations.filter(
			(operation) => !isCoveredByBaseField(baseFields, field, resource, operation),
		);
		if (operations.length === 0) continue;

		fields.push({
			...field,
			displayOptions: {
				...field.displayOptions,
				show: {
					...field.displayOptions?.show,
					operation: operations,
				},
			},
		});
	}

	return fields;
}

export function isAdvancedOnlyOperation(resource: string, operation: string): boolean {
	return advancedOnlyOperations.get(resource)?.has(operation) ?? false;
}

export function getAdvancedRouterResource(resource: string): string {
	return resource === 'standards' ? 'standard' : resource;
}
