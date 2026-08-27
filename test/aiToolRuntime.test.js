const test = require('node:test');
const assert = require('node:assert/strict');

const {
	buildUnifiedSchema,
} = require('../dist/nodes/Cipp/advanced/ai-tools/schema-generator');
const { z } = require('zod');
const {
	executeAiTool,
} = require('../dist/nodes/Cipp/advanced/ai-tools/tool-executor');

function createCippContext(apiResponses = []) {
	const requests = [];
	let responseIndex = 0;
	return {
		requests,
		context: {
			getCredentials: async () => ({
				baseUrl: 'https://cipp.example.test',
				tenantId: 'credential-tenant',
				clientId: 'client-id',
				clientSecret: 'client-secret',
			}),
			getNode: () => ({ name: 'CIPP AI Tools', type: 'cippAdvancedAiTools' }),
			helpers: {
				httpRequest: async (options) => {
					if (options.url.includes('login.microsoftonline.com')) {
						return { access_token: 'test-token', expires_in: 3600 };
					}
					requests.push(options);
					if (typeof apiResponses === 'function') {
						return apiResponses(options, responseIndex++);
					}
					return apiResponses[responseIndex++] ?? {};
				},
			},
		},
	};
}

test('requires tenantFilter at runtime before dispatching a tenant-scoped AI operation', async () => {
	const { context, requests } = createCippContext();
	const result = JSON.parse(await executeAiTool(context, 'tools', 'breachTenant', {}));

	assert.equal(result.success, false);
	assert.equal(result.error.errorType, 'MISSING_REQUIRED_FIELD');
	assert.match(result.error.message, /tenantFilter/);
	assert.equal(requests.length, 0);
});

test('tenant validation runs before composite and custom-executor dispatch', async () => {
	for (const invocation of [
		{ resource: 'workflows', operation: 'licenseAudit', params: {} },
		{ resource: 'teamsShift', operation: 'listShifts', params: { teamId: 'team-1' } },
	]) {
		const { context, requests } = createCippContext();
		const result = JSON.parse(await executeAiTool(
			context,
			invocation.resource,
			invocation.operation,
			invocation.params,
		));

		assert.equal(result.success, false, `${invocation.resource}.${invocation.operation}`);
		assert.equal(result.error.errorType, 'MISSING_REQUIRED_FIELD');
		assert.match(result.error.message, /tenantFilter/);
		assert.equal(requests.length, 0);
	}
});

test('uses operation-specific schemas when shared fields have incompatible enum constraints', () => {
	const schema = buildUnifiedSchema('tools', ['execGraphRequest', 'graphRequestExec'], z);

	// PUT is valid for graphRequestExec even though it is absent from the first
	// operation's enum. The unified tool schema must not use first-operation-wins.
	assert.equal(schema.safeParse({
		operation: 'graphRequestExec',
		tenantFilter: 'contoso.onmicrosoft.com',
		endpoint: 'users/1',
		method: 'PUT',
	}).success, true);
});

test('runtime validation applies the selected operation enum constraints', async () => {
	const { context, requests } = createCippContext();
	const result = JSON.parse(await executeAiTool(context, 'tools', 'execGraphRequest', {
		tenantFilter: 'contoso.onmicrosoft.com',
		endpoint: 'users/1',
		method: 'PUT',
	}));

	assert.equal(result.success, false);
	assert.equal(result.error.errorType, 'VALIDATION_ERROR');
	assert.match(result.error.message, /GET, POST, PATCH, DELETE/);
	assert.equal(requests.length, 0);
});

test('AI Graph Request preserves embedded OData and returns one bounded page by default', async () => {
	const { context, requests } = createCippContext([
		{ Results: [{ id: '1' }], Metadata: { nextLink: 'https://graph.example/next' } },
	]);
	const result = JSON.parse(await executeAiTool(context, 'tools', 'graphRequest', {
		tenantFilter: 'contoso.onmicrosoft.com',
		Endpoint: "users?$filter=displayName eq 'Alex'&$select=id,displayName&$top=1",
	}));

	assert.equal(result.success, true);
	assert.deepEqual(result.result, { items: [{ id: '1' }], count: 1 });
	assert.equal(requests.length, 1);
	assert.deepEqual(requests[0].qs, {
		TenantFilter: 'contoso.onmicrosoft.com',
		Endpoint: 'users',
		'$filter': "displayName eq 'Alex'",
		'$select': 'id,displayName',
		'$top': 1,
		manualPagination: true,
		NoPagination: true,
	});
	assert.equal(requests[0].timeout, undefined);
	assert.equal(requests[0].abortSignal, undefined);
});

