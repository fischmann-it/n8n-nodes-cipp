const test = require('node:test');
const assert = require('node:assert/strict');

const {
	postAction,
	withTrustedTenant,
} = require('../dist/nodes/Cipp/advanced/GenericFunctions');
const {
	executeComposite,
	normalizeMaxTenants,
} = require('../dist/nodes/Cipp/advanced/ai-tools/composite-executor');
const { execute: executePolicy } = require('../dist/nodes/Cipp/advanced/actions/policy');
const { execute: executeWorkflow } = require('../dist/nodes/Cipp/advanced/actions/workflows');
const { execute: executeAlert } = require('../dist/nodes/Cipp/advanced/actions/alert');
const { execute: executeApplication } = require('../dist/nodes/Cipp/advanced/actions/application');
const { execute: executeUser } = require('../dist/nodes/Cipp/advanced/actions/user');
const { CippApp } = require('../dist/nodes/Cipp/CippApp.node');

function makeNode() {
	return {
		name: 'CIPP',
		type: '@joshuanode/n8n-nodes-cipp.cippApp',
		typeVersion: 1,
		position: [0, 0],
		parameters: {},
	};
}

function makeCredentials(suffix) {
	return {
		baseUrl: 'https://cipp.example.test',
		tenantId: `tenant-${suffix}`,
		clientId: `client-${suffix}`,
		clientSecret: 'test-secret',
	};
}

function makeApiContext(parameters, suffix, apiResponse = {}) {
	const requests = [];
	const context = {
		getNode: makeNode,
		getNodeParameter(name, _index, defaultValue) {
			return Object.hasOwn(parameters, name) ? parameters[name] : defaultValue;
		},
		async getCredentials() {
			return makeCredentials(suffix);
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
				return apiResponse;
			},
			returnJsonArray(value) {
				const values = Array.isArray(value) ? value : [value];
				return values.map((json) => ({ json }));
			},
			constructExecutionMetaData(value) {
				return value;
			},
		},
	};
	return { context, requests };
}

test('trusted tenant fields override caller-controlled payload fields', () => {
	assert.deepEqual(
		withTrustedTenant(
			{ tenantFilter: 'attacker.example', selectedTenants: 'attacker.example', value: 1 },
			'tenantFilter',
			'contoso.onmicrosoft.com',
		),
		{
			tenantFilter: 'contoso.onmicrosoft.com',
			selectedTenants: 'attacker.example',
			value: 1,
		},
	);
});

test('generic POST actions cannot override the selected tenant through their body', async () => {
	let apiRequest;
	const context = {
		getNode: makeNode,
		getNodeParameter(name, _index, defaultValue) {
			return name === 'tenantFilter' ? 'contoso.onmicrosoft.com' : defaultValue;
		},
		async getCredentials() {
			return makeCredentials('post-action');
		},
		helpers: {
			async httpRequest(options) {
				if (options.url.includes('/oauth2/v2.0/token')) {
					return { access_token: 'token', expires_in: 3600 };
				}
				apiRequest = options;
				return { ok: true };
			},
		},
	};

	await postAction(context, 0, '/api/TestAction', {
		tenantFilter: 'attacker.example',
		value: 1,
	});

	assert.equal(apiRequest.body.tenantFilter, 'contoso.onmicrosoft.com');
	assert.equal(apiRequest.body.value, 1);
});

test('Defender deployment JSON cannot override the selected tenant', async () => {
	let apiRequest;
	const parameters = {
		tenantFilter: 'contoso.onmicrosoft.com',
		deploymentConfig: JSON.stringify({
			selectedTenants: 'attacker.example',
			policyName: 'Defender baseline',
		}),
	};
	const context = {
		getNode: makeNode,
		getNodeParameter(name, _index, defaultValue) {
			return Object.hasOwn(parameters, name) ? parameters[name] : defaultValue;
		},
		async getCredentials() {
			return makeCredentials('defender');
		},
		helpers: {
			async httpRequest(options) {
				if (options.url.includes('/oauth2/v2.0/token')) {
					return { access_token: 'token', expires_in: 3600 };
				}
				apiRequest = options;
				return { ok: true };
			},
		},
	};

	await executePolicy(context, 'addDefenderDeployment', 0);

	assert.equal(apiRequest.body.selectedTenants, 'contoso.onmicrosoft.com');
	assert.equal(apiRequest.body.policyName, 'Defender baseline');
});

