import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INode,
	JsonObject,
} from 'n8n-workflow';

import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import {
	clearCachedCippAccessToken,
	createCippTokenRequest,
	getCachedCippAccessToken,
	normalizeCippBaseUrl,
	performCippApiRequest,
} from '../CippApiClient';
import type { ICippRequestControl } from '../CippApiClient';
import type {
	ICippCredentials,
	ISecureScoreCacheEntry,
	ITenant,
	ITenantCacheEntry,
} from './types';

function validateCredentials(creds: IDataObject): ICippCredentials {
	const baseUrl = creds.baseUrl as string;
	const tenantId = creds.tenantId as string;
	const clientId = creds.clientId as string;
	const clientSecret = creds.clientSecret as string;
	if (!baseUrl || !tenantId || !clientId || !clientSecret) {
		throw new Error('Missing required CIPP API credentials (baseUrl, tenantId, clientId, clientSecret)');
	}
	const enableTenantCache = creds.enableTenantCache === true;
	const tenantCacheTtl = typeof creds.tenantCacheTtl === 'number' ? creds.tenantCacheTtl : 30;
	const enableSecureScoreCache = creds.enableSecureScoreCache === true;
	const secureScoreCacheTtl = typeof creds.secureScoreCacheTtl === 'number' ? creds.secureScoreCacheTtl : 60;
	return {
		baseUrl,
		tenantId,
		clientId,
		clientSecret,
		enableTenantCache,
		tenantCacheTtl,
		enableSecureScoreCache,
		secureScoreCacheTtl,
	};
}

const NODE_TOKEN_CACHE_NAMESPACE = 'node-request';

// Tenant list cache to avoid repeated ListTenants calls in the dropdown
const tenantCache = new Map<string, ITenantCacheEntry>();
const MAX_TENANT_CACHE_SIZE = 50;

function evictExpiredTenantEntries(): void {
	const now = Date.now();
	for (const [key, entry] of tenantCache) {
		if (entry.expiresAt <= now) {
			tenantCache.delete(key);
		}
	}
}

// Raw Secure Score arrays keyed by normalized baseUrl, client/tenant identity, target, and depth.
const secureScoreCache = new Map<string, ISecureScoreCacheEntry>();
const MAX_SECURE_SCORE_CACHE_SIZE = 200;

function evictExpiredSecureScoreEntries(): void {
	const now = Date.now();
	for (const [key, entry] of secureScoreCache) {
		if (entry.expiresAt <= now) {
			secureScoreCache.delete(key);
		}
	}
}

function getEndpointCacheKey(credentials: ICippCredentials): string {
	return `${normalizeCippBaseUrl(credentials.baseUrl)}:${credentials.clientId}:${credentials.tenantId}`;
}

/**
 * Gets OAuth2 access token from Azure AD using client credentials flow
 */
export async function getAccessToken(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	credentials: ICippCredentials,
): Promise<string> {
	try {
		return await getCachedCippAccessToken(
			credentials,
			NODE_TOKEN_CACHE_NAMESPACE,
			async () => {
				const tokenRequest = createCippTokenRequest(credentials);
				const options: IHttpRequestOptions = {
					method: 'POST',
					url: tokenRequest.url,
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: tokenRequest.body,
					json: true,
				};
				const response = (await this.helpers.httpRequest(options)) as IDataObject;

				if (!response.access_token) {
					throw new NodeOperationError(this.getNode(), 'No access token in response');
				}

				return {
					accessToken: response.access_token as string,
					expiresInSeconds: Number(response.expires_in) || 3600,
				};
			},
		);
	} catch (error) {
		const err = error as IDataObject;

		throw new NodeApiError(this.getNode(), (error || {}) as JsonObject, {
			message: 'Failed to authenticate with CIPP',
			description:
				(err.error_description as string) ||
				(err.message as string) ||
				'Check your Azure AD credentials and ensure the app registration is configured correctly',
		});
	}
}

/**
 * Makes an authenticated request to the CIPP API
 */
export async function cippApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	requestControl: ICippRequestControl = {},
): Promise<IDataObject | IDataObject[]> {
	const credentials = validateCredentials(await this.getCredentials('cippApi'));

	const accessToken = await getAccessToken.call(this, credentials);
	const response = await performCippApiRequest(
		this,
		credentials,
		accessToken,
		method,
		endpoint,
		body,
		query,
		() => {
			clearCachedCippAccessToken(credentials, NODE_TOKEN_CACHE_NAMESPACE);
			const endpointCacheKey = getEndpointCacheKey(credentials);
			tenantCache.delete(endpointCacheKey);
			for (const key of secureScoreCache.keys()) {
				if (key.startsWith(endpointCacheKey + ':')) secureScoreCache.delete(key);
			}
		},
		requestControl,
	);

	if (response === null || response === undefined) {
		return {} as IDataObject;
	}
	if (typeof response === 'string' || typeof response === 'number' || typeof response === 'boolean') {
		return { result: response } as IDataObject;
	}
	return response as IDataObject | IDataObject[];
}