test('AI Graph Request follows the exact absolute cursor and terminates after page two', async () => {
	const nextLink = 'https://graph.microsoft.com/beta/users?$skiptoken=page-two%2Bopaque';
	const { context, requests } = createCippContext((options) => {
		if (!Object.hasOwn(options.qs, 'nextLink')) {
			return { Results: [{ id: '1' }], Metadata: { nextLink } };
		}
		assert.equal(options.qs.nextLink, nextLink);
		return { Results: [{ id: '2' }], Metadata: {} };
	});
	const result = JSON.parse(await executeAiTool(context, 'tools', 'graphRequest', {
		tenantFilter: 'contoso.onmicrosoft.com',
		Endpoint: 'users?$top=1',
		returnAll: true,
	}));

	assert.equal(result.success, true);
	assert.deepEqual(result.result, { items: [{ id: '1' }, { id: '2' }], count: 2 });
	assert.equal(requests.length, 2);
	assert.deepEqual(requests[0].qs, {
		TenantFilter: 'contoso.onmicrosoft.com',
		Endpoint: 'users',
		'$top': 1,
		manualPagination: true,
		NoPagination: true,
	});
	assert.deepEqual(requests[1].qs, {
		TenantFilter: 'contoso.onmicrosoft.com',
		Endpoint: 'users',
		manualPagination: true,
		NoPagination: true,
		nextLink,
	});
	assert.equal(requests[1].qs.nextLink, nextLink);
	for (const request of requests) {
		assert.equal(request.timeout, undefined);
		assert.equal(request.abortSignal, undefined);
	}
});

test('AI Return All returns an error for the official CIPP queued-response envelope', async () => {
	const { context, requests } = createCippContext([{
		Results: [],
		Metadata: {
			Queued: true,
			QueueMessage: 'Loading 9001 rows for contoso. Please check back after the job completes',
			QueueId: 'queue-456',
		},
	}]);
	const result = JSON.parse(await executeAiTool(context, 'tools', 'graphRequest', {
		tenantFilter: 'contoso.onmicrosoft.com',
		Endpoint: 'users?$count=true',
		returnAll: true,
	}));

	assert.equal(result.success, false);
	assert.equal(result.error.errorType, 'API_ERROR');
	assert.match(result.error.message, /queued the Graph Return All request/i);
	assert.match(result.error.message, /queue-456/);
	assert.match(result.error.message, /Loading 9001 rows/);
	assert.equal(requests.length, 1);
});

test('AI Return All preserves a Graph value entity whose business data contains queued=true', async () => {
	const graphEntity = { id: 'job-2', displayName: 'Queued job', queued: true };
	const { context, requests } = createCippContext([{
		value: [graphEntity],
		metadata: {},
	}]);
	const result = JSON.parse(await executeAiTool(context, 'tools', 'graphRequest', {
		tenantFilter: 'contoso.onmicrosoft.com',
		Endpoint: 'jobs',
		returnAll: true,
	}));

	assert.equal(result.success, true);
	assert.deepEqual(result.result, { items: [graphEntity], count: 1 });
	assert.equal(requests.length, 1);
});

test('unregistered tenant aliases cannot override application.addStore selected tenant', async () => {
	const { context, requests } = createCippContext([{ queued: true }]);
	const result = JSON.parse(await executeAiTool(context, 'application', 'addStore', {
		tenantFilter: 'contoso.onmicrosoft.com',
		selectedTenants: 'attacker.example',
		TenantFilter: 'attacker-pascal.example',
		PackageName: '9NBLGGH4NNS1',
		ApplicationName: 'Company Portal',
		description: 'Microsoft Store application',
		AssignTo: 'user',
	}));

	assert.equal(result.success, true);
	assert.equal(requests.length, 1);
	assert.equal(requests[0].body.selectedTenants, 'contoso.onmicrosoft.com');
	assert.equal(Object.hasOwn(requests[0].body, 'TenantFilter'), false);
});

test('device.manage maps managementAction without colliding with n8n action metadata', async () => {
	const { context, requests } = createCippContext([{ ok: true }]);
	const result = JSON.parse(await executeAiTool(context, 'device', 'manage', {
		tenantFilter: 'contoso.onmicrosoft.com',
		ID: 'device-1',
		managementAction: 'Delete',
		action: 'framework-metadata',
	}));

	assert.equal(result.success, true);
	assert.equal(requests[0].body.action, 'Delete');
});

test('user.setUserPhoto maps photoAction without colliding with n8n action metadata', async () => {
	const { context, requests } = createCippContext([{ ok: true }]);
	const result = JSON.parse(await executeAiTool(context, 'user', 'setUserPhoto', {
		tenantFilter: 'contoso.onmicrosoft.com',
		photoAction: 'remove',
		userId: 'user-1',
		action: 'framework-metadata',
	}));

	assert.equal(result.success, true);
	assert.equal(requests[0].body.action, 'remove');
});

test('universalSearchV2 preserves its endpoint limit query parameter', async () => {
	const { context, requests } = createCippContext([{ value: [] }]);
	const result = JSON.parse(await executeAiTool(context, 'tools', 'universalSearchV2', {
		searchTerms: 'alex',
		type: 'user',
		limit: 7,
	}));

	assert.equal(result.success, true);
	assert.equal(requests.length, 1);
	assert.equal(requests[0].qs.limit, 7);
});