test('base bulk license JSON cannot override the selected tenant', async () => {
	const { context, requests } = makeApiContext({
		resource: 'user',
		operation: 'bulkLicense',
		tenantFilter: 'contoso.onmicrosoft.com',
		licenseJson: JSON.stringify([{ tenantFilter: 'attacker.example', userId: 'user-1' }]),
	}, 'base-bulk-license');

	await CippApp.prototype.execute.call(context);

	assert.equal(requests[0].body[0].tenantFilter, 'contoso.onmicrosoft.com');
	assert.equal(requests[0].body[0].userId, 'user-1');
});

test('base conditional access template JSON cannot override the selected tenant', async () => {
	const { context, requests } = makeApiContext({
		resource: 'conditionalAccess',
		operation: 'addTemplate',
		tenantFilter: 'contoso.onmicrosoft.com',
		caTemplateJson: JSON.stringify({ tenantFilter: 'attacker.example', displayName: 'CA template' }),
	}, 'base-ca-template');

	await CippApp.prototype.execute.call(context);

	assert.equal(requests[0].body.tenantFilter, 'contoso.onmicrosoft.com');
	assert.equal(requests[0].body.displayName, 'CA template');
});

test('base policy JSON cannot override the selected tenant', async () => {
	const { context, requests } = makeApiContext({
		resource: 'policy',
		operation: 'add',
		tenantFilter: 'contoso.onmicrosoft.com',
		policyConfig: JSON.stringify({ tenantFilter: 'attacker.example', displayName: 'Policy' }),
	}, 'base-policy');

	await CippApp.prototype.execute.call(context);

	assert.equal(requests[0].body.tenantFilter, 'contoso.onmicrosoft.com');
	assert.equal(requests[0].body.displayName, 'Policy');
});

test('CIPP v10.5 raw query and body cannot override an included selected tenant', async () => {
	const { context, requests } = makeApiContext({
		resource: 'cippV105',
		operation: 'addEnrollment',
		tenantFilter: 'contoso.onmicrosoft.com',
		v105IncludeTenant: true,
		v105QueryJson: JSON.stringify({ tenantFilter: 'attacker-query.example' }),
		v105BodyJson: JSON.stringify({ tenantFilter: 'attacker-body.example', value: 1 }),
		v105Options: {},
	}, 'base-v105');

	await CippApp.prototype.execute.call(context);

	assert.equal(requests[0].qs.tenantFilter, 'contoso.onmicrosoft.com');
	assert.equal(requests[0].body.tenantFilter, 'contoso.onmicrosoft.com');
	assert.equal(requests[0].body.value, 1);
});

test('CIPP v10.6 raw query and body cannot override an included selected tenant', async () => {
	const { context, requests } = makeApiContext({
		resource: 'cippV106',
		operation: 'execCopilotSettings',
		tenantFilter: 'contoso.onmicrosoft.com',
		v106IncludeTenant: true,
		v106QueryJson: JSON.stringify({ tenantFilter: 'attacker-query.example' }),
		v106BodyJson: JSON.stringify({ tenantFilter: 'attacker-body.example', value: 1 }),
		v106Options: {},
		v106CopilotSettingId: 'setting-1',
		v106CopilotValue: 'enabled',
	}, 'base-v106');

	await CippApp.prototype.execute.call(context);

	assert.equal(requests[0].qs.tenantFilter, 'contoso.onmicrosoft.com');
	assert.equal(requests[0].body.tenantFilter, 'contoso.onmicrosoft.com');
});

test('generic CIPP API request raw query and body cannot override its included tenant', async () => {
	const { context, requests } = makeApiContext({
		resource: 'tools',
		operation: 'cippApiRequest',
		cippApiMethod: 'POST',
		cippApiEndpoint: '/api/TestEndpoint',
		cippApiIncludeTenant: true,
		cippApiTenantFilter: 'contoso.onmicrosoft.com',
		cippApiQueryJson: JSON.stringify({ tenantFilter: 'attacker-query.example' }),
		cippApiBodyJson: JSON.stringify({ tenantFilter: 'attacker-body.example', value: 1 }),
		cippApiOptions: {},
	}, 'base-cipp-api');

	await CippApp.prototype.execute.call(context);

	assert.equal(requests[0].qs.tenantFilter, 'contoso.onmicrosoft.com');
	assert.equal(requests[0].body.tenantFilter, 'contoso.onmicrosoft.com');
	assert.equal(requests[0].body.value, 1);
});

