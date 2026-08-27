const test = require('node:test');
const assert = require('node:assert/strict');

const {
	buildGraphRequestQuery,
	extractGraphPage,
	paginateGraphRequest,
	withGraphRequestDeadline,
} = require('../dist/nodes/Cipp/GraphRequestUtils');
const { performCippApiRequest } = require('../dist/nodes/Cipp/CippApiClient');
const { CippApp } = require('../dist/nodes/Cipp/CippApp.node');

function makeGraphNodeContext(parameters, apiResponses) {
	const requests = [];
	let responseIndex = 0;
	return {
		requests,
		context: {
			getNode: () => ({
				name: 'CIPP',
				type: '@joshuanode/n8n-nodes-cipp.cippApp',
				typeVersion: 1,
				position: [0, 0],
				parameters: {},
			}),
			getNodeParameter(name, _index, defaultValue) {
				return Object.hasOwn(parameters, name) ? parameters[name] : defaultValue;
			},
			async getCredentials() {
				return {
					baseUrl: 'https://cipp.example.test',
					tenantId: 'credential-tenant',
					clientId: `graph-client-${Math.random()}`,
					clientSecret: 'test-secret',
				};
			},
			getInputData() {
				return [{ json: {} }];
			},
			continueOnFail() {
				return false;
			},
			helpers: {
				async httpRequest(options) {
					if (options.url.includes('/oauth2/v2.0/token')) {
						return { access_token: 'token', expires_in: 3600 };
					}
					requests.push(options);
					if (typeof apiResponses === 'function') {
						return apiResponses(options, responseIndex++);
					}
					return apiResponses[responseIndex++] ?? {};
				},
				returnJsonArray(value) {
					const values = Array.isArray(value) ? value : [value];
					return values.map((json) => ({ json }));
				},
				constructExecutionMetaData(value) {
					return value;
				},
			},
		},
	};
}

test('moves OData parameters embedded in graphEndpoint into the CIPP query', () => {
	const query = buildGraphRequestQuery(
		'contoso.onmicrosoft.com',
		"users?$filter=displayName eq 'ZZZ_NONEXISTENT_9x8x7'&$select=id,displayName&$top=1",
		{},
	);

	assert.deepEqual(query, {
		TenantFilter: 'contoso.onmicrosoft.com',
		Endpoint: 'users',
		'$filter': "displayName eq 'ZZZ_NONEXISTENT_9x8x7'",
		'$select': 'id,displayName',
		'$top': 1,
	});
});

test('dedicated option fields override values embedded in graphEndpoint', () => {
	const query = buildGraphRequestQuery(
		'contoso.onmicrosoft.com',
		'users?$top=5&$orderby=displayName',
		{ top: 25, orderby: 'userPrincipalName', search: 'alex' },
	);

	assert.equal(query.Endpoint, 'users');
	assert.equal(query.$top, 25);
	assert.equal(query.$orderby, 'userPrincipalName');
	assert.equal(query.$search, 'alex');
});

test('rejects unsupported endpoint query parameters instead of silently dropping them', () => {
	assert.throws(
		() => buildGraphRequestQuery('contoso.onmicrosoft.com', 'users?api-version=1', {}),
		/Unsupported graphEndpoint query parameter "api-version"/,
	);
});

test('rejects invalid embedded $top values', () => {
	assert.throws(
		() => buildGraphRequestQuery('contoso.onmicrosoft.com', 'users?$top=all', {}),
		/\$top in graphEndpoint must be a positive integer/,
	);
});

test('rejects invalid embedded $count values', () => {
	assert.throws(
		() => buildGraphRequestQuery('contoso.onmicrosoft.com', 'users?$count=yes', {}),
		/\$count in graphEndpoint must be true or false/,
	);
});

test('extracts a CIPP manual-pagination envelope', () => {
	assert.deepEqual(
		extractGraphPage({
			Results: [{ id: '1' }],
			Metadata: { nextLink: 'https://graph.microsoft.com/beta/users?$skiptoken=abc' },
		}),
		{
			items: [{ id: '1' }],
			nextLink: 'https://graph.microsoft.com/beta/users?$skiptoken=abc',
		},
	);
});

