const test = require('node:test');
const assert = require('node:assert/strict');

const { operationFields, resourceFields } = require('../dist/nodes/Cipp/descriptions');

function isVisibleForOperation(field, resource, operation) {
	const show = field.displayOptions?.show ?? {};
	const hide = field.displayOptions?.hide ?? {};

	return (
		(!Array.isArray(show.resource) || show.resource.includes(resource)) &&
		(!Array.isArray(show.operation) || show.operation.includes(operation)) &&
		(!Array.isArray(hide.resource) || !hide.resource.includes(resource)) &&
		(!Array.isArray(hide.operation) || !hide.operation.includes(operation))
	);
}

function getOperationSelections() {
	const selections = [];

	for (const field of operationFields) {
		const resources = field.displayOptions?.show?.resource ?? [];
		const options = Array.isArray(field.options) ? field.options : [];
		for (const resource of resources) {
			for (const option of options) {
				if (typeof option.value === 'string') {
					selections.push({ resource, operation: option.value });
				}
			}
		}
	}

	return selections;
}

test('merged descriptions never render duplicate parameter names for an operation', () => {
	const duplicates = [];

	for (const { resource, operation } of getOperationSelections()) {
		const visibleNames = new Map();
		for (const field of resourceFields) {
			if (!isVisibleForOperation(field, resource, operation)) continue;
			visibleNames.set(field.name, (visibleNames.get(field.name) ?? 0) + 1);
		}

		for (const [name, count] of visibleNames) {
			if (count > 1) duplicates.push({ resource, operation, name, count });
		}
	}

	assert.deepEqual(duplicates, []);
});

test('an imported operation covered by a base resource-wide tenant field has one tenant selector', () => {
	const tenantFields = resourceFields.filter(
		(field) =>
			field.name === 'tenantFilter' &&
			isVisibleForOperation(field, 'application', 'addMultiTenantApp'),
	);

	assert.equal(tenantFields.length, 1);
	assert.equal(tenantFields[0].type, 'resourceLocator');
});

test('an imported operation without base tenant coverage keeps its tenant selector', () => {
	const tenantFields = resourceFields.filter(
		(field) =>
			field.name === 'tenantFilter' && isVisibleForOperation(field, 'alert', 'listMdoAlerts'),
	);

	assert.equal(tenantFields.length, 1);
	assert.equal(tenantFields[0].required, true);
});

test('credential cache controls expose every cache setting consumed by the advanced runtime', () => {
	const { CippApi } = require('../dist/credentials/CippApi.credentials');
	const properties = new Map(new CippApi().properties.map((property) => [property.name, property]));

	assert.equal(properties.get('enableTenantCache')?.default, false);
	assert.equal(properties.get('tenantCacheTtl')?.default, 30);
	assert.deepEqual(properties.get('tenantCacheTtl')?.displayOptions?.show, {
		enableTenantCache: [true],
	});
	assert.equal(properties.get('enableSecureScoreCache')?.default, false);
	assert.equal(properties.get('secureScoreCacheTtl')?.default, 60);
	assert.deepEqual(properties.get('secureScoreCacheTtl')?.displayOptions?.show, {
		enableSecureScoreCache: [true],
	});
});