test('advanced alert filters cannot override the selected tenant', async () => {
	const { context, requests } = makeApiContext({
		tenantFilter: 'contoso.onmicrosoft.com',
		auditSearchFilters: { tenantFilter: 'attacker.example', SearchId: 'search-1' },
		returnAll: true,
	}, 'advanced-alert', []);

	await executeAlert(context, 'listAuditLogSearches', 0);

	assert.equal(requests[0].qs.tenantFilter, 'contoso.onmicrosoft.com');
	assert.equal(requests[0].qs.SearchId, 'search-1');
});

test('advanced Win32 script options cannot override selected tenant or named fields', async () => {
	const { context, requests } = makeApiContext({
		tenantFilter: 'contoso.onmicrosoft.com',
		appName: 'Trusted app',
		appDescription: 'Trusted description',
		installScript: 'install.ps1',
		uninstallScript: 'uninstall.ps1',
		assignTo: 'user',
		win32ScriptOptions: {
			selectedTenants: 'attacker.example',
			applicationName: 'Attacker app',
			restartBehavior: 'allow',
		},
	}, 'advanced-win32');

	await executeApplication(context, 'addWin32Script', 0);

	assert.equal(requests[0].body.selectedTenants, 'contoso.onmicrosoft.com');
	assert.equal(requests[0].body.applicationName, 'Trusted app');
	assert.equal(requests[0].body.restartBehavior, 'allow');
});

test('advanced user edit fields cannot override the selected tenant or user', async () => {
	const { context, requests } = makeApiContext({
		tenantFilter: 'contoso.onmicrosoft.com',
		userId: 'trusted-user',
		editFields: {
			tenantFilter: 'attacker.example',
			id: 'attacker-user',
			displayName: 'Updated user',
		},
	}, 'advanced-user');

	await executeUser(context, 'edit', 0);

	assert.equal(requests[0].body.tenantFilter, 'contoso.onmicrosoft.com');
	assert.equal(requests[0].body.id, 'trusted-user');
	assert.equal(requests[0].body.displayName, 'Updated user');
});

