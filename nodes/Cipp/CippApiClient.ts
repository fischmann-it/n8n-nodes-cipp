import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';

import { NodeApiError } from 'n8n-workflow';

interface ICippAuthCredentials {
	baseUrl: string;
	tenantId: string;
	clientId: string;
	clientSecret: string;
}

interface ICachedAccessToken {
	accessToken: string;
	expiresAt: number;
}

interface IAcquiredAccessToken {
	accessToken: string;
	expiresInSeconds: number;
}

type CippNodeContext = IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions;

export interface ICippRequestControl {
	timeoutMs?: number;
}

const tokenCache = new Map<string, ICachedAccessToken>();
const MAX_TOKEN_CACHE_SIZE = 50;

function getTokenCacheKey(
	credentials: Pick<ICippAuthCredentials, 'clientId' | 'tenantId'>,
	cacheNamespace: string,
): string {
	return `${cacheNamespace}:${credentials.clientId}:${credentials.tenantId}`;
}

function evictExpiredTokens(): void {
	const now = Date.now();
	for (const [key, token] of tokenCache) {
		if (token.expiresAt <= now) tokenCache.delete(key);
	}
}

export function normalizeCippBaseUrl(baseUrl: string): string {
	return baseUrl.trim().replace(/\/+$/, '');
}

function joinCippUrl(baseUrl: string, endpoint: string): string {
	const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
	return `${normalizeCippBaseUrl(baseUrl)}${normalizedEndpoint}`;
}

export function createCippTokenRequest(
	credentials: Pick<ICippAuthCredentials, 'tenantId' | 'clientId' | 'clientSecret'>,
): { url: string; body: string } {
	const scope = `api://${credentials.clientId}/.default`;
	return {
		url: `https://login.microsoftonline.com/${credentials.tenantId}/oauth2/v2.0/token`,
		body: `grant_type=client_credentials&client_id=${encodeURIComponent(credentials.clientId)}&client_secret=${encodeURIComponent(credentials.clientSecret)}&scope=${encodeURIComponent(scope)}`,
	};
}

export async function getCachedCippAccessToken(
	credentials: Pick<ICippAuthCredentials, 'clientId' | 'tenantId'>,
	cacheNamespace: string,
	acquire: () => Promise<IAcquiredAccessToken>,
): Promise<string> {
	const cacheKey = getTokenCacheKey(credentials, cacheNamespace);
	const cached = tokenCache.get(cacheKey);

	if (cached && cached.expiresAt > Date.now() + 300000) {
		return cached.accessToken;
	}

	try {
		const token = await acquire();

		if (tokenCache.size >= MAX_TOKEN_CACHE_SIZE) {
			evictExpiredTokens();
			if (tokenCache.size >= MAX_TOKEN_CACHE_SIZE) {
				const firstKey = tokenCache.keys().next().value;
				if (firstKey !== undefined) tokenCache.delete(firstKey);
			}
		}

		tokenCache.set(cacheKey, {
			accessToken: token.accessToken,
			expiresAt: Date.now() + token.expiresInSeconds * 1000,
		});
		return token.accessToken;
	} catch (error) {
		tokenCache.delete(cacheKey);
		throw error;
	}
}

export function clearCachedCippAccessToken(
	credentials: Pick<ICippAuthCredentials, 'clientId' | 'tenantId'>,
	cacheNamespace: string,
): void {
	tokenCache.delete(getTokenCacheKey(credentials, cacheNamespace));
}

export async function performCippApiRequest(
	context: CippNodeContext,
	credentials: ICippAuthCredentials,
	accessToken: string,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | IDataObject[],
	query: IDataObject,
	onUnauthorized: () => void,
	requestControl: ICippRequestControl = {},
): Promise<unknown> {
	let deadlineSignal: AbortSignal | undefined;
	const options: IHttpRequestOptions = {
		method,
		url: joinCippUrl(credentials.baseUrl, endpoint),
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		qs: query,
		json: true,
	};
	if (requestControl.timeoutMs !== undefined) {
		options.timeout = requestControl.timeoutMs;
		deadlineSignal = AbortSignal.timeout(requestControl.timeoutMs);
		options.abortSignal = deadlineSignal;
	}

	if (Object.keys(body).length > 0) options.body = body;

	try {
		const request = context.helpers.httpRequest(options);
		if (requestControl.timeoutMs === undefined) return await request;

		const timeoutMs = requestControl.timeoutMs;
		const deadline = new Promise<never>((_, reject) => {
			deadlineSignal?.addEventListener('abort', () => {
				const timeoutError = new Error(`CIPP API request timed out after ${timeoutMs} ms`);
				(timeoutError as Error & { code: string }).code = 'CIPP_REQUEST_TIMEOUT';
				reject(timeoutError);
			}, { once: true });
		});
		return await Promise.race([request, deadline]);
	} catch (error: unknown) {
		const errorResponse = (error || {}) as JsonObject;
		const err = error as {
			statusCode?: number;
			response?: { status?: number; statusCode?: number };
			error?: { message?: string; error_description?: string };
			message?: string;
		};
		const statusCode = err.statusCode || err.response?.status || err.response?.statusCode;
		if ((error as { code?: string }).code === 'CIPP_REQUEST_TIMEOUT') {
			throw new NodeApiError(context.getNode(), errorResponse, {
				message: 'CIPP API request timed out',
				description: err.message,
			});
		}

		if (statusCode === 401) {
			onUnauthorized();
			throw new NodeApiError(context.getNode(), errorResponse, {
				message: 'Authentication failed',
				description:
					'Your access token has expired or is invalid. Check your CIPP API credentials.',
			});
		}

		if (statusCode === 403) {
			throw new NodeApiError(context.getNode(), errorResponse, {
				message: 'Permission denied',
				description:
					'Your API client does not have permission to perform this action. Check your CIPP API client role.',
			});
		}

		if (statusCode === 404) {
			throw new NodeApiError(context.getNode(), errorResponse, {
				message: 'Resource not found',
				description:
					err.error?.message ||
					'The requested resource does not exist. Check your tenant filter and IDs.',
			});
		}

		if (statusCode === 429) {
			throw new NodeApiError(context.getNode(), errorResponse, {
				message: 'Rate limit exceeded',
				description: 'Too many requests. Please wait before retrying.',
			});
		}

		const errorMessage =
			err.error?.message || err.error?.error_description || err.message || 'Unknown error';

		throw new NodeApiError(context.getNode(), errorResponse, {
			message: `CIPP API Error (Status ${statusCode || 'Unknown'})`,
			description: errorMessage,
		});
	}
}