test('extracts a raw Microsoft Graph pagination envelope', () => {
	assert.deepEqual(
		extractGraphPage({
			value: [{ id: '1' }],
			'@odata.nextLink': 'https://graph.microsoft.com/beta/users?$skiptoken=abc',
		}),
		{
			items: [{ id: '1' }],
			nextLink: 'https://graph.microsoft.com/beta/users?$skiptoken=abc',
		},
	);
});

test('extracts a trailing pagination marker from an array response', () => {
	assert.deepEqual(
		extractGraphPage([
			{ id: '1' },
			{ nextLink: 'https://graph.microsoft.com/beta/users?$skiptoken=abc' },
		]),
		{
			items: [{ id: '1' }],
			nextLink: 'https://graph.microsoft.com/beta/users?$skiptoken=abc',
		},
	);
});

test('regular Graph Request uses the CIPP manual one-page contract by default', async () => {
	const { context, requests } = makeGraphNodeContext(
		{
			resource: 'tools',
			operation: 'graphRequest',
			tenantFilter: 'contoso.onmicrosoft.com',
			graphEndpoint: 'groups?$select=id,displayName&$top=200',
			graphOptions: {},
			graphReturnAll: false,
		},
		[{ Results: [{ id: '1' }], Metadata: { nextLink: 'https://graph.microsoft.com/next' } }],
	);

	await CippApp.prototype.execute.call(context);

	assert.equal(requests.length, 1);
	assert.equal(requests[0].qs.TenantFilter, 'contoso.onmicrosoft.com');
	assert.equal(requests[0].qs.NoPagination, true);
	assert.equal(requests[0].qs.manualPagination, true);
	assert.equal(requests[0].timeout, undefined);
	assert.equal(requests[0].abortSignal, undefined);
});

test('regular Graph Request returns a 56-item collection without post-response work hanging', async () => {
	const groups = Array.from({ length: 56 }, (_, index) => ({
		id: `group-${index + 1}`,
		displayName: `Group ${index + 1}`,
	}));
	const { context, requests } = makeGraphNodeContext(
		{
			resource: 'tools',
			operation: 'graphRequest',
			tenantFilter: 'contoso.onmicrosoft.com',
			graphEndpoint: 'groups?$select=id,displayName&$top=999',
			graphOptions: {},
			graphReturnAll: false,
		},
		[{ Results: groups, Metadata: {} }],
	);

	const startedAt = performance.now();
	const output = await CippApp.prototype.execute.call(context);
	const elapsedMs = performance.now() - startedAt;

	assert.equal(requests.length, 1);
	assert.equal(output[0].length, 56);
	assert.deepEqual(output[0].map((item) => item.json), groups);
	assert.ok(elapsedMs < 1_000, `collection response handling took ${elapsedMs.toFixed(1)} ms`);
});

