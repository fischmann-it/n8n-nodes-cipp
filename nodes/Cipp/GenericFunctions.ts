import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';

import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import {
	clearCachedCippAccessToken,
	createCippTokenRequest,
	getCachedCippAccessToken,
	performCippApiRequest,
} from './CippApiClient';
import type { ICippRequestControl } from './CippApiClient';
import type { ICippCredentials, ITenant } from './types';

const NODE_TOKEN_CACHE_NAMESPACE = 'node-request';

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
					expiresInSeconds: (response.expires_in as number) || 3600,
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
	body: IDataObject | IDataObject[] = {},
	query: IDataObject = {},
	requestControl: ICippRequestControl = {},
): Promise<IDataObject> {
	const credentials = (await this.getCredentials('cippApi')) as unknown as ICippCredentials;

	const accessToken = await getAccessToken.call(this, credentials);
	return (await performCippApiRequest(
		this,
		credentials,
		accessToken,
		method,
		endpoint,
		body,
		query,
		() => clearCachedCippAccessToken(credentials, NODE_TOKEN_CACHE_NAMESPACE),
		requestControl,
	)) as IDataObject;
}

/**
 * Fetches the list of tenants from CIPP
 */
export async function getTenantList(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
): Promise<ITenant[]> {
	const response = await cippApiRequest.call(this, 'GET', '/api/ListTenants', {}, {});

	if (Array.isArray(response)) {
		return response as ITenant[];
	}

	if (response.Results && Array.isArray(response.Results)) {
		return response.Results as ITenant[];
	}

	return [];
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

	return '';
}
