import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IDataObject,
	IHttpRequestOptions,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

import {
	createCippTokenRequest,
	getCachedCippAccessToken,
} from '../nodes/Cipp/CippApiClient';

const CREDENTIAL_TOKEN_CACHE_NAMESPACE = 'credential-authenticate';

function getCredentialString(credentials: ICredentialDataDecryptedObject, name: string): string {
	const value = credentials[name];

	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error(`Missing required CIPP credential field: ${name}`);
	}

	return value.trim();
}

async function getAccessToken(credentials: ICredentialDataDecryptedObject): Promise<string> {
	const tenantId = getCredentialString(credentials, 'tenantId');
	const clientId = getCredentialString(credentials, 'clientId');
	const clientSecret = getCredentialString(credentials, 'clientSecret');
	const authCredentials = { baseUrl: '', tenantId, clientId, clientSecret };

	return getCachedCippAccessToken(
		authCredentials,
		CREDENTIAL_TOKEN_CACHE_NAMESPACE,
		async () => {
			const tokenRequest = createCippTokenRequest(authCredentials);
			const response = await fetch(tokenRequest.url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: tokenRequest.body,
			});
			const responseBody = (await response.json().catch(() => ({}))) as IDataObject;

			if (!response.ok || typeof responseBody.access_token !== 'string') {
				const message =
					(responseBody.error_description as string | undefined) ||
					(responseBody.error as string | undefined) ||
					`Azure AD token request failed with status ${response.status}`;
				throw new Error(message);
			}

			return {
				accessToken: responseBody.access_token,
				expiresInSeconds:
					typeof responseBody.expires_in === 'number' ? responseBody.expires_in : 3600,
			};
		},
	);
}

export class CippApi implements ICredentialType {
	name = 'cippApi';
	displayName = 'CIPP.app API';
	icon: Icon = 'file:cipp.svg';
	documentationUrl = 'https://docs.cipp.app/api-documentation/setup-and-authentication';
	genericAuth = true;
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/ListTenants',
			method: 'GET',
		},
	};

	properties: INodeProperties[] = [
		{
			displayName: 'CIPP Instance URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'https://cipp.yourdomain.com',
			description: 'The base URL of your CIPP deployment (API URL)',
		},
		{
			displayName: 'Azure AD Tenant ID',
			name: 'tenantId',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
			description: 'Your Azure AD Tenant ID (where the CIPP-SAM app registration lives)',
		},
		{
			displayName: 'Application (Client) ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
			description: 'The Application (Client) ID from your CIPP-SAM Azure AD App Registration',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'The Client Secret from your CIPP-SAM Azure AD App Registration',
		},
		{
			displayName: 'Enable Tenant List Cache',
			name: 'enableTenantCache',
			type: 'boolean',
			default: false,
			description: 'Whether to cache the tenant dropdown list in memory',
		},
		{
			displayName: 'Tenant List Cache TTL',
			name: 'tenantCacheTtl',
			type: 'number',
			default: 30,
			description: 'How many minutes to retain tenant dropdown results',
			typeOptions: {
				minValue: 1,
				maxValue: 1440,
			},
			displayOptions: {
				show: {
					enableTenantCache: [true],
				},
			},
		},
		{
			displayName: 'Enable Secure Score Cache',
			name: 'enableSecureScoreCache',
			type: 'boolean',
			default: false,
			description: 'Whether to cache Secure Score responses in memory',
		},
		{
			displayName: 'Secure Score Cache TTL',
			name: 'secureScoreCacheTtl',
			type: 'number',
			default: 60,
			description: 'How many minutes to retain Secure Score responses',
			typeOptions: {
				minValue: 1,
				maxValue: 1440,
			},
			displayOptions: {
				show: {
					enableSecureScoreCache: [true],
				},
			},
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const accessToken = await getAccessToken(credentials);

		requestOptions.headers = {
			...((requestOptions.headers as IDataObject | undefined) ?? {}),
			Authorization: `Bearer ${accessToken}`,
			Accept: 'application/json',
		};

		return requestOptions;
	}
}