test('regular Return All follows the exact absolute cursor and terminates after page two', async () => {
	const nextLink = 'https://graph.microsoft.com/beta/groups?$skiptoken=page-two%2Bopaque';
	const { context, requests } = makeGraphNodeContext(
		{
			resource: 'tools',
			operation: 'graphRequest',
			tenantFilter: 'contoso.onmicrosoft.com',
			graphEndpoint: 'groups?$top=200',
			graphOptions: {},
			graphReturnAll: true,
		},
		(options) => {
			if (!Object.hasOwn(options.qs, 'nextLink')) {
				return { Results: [{ id: '1' }], Metadata: { nextLink } };
			}
			assert.equal(options.qs.nextLink, nextLink);
			return { Results: [{ id: '2' }], Metadata: {} };
		},
	);

	const output = await CippApp.prototype.execute.call(context);

	assert.deepEqual(output[0].map((item) => item.json.id), ['1', '2']);
	assert.equal(requests.length, 2);
	assert.deepEqual(requests[0].qs, {
		TenantFilter: 'contoso.onmicrosoft.com',
		Endpoint: 'groups',
		'$top': 200,
		manualPagination: true,
		NoPagination: true,
	});
	assert.deepEqual(requests[1].qs, {
		TenantFilter: 'contoso.onmicrosoft.com',
		Endpoint: 'groups',
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

test('regular Return All stops immediately when the first page has no cursor', async () => {
	const { context, requests } = makeGraphNodeContext(
		{
			resource: 'tools',
			operation: 'graphRequest',
			tenantFilter: 'contoso.onmicrosoft.com',
			graphEndpoint: 'groups?$top=200',
			graphOptions: {},
			graphReturnAll: true,
		},
		[{ Results: [{ id: '1' }], Metadata: {} }],
	);

	const output = await CippApp.prototype.execute.call(context);
	assert.deepEqual(output[0].map((item) => item.json.id), ['1']);
	assert.equal(requests.length, 1);
});

test('shared Graph pager rejects an exact repeated cursor after two responses', async () => {
	const nextLink = 'https://graph.microsoft.com/beta/groups?$skiptoken=same';
	let calls = 0;
	await assert.rejects(
		() => paginateGraphRequest(
			{
				TenantFilter: 'contoso.onmicrosoft.com',
				Endpoint: 'groups',
				'$top': 1,
			},
			async (query) => {
				calls += 1;
				if (calls === 2) assert.equal(query.nextLink, nextLink);
				return { Results: [{ id: String(calls) }], Metadata: { nextLink } };
			},
			{ maxPages: 25, timeoutMs: 1_000 },
		),
		/repeated nextLink/i,
	);
	assert.equal(calls, 2);
});

test('shared Graph pager rejects repeated page content even when cursors keep changing', async () => {
	let calls = 0;
	await assert.rejects(
		() => paginateGraphRequest(
			{ TenantFilter: 'contoso.onmicrosoft.com', Endpoint: 'groups' },
			async () => {
				calls += 1;
				return {
					Results: [{ id: 'same-page' }],
					Metadata: { nextLink: `https://graph.microsoft.com/beta/groups?$skiptoken=fresh-${calls}` },
				};
			},
			{ maxPages: 25, timeoutMs: 1_000 },
		),
		/repeated page content/i,
	);
	assert.equal(calls, 2);
});

test('shared Graph pager enforces maxPages when every page and cursor advances', async () => {
	let calls = 0;
	await assert.rejects(
		() => paginateGraphRequest(
			{ TenantFilter: 'contoso.onmicrosoft.com', Endpoint: 'groups' },
			async () => {
				calls += 1;
				return {
					Results: [{ id: `page-${calls}` }],
					Metadata: { nextLink: `https://graph.microsoft.com/beta/groups?$skiptoken=page-${calls + 1}` },
				};
			},
			{ maxPages: 3, timeoutMs: 1_000 },
		),
		/Max Pages safety cap \(3\)/i,
	);
	assert.equal(calls, 3);
});

test('shared Graph pager applies one deadline to a permanently pending page', async () => {
	const startedAt = Date.now();
	await assert.rejects(
		() => paginateGraphRequest(
			{ TenantFilter: 'contoso.onmicrosoft.com', Endpoint: 'groups' },
			async () => new Promise(() => {}),
			{ maxPages: 25, timeoutMs: 15 },
		),
		/timed out after 15 ms/i,
	);
	assert.ok(Date.now() - startedAt < 250);
});

test('one-page Graph requests retain an outer deadline without HTTP request timeout options', async () => {
	const startedAt = Date.now();
	await assert.rejects(
		() => withGraphRequestDeadline(async () => new Promise(() => {}), 15),
		/timed out after 15 ms/i,
	);
	assert.ok(Date.now() - startedAt < 250);
});

test('shared Graph pager does not reset the global deadline for a pending continuation page', async () => {
	let calls = 0;
	const startedAt = Date.now();
	await assert.rejects(
		() => paginateGraphRequest(
			{ TenantFilter: 'contoso.onmicrosoft.com', Endpoint: 'groups' },
			async () => {
				calls += 1;
				if (calls === 1) {
					await new Promise((resolve) => setTimeout(resolve, 15));
					return {
						Results: [{ id: 'first-page' }],
						Metadata: { nextLink: 'https://graph.microsoft.com/beta/groups?$skiptoken=page-two' },
					};
				}
				return new Promise(() => {});
			},
			{ maxPages: 25, timeoutMs: 40 },
		),
		/timed out after 40 ms/i,
	);
	assert.equal(calls, 2);
	assert.ok(Date.now() - startedAt < 150);
});

test('shared Graph pager rejects non-Graph absolute continuation URLs', async () => {
	await assert.rejects(
		() => paginateGraphRequest(
			{ TenantFilter: 'contoso.onmicrosoft.com', Endpoint: 'groups' },
			async () => ({
				Results: [{ id: '1' }],
				Metadata: { nextLink: 'https://evil.example/beta/groups?$skiptoken=stolen' },
			}),
			{ maxPages: 25, timeoutMs: 1_000 },
		),
		/must be an absolute https:\/\/graph\.microsoft\.com URL/i,
	);
});

test('regular Return All rejects the official CIPP queued-response envelope', async () => {
	const { context, requests } = makeGraphNodeContext(
		{
			resource: 'tools',
			operation: 'graphRequest',
			tenantFilter: 'contoso.onmicrosoft.com',
			graphEndpoint: 'users?$count=true',
			graphOptions: {},
			graphReturnAll: true,
		},
		[{
			Results: [],
			Metadata: {
				Queued: true,
				QueueMessage: 'Loading 9001 rows for contoso. Please check back after the job completes',
				QueueId: 'queue-123',
			},
		}],
	);

	await assert.rejects(
		() => CippApp.prototype.execute.call(context),
		(error) => {
			assert.match(error.message, /queued the Graph Return All request/i);
			assert.match(error.message, /queue-123/);
			assert.match(error.message, /Loading 9001 rows/);
			return true;
		},
	);
	assert.equal(requests.length, 1);
});

test('regular Return All preserves a Graph result entity whose business data contains queued=true', async () => {
	const graphEntity = { id: 'job-1', displayName: 'Queued job', queued: true };
	const { context, requests } = makeGraphNodeContext(
		{
			resource: 'tools',
			operation: 'graphRequest',
			tenantFilter: 'contoso.onmicrosoft.com',
			graphEndpoint: 'jobs',
			graphOptions: {},
			graphReturnAll: true,
		},
		[{ Results: [graphEntity], Metadata: {} }],
	);

	const output = await CippApp.prototype.execute.call(context);

	assert.deepEqual(output[0].map((item) => item.json), [graphEntity]);
	assert.equal(requests.length, 1);
});

test('CIPP request timeout is a real deadline even if the HTTP helper never settles', async () => {
	const context = {
		getNode: () => ({
			name: 'CIPP',
			type: '@joshuanode/n8n-nodes-cipp.cippApp',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		}),
		helpers: {
			httpRequest: async () => new Promise(() => {}),
		},
	};
	const request = performCippApiRequest(
		context,
		{
			baseUrl: 'https://cipp.example.test',
			tenantId: 'credential-tenant',
			clientId: 'client-id',
			clientSecret: 'test-secret',
		},
		'token',
		'GET',
		'/api/ListGraphRequest',
		{},
		{},
		() => {},
		{ timeoutMs: 10 },
	);
	const outcome = await Promise.race([
		request.then(
			() => ({ type: 'resolved' }),
			(error) => ({ type: 'rejected', error }),
		),
		new Promise((resolve) => setTimeout(() => resolve({ type: 'still-pending' }), 75)),
	]);

	assert.equal(outcome.type, 'rejected');
	assert.match(
		String(outcome.error.description ?? outcome.error.message),
		/timed out after 10 ms/i,
	);
});