/**
 * Fetches the list of tenants from CIPP
 */
export async function getTenantList(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
): Promise<ITenant[]> {
	const credentials = validateCredentials(await this.getCredentials('cippApi'));
	const cacheKey = getEndpointCacheKey(credentials);

	// Check cache if enabled
	if (credentials.enableTenantCache) {
		const cached = tenantCache.get(cacheKey);
		if (cached && cached.expiresAt > Date.now()) {
			return [...cached.tenants];
		}
	}

	// Fetch fresh from API
	const response = await cippApiRequest.call(this, 'POST', '/api/ListTenants', {}, {});

	let tenants: ITenant[];
	if (Array.isArray(response)) {
		tenants = response as unknown as ITenant[];
	} else if (response.Results && Array.isArray(response.Results)) {
		tenants = response.Results as ITenant[];
	} else {
		tenants = [];
	}

	// Store in cache if enabled
	if (credentials.enableTenantCache) {
		const ttlMs = (credentials.tenantCacheTtl ?? 30) * 60000;
		if (tenantCache.size >= MAX_TENANT_CACHE_SIZE) {
			evictExpiredTenantEntries();
			if (tenantCache.size >= MAX_TENANT_CACHE_SIZE) {
				const firstKey = tenantCache.keys().next().value;
				if (firstKey !== undefined) tenantCache.delete(firstKey);
			}
		}
		tenantCache.set(cacheKey, { tenants, expiresAt: Date.now() + ttlMs });
	}

	return tenants;
}

/**
 * Fetch raw secure score array for a tenant, using an in-memory cache.
 * The CIPP instance URL is part of the key so two deployments using the same
 * Azure app identity cannot share endpoint-derived data. Output transforms are
 * applied after this returns, so one entry serves all modes for the same data.
 */
export async function getSecureScoreCached(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	tenantFilter: string,
	top: number,
): Promise<IDataObject[]> {
	const credentials = validateCredentials(await this.getCredentials('cippApi'));
	const baseKey = getEndpointCacheKey(credentials);
	const scoreKey = `${baseKey}:${tenantFilter}:${top}`;

	if (credentials.enableSecureScoreCache) {
		const cached = secureScoreCache.get(scoreKey);
		if (cached && cached.expiresAt > Date.now()) {
			return [...(cached.data as IDataObject[])];
		}
	}

	const qs: IDataObject = {
		tenantFilter,
		Endpoint: 'security/secureScores',
		'$top': top,
	};
	const scoreData = await cippApiRequest.call(this, 'GET', '/api/ListGraphRequest', {}, qs);

	let raw: IDataObject[];
	if (Array.isArray(scoreData)) {
		raw = scoreData as IDataObject[];
	} else if (scoreData && Array.isArray((scoreData as IDataObject).Results)) {
		raw = (scoreData as IDataObject).Results as IDataObject[];
	} else if (scoreData && Array.isArray((scoreData as IDataObject).value)) {
		raw = (scoreData as IDataObject).value as IDataObject[];
	} else {
		raw = scoreData ? [scoreData as IDataObject] : [];
	}

	if (credentials.enableSecureScoreCache) {
		const ttlMs = (credentials.secureScoreCacheTtl ?? 60) * 60000;
		if (secureScoreCache.size >= MAX_SECURE_SCORE_CACHE_SIZE) {
			evictExpiredSecureScoreEntries();
			if (secureScoreCache.size >= MAX_SECURE_SCORE_CACHE_SIZE) {
				const firstKey = secureScoreCache.keys().next().value;
				if (firstKey !== undefined) secureScoreCache.delete(firstKey);
			}
		}
		secureScoreCache.set(scoreKey, { data: raw, expiresAt: Date.now() + ttlMs });
	}

	return raw;
}

/**
 * Helper to get a resource locator value (handles both list and id modes)
 */
export function getResourceLocatorValue(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}

	if (value && typeof value === 'object') {
		const locator = value as { mode: string; value: string };
		return locator.value || '';
	}

	if (value === undefined || value === null || value === '') {
		return '';
	}

	throw new Error(`Unexpected tenant filter type: ${typeof value}`);
}

/**
 * Extracts the tenant filter from the resource locator parameter, returning '' if not set.
 * Uses getNodeParameter default to safely return '' when the parameter is not registered
 * for the current operation, while still surfacing real errors (bad types, corrupt state).
 */
export function getTenantFilter(context: IExecuteFunctions, i: number): string {
	const tenantValue = context.getNodeParameter('tenantFilter', i, '') as IDataObject | string;
	return getResourceLocatorValue(tenantValue);
}

