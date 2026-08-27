const test = require('node:test');
const assert = require('node:assert/strict');

const {
	getAccessToken: getAdvancedAccessToken,
	getSecureScoreCached,
	getTenantList,
} = require('../dist/nodes/Cipp/advanced/GenericFunctions');
const {
	getAccessToken: getBaseAccessToken,
} = require('../dist/nodes/Cipp/GenericFunctions');
const { CippApi } = require('../dist/credentials/CippApi.credentials');

function createContext(baseUrl, clientId, responseFactory) {
	const apiRequests = [];
	return {
		apiRequests,
		context: {
			getCredentials: async () => ({
				baseUrl,
				tenantId: 'shared-azure-tenant',
				clientId,
				clientSecret: 'shared-secret',
				enableTenantCache: true,
				tenantCacheTtl: 30,
				enableSecureScoreCache: true,
				secureScoreCacheTtl: 60,
			}),
			getNode: () => ({ name: 'CIPP' }),
			helpers: {
				httpRequest: async (options) => {
					if (options.url.includes('login.microsoftonline.com')) {
						return { access_token: `token-${clientId}`, expires_in: 3600 };
					}
					apiRequests.push(options);
					return responseFactory(options);
				},
			},
		},
	};
}

test('tenant cache is isolated by normalized CIPP base URL', async () => {
	const clientId = 'cache-isolation-tenants';
	const first = createContext('https://first.cipp.test/', clientId, () => [
		{ customerId: 'first', defaultDomainName: 'first.example' },
	]);
	const second = createContext('https://second.cipp.test', clientId, () => [
		{ customerId: 'second', defaultDomainName: 'second.example' },
	]);

	const firstResult = await getTenantList.call(first.context);
	const secondResult = await getTenantList.call(second.context);
	const firstCachedResult = await getTenantList.call(first.context);

	assert.equal(firstResult[0].customerId, 'first');
	assert.equal(secondResult[0].customerId, 'second');
	assert.equal(firstCachedResult[0].customerId, 'first');
	assert.equal(first.apiRequests.length, 1);
	assert.equal(second.apiRequests.length, 1);
});

test('Secure Score cache is isolated by normalized CIPP base URL', async () => {
	const clientId = 'cache-isolation-secure-score';
	const first = createContext('https://first-score.cipp.test/', clientId, () => ({
		Results: [{ source: 'first' }],
	}));
	const second = createContext('https://second-score.cipp.test', clientId, () => ({
		Results: [{ source: 'second' }],
	}));

	const firstResult = await getSecureScoreCached.call(first.context, 'customer.example', 1);
	const secondResult = await getSecureScoreCached.call(second.context, 'customer.example', 1);
	const firstCachedResult = await getSecureScoreCached.call(
		first.context,
		'customer.example',
		1,
	);

	assert.equal(firstResult[0].source, 'first');
	assert.equal(secondResult[0].source, 'second');
	assert.equal(firstCachedResult[0].source, 'first');
	assert.equal(first.apiRequests.length, 1);
	assert.equal(second.apiRequests.length, 1);
});

test('normal and advanced node paths share the same bounded token cache', async () => {
	const credentials = {
		baseUrl: 'https://shared-token.cipp.test',
		tenantId: 'shared-token-tenant',
		clientId: 'shared-token-client',
		clientSecret: 'shared-token-secret',
	};
	let tokenRequests = 0;
	const context = {
		getNode: () => ({ name: 'CIPP' }),
		helpers: {
			httpRequest: async () => {
				tokenRequests += 1;
				return { access_token: 'shared-node-token', expires_in: 3600 };
			},
		},
	};

	assert.equal(await getBaseAccessToken.call(context, credentials), 'shared-node-token');
	assert.equal(await getAdvancedAccessToken.call(context, credentials), 'shared-node-token');
	assert.equal(tokenRequests, 1);
});

test('credential authentication keeps its fetch lifecycle isolated from node execution', async () => {
	const credentials = {
		baseUrl: 'https://credential-auth.cipp.test',
		tenantId: 'credential-auth-tenant',
		clientId: 'credential-auth-client',
		clientSecret: 'credential-auth-secret',
	};
	const nodeContext = {
		getNode: () => ({ name: 'CIPP' }),
		helpers: {
			httpRequest: async () => ({ access_token: 'node-token', expires_in: 3600 }),
		},
	};
	await getBaseAccessToken.call(nodeContext, credentials);

	const originalFetch = global.fetch;
	let fetchRequests = 0;
	global.fetch = async () => {
		fetchRequests += 1;
		return {
			ok: true,
			status: 200,
			json: async () => ({ access_token: 'credential-token', expires_in: 3600 }),
		};
	};

	try {
		const credentialType = new CippApi();
		const first = await credentialType.authenticate(credentials, { headers: {} });
		const second = await credentialType.authenticate(credentials, { headers: {} });

		assert.equal(first.headers.Authorization, 'Bearer credential-token');
		assert.equal(second.headers.Authorization, 'Bearer credential-token');
		assert.equal(fetchRequests, 1);
	} finally {
		global.fetch = originalFetch;
	}
});