test('cross-tenant sweep limit rejects values that can bypass the cap', () => {
	for (const value of [-1, 0, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
		assert.throws(() => normalizeMaxTenants(value), /positive integer/);
	}
});

test('cross-tenant sweep limit retains its default and hard upper cap', () => {
	assert.equal(normalizeMaxTenants(undefined), 20);
	assert.equal(normalizeMaxTenants(12), 12);
	assert.equal(normalizeMaxTenants(500), 50);
});

test('AI composite path preserves a structured error envelope for an invalid sweep limit', async () => {
	const result = JSON.parse(
		await executeComposite(
			{},
			'workflows',
			'crossTenantSweep',
			'',
			{ composite: 'licenseAudit', maxTenants: -1 },
			'bestEffort',
		),
	);

	assert.equal(result.success, false);
	assert.equal(result.error.errorType, 'API_ERROR');
	assert.match(result.error.message, /maxTenants must be a positive integer/);
});

test('cross-tenant sweep returns an AI error envelope when tenant discovery fails', async () => {
	const { context } = makeApiContext({}, 'sweep-list-failure');
	context.helpers.httpRequest = async (options) => {
		if (options.url.includes('/oauth2/v2.0/token')) {
			return { access_token: 'token', expires_in: 3600 };
		}
		throw new Error('tenant discovery unavailable');
	};

	const result = JSON.parse(await executeComposite(
		context,
		'workflows',
		'crossTenantSweep',
		'',
		{ composite: 'licenseAudit' },
		'bestEffort',
	));

	assert.equal(result.success, false);
	assert.match(result.error.message, /tenant\.getAll/);
});

test('best-effort license audit returns an AI error envelope when its root step fails', async () => {
	const { context } = makeApiContext({}, 'license-root-failure');
	context.helpers.httpRequest = async (options) => {
		if (options.url.includes('/oauth2/v2.0/token')) {
			return { access_token: 'token', expires_in: 3600 };
		}
		throw new Error('license inventory unavailable');
	};

	const result = JSON.parse(await executeComposite(
		context,
		'workflows',
		'licenseAudit',
		'contoso.onmicrosoft.com',
		{},
		'bestEffort',
	));

	assert.equal(result.success, false);
	assert.match(result.error.message, /tenant\.getLicenses/);
});

test('best-effort security posture fails when every root step is unavailable', async () => {
	const { context } = makeApiContext({}, 'security-root-outage');
	context.helpers.httpRequest = async (options) => {
		if (options.url.includes('/oauth2/v2.0/token')) {
			return { access_token: 'token', expires_in: 3600 };
		}
		throw new Error('security root unavailable');
	};

	const result = JSON.parse(await executeComposite(
		context,
		'workflows',
		'securityPosture',
		'contoso.onmicrosoft.com',
		{},
		'bestEffort',
	));

	assert.equal(result.success, false);
	assert.match(result.error.message, /all root steps failed/);
});

test('best-effort BEC investigation fails when every root step is unavailable', async () => {
	const { context } = makeApiContext({}, 'bec-root-outage');
	context.helpers.httpRequest = async (options) => {
		if (options.url.includes('/oauth2/v2.0/token')) {
			return { access_token: 'token', expires_in: 3600 };
		}
		throw new Error('BEC root unavailable');
	};

	const result = JSON.parse(await executeComposite(
		context,
		'workflows',
		'becInvestigation',
		'contoso.onmicrosoft.com',
		{},
		'bestEffort',
	));

	assert.equal(result.success, false);
	assert.match(result.error.message, /all root steps failed/);
});

test('best-effort security posture remains successful when one root step succeeds', async () => {
	const { context } = makeApiContext({}, 'security-partial');
	let apiCall = 0;
	context.helpers.httpRequest = async (options) => {
		if (options.url.includes('/oauth2/v2.0/token')) {
			return { access_token: 'token', expires_in: 3600 };
		}
		apiCall += 1;
		if (apiCall === 1) return [];
		throw new Error('optional security signal unavailable');
	};

	const result = JSON.parse(await executeComposite(
		context,
		'workflows',
		'securityPosture',
		'contoso.onmicrosoft.com',
		{},
		'bestEffort',
	));

	assert.equal(result.success, true);
	assert.equal(result.result.steps[0].ok, true);
	assert.equal(result.result.steps[1].ok, false);
	assert.equal(result.result.indicators.identity.mfaCoveredPct, 100);
	assert.equal(result.result.indicators.identity.basicAuthEnabled, null);
	assert.equal(result.result.indicators.identity.basicAuthProtocols, null);
	assert.equal(result.result.indicators.access.caPoliciesCount, null);
	assert.equal(result.result.indicators.access.caPoliciesEnabledCount, null);
	assert.equal(result.result.indicators.access.caPoliciesReportOnlyCount, null);
	assert.equal(result.result.indicators.access.hasMfaRequirementPolicy, null);
	assert.equal(result.result.indicators.access.hasLegacyAuthBlockPolicy, null);
	assert.ok(result.result.gaps.includes('Basic authentication posture unavailable (step failed)'));
	assert.ok(result.result.gaps.includes('Conditional Access posture unavailable (step failed)'));
	assert.ok(!result.result.gaps.includes('No Conditional Access policies found'));
});

test('best-effort security posture distinguishes failed MFA from successful empty basic auth and CA data', async () => {
	const { context } = makeApiContext({}, 'security-mfa-partial');
	context.helpers.httpRequest = async (options) => {
		if (options.url.includes('/oauth2/v2.0/token')) {
			return { access_token: 'token', expires_in: 3600 };
		}
		if (
			options.url.endsWith('/api/ListBasicAuth') ||
			options.url.endsWith('/api/ListConditionalAccessPolicies')
		) {
			return [];
		}
		throw new Error('security signal unavailable');
	};

	const result = JSON.parse(await executeComposite(
		context,
		'workflows',
		'securityPosture',
		'contoso.onmicrosoft.com',
		{},
		'bestEffort',
	));

	assert.equal(result.success, true);
	assert.equal(result.result.indicators.identity.mfaCoveredPct, null);
	assert.equal(result.result.indicators.identity.usersEvaluated, null);
	assert.equal(result.result.indicators.identity.usersWithoutMfa, null);
	assert.equal(result.result.indicators.identity.usersWithoutMfaTotal, null);
	assert.equal(result.result.indicators.identity.adminGaps, null);
	assert.equal(result.result.indicators.identity.basicAuthEnabled, false);
	assert.deepEqual(result.result.indicators.identity.basicAuthProtocols, []);
	assert.equal(result.result.indicators.access.caPoliciesCount, 0);
	assert.equal(result.result.indicators.access.caPoliciesEnabledCount, 0);
	assert.equal(result.result.indicators.access.caPoliciesReportOnlyCount, 0);
	assert.equal(result.result.indicators.access.hasMfaRequirementPolicy, false);
	assert.equal(result.result.indicators.access.hasLegacyAuthBlockPolicy, false);
	assert.ok(result.result.gaps.includes('MFA posture unavailable (step failed)'));
	assert.ok(result.result.gaps.includes('No Conditional Access policies found'));
});

test('best-effort security posture reports each unavailable email signal without fabricating an absent policy', async () => {
	const { context } = makeApiContext({}, 'security-email-partial');
	context.helpers.httpRequest = async (options) => {
		if (options.url.includes('/oauth2/v2.0/token')) {
			return { access_token: 'token', expires_in: 3600 };
		}
		if (
			options.url.endsWith('/api/ListMFAUsers') ||
			options.url.endsWith('/api/ListBasicAuth') ||
			options.url.endsWith('/api/ListConditionalAccessPolicies') ||
			options.url.endsWith('/api/ListSafeAttachmentsFilters') ||
			options.url.endsWith('/api/ListSafeLinksPolicy')
		) {
			return [];
		}
		throw new Error('security signal unavailable');
	};

	const result = JSON.parse(await executeComposite(
		context,
		'workflows',
		'securityPosture',
		'contoso.onmicrosoft.com',
		{},
		'bestEffort',
	));

	assert.equal(result.success, true);
	assert.equal(result.result.indicators.email.hasAntiPhishingPolicy, null);
	assert.equal(result.result.indicators.email.hasSafeAttachments, false);
	assert.equal(result.result.indicators.email.hasSafeLinks, false);
	assert.ok(result.result.gaps.includes('Anti-phishing policy posture unavailable (step failed)'));
	assert.ok(result.result.gaps.includes('No Safe Attachments policy configured (requires Defender for Office 365)'));
	assert.ok(result.result.gaps.includes('No Safe Links policy configured (requires Defender for Office 365)'));
	assert.ok(!result.result.gaps.includes('No anti-phishing policy configured'));
});

test('cross-tenant best-effort sweep captures one tenant root failure and continues', async () => {
	const { context } = makeApiContext({}, 'sweep-partial');
	context.helpers.httpRequest = async (options) => {
		if (options.url.includes('/oauth2/v2.0/token')) {
			return { access_token: 'token', expires_in: 3600 };
		}
		if (options.url.endsWith('/api/ListTenants')) {
			return [
				{ customerId: 'tenant-a', defaultDomainName: 'a.example' },
				{ customerId: 'tenant-b', defaultDomainName: 'b.example' },
			];
		}
		if (options.url.endsWith('/api/ListLicenses') && options.qs.tenantFilter === 'a.example') {
			throw new Error('tenant A license inventory unavailable');
		}
		return [];
	};

	const result = JSON.parse(await executeComposite(
		context,
		'workflows',
		'crossTenantSweep',
		'',
		{ composite: 'licenseAudit', maxTenants: 2 },
		'bestEffort',
	));

	assert.equal(result.success, true);
	assert.equal(result.result.tenantsScanned, 2);
	assert.equal(result.result.tenantsErrored, 1);
	assert.match(result.result.errors['a.example'], /tenant\.getLicenses/);
	assert.ok(result.result.results['b.example']);
});

test('regular Workflow node throws when a composite returns an error envelope', async () => {
	const parameters = {
		failMode: 'fast',
		tenantFilter: 'contoso.onmicrosoft.com',
		inactiveDays: 90,
	};
	const context = {
		getNode: makeNode,
		getNodeParameter(name, _index, defaultValue) {
			return Object.hasOwn(parameters, name) ? parameters[name] : defaultValue;
		},
		async getCredentials() {
			return makeCredentials('workflow');
		},
		helpers: {
			async httpRequest(options) {
				if (options.url.includes('/oauth2/v2.0/token')) {
					return { access_token: 'token', expires_in: 3600 };
				}
				throw new Error('upstream license inventory failed');
			},
		},
	};

	await assert.rejects(
		() => executeWorkflow(context, 'licenseAudit', 0),
		/CIPP API Error \(Status Unknown\)/,
	);
});

test('regular cross-tenant Workflow throws when tenant discovery fails', async () => {
	const { context } = makeApiContext({
		failMode: 'bestEffort',
		sweepComposite: 'licenseAudit',
		tenantIds: '',
		maxTenants: 20,
	}, 'regular-sweep-failure');
	context.helpers.httpRequest = async (options) => {
		if (options.url.includes('/oauth2/v2.0/token')) {
			return { access_token: 'token', expires_in: 3600 };
		}
		throw new Error('tenant discovery unavailable');
	};

	await assert.rejects(
		() => executeWorkflow(context, 'crossTenantSweep', 0),
		/tenant\.getAll/,
	);
});