/**
 * Strips Graph API URL prefixes and leading slashes from an endpoint string.
 */
export function normalizeGraphEndpoint(endpoint: string): string {
	return endpoint
		.trim()
		.replace(/^https?:\/\/graph\.microsoft\.com\/(?:v1\.0|beta)\//i, '')
		.replace(/^(?:v1\.0|beta)\//i, '')
		.replace(/^\/+/, '');
}

/**
 * Parses a value as JSON, returning an IDataObject or IDataObject[].
 * Throws a friendly NodeOperationError on invalid input.
 */
export function parseJsonPayload(
	node: INode,
	value: unknown,
	fieldName: string,
	itemIndex: number,
): IDataObject | IDataObject[] {
	if (value === undefined || value === null || value === '') {
		return {};
	}

	if (typeof value === 'string') {
		try {
			const parsed = JSON.parse(value) as unknown;

			if (Array.isArray(parsed) || (parsed !== null && typeof parsed === 'object')) {
				return parsed as IDataObject | IDataObject[];
			}
		} catch {
			// fall through to throw below
		}

		throw new NodeOperationError(node, `${fieldName} must be valid JSON (object or array).`, {
			itemIndex,
		});
	}

	if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
		return value as IDataObject | IDataObject[];
	}

	throw new NodeOperationError(node, `${fieldName} must be a JSON object or array.`, {
		itemIndex,
	});
}

/**
 * Like parseJsonPayload but enforces the result is an object (not array).
 */
export function parseJsonObjectPayload(
	node: INode,
	value: unknown,
	fieldName: string,
	itemIndex: number,
): IDataObject {
	const parsed = parseJsonPayload(node, value, fieldName, itemIndex);

	if (Array.isArray(parsed)) {
		throw new NodeOperationError(node, `${fieldName} must be a JSON object.`, {
			itemIndex,
		});
	}

	return parsed;
}

/**
 * Returns true if the payload (object or array) has content.
 */
export function hasPayloadContent(payload: IDataObject | IDataObject[]): boolean {
	return Array.isArray(payload) ? payload.length > 0 : Object.keys(payload).length > 0;
}

/**
 * Returns true if the endpoint matches the Teams schedule path pattern.
 */
export function isTeamsScheduleEndpoint(endpoint: string): boolean {
	return /^teams\/[^/]+\/schedule(?:\/.*)?$/i.test(endpoint);
}

/**
 * Lists items from a CIPP endpoint, applying returnAll/limit slicing.
 * Replaces the common pattern of: call API → check returnAll → slice to limit.
 */
export async function listWithSlice(
	context: IExecuteFunctions,
	i: number,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
	const returnAll = context.getNodeParameter('returnAll', i) as boolean;
	let responseData = await cippApiRequest.call(context, method, endpoint, body, qs);

	// Unwrap common CIPP response wrappers to get the underlying array
	if (!Array.isArray(responseData) && responseData !== null && typeof responseData === 'object') {
		if (Array.isArray(responseData.Results)) {
			responseData = responseData.Results as IDataObject[];
		} else if (Array.isArray(responseData.value)) {
			responseData = responseData.value as IDataObject[];
		}
	}

	if (Array.isArray(responseData) && !returnAll) {
		const limit = context.getNodeParameter('limit', i) as number;
		responseData = responseData.slice(0, limit);
	}
	return responseData;
}

/**
 * Executes a POST action against a CIPP endpoint, automatically reading
 * tenantFilter and merging it into the body.
 */
export async function postAction(
	context: IExecuteFunctions,
	i: number,
	endpoint: string,
	body: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
	const tenantFilter = getTenantFilter(context, i);
	return cippApiRequest.call(
		context,
		'POST',
		endpoint,
		withTrustedTenant(body, 'tenantFilter', tenantFilter),
		{},
	);
}

/**
 * Adds a tenant field after caller-controlled payload fields so the trusted
 * node selection cannot be replaced by JSON or a reusable action body.
 */
export function withTrustedTenant(
	body: IDataObject,
	field: string,
	tenant: string,
): IDataObject {
	return { ...body, [field]: tenant };
}

/**
 * Builds an OData-style query string from base params and OData options.
 */
export function buildOdataQuery(
	baseQs: IDataObject,
	params: { select?: string | string[]; filter?: string; top?: number; orderby?: string },
): IDataObject {
	const qs = { ...baseQs };
	if (params.select) {
		const parts = Array.isArray(params.select) ? params.select : [params.select];
		const joined = parts.filter(Boolean).join(',');
		if (joined) qs.$select = joined;
	}
	if (params.filter) qs.$filter = params.filter;
	if (params.top) qs.$top = params.top;
	if (params.orderby) qs.$orderby = params.orderby;
	return qs;
}
