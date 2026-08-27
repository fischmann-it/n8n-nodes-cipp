import type {
	ICredentialsDecrypted,
	ICredentialTestFunctions,
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	INodeCredentialTestResult,
	INodeExecutionData,
	INodeListSearchResult,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import {
	cippApiRequest,
	getResourceLocatorValue,
	getTenantList,
} from './GenericFunctions';

import { operationFields, resourceFields } from './descriptions';
import {
	getAdvancedRouterResource,
	isAdvancedOnlyOperation,
} from './descriptions/AdvancedOperations';
import { router as advancedRouter } from './advanced/actions/router';
import {
	buildGraphRequestQuery,
	extractGraphPage,
	GRAPH_MAX_PAGES_DEFAULT,
	GRAPH_REQUEST_TIMEOUT_MS,
	paginateGraphRequest,
	parseGraphMaxPages,
	withGraphRequestDeadline,
} from './GraphRequestUtils';

export class CippApp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CIPP.app',
		name: 'cippApp',
		icon: 'file:cipp.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage Microsoft 365 tenants via CIPP.app',
		defaults: {
			name: 'CIPP.app',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'cippApi',
				required: true,
				testedBy: 'cippApiCredentialTest',
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Alert',
						value: 'alert',
						description: 'Manage alerts and security incidents',
					},
					{
						name: 'Application',
						value: 'application',
						description: 'Manage Intune applications',
					},
					{
						name: 'Autopilot',
						value: 'autopilot',
						description: 'Manage Autopilot devices',
					},
					{
						name: 'Backup',
						value: 'backup',
						description: 'Manage CIPP backups',
					},
					{
						name: 'CIPP Admin',
						value: 'cippAdmin',
						description: 'Manage CIPP platform settings, setup, extensions, and webhooks',
					},
					{
						name: 'CIPP Core',
						value: 'cippCore',
						description: 'Manage CIPP diagnostics, functions, versions, and logs',
					},
					{
						name: 'CIPP v10.5',
						value: 'cippV105',
						description: 'Use CIPP v10.5 API additions',
					},
					{
						name: 'CIPP v10.6',
						value: 'cippV106',
						description: 'Use CIPP v10.6 API additions',
					},
					{
						name: 'Conditional Access',
						value: 'conditionalAccess',
						description: 'Manage conditional access policies and named locations',
					},
					{
						name: 'Contact',
						value: 'contact',
						description: 'Manage Exchange contacts, templates, and permissions',
					},
					{
						name: 'Device',
						value: 'device',
						description: 'Manage Intune devices',
					},
					{
						name: 'Email Security',
						value: 'emailSecurity',
						description: 'Manage spam filters, transport rules, connectors, and email security policies',
					},
					{
						name: 'Exchange Resource',
						value: 'exchangeResource',
						description: 'Manage Exchange rooms, equipment, and room lists',
					},
					{
						name: 'GDAP',
						value: 'gdap',
						description: 'Manage GDAP partner relationships',
					},
					{
						name: 'Group',
						value: 'group',
						description: 'Manage Azure AD groups',
					},
					{
						name: 'Identity',
						value: 'identity',
						description: 'Manage audit logs, roles, and deleted items',
					},
					{
						name: 'Intune',
						value: 'intune',
						description: 'Manage Intune scripts, compliance policies, assignment filters, and reusable settings',
					},
					{
						name: 'Mailbox',
						value: 'mailbox',
						description: 'Manage Exchange mailboxes',
					},
					{
						name: 'OneDrive',
						value: 'onedrive',
						description: 'Provision and manage OneDrive',
					},
					{
						name: 'Policy',
						value: 'policy',
						description: 'Manage Intune policies and Defender TVM',
					},
					{
						name: 'Quarantine',
						value: 'quarantine',
						description: 'Manage quarantined email messages',
					},
					{
						name: 'Safe Link',
						value: 'safeLinks',
						description: 'Manage Safe Links policies and templates',
					},
					{
						name: 'Scheduled Item',
						value: 'scheduledItem',
						description: 'Manage scheduled jobs',
					},
					{
						name: 'SharePoint',
						value: 'sharepoint',
						description: 'Manage SharePoint sites, quotas, and settings',
					},
					{
						name: 'Spam Filter',
						value: 'spamfilter',
						description: 'Manage spam filters, quarantine policies, and templates',
					},
					{
						name: 'Standard',
						value: 'standards',
						description: 'Manage tenant standards, drift, BPA, and domain analyser',
					},
					{
						name: 'Team',
						value: 'team',
						description: 'Manage Teams and SharePoint',
					},
					{
						name: 'Teams Shift',
						value: 'teamsShift',
						description: 'Manage Teams Shifts schedule — shifts, open shifts, groups, time off',
					},
					{
						name: 'Tenant',
						value: 'tenant',
						description: 'List and manage tenants',
					},
					{
						name: 'Testing',
						value: 'testing',
						description: 'Manage test runs, test reports, and available tests',
					},
					{
						name: 'Tool',
						value: 'tools',
						description: 'Breach search and Graph requests',
					},
					{
						name: 'Transport',
						value: 'transport',
						description: 'Manage transport rules, connectors, and connection filters',
					},
					{
						name: 'User',
						value: 'user',
						description: 'Manage Azure AD users',
					},
					{
						name: 'Voice',
						value: 'voice',
						description: 'Manage Teams Voice',
					},
					{
						name: 'Workflow',
						value: 'workflows',
						description: 'Run composite CIPP investigations, audits, and cross-tenant sweeps',
					},
				],
				default: 'tenant',
			},
			...operationFields,
			...resourceFields,
		],
		usableAsTool: true,
	};

	methods = {
		credentialTest: {
			async cippApiCredentialTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				try {
					const creds = credential.data as IDataObject;
					const baseUrl = (creds.baseUrl as string).replace(/\/$/, '');
					const tenantId = creds.tenantId as string;
					const clientId = creds.clientId as string;
					const clientSecret = creds.clientSecret as string;

					// Step 1: Get OAuth token from Azure AD
					const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
					const scope = `api://${clientId}/.default`;

					const tokenBody = `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&scope=${encodeURIComponent(scope)}`;

					const tokenRequest = await fetch(tokenUrl, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
						},
						body: tokenBody,
					});
					const tokenResponse = (await tokenRequest.json().catch(() => ({}))) as IDataObject;

					if (!tokenRequest.ok || typeof tokenResponse.access_token !== 'string') {
						return {
							status: 'Error',
							message: 'Failed to obtain access token from Azure AD. Check your Tenant ID, Client ID, and Client Secret.',
						};
					}

					// Step 2: Test API connection with the token
					const testRequest = await fetch(`${baseUrl}/api/ListTenants`, {
						method: 'GET',
						headers: {
							Authorization: `Bearer ${tokenResponse.access_token}`,
							Accept: 'application/json',
						},
					});

					if (!testRequest.ok) {
						return {
							status: 'Error',
							message: `CIPP API test request failed with status ${testRequest.status}.`,
						};
					}

					return {
						status: 'OK',
						message: 'Connection successful!',
					};
				} catch (error) {
					const err = error as { message?: string; statusCode?: number };
					return {
						status: 'Error',
						message: `Connection failed: ${err.message || 'Unknown error'}`,
					};
				}
			},
		},
		listSearch: {
			async tenantSearch(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const tenants = await getTenantList.call(this);

				const results = tenants
					.filter((tenant) => {
						if (!filter) return true;
						const searchTerm = (filter || '').toLowerCase();
						return (
							tenant.displayName?.toLowerCase().includes(searchTerm) ||
							tenant.defaultDomainName?.toLowerCase().includes(searchTerm)
						);
					})
					.map((tenant) => ({
						name: tenant.displayName || tenant.defaultDomainName,
						value: tenant.defaultDomainName,
						url: `https://portal.azure.com/${tenant.defaultDomainName}`,
					}));

				return { results };
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const normalizeGraphEndpoint = (endpoint: string): string =>
			endpoint
				.trim()
				.replace(/^https?:\/\/graph\.microsoft\.com\/(?:v1\.0|beta)\//i, '')
				.replace(/^(?:v1\.0|beta)\//i, '')
				.replace(/^\/+/, '');
		const parseJsonPayload = (
			value: unknown,
			fieldName: string,
			itemIndex: number,
		): IDataObject | IDataObject[] => {
			if (value === undefined || value === null || value === '') {
				return {};
			}

			if (typeof value === 'string') {
				try {
					const parsed = JSON.parse(value) as unknown;

					if (Array.isArray(parsed) || (parsed !== null && typeof parsed === 'object')) {
						return parsed as IDataObject | IDataObject[];
					}
				} catch (error) {
					void error;
				}

				throw new NodeOperationError(
					this.getNode(),
					`${fieldName} must be valid JSON (object or array).`,
					{ itemIndex },
				);
			}

			if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
				return value as IDataObject | IDataObject[];
			}

			throw new NodeOperationError(
				this.getNode(),
				`${fieldName} must be a JSON object or array.`,
				{ itemIndex },
			);
		};
		const parseJsonObjectPayload = (
			value: unknown,
			fieldName: string,
			itemIndex: number,
		): IDataObject => {
			const parsed = parseJsonPayload(value, fieldName, itemIndex);

			if (Array.isArray(parsed)) {
				throw new NodeOperationError(this.getNode(), `${fieldName} must be a JSON object.`, {
					itemIndex,
				});
			}

			return parsed;
		};
		const hasPayloadContent = (payload: IDataObject | IDataObject[]): boolean =>
			Array.isArray(payload) ? payload.length > 0 : Object.keys(payload).length > 0;
		const getOffboardRecipientValue = (value: unknown): unknown => {
			if (typeof value !== 'object' || value === null || Array.isArray(value)) return value;

			const recipient = value as IDataObject;
			return recipient.value ?? recipient.userPrincipalName ?? recipient.UserPrincipalName ?? recipient.id;
		};
		const normalizeOffboardRecipients = (
			value: unknown,
			fieldName: string,
			itemIndex: number,
		): string[] => {
			let recipients = value;
			if (typeof recipients === 'string') {
				const trimmed = recipients.trim();
				if (!trimmed) return [];
				if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
					try {
						recipients = JSON.parse(trimmed) as unknown;
					} catch {
						throw new NodeOperationError(
							this.getNode(),
							`${fieldName} must be a comma-separated list or valid JSON.`,
							{ itemIndex },
						);
					}
				} else {
					recipients = trimmed.split(',');
				}
			}

			const normalized = (Array.isArray(recipients) ? recipients : [recipients])
				.map((recipient) => getOffboardRecipientValue(recipient))
				.filter((recipient): recipient is string => typeof recipient === 'string')
				.map((recipient) => recipient.trim())
				.filter(Boolean);

			if (normalized.length === 0) {
				throw new NodeOperationError(
					this.getNode(),
					`${fieldName} must contain at least one user identifier.`,
					{ itemIndex },
				);
			}

			return normalized;
		};
		const isTeamsScheduleEndpoint = (endpoint: string): boolean =>
			/^teams\/[^/]+\/schedule(?:\/.*)?$/i.test(endpoint);
		const normalizeCippEndpoint = (endpoint: string): string => {
			const trimmed = endpoint.trim();
			if (!trimmed) {
				throw new NodeOperationError(this.getNode(), 'Endpoint is required.');
			}

			const withoutOrigin = trimmed.replace(/^https?:\/\/[^/]+/i, '');
			const withLeadingSlash = withoutOrigin.startsWith('/') ? withoutOrigin : `/${withoutOrigin}`;
			return withLeadingSlash.toLowerCase().startsWith('/api/')
				? withLeadingSlash
				: `/api${withLeadingSlash}`;
		};
		const splitCsv = (value: unknown): string[] | undefined => {
			if (typeof value !== 'string' || value.trim() === '') {
				return undefined;
			}

			return value
				.split(',')
				.map((entry) => entry.trim())
				.filter(Boolean);
		};
		const v105Endpoints: Record<string, { method: IHttpRequestMethods; endpoint: string }> = {
			addAssignmentFilterTemplate: { method: 'POST', endpoint: '/api/AddAssignmentFilterTemplate' },
			addDlpCompliancePolicy: { method: 'POST', endpoint: '/api/AddDlpCompliancePolicy' },
			addEnrollment: { method: 'POST', endpoint: '/api/AddEnrollment' },
			addGroupTeam: { method: 'POST', endpoint: '/api/AddGroupTeam' },
			addRetentionCompliancePolicy: { method: 'POST', endpoint: '/api/AddRetentionCompliancePolicy' },
			addSensitiveInfoType: { method: 'POST', endpoint: '/api/AddSensitiveInfoType' },
			addSensitivityLabel: { method: 'POST', endpoint: '/api/AddSensitivityLabel' },
			addUserBulk: { method: 'POST', endpoint: '/api/AddUserBulk' },
			assignPolicy: { method: 'POST', endpoint: '/api/ExecAssignPolicy' },
			editAssignmentFilter: { method: 'POST', endpoint: '/api/EditAssignmentFilter' },
			editDlpCompliancePolicy: { method: 'POST', endpoint: '/api/EditDlpCompliancePolicy' },
			editRetentionCompliancePolicy: { method: 'POST', endpoint: '/api/EditRetentionCompliancePolicy' },
			editSensitiveInfoType: { method: 'POST', endpoint: '/api/EditSensitiveInfoType' },
			editSensitivityLabel: { method: 'POST', endpoint: '/api/EditSensitivityLabel' },
			execAssignmentFilter: { method: 'DELETE', endpoint: '/api/ExecAssignmentFilter' },
			execMailboxRestore: { method: 'POST', endpoint: '/api/ExecMailboxRestore' },
			execMcp: { method: 'POST', endpoint: '/api/ExecMcp' },
			execSpoVersionCleanup: { method: 'POST', endpoint: '/api/ExecSPOVersionCleanup' },
			listActiveSyncDevices: { method: 'GET', endpoint: '/api/ListActiveSyncDevices' },
			listAndroidEnrollmentProfiles: { method: 'POST', endpoint: '/api/ListAndroidEnrollmentProfiles' },
			listAppleEnrollmentProfiles: { method: 'POST', endpoint: '/api/ListAppleEnrollmentProfiles' },
			listAssignmentFilterTemplates: { method: 'GET', endpoint: '/api/ListAssignmentFilterTemplates' },
			listCspSku: { method: 'GET', endpoint: '/api/ListCSPsku' },
			listDlpCompliancePolicy: { method: 'GET', endpoint: '/api/ListDlpCompliancePolicy' },
			listHveAccounts: { method: 'GET', endpoint: '/api/ListHVEAccounts' },
			listLicensesReport: { method: 'GET', endpoint: '/api/ListLicensesReport' },
			listMailboxRestores: { method: 'GET', endpoint: '/api/ListMailboxRestores' },
			listRetentionCompliancePolicy: { method: 'GET', endpoint: '/api/ListRetentionCompliancePolicy' },
			listSensitiveInfoType: { method: 'GET', endpoint: '/api/ListSensitiveInfoType' },
			listSensitivityLabel: { method: 'GET', endpoint: '/api/ListSensitivityLabel' },
			listSnoozedAlerts: { method: 'GET', endpoint: '/api/ListSnoozedAlerts' },
			patchUser: { method: 'PATCH', endpoint: '/api/PatchUser' },
			removeAdminRole: { method: 'POST', endpoint: '/api/ExecRemoveAdminRole' },
			removeAssignmentFilterTemplate: { method: 'POST', endpoint: '/api/RemoveAssignmentFilterTemplate' },
			removeDlpCompliancePolicy: { method: 'POST', endpoint: '/api/RemoveDlpCompliancePolicy' },
			removeEnrollmentProfile: { method: 'POST', endpoint: '/api/ExecRemoveEnrollmentProfile' },
			removeRetentionCompliancePolicy: { method: 'POST', endpoint: '/api/RemoveRetentionCompliancePolicy' },
			removeSensitiveInfoType: { method: 'POST', endpoint: '/api/RemoveSensitiveInfoType' },
			removeSensitivityLabel: { method: 'POST', endpoint: '/api/RemoveSensitivityLabel' },
			removeSnooze: { method: 'POST', endpoint: '/api/ExecRemoveSnooze' },
			setCasMailbox: { method: 'POST', endpoint: '/api/ExecSetCASMailbox' },
			setPackageTag: { method: 'POST', endpoint: '/api/ExecSetPackageTag' },
			snoozeAlert: { method: 'POST', endpoint: '/api/ExecSnoozeAlert' },
		};
		const v106Endpoints: Record<string, { method: IHttpRequestMethods; endpoint: string }> = {
			addIntunePolicyClone: { method: 'POST', endpoint: '/api/AddIntunePolicyClone' },
			execAddCippCveException: { method: 'POST', endpoint: '/api/ExecAddCippCveException' },
			execBackupReplicationConfig: { method: 'POST', endpoint: '/api/ExecBackupReplicationConfig' },
			execBulkRemoveSharingLinks: { method: 'POST', endpoint: '/api/ExecBulkRemoveSharingLinks' },
			execCopilotSettings: { method: 'POST', endpoint: '/api/ExecCopilotSettings' },
			execGdapRepairRoleMappings: { method: 'POST', endpoint: '/api/ExecGDAPRepairRoleMappings' },
			execRemoveCippCveException: { method: 'POST', endpoint: '/api/ExecRemoveCippCveException' },
			execRemoveSpoExternalUser: { method: 'POST', endpoint: '/api/ExecRemoveSPOExternalUser' },
			execRemoveSharingLink: { method: 'POST', endpoint: '/api/ExecRemoveSharingLink' },
			execRemoveSiteUser: { method: 'POST', endpoint: '/api/ExecRemoveSiteUser' },
			execRestoreDeletedSite: { method: 'POST', endpoint: '/api/ExecRestoreDeletedSite' },
			execRestoreRecycleBinItems: { method: 'POST', endpoint: '/api/ExecRestoreRecycleBinItems' },
			execSamCertificate: { method: 'POST', endpoint: '/api/ExecSAMCertificate' },
			execSetLibraryPermission: { method: 'POST', endpoint: '/api/ExecSetLibraryPermission' },
			execSetSiteProperties: { method: 'POST', endpoint: '/api/ExecSetSiteProperties' },
			execShadowAiSanction: { method: 'POST', endpoint: '/api/ExecShadowAISanction' },
			listAgent365PackageDetail: { method: 'GET', endpoint: '/api/ListAgent365PackageDetail' },
			listAgent365Packages: { method: 'GET', endpoint: '/api/ListAgent365Packages' },
			listAlertResults: { method: 'GET', endpoint: '/api/ListAlertResults' },
			listAuditLogCoverage: { method: 'GET', endpoint: '/api/ListAuditLogCoverage' },
			listCopilotSettings: { method: 'GET', endpoint: '/api/ListCopilotSettings' },
			listCopilotUsage: { method: 'GET', endpoint: '/api/ListCopilotUsage' },
			listCveManagement: { method: 'GET', endpoint: '/api/ListCVEManagement' },
			listDeletedSites: { method: 'GET', endpoint: '/api/ListDeletedSites' },
			listSensitiveInfoTypeRulePackage: { method: 'GET', endpoint: '/api/ListSensitiveInfoTypeRulePackage' },
			listShadowAi: { method: 'GET', endpoint: '/api/ListShadowAI' },
			listSharePointExternalUsers: { method: 'GET', endpoint: '/api/ListSharePointExternalUsers' },
			listSharePointSharing: { method: 'GET', endpoint: '/api/ListSharePointSharing' },
			listSiteLibraries: { method: 'GET', endpoint: '/api/ListSiteLibraries' },
			listSiteProperties: { method: 'GET', endpoint: '/api/ListSiteProperties' },
			listSiteRecycleBin: { method: 'GET', endpoint: '/api/ListSiteRecycleBin' },
			listSpoVersionCleanup: { method: 'GET', endpoint: '/api/ListSPOVersionCleanup' },
		};

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[] = {};

				// Get tenant filter if applicable
				const getTenantFilter = (): string => {
					try {
						const tenantValue = this.getNodeParameter('tenantFilter', i) as IDataObject;
						return getResourceLocatorValue(tenantValue);
					} catch {
						return '';
					}
				};

				// ==================== TENANT ====================
				if (isAdvancedOnlyOperation(resource, operation)) {
					responseData = await advancedRouter(
						this,
						getAdvancedRouterResource(resource),
						operation,
						i,
					);
				}
				else if (resource === 'tenant') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const options = this.getNodeParameter('options', i, {}) as IDataObject;

						const qs: IDataObject = {};
						if (options.allTenantSelector) {
							qs.allTenantSelector = true;
						}

						responseData = await cippApiRequest.call(this, 'GET', '/api/ListTenants', {}, qs);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'clearCache') {
						const clearTenantOnly = this.getNodeParameter('clearCacheTenantOnly', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ListTenants',
							{
								ClearCache: true,
								TenantsOnly: clearTenantOnly,
							},
							{},
						);
					} else if (operation === 'getLicenses') {
						const tenantFilter = getTenantFilter();
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const licenseOptions = this.getNodeParameter('licenseOptions', i, {}) as IDataObject;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListLicenses',
							{},
							{ tenantFilter },
						);

						// Strip out AssignedUsers and AssignedGroups if summaryOnly is enabled
						if (licenseOptions.summaryOnly && Array.isArray(responseData)) {
							responseData = (responseData as IDataObject[]).map((license) => {
								const summary = { ...license };
								delete summary.AssignedUsers;
								delete summary.AssignedGroups;
								return summary;
							});
						}

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'getCspLicenses') {
						const tenantFilter = getTenantFilter();
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListCSPLicenses',
							{},
							{ tenantFilter },
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'cspLicenseAction') {
						const tenantFilter = getTenantFilter();
						const action = this.getNodeParameter('cspAction', i) as string;
						const licenseSku = this.getNodeParameter('licenseSku', i) as string;
						const quantity = this.getNodeParameter('licenseQuantity', i) as number;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecCSPLicense',
							{
								tenantFilter,
								LicenseSKU: licenseSku,
								Quantity: quantity,
								Action: action,
							},
							{},
						);
					} else if (operation === 'listDefenderState') {
						const tenantFilter = getTenantFilter();
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListDefenderState',
							{},
							{ tenantFilter },
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listCspSkus') {
						const tenantFilter = getTenantFilter();
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListCSPSKUs',
							{},
							{ tenantFilter },
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					}
				}

				// ==================== USER ====================
				else if (resource === 'user') {
					const tenantFilter = getTenantFilter();

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const userFields = this.getNodeParameter('userFields', i, []) as string[];
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

						const qs: IDataObject = {
							tenantFilter,
							Endpoint: 'users',
						};

						// Build select fields from multi-select + additional fields
						const selectFields: string[] = [...userFields];
						if (filters.select) {
							const additionalFields = (filters.select as string).split(',').map((f) => f.trim());
							selectFields.push(...additionalFields);
						}
						if (selectFields.length > 0) {
							qs['$select'] = selectFields.join(',');
						}

						if (filters.filter) qs['$filter'] = filters.filter;

						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							qs['$top'] = limit;
						}

						responseData = await cippApiRequest.call(this, 'GET', '/api/ListGraphRequest', {}, qs);
					} else if (operation === 'add') {
						const firstName = this.getNodeParameter('firstName', i) as string;
						const lastName = this.getNodeParameter('lastName', i) as string;
						const domain = this.getNodeParameter('domain', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						// Map to the field names CIPP's /api/AddUser (New-CIPPUser) expects:
						// - givenName (not firstName)
						// - surname (not lastName)
						// - username (used for mailNickname + UPN prefix)
						// - primDomain (object with .value, or Domain as plain string)
						const body: IDataObject = {
							tenantFilter,
							givenName: additionalFields.givenName || firstName || '',
							surname: additionalFields.surname || lastName || '',
							displayName: additionalFields.displayName || `${firstName || ''} ${lastName || ''}`.trim(),
							username: additionalFields.username || additionalFields.mailNickname || (firstName || '').toLowerCase(),
							mailNickname: additionalFields.mailNickname || additionalFields.username || (firstName || '').toLowerCase(),
							Domain: domain,
							usageLocation: additionalFields.usageLocation || 'US',
						};

						// Spread remaining additionalFields (but don't overwrite mapped fields)
						for (const [key, value] of Object.entries(additionalFields)) {
							if (!body[key] && value !== undefined && value !== '') {
								body[key] = value;
							}
						}

						// Wrap copyFrom and setManager as {value: id} objects if they're plain strings
						// CIPP's AddUser expects these as objects with a .value property
						if (body.copyFrom && typeof body.copyFrom === 'string') {
							body.copyFrom = { value: body.copyFrom };
						}
						if (body.setManager && typeof body.setManager === 'string') {
							body.setManager = { value: body.setManager };
						}

						// CIPP's New-CIPPUser reads `password` (used verbatim if present, else random)
						// and `MustChangePass`. `password` is already spread above; map the
						// mustChangePassword toggle to the field name CIPP expects.
						if (additionalFields.mustChangePassword !== undefined) {
							body.MustChangePass = additionalFields.mustChangePassword;
							delete body.mustChangePassword;
						}

						responseData = await cippApiRequest.call(this, 'POST', '/api/AddUser', body, {});
					} else if (operation === 'disable' || operation === 'enable') {
						const userId = this.getNodeParameter('userId', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecDisableUser',
							{
								tenantFilter,
								ID: userId,
								Enable: operation === 'enable',
							},
							{},
						);
					} else if (operation === 'resetPassword') {
						const userId = this.getNodeParameter('userId', i) as string;
						const options = this.getNodeParameter('passwordOptions', i, {}) as IDataObject;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecResetPass',
							{
								tenantFilter,
								ID: userId,
								MustChange: options.mustChangePass !== false,
							},
							{},
						);
					} else if (operation === 'remove') {
						const userId = this.getNodeParameter('userId', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/RemoveUser',
							{
								tenantFilter,
								ID: userId,
							},
							{},
						);
					} else if (operation === 'resetMfa') {
						const userId = this.getNodeParameter('userId', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecResetMFA',
							{
								tenantFilter,
								ID: userId,
							},
							{},
						);
					} else if (operation === 'sendMfaPush') {
						const userId = this.getNodeParameter('userId', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecSendPush',
							{
								tenantFilter,
								UserEmail: userId,
							},
							{},
						);
					} else if (operation === 'setPerUserMfa') {
						const userId = this.getNodeParameter('userId', i) as string;
						const mfaState = this.getNodeParameter('mfaState', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecPerUserMFA',
							{
								tenantFilter,
								userId,
								State: mfaState,
							},
							{},
						);
					} else if (operation === 'createTap') {
						const userId = this.getNodeParameter('userId', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecCreateTAP',
							{
								tenantFilter,
								ID: userId,
							},
							{},
						);
					} else if (operation === 'clearImmutableId') {
						const userId = this.getNodeParameter('userId', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecClrImmId',
							{
								tenantFilter,
								ID: userId,
							},
							{},
						);
					} else if (operation === 'revokeSessions') {
						const userId = this.getNodeParameter('userId', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecRevokeSessions',
							{
								tenantFilter,
								ID: userId,
							},
							{},
						);
					} else if (operation === 'offboard') {
						const users = this.getNodeParameter('usersToOffboard', i) as string;
						const scheduled = this.getNodeParameter('scheduledOffboard', i) as boolean;
						const offboardOptions = this.getNodeParameter('offboardOptions', i, {}) as IDataObject;
						const parsedUsers = parseJsonPayload(users, 'Users to Offboard', i);
						const userEntries = Array.isArray(parsedUsers) ? parsedUsers : [parsedUsers];
						const userValues = userEntries
							.map((user) => {
								if (typeof user === 'string') return user;
								return (
									(user.value as string | undefined) ??
									(user.userPrincipalName as string | undefined) ??
									(user.UserPrincipalName as string | undefined) ??
									(user.mail as string | undefined) ??
									(user.id as string | undefined)
								);
							})
							.filter((user): user is string => Boolean(user));

						if (userValues.length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'Users to Offboard must contain at least one user identifier.',
								{ itemIndex: i },
							);
						}

						const offboardBody: IDataObject = {
							tenantFilter,
							user: userValues.map((value) => ({ value })),
						};
						// Keep this list aligned with Test-CIPPOffboardingRequest and
						// Invoke-CIPPOffboardingJob; the generated OpenAPI schema can lag those sources.
						const supportedOffboardOptions = [
							'DisableSignIn',
							'RevokeSessions',
							'ResetPass',
							'removeCalendarInvites',
							'removePermissions',
							'removeCalendarPermissions',
							'RemoveRules',
							'RemoveGroups',
							'RemoveLicenses',
							'RemoveMobile',
							'ConvertToShared',
							'HideFromGAL',
							'ClearImmutableId',
							'RemoveMFADevices',
							'RemoveTeamsPhoneDID',
							'DeleteUser',
							'DisableOneDriveSharing',
							'disableForwarding',
							'OOO',
							'forward',
							'KeepCopy',
							'OnedriveAccess',
							'AccessAutomap',
							'AccessNoAutomap',
						];
						const collectionOffboardOptions = new Set([
							'OnedriveAccess',
							'AccessAutomap',
							'AccessNoAutomap',
						]);
						const applyOffboardOption = (key: string, value: unknown): void => {
							if (value === undefined || value === null || value === '' || value === false) return;

							if (collectionOffboardOptions.has(key)) {
								// The executable CIPP helpers accept scalar or array recipients and normalize
								// label/value objects themselves; send string arrays for multiple recipients.
								offboardBody[key] = normalizeOffboardRecipients(value, key, i);
								return;
							}

							if (key === 'forward') {
								const recipient = getOffboardRecipientValue(value);
								if (typeof recipient !== 'string' || !recipient.trim()) {
									throw new NodeOperationError(
										this.getNode(),
										'Forward Email To must contain a user identifier.',
										{ itemIndex: i },
									);
								}
								// Invoke-CIPPOffboardingJob reads Options.forward.value even though the
								// generated OpenAPI schema currently describes this field as a string.
								offboardBody.forward = { value: recipient.trim() };
								return;
							}

							offboardBody[key] =
								typeof value === 'object' && 'value' in value
									? (value as IDataObject).value
									: value;
						};
						for (const userEntry of userEntries) {
							if (typeof userEntry !== 'object' || userEntry === null) continue;
							for (const key of supportedOffboardOptions) {
								const value = (userEntry as IDataObject)[key];
								applyOffboardOption(key, value);
							}
						}
						if (scheduled) {
							const scheduledDate = this.getNodeParameter('scheduledOffboardDate', i) as string;
							const scheduledDateMilliseconds = Date.parse(scheduledDate);
							if (!Number.isFinite(scheduledDateMilliseconds) || scheduledDateMilliseconds <= 0) {
								throw new NodeOperationError(
									this.getNode(),
									'Scheduled Time must be a valid date after January 1, 1970.',
									{ itemIndex: i },
								);
							}
							const scheduledDateUnix = Math.floor(scheduledDateMilliseconds / 1000);
							offboardBody.Scheduled = { enabled: true, date: scheduledDateUnix };
						}
						for (const [key, value] of Object.entries(offboardOptions)) {
							applyOffboardOption(key, value);
						}
						if (offboardBody.disableForwarding === true && offboardBody.forward) {
							throw new NodeOperationError(
								this.getNode(),
								'Disable Email Forwarding and Forward Email To cannot be used together.',
								{ itemIndex: i },
							);
						}
						const postExecution = this.getNodeParameter('offboardPostExecution', i, {}) as IDataObject;
						if (Object.values(postExecution).some((value) => value === true)) {
							offboardBody.PostExecution = postExecution;
						}
						const reference = this.getNodeParameter('offboardReference', i, '') as string;
						if (reference.trim()) {
							offboardBody.reference = reference.trim();
						}

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecOffboardUser',
							offboardBody,
							{},
						);
					} else if (operation === 'listInactiveAccounts') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListInactiveAccounts',
							{},
							{ tenantFilter },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listSignIns') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListSignIns',
							{},
							{ tenantFilter },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listMfaUsers') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListMFAUsers',
							{},
							{ tenantFilter },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'dismissRiskyUser') {
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecDismissRiskyUser',
							{
								tenantFilter,
								ID: userId,
							},
							{},
						);
					} else if (operation === 'listJitAdmin') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListJITAdmin',
							{},
							{ tenantFilter },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'execJitAdmin') {
						const userId = this.getNodeParameter('userId', i) as string;
						const jitAdminRole = this.getNodeParameter('jitAdminRole', i) as string;
						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecJITAdmin',
							{
								tenantFilter,
								ID: userId,
								Role: jitAdminRole,
							},
							{},
						);
					} else if (operation === 'listUserDevices') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListUserDevices',
							{},
							{ tenantFilter, userId },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listUserGroups') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListUserGroups',
							{},
							{ tenantFilter, userId },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listUserMailboxDetails') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListUserMailboxDetails',
							{},
							{ tenantFilter, UserID: userId },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listUserPhoto') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListUserPhoto',
							{},
							{ tenantFilter, userId },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listUserCAPolicies') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListUserConditionalAccessPolicies',
							{},
							{ tenantFilter, userId },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listUserSettings') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListUserSettings',
							{},
							{ tenantFilter, userId },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listPerUserMfa') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListPerUserMFA',
							{},
							{ tenantFilter },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listUserCounts') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListUserCounts',
							{},
							{ tenantFilter },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'addGuest') {
						const displayName = this.getNodeParameter('guestDisplayName', i) as string;
						const mail = this.getNodeParameter('guestMail', i) as string;
						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/AddGuest',
							{
								tenantFilter,
								displayName,
								mail,
							},
							{},
						);
					} else if (operation === 'setUserPhoto') {
						const userId = this.getNodeParameter('userId', i) as string;
						const photo = this.getNodeParameter('photo', i) as string;
						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecSetUserPhoto',
							{
								tenantFilter,
								userId,
								photo,
							},
							{},
						);
					} else if (operation === 'bulkLicense') {
						const licenseJson = this.getNodeParameter('licenseJson', i) as string;
						const parsedLicense = parseJsonPayload(licenseJson, 'License JSON', i);
						const licenseRequests = (
							Array.isArray(parsedLicense)
								? parsedLicense
								: Array.isArray(parsedLicense.requests)
									? (parsedLicense.requests as IDataObject[])
									: [parsedLicense]
						).map((request) => ({
							...request,
							tenantFilter,
						}));

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecBulkLicense',
							licenseRequests,
							{},
						);
					}
				}

				// ==================== GROUP ====================
				else if (resource === 'group') {
					const tenantFilter = getTenantFilter();

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const options = this.getNodeParameter('options', i, {}) as IDataObject;

						const qs: IDataObject = { tenantFilter };
						if (options.groupId) qs.groupId = options.groupId;
						if (options.members) qs.members = true;
						if (options.owners) qs.owners = true;

						responseData = await cippApiRequest.call(this, 'GET', '/api/ListGroups', {}, qs);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'add') {
						const groupName = this.getNodeParameter('groupName', i) as string;
						const groupType = this.getNodeParameter('groupType', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/AddGroup',
							{
								tenantFilter,
								displayName: groupName,
								groupType,
							},
							{},
						);
					} else if (operation === 'edit') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const groupType = this.getNodeParameter('groupTypeForEdit', i, '') as string;
						const editOptions = this.getNodeParameter('editOptions', i, {}) as IDataObject;

						const splitList = (v: string) =>
							v
								.split(',')
								.map((x) => x.trim())
								.filter((x) => x !== '');

						// CIPP's EditGroup reads PascalCase, singular field names and uses groupType
						// to route between Graph (Microsoft 365 / Security) and Exchange Online
						// (Distribution List / Mail-Enabled Security). Without the right type or
						// field names the request returns 200 with an empty Results array (silent no-op).
						const body: IDataObject = {
							tenantFilter,
							groupId,
							groupType,
						};

						// AddMember resolves bare UPN strings to object IDs server-side, so a plain
						// string array works for both Graph and Exchange paths.
						if (editOptions.addMembers) {
							body.AddMember = splitList(editOptions.addMembers as string);
						}
						// RemoveMember / AddOwner / RemoveOwner are keyed off `.value` server-side,
						// so they must be objects.
						if (editOptions.removeMembers) {
							body.RemoveMember = splitList(editOptions.removeMembers as string).map((v) => ({
								value: v,
							}));
						}
						if (editOptions.addOwners) {
							body.AddOwner = splitList(editOptions.addOwners as string).map((v) => ({ value: v }));
						}
						if (editOptions.removeOwners) {
							body.RemoveOwner = splitList(editOptions.removeOwners as string).map((v) => ({
								value: v,
							}));
						}

						responseData = await cippApiRequest.call(this, 'POST', '/api/EditGroup', body, {});
					} else if (operation === 'delete') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const groupType = this.getNodeParameter('groupTypeForDelete', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecGroupsDelete',
							{
								tenantFilter,
								ID: groupId,
								groupType,
							},
							{},
						);
					} else if (operation === 'hideFromGal') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const groupEmail = this.getNodeParameter('groupEmail', i) as string;
						const groupType = this.getNodeParameter('groupTypeForDelete', i) as string;
						const hideFromGal = this.getNodeParameter('hideFromGal', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecGroupsHideFromGAL',
							{
								tenantFilter,
								ID: groupId,
								groupEmail,
								groupType,
								HideFromGAL: hideFromGal,
							},
							{},
						);
					} else if (operation === 'deliveryManagement') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const groupEmail = this.getNodeParameter('groupEmail', i) as string;
						const groupType = this.getNodeParameter('groupTypeForDelete', i) as string;
						const onlyInternal = this.getNodeParameter('onlyInternal', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecGroupsDeliveryManagement',
							{
								tenantFilter,
								ID: groupId,
								groupEmail,
								groupType,
								OnlyAllowInternal: onlyInternal,
							},
							{},
						);
					}
				}

				// ==================== CONDITIONAL ACCESS ====================
				else if (resource === 'conditionalAccess') {
					const tenantFilter = getTenantFilter();

					if (operation === 'listPolicies') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListConditionalAccessPolicies', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listPolicyChanges') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListConditionalAccessPolicyChanges', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listTemplates') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListCAtemplates', {}, {});
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listNamedLocations') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListNamedLocations', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addPolicy') {
						const policyJson = this.getNodeParameter('caPolicyJson', i) as string;
						const caState = this.getNodeParameter('caState', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddCAPolicy', {
							tenantFilter: { value: [tenantFilter] },
							RawJSON: policyJson,
							NewState: caState || 'donotchange',
						}, {});
					} else if (operation === 'editPolicy') {
						const policyId = this.getNodeParameter('policyId', i) as string;
						const editState = this.getNodeParameter('editCaState', i) as string;
						const body: IDataObject = {
							tenantFilter,
							GUID: policyId,
						};
						if (editState) body.State = editState;
						const editJson = this.getNodeParameter('editPolicyJson', i) as string;
						let editData: IDataObject;
						try {
							editData = JSON.parse(editJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Policy JSON must be valid JSON', { itemIndex: i });
						}
						if (editData.displayName) body.newDisplayName = editData.displayName as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/EditCAPolicy', body, {});
					} else if (operation === 'removePolicy') {
						const policyId = this.getNodeParameter('policyId', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/RemoveCAPolicy', {
							tenantFilter,
							GUID: policyId,
						}, {});
					} else if (operation === 'addTemplate') {
						const templateJson = this.getNodeParameter('caTemplateJson', i) as string;
						let templateData: IDataObject;
						try {
							templateData = JSON.parse(templateJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Template JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddCATemplate', {
							...templateData,
							tenantFilter,
						}, {});
					} else if (operation === 'removeTemplate') {
						const templateId = this.getNodeParameter('caTemplateId', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/RemoveCATemplate', {
							ID: templateId,
						}, {});
					} else if (operation === 'caCheck') {
						const userId = this.getNodeParameter('caCheckUserId', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecCACheck', {
							tenantFilter,
							userID: { value: userId },
						}, {});
					} else if (operation === 'addNamedLocation') {
						const locationName = this.getNodeParameter('namedLocationName', i) as string;
						const locationType = this.getNodeParameter('namedLocationType', i) as string;
						const body: IDataObject = {
							selectedTenants: { value: [tenantFilter] },
							policyName: locationName,
						};
						if (locationType === 'ip') {
							const ipRanges = this.getNodeParameter('namedLocationIpRanges', i) as string;
							const trusted = this.getNodeParameter('namedLocationTrusted', i) as boolean;
							body.Type = 'IPLocation';
							body.Ips = ipRanges.split(',').map((r: string) => r.trim()).join('\n');
							body.Trusted = trusted;
						} else {
							const countries = this.getNodeParameter('namedLocationCountries', i) as string;
							body.Type = 'CountryLocation';
							body.Countries = { value: countries.split(',').map((c: string) => c.trim()) };
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddNamedLocation', body, {});
					} else if (operation === 'manageNamedLocation') {
						const locationId = this.getNodeParameter('namedLocationId', i) as string;
						const action = this.getNodeParameter('namedLocationAction', i) as string;
						if (action === 'Delete') {
							responseData = await cippApiRequest.call(this, 'POST', '/api/ExecNamedLocation', {
								tenantFilter,
								namedLocationId: locationId,
								change: 'Delete',
							}, {});
						} else {
							const locationJson = this.getNodeParameter('namedLocationJson', i) as string;
							let locationData: IDataObject;
							try {
								locationData = JSON.parse(locationJson) as IDataObject;
							} catch {
								throw new NodeOperationError(this.getNode(), 'Location JSON must be valid JSON', { itemIndex: i });
							}
							responseData = await cippApiRequest.call(this, 'POST', '/api/ExecNamedLocation', {
								tenantFilter,
								namedLocationId: locationId,
								change: 'Update',
								input: locationData,
							}, {});
						}
					}
				}

				// ==================== DEVICE ====================
				else if (resource === 'device') {
					const tenantFilter = getTenantFilter();

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListDevices',
							{},
							{ tenantFilter },
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'manage') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;
						const action = this.getNodeParameter('manageAction', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecDeviceDelete',
							{
								tenantFilter,
								ID: deviceId,
								action,
							},
							{},
						);
					} else if (operation === 'executeAction') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;
						const action = this.getNodeParameter('executeDeviceAction', i) as string;

						const body: IDataObject = {
							tenantFilter,
							GUID: deviceId,
							Action: action,
						};

						if (action === 'Rename') {
							body.newDeviceName = this.getNodeParameter('newDeviceName', i) as string;
						}

						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecDeviceAction', body, {});
					} else if (operation === 'getRecoveryKey') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecGetRecoveryKey',
							{
								tenantFilter,
								GUID: deviceId,
							},
							{},
						);
					} else if (operation === 'getLapsPassword') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecGetLocalAdminPassword',
							{
								tenantFilter,
								GUID: deviceId,
							},
							{},
						);
					}
				}

				// ==================== AUTOPILOT ====================
				else if (resource === 'autopilot') {
					const tenantFilter = getTenantFilter();

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListAPDevices',
							{},
							{ tenantFilter },
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'assign') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;
						const serialNumber = this.getNodeParameter('serialNumber', i) as string;
						const userPrincipalName = this.getNodeParameter('userPrincipalName', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecAssignAPDevice',
							{
								tenantFilter,
								ID: deviceId,
								serialNumber,
								userPrincipalName,
							},
							{},
						);
					} else if (operation === 'remove') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/RemoveAPDevice',
							{
								tenantFilter,
								ID: deviceId,
							},
							{},
						);
					} else if (operation === 'sync') {
						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecSyncAPDevices',
							{ tenantFilter },
							{},
						);
					} else if (operation === 'getConfigurations') {
						const configType = this.getNodeParameter('configType', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListAutopilotConfig',
							{},
							{ tenantFilter, type: configType },
						);
					} else if (operation === 'syncDep') {
						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecSyncDEP',
							{ tenantFilter },
							{},
						);
					}
				}

				// ==================== MAILBOX ====================
				else if (resource === 'mailbox') {
					const tenantFilter = getTenantFilter();

					// ---------- List operations (no userId required) ----------
					if (operation === 'listMailboxes') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListMailboxes', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listMailboxForwarding') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListMailboxForwarding', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listRestrictedUsers') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListRestrictedUsers', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listSharedMailboxStatistics') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListSharedMailboxStatistics', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listSharedMailboxAccountEnabled') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListSharedMailboxAccountEnabled', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listMessageTrace') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('messageTraceFilters', i, {}) as IDataObject;
						const body: IDataObject = { tenantFilter };

						for (const key of [
							'dateFilter',
							'days',
							'endDate',
							'fromIP',
							'MessageId',
							'startDate',
							'toIP',
							'traceDetail',
						]) {
							if (filters[key] !== undefined && filters[key] !== '') {
								body[key] = filters[key];
							}
						}

						const recipients = splitCsv(filters.recipient);
						const senders = splitCsv(filters.sender);
						const statuses = splitCsv(filters.status);
						if (recipients) body.recipient = recipients;
						if (senders) body.sender = senders;
						if (statuses) body.status = statuses;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ListMessageTrace',
							body,
							{},
						);

						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}

					// ---------- List operations (userId required) ----------
					} else if (operation === 'listMailboxDetails') {
						const userId = this.getNodeParameter('userId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListUserMailboxDetails', {}, { tenantFilter, UserID: userId });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listMailboxRules') {
						const userId = this.getNodeParameter('userId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListMailboxRules', {}, { tenantFilter, userId });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listMailboxMobileDevices') {
						const userId = this.getNodeParameter('userId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListMailboxMobileDevices', {}, { tenantFilter, Mailbox: userId });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listMailboxCAS') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListMailboxCAS', {}, { TenantFilter: tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listCalendarPermissions') {
						const userId = this.getNodeParameter('userId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListCalendarPermissions', {}, { tenantFilter, UserID: userId });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listContactPermissions') {
						const userId = this.getNodeParameter('userId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListContactPermissions', {}, { tenantFilter, UserID: userId });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listOoO') {
						const userId = this.getNodeParameter('userId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListOoO', {}, { tenantFilter, userid: userId });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}

					// ---------- Add Shared Mailbox ----------
					} else if (operation === 'addSharedMailbox') {
						const displayName = this.getNodeParameter('displayName', i) as string;
						const username = this.getNodeParameter('username', i) as string;
						const domain = this.getNodeParameter('domain', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddSharedMailbox', {
							...additionalFields,
							tenantID: tenantFilter,
							displayName,
							username,
							domain,
						}, {});

					// ---------- Existing operations ----------
					} else if (operation === 'convert') {
						const userId = this.getNodeParameter('userId', i) as string;
						const mailboxType = this.getNodeParameter('mailboxType', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecConvertMailbox', {
							tenantFilter,
							ID: userId,
							MailboxType: mailboxType,
						}, {});
					} else if (operation === 'enableArchive') {
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecEnableArchive', {
							tenantFilter,
							ID: userId,
						}, {});
					} else if (operation === 'setOutOfOffice') {
						const userId = this.getNodeParameter('userId', i) as string;
						const autoReplyState = this.getNodeParameter('autoReplyState', i) as string;
						const body: IDataObject = {
							tenantFilter,
							userId,
							AutoReplyState: autoReplyState,
						};
						if (autoReplyState === 'Enabled') {
							body.input = this.getNodeParameter('autoReplyMessage', i) as string;
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecSetOOO', body, {});
					} else if (operation === 'setForwarding') {
						const userId = this.getNodeParameter('userId', i) as string;
						const forwardingType = this.getNodeParameter('forwardingType', i) as string;
						const forwardTo = this.getNodeParameter('forwardTo', i) as string;
						const keepCopy = this.getNodeParameter('keepCopy', i) as boolean;
						const body: IDataObject = {
							tenantFilter,
							userID: userId,
							forwardOption: forwardTo ? forwardingType : 'disabled',
							KeepCopy: String(keepCopy),
						};

						if (forwardTo && forwardingType === 'internalAddress') {
							body.ForwardInternal = forwardTo;
						} else if (forwardTo) {
							body.ForwardExternal = forwardTo;
						}

						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecEmailForward', body, {});

					// ---------- Edit Mailbox Permissions ----------
					} else if (operation === 'editMailboxPermissions') {
						const userId = this.getNodeParameter('userId', i) as string;
						const permissions = this.getNodeParameter('permissions', i, {}) as IDataObject;

						// CIPP's ExecEditMailboxPermissions reads each permission field as
						// `($Request.body.<Field>).value`, so every recipient must be an object
						// with a `.value` property (array of them for multiple). A bare string
						// yields a null `.value` and the request silently no-ops (200 + empty Results).
						const toValueObjects = (v: unknown) =>
							String(v)
								.split(',')
								.map((x) => x.trim())
								.filter((x) => x !== '')
								.map((value) => ({ value }));

						const body: IDataObject = {
							tenantfilter: tenantFilter,
							userID: userId,
						};

						// AutoMapping is not a top-level field CIPP reads; AddFullAccess always
						// automaps, AddFullAccessNoAutoMap does not. Route based on the toggle.
						const autoMapping = permissions.AutoMapping !== false;
						if (permissions.AddFullAccess) {
							const fullAccess = toValueObjects(permissions.AddFullAccess);
							if (autoMapping) {
								body.AddFullAccess = fullAccess;
							} else {
								body.AddFullAccessNoAutoMap = fullAccess;
							}
						}
						if (permissions.RemoveFullAccess) {
							body.RemoveFullAccess = toValueObjects(permissions.RemoveFullAccess);
						}
						if (permissions.AddSendAs) {
							body.AddSendAs = toValueObjects(permissions.AddSendAs);
						}
						if (permissions.RemoveSendAs) {
							body.RemoveSendAs = toValueObjects(permissions.RemoveSendAs);
						}
						if (permissions.AddSendOnBehalf) {
							body.AddSendOnBehalf = toValueObjects(permissions.AddSendOnBehalf);
						}
						if (permissions.RemoveSendOnBehalf) {
							body.RemoveSendOnBehalf = toValueObjects(permissions.RemoveSendOnBehalf);
						}

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecEditMailboxPermissions',
							body,
							{},
						);

					// ---------- Edit Calendar Permissions ----------
					} else if (operation === 'editCalendarPermissions') {
						const userId = this.getNodeParameter('userId', i) as string;
						const userToModify = this.getNodeParameter('userToModify', i) as string;
						const permissionLevel = this.getNodeParameter('permissionLevel', i) as string;
						const folderName = this.getNodeParameter('folderName', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecEditCalendarPermissions', {
							tenantFilter,
							userid: userId,
							UserToGetPermissions: userToModify,
							Permissions: permissionLevel,
							FolderName: folderName,
						}, {});

					// ---------- Modify Contact Permissions ----------
					} else if (operation === 'modifyContactPerms') {
						const userId = this.getNodeParameter('userId', i) as string;
						const contactUserToModify = this.getNodeParameter('contactUserToModify', i) as string;
						const contactPermissionLevel = this.getNodeParameter('contactPermissionLevel', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecModifyContactPerms', {
							tenantFilter,
							UserID: userId,
							UserToGetPermissions: contactUserToModify,
							Permissions: contactPermissionLevel,
						}, {});

					// ---------- Mailbox Rules ----------
					} else if (operation === 'removeMailboxRule') {
						const userId = this.getNodeParameter('userId', i) as string;
						const ruleName = this.getNodeParameter('ruleName', i) as string;
						const ruleId = this.getNodeParameter('ruleId', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecRemoveMailboxRule', {
							TenantFilter: tenantFilter,
							userPrincipalName: userId,
							ruleName,
							ruleId,
						}, {});
					} else if (operation === 'setMailboxRule') {
						const userId = this.getNodeParameter('userId', i) as string;
						const setRuleName = this.getNodeParameter('setRuleName', i) as string;
						const setRuleId = this.getNodeParameter('setRuleId', i) as string;
						const ruleAction = this.getNodeParameter('ruleAction', i) as string;
						const body: IDataObject = {
							TenantFilter: tenantFilter,
							userPrincipalName: userId,
							ruleName: setRuleName,
							ruleId: setRuleId,
						};
						if (ruleAction === 'Enable') {
							body.Enable = true;
						} else {
							body.Disable = true;
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecSetMailboxRule', body, {});

					// ---------- Set Mailbox Quota ----------
					} else if (operation === 'setMailboxQuota') {
						const userId = this.getNodeParameter('userId', i) as string;
						const quotaType = this.getNodeParameter('quotaType', i) as string;
						const quotaValue = this.getNodeParameter('quotaValue', i) as string;
						const body: IDataObject = {
							tenantfilter: tenantFilter,
							user: userId,
							quota: quotaValue,
						};
						body[quotaType] = true;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecSetMailboxQuota', body, {});

					// ---------- Set Litigation Hold ----------
					} else if (operation === 'setLitigationHold') {
						const userId = this.getNodeParameter('userId', i) as string;
						const enabled = this.getNodeParameter('litigationHoldEnabled', i) as boolean;
						const body: IDataObject = {
							tenantFilter,
							Identity: userId,
							UPN: userId,
						};
						if (!enabled) {
							body.disable = true;
						} else {
							const duration = this.getNodeParameter('litigationHoldDuration', i) as number;
							if (duration > 0) body.days = duration;
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecSetLitigationHold', body, {});

					// ---------- Set Mailbox Email Size ----------
					} else if (operation === 'setMailboxEmailSize') {
						const userId = this.getNodeParameter('userId', i) as string;
						const maxSendSize = this.getNodeParameter('maxSendSize', i) as number;
						const maxReceiveSize = this.getNodeParameter('maxReceiveSize', i) as number;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecSetMailboxEmailSize', {
							tenantFilter,
							UPN: userId,
							id: userId,
							maxSendSize: String(maxSendSize),
							maxReceiveSize: String(maxReceiveSize),
						}, {});

					// ---------- Set Mailbox Locale ----------
					} else if (operation === 'setMailboxLocale') {
						const userId = this.getNodeParameter('userId', i) as string;
						const language = this.getNodeParameter('language', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecSetMailboxLocale', {
							tenantFilter,
							user: userId,
							locale: language,
						}, {});

					// ---------- Set Retention Hold ----------
					} else if (operation === 'setRetentionHold') {
						const userId = this.getNodeParameter('userId', i) as string;
						const enabled = this.getNodeParameter('retentionHoldEnabled', i) as boolean;
						const retentionBody: IDataObject = {
							tenantFilter,
							Identity: userId,
							UPN: userId,
						};
						if (!enabled) {
							retentionBody.disable = true;
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecSetRetentionHold', retentionBody, {});

					// ---------- Set Recipient Limits ----------
					} else if (operation === 'setRecipientLimits') {
						const userId = this.getNodeParameter('userId', i) as string;
						const recipientLimit = this.getNodeParameter('recipientLimit', i) as number;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecSetRecipientLimits', {
							tenantFilter,
							Identity: userId,
							userid: userId,
							recipientLimit,
						}, {});

					// ---------- Copy for Sent ----------
					} else if (operation === 'copyForSent') {
						const userId = this.getNodeParameter('userId', i) as string;
						const enabled = this.getNodeParameter('copyForSentEnabled', i) as boolean;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecCopyForSent', {
							tenantFilter,
							ID: userId,
							messageCopyState: String(enabled),
						}, {});

					// ---------- Hide From GAL ----------
					} else if (operation === 'hideFromGAL') {
						const userId = this.getNodeParameter('userId', i) as string;
						const hidden = this.getNodeParameter('hiddenFromGAL', i) as boolean;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecHideFromGAL', {
							tenantFilter,
							ID: userId,
							HideFromGAL: String(hidden),
						}, {});

					// ---------- Manage Mobile Devices ----------
					} else if (operation === 'mailboxMobileDevices') {
						const userId = this.getNodeParameter('userId', i) as string;
						const deviceGuid = this.getNodeParameter('deviceGuid', i) as string;
						const deviceId = this.getNodeParameter('deviceId', i) as string;
						const mobileAction = this.getNodeParameter('mobileAction', i) as string;
						const qs: IDataObject = {
							tenantfilter: tenantFilter,
							Userid: userId,
							guid: deviceGuid,
							deviceid: deviceId,
						};
						if (mobileAction === 'Quarantine') {
							qs.Quarantine = 'true';
						} else if (mobileAction === 'Delete') {
							qs.Delete = 'true';
						}
						responseData = await cippApiRequest.call(this, 'GET', '/api/ExecMailboxMobileDevices', {}, qs);

					// ---------- Start Managed Folder Assistant ----------
					} else if (operation === 'startManagedFolderAssistant') {
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecStartManagedFolderAssistant', {
							tenantFilter,
							Id: userId,
							UserPrincipalName: userId,
						}, {});

					// ---------- Enable Auto-Expanding Archive ----------
					} else if (operation === 'enableAutoExpandingArchive') {
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecEnableAutoExpandingArchive', {
							tenantFilter,
							ID: userId,
							username: userId,
						}, {});

					// ---------- High Volume Email ----------
					} else if (operation === 'hveUser') {
						const hveDisplayName = this.getNodeParameter('hveDisplayName', i) as string;
						const hvePrimarySMTPAddress = this.getNodeParameter('hvePrimarySMTPAddress', i) as string;
						const hvePassword = this.getNodeParameter('hvePassword', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecHVEUser', {
							TenantFilter: tenantFilter,
							displayName: hveDisplayName,
							primarySMTPAddress: hvePrimarySMTPAddress,
							password: hvePassword,
						}, {});

					// ---------- Schedule Mailbox Vacation ----------
					} else if (operation === 'scheduleMailboxVacation') {
						const userId = this.getNodeParameter('userId', i) as string;
						const startDate = this.getNodeParameter('vacationStartDate', i) as string;
						const endDate = this.getNodeParameter('vacationEndDate', i) as string;
						const vacationOptions = this.getNodeParameter('vacationOptions', i, {}) as IDataObject;
						const body: IDataObject = {
							tenantFilter,
							mailboxOwners: [{ value: userId }],
							startDate: new Date(startDate).getTime(),
							endDate: new Date(endDate).getTime(),
						};
						if (vacationOptions.ForwardTo) {
							body.delegates = [{ value: vacationOptions.ForwardTo }];
						}
						if (vacationOptions.KeepCopy !== undefined) body.autoMap = vacationOptions.KeepCopy;
						if (vacationOptions.CalendarAccessUser) {
							body.includeCalendar = true;
							body.calendarPermission = vacationOptions.CalendarPermission || 'Reviewer';
							body.canViewPrivateItems = false;
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecScheduleMailboxVacation', body, {});

					// ---------- Schedule OOO Vacation ----------
					} else if (operation === 'scheduleOOOVacation') {
						const userId = this.getNodeParameter('userId', i) as string;
						const startDate = this.getNodeParameter('oooStartDate', i) as string;
						const endDate = this.getNodeParameter('oooEndDate', i) as string;
						const internalMessage = this.getNodeParameter('oooInternalMessage', i) as string;
						const body: IDataObject = {
							tenantFilter,
							Users: [{ value: userId }],
							startDate: new Date(startDate).getTime(),
							endDate: new Date(endDate).getTime(),
							internalMessage,
						};
						const externalMessage = this.getNodeParameter('oooExternalMessage', i, '') as string;
						if (externalMessage) {
							body.externalMessage = externalMessage;
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecScheduleOOOVacation', body, {});

					// ---------- Manage Retention Policies ----------
					} else if (operation === 'manageRetentionPolicies') {
						const action = this.getNodeParameter('retentionPolicyAction', i) as string;
						if (action === 'List') {
							responseData = await cippApiRequest.call(this, 'GET', '/api/ExecManageRetentionPolicies', {}, { tenantFilter });
						} else {
							const policyName = this.getNodeParameter('retentionPolicyName', i) as string;
							const body: IDataObject = { tenantFilter };
							if (action === 'Create') {
								body.CreatePolicies = [{ Name: policyName }];
							} else if (action === 'Delete') {
								body.DeletePolicies = [policyName];
							}
							responseData = await cippApiRequest.call(this, 'POST', '/api/ExecManageRetentionPolicies', body, {});
						}

					// ---------- Manage Retention Tags ----------
					} else if (operation === 'manageRetentionTags') {
						const action = this.getNodeParameter('retentionTagAction', i) as string;
						if (action === 'List') {
							responseData = await cippApiRequest.call(this, 'GET', '/api/ExecManageRetentionTags', {}, { tenantFilter });
						} else {
							const tagName = this.getNodeParameter('retentionTagName', i) as string;
							const body: IDataObject = { tenantFilter };
							if (action === 'Create') {
								body.CreateTags = [{ Name: tagName }];
							} else if (action === 'Delete') {
								body.DeleteTags = [tagName];
							}
							responseData = await cippApiRequest.call(this, 'POST', '/api/ExecManageRetentionTags', body, {});
						}

					// ---------- Set Mailbox Retention Policy ----------
					} else if (operation === 'setMailboxRetentionPolicies') {
						const userId = this.getNodeParameter('userId', i) as string;
						const policyName = this.getNodeParameter('retentionPolicyToSet', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecSetMailboxRetentionPolicies', {
							tenantFilter,
							PolicyName: policyName,
							Mailboxes: [userId],
						}, {});

					// ---------- Remove Restricted User ----------
					} else if (operation === 'removeRestrictedUser') {
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecRemoveRestrictedUser', {
							tenantFilter,
							SenderAddress: userId,
						}, {});
					}
				}

				// ==================== QUARANTINE ====================
				else if (resource === 'quarantine') {
					const tenantFilter = getTenantFilter();

					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListMailQuarantine',
							{},
							{ tenantFilter },
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'release') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						const allowSender = this.getNodeParameter('allowSender', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecQuarantineManagement',
							{
								tenantFilter,
								ID: messageId,
								Type: 'Release',
								AllowSender: allowSender,
							},
							{},
						);
					} else if (operation === 'deny') {
						const messageId = this.getNodeParameter('messageId', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecQuarantineManagement',
							{
								tenantFilter,
								ID: messageId,
								Type: 'Deny',
							},
							{},
						);
					} else if (operation === 'getMessage') {
						const messageId = this.getNodeParameter('messageId', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListMailQuarantineMessage',
							{},
							{
								tenantFilter,
								Identity: messageId,
							},
						);
					}
				}

				// ==================== ALERT ====================
				else if (resource === 'alert') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						responseData = await cippApiRequest.call(this, 'GET', '/api/ListAlertsQueue', {}, {});

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'add') {
						const alertConfig = this.getNodeParameter('alertConfig', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/AddAlert',
							JSON.parse(alertConfig),
							{},
						);
					} else if (operation === 'getSecurityAlerts') {
						const tenantFilter = getTenantFilter();
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ExecAlertsList',
							{},
							{ tenantFilter },
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'getSecurityIncidents') {
						const tenantFilter = getTenantFilter();
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ExecIncidentsList',
							{},
							{ tenantFilter },
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'setSecurityAlertStatus') {
						const tenantFilter = getTenantFilter();
						const alertId = this.getNodeParameter('alertId', i) as string;
						const status = this.getNodeParameter('alertStatus', i) as string;
						const additionalFields = this.getNodeParameter(
							'alertAdditionalFields',
							i,
							{},
						) as IDataObject;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecSetSecurityAlert',
							{
								...additionalFields,
								tenantFilter,
								ID: alertId,
								Status: status,
							},
							{},
						);
					} else if (operation === 'setSecurityIncidentStatus') {
						const tenantFilter = getTenantFilter();
						const incidentId = this.getNodeParameter('incidentId', i) as string;
						const status = this.getNodeParameter('incidentStatus', i) as string;
						const assignedTo = this.getNodeParameter('assignedTo', i, '') as string;

						const body: IDataObject = {
							tenantFilter,
							ID: incidentId,
							Status: status,
						};

						if (assignedTo) {
							body.AssignedTo = assignedTo;
						}

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecSetSecurityIncident',
							body,
							{},
						);
					}
				}

				// ==================== APPLICATION ====================
				else if (resource === 'application') {
					const tenantFilter = getTenantFilter();

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListApps',
							{},
							{ tenantFilter },
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'getQueue') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListApplicationQueue',
							{},
							{ tenantFilter },
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listDetectedApps') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const deviceId = this.getNodeParameter('detectedAppDeviceId', i, '') as string;
						const includeDevices = this.getNodeParameter('detectedAppsIncludeDevices', i) as boolean;
						const qs: IDataObject = { tenantFilter };

						if (deviceId) qs.DeviceID = deviceId;
						if (includeDevices) qs.includeDevices = 'true';

						responseData = await cippApiRequest.call(this, 'GET', '/api/ListDetectedApps', {}, qs);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listDetectedAppDevices') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const detectedAppId = this.getNodeParameter('detectedAppId', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListDetectedAppDevices',
							{},
							{ tenantFilter, id: detectedAppId },
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listAppRepository') {
						const search = this.getNodeParameter('appRepositorySearch', i, '') as string;
						const repository = this.getNodeParameter('appRepositoryName', i, '') as string;
						const body: IDataObject = { tenantFilter };

						if (search) body.Search = search;
						if (repository) body.Repository = repository;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ListAppsRepository',
							body,
							{},
						);
					} else if (operation === 'assign') {
						const appId = this.getNodeParameter('appId', i) as string;
						const assignTo = this.getNodeParameter('assignTo', i) as string;

						const body: IDataObject = {
							tenantFilter,
							ID: appId,
							AssignTo: assignTo,
						};

						if (assignTo === 'customGroup') {
							const customGroups = this.getNodeParameter('customGroupNames', i, '') as string;
							body.customGroupNames = customGroups.split(',').map((g) => g.trim());
						}

						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecAssignApp', body, {});
					} else if (operation === 'remove') {
						const appId = this.getNodeParameter('appId', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/RemoveApp',
							{
								tenantFilter,
								ID: appId,
							},
							{},
						);
					} else if (operation === 'removeFromQueue') {
						const queueId = this.getNodeParameter('queueId', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/RemoveQueuedApp',
							{
								tenantFilter,
								ID: queueId,
							},
							{},
						);
					} else if (operation === 'addWinget') {
						const packageId = this.getNodeParameter('packageId', i) as string;
						const appName = this.getNodeParameter('appName', i) as string;
						const appDescription = this.getNodeParameter('appDescription', i, '') as string;
						const uninstall = this.getNodeParameter('uninstall', i) as boolean;
						const assignTo = this.getNodeParameter('assignTo', i) as string;

						const body: IDataObject = {
							tenantFilter,
							PackageIdentifier: packageId,
							ApplicationName: appName,
							Description: appDescription,
							InstallAsSystem: true,
							UninstallApp: uninstall,
							AssignTo: assignTo,
						};

						if (assignTo === 'customGroup') {
							const customGroups = this.getNodeParameter('customGroupNames', i, '') as string;
							body.customGroupNames = customGroups.split(',').map((g) => g.trim());
						}

						responseData = await cippApiRequest.call(this, 'POST', '/api/AddWinGetApp', body, {});
					} else if (operation === 'addStore') {
						const packageId = this.getNodeParameter('packageId', i) as string;
						const appName = this.getNodeParameter('appName', i) as string;
						const appDescription = this.getNodeParameter('appDescription', i, '') as string;
						const uninstall = this.getNodeParameter('uninstall', i) as boolean;
						const assignTo = this.getNodeParameter('assignTo', i) as string;

						const body: IDataObject = {
							tenantFilter,
							PackageIdentifier: packageId,
							ApplicationName: appName,
							Description: appDescription,
							UninstallApp: uninstall,
							AssignTo: assignTo,
						};

						if (assignTo === 'customGroup') {
							const customGroups = this.getNodeParameter('customGroupNames', i, '') as string;
							body.customGroupNames = customGroups.split(',').map((g) => g.trim());
						}

						responseData = await cippApiRequest.call(this, 'POST', '/api/AddStoreApp', body, {});
					} else if (operation === 'addChocolatey') {
						const packageName = this.getNodeParameter('packageName', i) as string;
						const appName = this.getNodeParameter('appName', i) as string;
						const appDescription = this.getNodeParameter('appDescription', i, '') as string;
						const uninstall = this.getNodeParameter('uninstall', i) as boolean;
						const assignTo = this.getNodeParameter('assignTo', i) as string;
						const chocoOptions = this.getNodeParameter('chocoOptions', i, {}) as IDataObject;

						const body: IDataObject = {
							...chocoOptions,
							tenantFilter,
							PackageName: packageName,
							ApplicationName: appName,
							Description: appDescription,
							UninstallApp: uninstall,
							AssignTo: assignTo,
						};

						if (assignTo === 'customGroup') {
							const customGroups = this.getNodeParameter('customGroupNames', i, '') as string;
							body.customGroupNames = customGroups.split(',').map((g) => g.trim());
						}

						responseData = await cippApiRequest.call(this, 'POST', '/api/AddChocoApp', body, {});
					} else if (operation === 'addMsp') {
						const rmmTool = this.getNodeParameter('rmmTool', i) as string;
						const displayName = this.getNodeParameter('mspDisplayName', i) as string;
						const rmmParameters = this.getNodeParameter('rmmParameters', i) as string;
						const assignTo = this.getNodeParameter('assignTo', i) as string;

						const body: IDataObject = {
							tenantFilter,
							RMM: rmmTool,
							displayName,
							RMMParams: JSON.parse(rmmParameters),
							AssignTo: assignTo,
						};

						if (assignTo === 'customGroup') {
							const customGroups = this.getNodeParameter('customGroupNames', i, '') as string;
							body.customGroupNames = customGroups.split(',').map((g) => g.trim());
						}

						responseData = await cippApiRequest.call(this, 'POST', '/api/AddMSPApp', body, {});
					} else if (operation === 'addOffice') {
						const excludedApps = this.getNodeParameter('excludedApps', i) as string[];
						const updateChannel = this.getNodeParameter('updateChannel', i) as string;
						const assignTo = this.getNodeParameter('assignTo', i) as string;
						const officeOptions = this.getNodeParameter('officeOptions', i, {}) as IDataObject;

						const body: IDataObject = {
							...officeOptions,
							tenantFilter,
							ExcludeApps: excludedApps,
							UpdateChannel: updateChannel,
							AssignTo: assignTo,
						};

						responseData = await cippApiRequest.call(this, 'POST', '/api/AddOfficeApp', body, {});
					}
				}

				// ==================== TEAM ====================
				else if (resource === 'team') {
					const tenantFilter = getTenantFilter();

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListTeams',
							{},
							{ tenantFilter, type: 'list' },
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'add') {
						const displayName = this.getNodeParameter('displayName', i) as string;
						const description = this.getNodeParameter('teamDescription', i, '') as string;
						const owner = this.getNodeParameter('owner', i) as string;
						const visibility = this.getNodeParameter('visibility', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/AddTeam',
							{
								tenantFilter,
								displayName,
								description,
								owner,
								visibility,
							},
							{},
						);
					} else if (operation === 'getSites') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const siteType = this.getNodeParameter('siteType', i) as string;
						const useReportDB = this.getNodeParameter('useReportDB', i, false) as boolean;

						const sitesQuery: IDataObject = { tenantFilter, type: siteType };
						if (useReportDB) {
							sitesQuery.UseReportDB = true;
						}

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListSites',
							{},
							sitesQuery,
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'addSite') {
						const siteName = this.getNodeParameter('siteName', i) as string;
						const siteDescription = this.getNodeParameter('siteDescription', i, '') as string;
						const owner = this.getNodeParameter('siteOwner', i) as string;
						const templateName = this.getNodeParameter('templateName', i) as string;

						const body: IDataObject = {
							tenantFilter,
							siteName,
							siteDescription,
							owner,
							TemplateName: templateName,
						};

						if (templateName === 'communication') {
							body.siteDesign = this.getNodeParameter('siteDesign', i) as string;
						}

						responseData = await cippApiRequest.call(this, 'POST', '/api/AddSite', body, {});
					} else if (operation === 'getActivity') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListTeamsActivity',
							{},
							{ tenantFilter, type: 'TeamsUserActivityUser' },
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'manageSiteMember') {
						const siteUrl = this.getNodeParameter('siteUrl', i) as string;
						const siteUser = this.getNodeParameter('siteUser', i) as string;
						const action = this.getNodeParameter('memberAction', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecSetSharePointMember',
							{
								tenantFilter,
								URL: siteUrl,
								AddMember: action === 'add',
								userPrincipalName: siteUser,
							},
							{},
						);
					} else if (operation === 'manageSitePermissions') {
						const siteUrl = this.getNodeParameter('siteUrl', i) as string;
						const siteUser = this.getNodeParameter('siteUser', i) as string;
						const removePermission = this.getNodeParameter('removePermission', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecSharePointPerms',
							{
								tenantFilter,
								URL: siteUrl,
								RemovePermission: removePermission,
								userPrincipalName: siteUser,
							},
							{},
						);
					} else if (operation === 'addSitesBulk') {
						const sitesConfig = this.getNodeParameter('sitesConfig', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/AddSiteBulk',
							{
								tenantFilter,
								sites: JSON.parse(sitesConfig),
							},
							{},
						);
					}
				}

				// ==================== VOICE ====================
				else if (resource === 'voice') {
					const tenantFilter = getTenantFilter();

					if (operation === 'getPhoneNumbers') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListTeamsVoice',
							{},
							{ tenantFilter },
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'getLocations') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListTeamsLisLocation',
							{},
							{ tenantFilter },
						);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'assignNumber') {
						const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
						const voiceUser = this.getNodeParameter('voiceUser', i) as string;
						const phoneNumberType = this.getNodeParameter('phoneNumberType', i, '') as string;
						const locationOnly = this.getNodeParameter('locationOnly', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecTeamsVoicePhoneNumberAssignment',
							{
								tenantFilter,
								PhoneNumber: phoneNumber,
								PhoneNumberType: phoneNumberType,
								LocationOnly: locationOnly,
								UserPrincipalNameOrLocationId: voiceUser,
							},
							{},
						);
					} else if (operation === 'unassignNumber') {
						const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
						const voiceUser = this.getNodeParameter('voiceUser', i) as string;
						const phoneNumberType = this.getNodeParameter('phoneNumberType', i, '') as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecRemoveTeamsVoicePhoneNumberAssignment',
							{
								tenantFilter,
								PhoneNumber: phoneNumber,
								PhoneNumberType: phoneNumberType,
								AssignedTo: voiceUser,
							},
							{},
						);
					}
				}

				// ==================== SAFE LINKS ====================
				else if (resource === 'safeLinks') {
					const tenantFilter = getTenantFilter();

					if (operation === 'listPolicies') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListSafeLinksPolicy', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listTemplates') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListSafeLinksPolicyTemplates', {}, {});
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addPolicy') {
						const policyName = this.getNodeParameter('slPolicyName', i) as string;
						const policyJson = this.getNodeParameter('slPolicyJson', i) as string;
						let policyData: IDataObject;
						try {
							policyData = JSON.parse(policyJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Policy JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecNewSafeLinksPolicy', {
							...policyData,
							tenantFilter,
							Name: policyName,
						}, {});
					} else if (operation === 'editPolicy') {
						const policyName = this.getNodeParameter('slPolicyName', i) as string;
						const policyJson = this.getNodeParameter('slPolicyJson', i) as string;
						let policyData: IDataObject;
						try {
							policyData = JSON.parse(policyJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Policy JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/EditSafeLinksPolicy', {
							...policyData,
							tenantFilter,
							Name: policyName,
						}, {});
					} else if (operation === 'deletePolicy') {
						const policyName = this.getNodeParameter('slPolicyName', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecDeleteSafeLinksPolicy', {
							tenantFilter,
							Name: policyName,
						}, {});
					} else if (operation === 'addTemplate') {
						const templateName = this.getNodeParameter('slTemplateName', i) as string;
						const templateJson = this.getNodeParameter('slTemplateJson', i) as string;
						let templateData: IDataObject;
						try {
							templateData = JSON.parse(templateJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Template JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddSafeLinksPolicyTemplate', {
							...templateData,
							Name: templateName,
						}, {});
					} else if (operation === 'editTemplate') {
						const templateName = this.getNodeParameter('slTemplateName', i) as string;
						const templateJson = this.getNodeParameter('slTemplateJson', i) as string;
						let templateData: IDataObject;
						try {
							templateData = JSON.parse(templateJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Template JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/EditSafeLinksPolicyTemplate', {
							...templateData,
							Name: templateName,
						}, {});
					} else if (operation === 'removeTemplate') {
						const templateName = this.getNodeParameter('slTemplateName', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/RemoveSafeLinksPolicyTemplate', {
							Name: templateName,
						}, {});
					} else if (operation === 'addFromTemplate') {
						const templateName = this.getNodeParameter('slTemplateName', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddSafeLinksPolicyFromTemplate', {
							tenantFilter,
							TemplateName: templateName,
						}, {});
					}
				}

				// ==================== SCHEDULED ITEM ====================
				else if (resource === 'scheduledItem') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const options = this.getNodeParameter('options', i, {}) as IDataObject;

						const qs: IDataObject = {};
						if (options.showHidden) qs.showHidden = true;
						if (options.name) qs.name = options.name;

						responseData = await cippApiRequest.call(this, 'GET', '/api/ListScheduledItems', {}, qs);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'add') {
						const tenantFilter = getTenantFilter();
						const jobName = this.getNodeParameter('jobName', i) as string;
						const command = this.getNodeParameter('command', i) as string;
						const scheduledTime = this.getNodeParameter('scheduledTime', i, '') as string;
						const recurrence = this.getNodeParameter('recurrence', i) as string;
						const parameters = this.getNodeParameter('parameters', i) as string;
						const postExecution = this.getNodeParameter('postExecution', i) as string[];

						const body: IDataObject = {
							TenantFilter: tenantFilter || 'AllTenants',
							Name: jobName,
							Command: command,
							Recurrence: recurrence,
							Parameters: JSON.parse(parameters),
							PostExecution: postExecution,
						};

						if (scheduledTime) {
							body.ScheduledTime = new Date(scheduledTime).getTime() / 1000;
						}

						responseData = await cippApiRequest.call(this, 'POST', '/api/AddScheduledItem', body, {});
					} else if (operation === 'remove') {
						const rowKey = this.getNodeParameter('rowKey', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/RemoveScheduledItem',
							{
								RowKey: rowKey,
							},
							{},
						);
					}
				}

				// ==================== BACKUP ====================
				else if (resource === 'backup') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const options = this.getNodeParameter('options', i, {}) as IDataObject;

						const qs: IDataObject = {};
						if (options.namesOnly) qs.NameOnly = true;
						if (options.backupName) qs.BackupName = options.backupName;

						responseData = await cippApiRequest.call(this, 'GET', '/api/ExecListBackup', {}, qs);

						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'run') {
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecRunBackup', {}, {});
					} else if (operation === 'restore') {
						const backupData = this.getNodeParameter('backupData', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecRestoreBackup',
							JSON.parse(backupData),
							{},
						);
					} else if (operation === 'setAutoBackup') {
						const enableAutoBackup = this.getNodeParameter('enableAutoBackup', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecSetCIPPAutoBackup',
							{
								Enabled: enableAutoBackup,
							},
							{},
						);
					}
				}

				// ==================== CIPP V10.5 ====================
				else if (resource === 'cippV105') {
					const config = v105Endpoints[operation];
					if (!config) {
						throw new NodeOperationError(
							this.getNode(),
							`Unsupported CIPP v10.5 operation: ${operation}`,
							{ itemIndex: i },
						);
					}

					const includeTenant = this.getNodeParameter('v105IncludeTenant', i) as boolean;
					const query = parseJsonObjectPayload(
						this.getNodeParameter('v105QueryJson', i, '{}'),
						'Query Parameters',
						i,
					);
					const body =
						config.method === 'GET'
							? {}
							: parseJsonObjectPayload(
									this.getNodeParameter('v105BodyJson', i, '{}'),
									'Body',
									i,
								);

					if (includeTenant) {
						const tenantValue = this.getNodeParameter('tenantFilter', i) as IDataObject;
						const tenantFilter = getResourceLocatorValue(tenantValue);

						if (!tenantFilter) {
							throw new NodeOperationError(this.getNode(), 'Tenant is required.', {
								itemIndex: i,
							});
						}

						query.tenantFilter = tenantFilter;
						body.tenantFilter = tenantFilter;
					}

					const options = this.getNodeParameter('v105Options', i, {}) as IDataObject;
					const maxPayloadBytes = Number(options.maxPayloadBytes ?? 262144);
					if (!Number.isFinite(maxPayloadBytes) || maxPayloadBytes <= 0) {
						throw new NodeOperationError(
							this.getNode(),
							'Max Payload Bytes must be a positive number.',
							{ itemIndex: i },
						);
					}

					const payloadBytes = new TextEncoder().encode(JSON.stringify(body)).length;
					if (payloadBytes > maxPayloadBytes) {
						throw new NodeOperationError(
							this.getNode(),
							`Payload is ${payloadBytes} bytes, which exceeds Max Payload Bytes (${maxPayloadBytes}).`,
							{ itemIndex: i },
						);
					}

					responseData = await cippApiRequest.call(
						this,
						config.method,
						config.endpoint,
						body,
						query,
					);

					if (Array.isArray(responseData)) {
						const returnAll = this.getNodeParameter('returnAll', i, true) as boolean;
						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					}
				}

				// ==================== CIPP V10.6 ====================
				else if (resource === 'cippV106') {
					const config = v106Endpoints[operation];
					if (!config) throw new NodeOperationError(this.getNode(), `Unsupported CIPP v10.6 operation: ${operation}`, { itemIndex: i });
					const includeTenant = this.getNodeParameter('v106IncludeTenant', i) as boolean;
					const query = parseJsonObjectPayload(this.getNodeParameter('v106QueryJson', i, '{}'), 'Query Parameters', i);
					const advancedBody = config.method === 'GET' ? {} : parseJsonObjectPayload(this.getNodeParameter('v106BodyJson', i, '{}'), 'Advanced Body Overrides', i);
					const body: IDataObject = {};
					const splitV106Csv = (name: string): string[] => (this.getNodeParameter(name, i, '') as string).split(',').map((value) => value.trim()).filter(Boolean);
					if (operation === 'execAddCippCveException') Object.assign(body, { cveId: this.getNodeParameter('v106CveId', i), exceptionType: this.getNodeParameter('v106CveExceptionType', i), applyTo: this.getNodeParameter('v106CveApplyTo', i), justification: this.getNodeParameter('v106CveJustification', i), expiryDate: this.getNodeParameter('v106CveExpiryDate', i, '') || undefined });
					if (operation === 'execRemoveCippCveException') Object.assign(body, { cveId: this.getNodeParameter('v106CveId', i), removeScope: this.getNodeParameter('v106CveRemoveScope', i) });
					if (operation === 'execCopilotSettings') Object.assign(body, { settingId: this.getNodeParameter('v106CopilotSettingId', i), value: this.getNodeParameter('v106CopilotValue', i) });
					if (operation === 'execShadowAiSanction') Object.assign(body, { Tools: splitV106Csv('v106ShadowAiTools'), Action: this.getNodeParameter('v106ShadowAiAction', i) });
					if (operation === 'execBulkRemoveSharingLinks') Object.assign(body, { SiteUrl: this.getNodeParameter('v106SiteUrl', i), Scope: this.getNodeParameter('v106SharingScope', i) });
					if (operation === 'execRestoreDeletedSite') body.SiteUrl = this.getNodeParameter('v106SiteUrl', i);
					if (operation === 'execRestoreRecycleBinItems') Object.assign(body, { SiteUrl: this.getNodeParameter('v106SiteUrl', i), Ids: splitV106Csv('v106RecycleBinItemIds') });
					if (operation === 'execRemoveSharingLink') Object.assign(body, { DriveId: this.getNodeParameter('v106DriveId', i), ItemId: this.getNodeParameter('v106ItemId', i), PermissionId: this.getNodeParameter('v106PermissionId', i) });
					if (operation === 'execRemoveSpoExternalUser') Object.assign(body, { EntraUserId: this.getNodeParameter('v106EntraUserId', i, ''), LoginName: this.getNodeParameter('v106LoginName', i, ''), SiteUrls: splitV106Csv('v106SiteUrls'), DisplayName: this.getNodeParameter('v106ExternalUserDisplayName', i, '') });
					if (operation === 'execRemoveSiteUser') Object.assign(body, { user: { value: this.getNodeParameter('v106LoginName', i, '') }, SiteUrls: splitV106Csv('v106SiteUrls') });
					if (operation === 'execSetLibraryPermission') Object.assign(body, { SiteUrl: this.getNodeParameter('v106SiteUrl', i), ListId: this.getNodeParameter('v106LibraryId', i), LibraryName: this.getNodeParameter('v106LibraryName', i), PermissionLevel: this.getNodeParameter('v106LibraryPermissionLevel', i), Users: splitV106Csv('v106LibraryUsers').map((value) => ({ value })), Groups: [...splitV106Csv('v106LibraryGroups').map((value) => ({ value, addedFields: { groupTypes: [] } })), ...splitV106Csv('v106LibraryM365Groups').map((value) => ({ value, addedFields: { groupTypes: ['Unified'] } }))] });
					if (operation === 'execSetSiteProperties') Object.assign(body, { SiteUrl: this.getNodeParameter('v106SiteUrl', i), ...(this.getNodeParameter('v106SiteProperties', i, {}) as IDataObject) });
					Object.assign(body, advancedBody);
					if (operation === 'execRemoveSpoExternalUser' && !body.EntraUserId && !(body.SiteUrls as unknown[] | undefined)?.length) throw new NodeOperationError(this.getNode(), 'Provide an Entra User ID or at least one Site URL.', { itemIndex: i });
					if (operation === 'execRemoveSiteUser' && (!(body.SiteUrls as unknown[] | undefined)?.length || !((body.user as IDataObject | undefined)?.value))) throw new NodeOperationError(this.getNode(), 'User Login Name and at least one Site URL are required.', { itemIndex: i });
					if (operation === 'execSetLibraryPermission' && !(body.Users as unknown[] | undefined)?.length && !(body.Groups as unknown[] | undefined)?.length) throw new NodeOperationError(this.getNode(), 'Provide at least one user or group.', { itemIndex: i });
					if (includeTenant) {
						const tenantFilter = getResourceLocatorValue(this.getNodeParameter('tenantFilter', i) as IDataObject);
						if (!tenantFilter) throw new NodeOperationError(this.getNode(), 'Tenant is required.', { itemIndex: i });
						query.tenantFilter = tenantFilter;
						body.tenantFilter = tenantFilter;
					}
					const options = this.getNodeParameter('v106Options', i, {}) as IDataObject;
					const maxPayloadBytes = Number(options.maxPayloadBytes ?? 262144);
					if (!Number.isFinite(maxPayloadBytes) || maxPayloadBytes <= 0) throw new NodeOperationError(this.getNode(), 'Max Payload Bytes must be a positive number.', { itemIndex: i });
					if (new TextEncoder().encode(JSON.stringify(body)).length > maxPayloadBytes) throw new NodeOperationError(this.getNode(), `Payload exceeds Max Payload Bytes (${maxPayloadBytes}).`, { itemIndex: i });
					responseData = await cippApiRequest.call(this, config.method, config.endpoint, body, query);
					if (Array.isArray(responseData) && !(this.getNodeParameter('returnAll', i, true) as boolean)) responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
				}

				// ==================== TOOLS ====================
				else if (resource === 'tools') {
					if (operation === 'breachAccount') {
						const account = this.getNodeParameter('account', i) as string;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListBreachesAccount',
							{},
							{ account },
						);
					} else if (operation === 'breachTenant') {
						const tenantFilter = getTenantFilter();

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListBreachesTenant',
							{},
							{ tenantFilter },
						);
					} else if (operation === 'executeBreachSearch') {
						const tenantFilter = getTenantFilter();

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ExecBreachSearch',
							{},
							{ tenantFilter },
						);
					} else if (operation === 'getVersion') {
						const localVersion = this.getNodeParameter('localVersion', i, '') as string;
						const qs: IDataObject = {};

						if (localVersion) qs.LocalVersion = localVersion;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/GetVersion',
							{},
							qs,
						);
					} else if (operation === 'cippApiRequest') {
						const method = this.getNodeParameter('cippApiMethod', i) as IHttpRequestMethods;
						const endpoint = normalizeCippEndpoint(
							this.getNodeParameter('cippApiEndpoint', i) as string,
						);
						const includeTenant = this.getNodeParameter('cippApiIncludeTenant', i) as boolean;
						const query = parseJsonObjectPayload(
							this.getNodeParameter('cippApiQueryJson', i, '{}'),
							'Query Parameters',
							i,
						);
						const body =
							method === 'GET'
								? {}
								: parseJsonObjectPayload(
										this.getNodeParameter('cippApiBodyJson', i, '{}'),
										'Body',
										i,
						);

						if (includeTenant) {
							const tenantFilterValue = this.getNodeParameter('cippApiTenantFilter', i) as IDataObject;
							const tenantFilter = getResourceLocatorValue(tenantFilterValue);
							query.tenantFilter = tenantFilter;
							body.tenantFilter = tenantFilter;
						}

						const options = this.getNodeParameter('cippApiOptions', i, {}) as IDataObject;
						const maxPayloadBytes = Number(options.maxPayloadBytes ?? 262144);
						if (!Number.isFinite(maxPayloadBytes) || maxPayloadBytes <= 0) {
							throw new NodeOperationError(
								this.getNode(),
								'Max Payload Bytes must be a positive number.',
								{ itemIndex: i },
							);
						}

						const payloadBytes = new TextEncoder().encode(JSON.stringify(body)).length;
						if (payloadBytes > maxPayloadBytes) {
							throw new NodeOperationError(
								this.getNode(),
								`Payload is ${payloadBytes} bytes, which exceeds Max Payload Bytes (${maxPayloadBytes}).`,
								{ itemIndex: i },
							);
						}

						responseData = await cippApiRequest.call(this, method, endpoint, body, query);
					} else if (operation === 'graphRequest') {
						const tenantFilter = getTenantFilter();
						const endpoint = this.getNodeParameter('graphEndpoint', i) as string;
						const graphOptions = this.getNodeParameter('graphOptions', i, {}) as IDataObject;
						const returnAll = this.getNodeParameter('graphReturnAll', i, false) as boolean;
						let qs: IDataObject;
						try {
							qs = buildGraphRequestQuery(tenantFilter, endpoint, graphOptions);
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								error instanceof Error ? error.message : String(error),
								{ itemIndex: i },
							);
						}

						if (!returnAll) {
							qs.manualPagination = true;
							qs.NoPagination = true;
							const firstResponse = await withGraphRequestDeadline(
								async () => await cippApiRequest.call(
									this,
									'GET',
									'/api/ListGraphRequest',
									{},
									qs,
								),
								GRAPH_REQUEST_TIMEOUT_MS,
							);
							responseData = extractGraphPage(firstResponse).items;
						} else {
							try {
								const maxPages = parseGraphMaxPages(
									this.getNodeParameter('graphMaxPages', i, GRAPH_MAX_PAGES_DEFAULT),
								);
								responseData = await paginateGraphRequest(
									qs,
									async (pageQuery) => await cippApiRequest.call(
										this,
										'GET',
										'/api/ListGraphRequest',
										{},
										pageQuery,
									),
									{ maxPages },
								);
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									error instanceof Error ? error.message : String(error),
									{ itemIndex: i },
								);
							}
						}
					} else if (operation === 'execGraphRequest') {
						const tenantFilter = getTenantFilter();
						const rawEndpoint = this.getNodeParameter('execEndpoint', i) as string;
						const endpoint = normalizeGraphEndpoint(rawEndpoint);
						const method = this.getNodeParameter('execMethod', i) as string;

						const payload: IDataObject = { tenantFilter, endpoint, method };

						if (method === 'POST' || method === 'PATCH') {
							const body = parseJsonPayload(
								this.getNodeParameter('execBody', i, '{}'),
								'Body',
								i,
							);
							if (hasPayloadContent(body)) {
								payload.body = body;
							}
						}

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecGraphRequest',
							payload,
							{},
						);
					} else if (operation === 'graphRequestExec') {
						const tenantFilter = getTenantFilter();
						const rawEndpoint = this.getNodeParameter('graphExecEndpoint', i) as string;
						const method = this.getNodeParameter('graphExecMethod', i) as 'GET' | 'POST' | 'PATCH';
						const graphExecOptions = this.getNodeParameter(
							'graphExecOptions',
							i,
							{},
						) as IDataObject;

						const endpoint = normalizeGraphEndpoint(rawEndpoint);
						if (!endpoint) {
							throw new NodeOperationError(
								this.getNode(),
								'Endpoint is required for Graph Request (Exec).',
								{ itemIndex: i },
							);
						}

						const enforceShiftsAllowlist = graphExecOptions.enforceShiftsAllowlist !== false;
						if (enforceShiftsAllowlist && !isTeamsScheduleEndpoint(endpoint)) {
							throw new NodeOperationError(
								this.getNode(),
								'Endpoint blocked by client-side allowlist. Expected teams/{ID}/schedule/*.',
								{ itemIndex: i },
							);
						}

						const headers = parseJsonObjectPayload(
							this.getNodeParameter('graphExecHeaders', i, '{}'),
							'Headers',
							i,
						);
						const payload: IDataObject = {
							tenantFilter,
							endpoint,
							method,
						};

						if (Object.keys(headers).length > 0) {
							payload.headers = headers;
						}

						if (method !== 'GET') {
							const body = parseJsonPayload(
								this.getNodeParameter('graphExecBody', i, '{}'),
								'Body',
								i,
							);

							if (hasPayloadContent(body)) {
								payload.body = body;
							}
						}

						const maxPayloadBytes = Number(graphExecOptions.maxPayloadBytes ?? 262144);
						if (!Number.isFinite(maxPayloadBytes) || maxPayloadBytes <= 0) {
							throw new NodeOperationError(
								this.getNode(),
								'Max Payload Bytes must be a positive number.',
								{ itemIndex: i },
							);
						}

						const payloadBytes = new TextEncoder().encode(JSON.stringify(payload)).length;
						if (payloadBytes > maxPayloadBytes) {
							throw new NodeOperationError(
								this.getNode(),
								`Payload is ${payloadBytes} bytes, which exceeds Max Payload Bytes (${maxPayloadBytes}).`,
								{ itemIndex: i },
							);
						}

						try {
							responseData = await cippApiRequest.call(
								this,
								'POST',
								'/api/ExecGraphRequest',
								payload,
								{},
							);
						} catch (error) {
							const err = error as { message?: string; description?: string };
							const message = (err.message || '').toLowerCase();
							const description = (err.description || '').toLowerCase();
							const endpointMissing =
								message.includes('resource not found') || description.includes('not found');

							// Support alternate naming in forks that expose /api/GraphRequest
							if (!endpointMissing) {
								throw error;
							}

							responseData = await cippApiRequest.call(
								this,
								'POST',
								'/api/GraphRequest',
								payload,
								{},
							);
						}
					}
				}

				// ==================== TEAMS SHIFT ====================
				else if (resource === 'teamsShift') {
					const tenantFilter = getTenantFilter();
					const teamId = this.getNodeParameter('teamId', i) as string;
					const basePath = `teams/${teamId}/schedule`;

					const graphExec = async (
						method: string,
						endpoint: string,
						body?: IDataObject,
					) => {
						const payload: IDataObject = { tenantFilter, endpoint, method };
						if (body && Object.keys(body).length > 0) {
							payload.body = body;
						}
						return cippApiRequest.call(this, 'POST', '/api/ExecGraphRequest', payload, {});
					};

					const buildFilteredEndpoint = (base: string): string => {
						const filters = this.getNodeParameter('listFilters', i, {}) as IDataObject;

						// Raw OData filter takes priority
						if (filters.rawFilter) {
							return `${base}?$filter=${encodeURIComponent(filters.rawFilter as string)}`;
						}

						// Build from convenience date fields
						const parts: string[] = [];
						if (filters.startDate) {
							const d = new Date(filters.startDate as string).toISOString();
							parts.push(`sharedShift/startDateTime ge ${d}`);
						}
						if (filters.endDate) {
							const d = new Date(filters.endDate as string).toISOString();
							parts.push(`sharedShift/endDateTime le ${d}`);
						}

						if (parts.length > 0) {
							return `${base}?$filter=${encodeURIComponent(parts.join(' and '))}`;
						}
						return base;
					};

					// ── Shifts ──
					if (operation === 'listShifts') {
						responseData = await graphExec('GET', buildFilteredEndpoint(`${basePath}/shifts`));
					} else if (operation === 'createShift') {
						const userId = this.getNodeParameter('userId', i) as string;
						const startDateTime = this.getNodeParameter('startDateTime', i) as string;
						const endDateTime = this.getNodeParameter('endDateTime', i) as string;
						const options = this.getNodeParameter('shiftOptions', i, {}) as IDataObject;

						const sharedShift: IDataObject = {
							startDateTime,
							endDateTime,
						};
						if (options.displayName) sharedShift.displayName = options.displayName;
						if (options.notes) sharedShift.notes = options.notes;
						if (options.theme) sharedShift.theme = options.theme;
						if (options.activities) {
							sharedShift.activities = JSON.parse(options.activities as string);
						}

						responseData = await graphExec('POST', `${basePath}/shifts`, {
							userId,
							sharedShift,
						});
					} else if (operation === 'updateShift') {
						const shiftId = this.getNodeParameter('shiftId', i) as string;
						const shiftData = parseJsonObjectPayload(
							this.getNodeParameter('shiftUpdateData', i),
							'Shift Data',
							i,
						);
						responseData = await graphExec('PUT', `${basePath}/shifts/${shiftId}`, shiftData);
					} else if (operation === 'deleteShift') {
						const shiftId = this.getNodeParameter('shiftId', i) as string;
						responseData = await graphExec('DELETE', `${basePath}/shifts/${shiftId}`);
					}

					// ── Open Shifts ──
					else if (operation === 'listOpenShifts') {
						responseData = await graphExec('GET', buildFilteredEndpoint(`${basePath}/openShifts`));
					} else if (operation === 'createOpenShift') {
						const schedulingGroupId = this.getNodeParameter('schedulingGroupId', i) as string;
						const startDateTime = this.getNodeParameter('openShiftStart', i) as string;
						const endDateTime = this.getNodeParameter('openShiftEnd', i) as string;
						const openSlotCount = this.getNodeParameter('openSlotCount', i) as number;
						const options = this.getNodeParameter('openShiftOptions', i, {}) as IDataObject;

						const sharedOpenShift: IDataObject = {
							startDateTime,
							endDateTime,
							openSlotCount,
						};
						if (options.displayName) sharedOpenShift.displayName = options.displayName;
						if (options.notes) sharedOpenShift.notes = options.notes;
						if (options.theme) sharedOpenShift.theme = options.theme;
						if (options.activities) {
							sharedOpenShift.activities = JSON.parse(options.activities as string);
						}

						responseData = await graphExec('POST', `${basePath}/openShifts`, {
							schedulingGroupId,
							sharedOpenShift,
						});
					} else if (operation === 'updateOpenShift') {
						const openShiftId = this.getNodeParameter('openShiftId', i) as string;
						const data = parseJsonObjectPayload(
							this.getNodeParameter('openShiftUpdateData', i),
							'Open Shift Data',
							i,
						);
						responseData = await graphExec('PUT', `${basePath}/openShifts/${openShiftId}`, data);
					} else if (operation === 'deleteOpenShift') {
						const openShiftId = this.getNodeParameter('openShiftId', i) as string;
						responseData = await graphExec('DELETE', `${basePath}/openShifts/${openShiftId}`);
					}

					// ── Scheduling Groups ──
					else if (operation === 'listSchedulingGroups') {
						responseData = await graphExec('GET', buildFilteredEndpoint(`${basePath}/schedulingGroups`));
					} else if (operation === 'createSchedulingGroup') {
						const displayName = this.getNodeParameter('groupDisplayName', i) as string;
						const userIds = (this.getNodeParameter('groupUserIds', i) as string)
							.split(',')
							.map((id) => id.trim())
							.filter((id) => id);
						responseData = await graphExec('POST', `${basePath}/schedulingGroups`, {
							displayName,
							userIds,
							isActive: true,
						});
					} else if (operation === 'updateSchedulingGroup') {
						const groupId = this.getNodeParameter('schedulingGroupUpdateId', i) as string;
						const data = parseJsonObjectPayload(
							this.getNodeParameter('schedulingGroupUpdateData', i),
							'Scheduling Group Data',
							i,
						);
						responseData = await graphExec(
							'PUT',
							`${basePath}/schedulingGroups/${groupId}`,
							data,
						);
					} else if (operation === 'deleteSchedulingGroup') {
						const groupId = this.getNodeParameter('schedulingGroupUpdateId', i) as string;
						responseData = await graphExec(
							'PUT',
							`${basePath}/schedulingGroups/${groupId}`,
							{ isActive: false },
						);
					}

					// ── Time Off Reasons ──
					else if (operation === 'listTimeOffReasons') {
						responseData = await graphExec('GET', buildFilteredEndpoint(`${basePath}/timeOffReasons`));
					} else if (operation === 'createTimeOffReason') {
						const displayName = this.getNodeParameter('reasonDisplayName', i) as string;
						const iconType = this.getNodeParameter('iconType', i) as string;
						responseData = await graphExec('POST', `${basePath}/timeOffReasons`, {
							displayName,
							iconType,
							isActive: true,
						});
					} else if (operation === 'updateTimeOffReason') {
						const reasonId = this.getNodeParameter('timeOffReasonId', i) as string;
						const data = parseJsonObjectPayload(
							this.getNodeParameter('timeOffReasonUpdateData', i),
							'Time Off Reason Data',
							i,
						);
						responseData = await graphExec(
							'PUT',
							`${basePath}/timeOffReasons/${reasonId}`,
							data,
						);
					} else if (operation === 'deleteTimeOffReason') {
						const reasonId = this.getNodeParameter('timeOffReasonId', i) as string;
						responseData = await graphExec(
							'PUT',
							`${basePath}/timeOffReasons/${reasonId}`,
							{ isActive: false },
						);
					}

					// ── Time Off Requests ──
					else if (operation === 'listTimeOffRequests') {
						responseData = await graphExec('GET', buildFilteredEndpoint(`${basePath}/timeOffRequests`));
					} else if (operation === 'createTimeOffRequest') {
						const startDateTime = this.getNodeParameter('timeOffStart', i) as string;
						const endDateTime = this.getNodeParameter('timeOffEnd', i) as string;
						const timeOffReasonId = this.getNodeParameter(
							'timeOffReasonIdForRequest',
							i,
						) as string;
						responseData = await graphExec('POST', `${basePath}/timeOffRequests`, {
							startDateTime,
							endDateTime,
							timeOffReasonId,
						});
					} else if (operation === 'approveTimeOffRequest') {
						const requestId = this.getNodeParameter('timeOffRequestId', i) as string;
						const message = this.getNodeParameter('approvalMessage', i, '') as string;
						const body: IDataObject = {};
						if (message) body.message = message;
						responseData = await graphExec(
							'POST',
							`${basePath}/timeOffRequests/${requestId}/approve`,
							body,
						);
					} else if (operation === 'declineTimeOffRequest') {
						const requestId = this.getNodeParameter('timeOffRequestId', i) as string;
						const message = this.getNodeParameter('approvalMessage', i, '') as string;
						const body: IDataObject = {};
						if (message) body.message = message;
						responseData = await graphExec(
							'POST',
							`${basePath}/timeOffRequests/${requestId}/decline`,
							body,
						);
					}

					// ── Swap Shift Requests ──
					else if (operation === 'listSwapShiftRequests') {
						responseData = await graphExec('GET', buildFilteredEndpoint(`${basePath}/swapShiftsChangeRequests`));
					} else if (operation === 'createSwapShiftRequest') {
						const senderShiftId = this.getNodeParameter('senderShiftId', i) as string;
						const recipientShiftId = this.getNodeParameter('recipientShiftId', i) as string;
						const recipientUserId = this.getNodeParameter(
							'swapRecipientUserId',
							i,
						) as string;
						responseData = await graphExec(
							'POST',
							`${basePath}/swapShiftsChangeRequests`,
							{
								senderShiftId,
								recipientShiftId,
								recipientUserId,
							},
						);
					} else if (operation === 'approveSwapShiftRequest') {
						const requestId = this.getNodeParameter('swapShiftRequestId', i) as string;
						const message = this.getNodeParameter('approvalMessage', i, '') as string;
						const body: IDataObject = {};
						if (message) body.message = message;
						responseData = await graphExec(
							'POST',
							`${basePath}/swapShiftsChangeRequests/${requestId}/approve`,
							body,
						);
					} else if (operation === 'declineSwapShiftRequest') {
						const requestId = this.getNodeParameter('swapShiftRequestId', i) as string;
						const message = this.getNodeParameter('approvalMessage', i, '') as string;
						const body: IDataObject = {};
						if (message) body.message = message;
						responseData = await graphExec(
							'POST',
							`${basePath}/swapShiftsChangeRequests/${requestId}/decline`,
							body,
						);
					}

					// ── Offer Shift Requests ──
					else if (operation === 'listOfferShiftRequests') {
						responseData = await graphExec('GET', buildFilteredEndpoint(`${basePath}/offerShiftRequests`));
					} else if (operation === 'createOfferShiftRequest') {
						const senderShiftId = this.getNodeParameter(
							'offerSenderShiftId',
							i,
						) as string;
						const recipientUserId = this.getNodeParameter(
							'offerRecipientUserId',
							i,
						) as string;
						responseData = await graphExec('POST', `${basePath}/offerShiftRequests`, {
							senderShiftId,
							recipientUserId,
						});
					} else if (operation === 'approveOfferShiftRequest') {
						const requestId = this.getNodeParameter('offerShiftRequestId', i) as string;
						const message = this.getNodeParameter('approvalMessage', i, '') as string;
						const body: IDataObject = {};
						if (message) body.message = message;
						responseData = await graphExec(
							'POST',
							`${basePath}/offerShiftRequests/${requestId}/approve`,
							body,
						);
					} else if (operation === 'declineOfferShiftRequest') {
						const requestId = this.getNodeParameter('offerShiftRequestId', i) as string;
						const message = this.getNodeParameter('approvalMessage', i, '') as string;
						const body: IDataObject = {};
						if (message) body.message = message;
						responseData = await graphExec(
							'POST',
							`${basePath}/offerShiftRequests/${requestId}/decline`,
							body,
						);
					}
				}

				// ==================== IDENTITY ====================
				else if (resource === 'identity') {
					const tenantFilter = getTenantFilter();

					if (operation === 'listAuditLogs') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListAuditLogs',
							{},
							{ tenantFilter },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listAppConsentRequests') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const requestStatus = this.getNodeParameter('appConsentRequestStatus', i, '') as string;
						const filter = this.getNodeParameter('appConsentFilter', i, '') as string;
						const qs: IDataObject = { tenantFilter };

						if (requestStatus) qs.RequestStatus = requestStatus;
						if (filter) qs.Filter = filter;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListAppConsentRequests',
							{},
							qs,
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listAzureAdConnectStatus') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const dataToReturn = this.getNodeParameter('aadConnectDataToReturn', i, '') as string;
						const qs: IDataObject = { tenantFilter };

						if (dataToReturn) qs.DataToReturn = dataToReturn;

						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListAzureADConnectStatus',
							{},
							qs,
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listBasicAuth') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListBasicAuth',
							{},
							{ tenantFilter },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listDeletedItems') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListDeletedItems',
							{},
							{ tenantFilter },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listDomains') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListDomains',
							{},
							{ tenantFilter },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'listRoles') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListRoles',
							{},
							{ tenantFilter },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'restoreDeleted') {
						const objectId = this.getNodeParameter('objectId', i) as string;
						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecRestoreDeleted',
							{
								tenantFilter,
								ID: objectId,
							},
							{},
						);
					} else if (operation === 'setCloudManaged') {
						const objectId = this.getNodeParameter('cloudManagedObjectId', i) as string;
						const displayName = this.getNodeParameter('cloudManagedDisplayName', i, '') as string;
						const type = this.getNodeParameter('cloudManagedType', i) as string;
						const isCloudManaged = this.getNodeParameter('isCloudManaged', i) as boolean;

						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecSetCloudManaged',
							{
								tenantFilter,
								displayName,
								ID: objectId,
								isCloudManaged: String(isCloudManaged),
								type,
							},
							{},
						);
					}
				}

				// ==================== POLICY ====================
				else if (resource === 'policy') {
					const tenantFilter = getTenantFilter();

					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListIntunePolicy',
							{},
							{ tenantFilter },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'add') {
						const policyConfig = this.getNodeParameter('policyConfig', i) as string;
						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/AddPolicy',
							{
								...parseJsonObjectPayload(policyConfig, 'Policy Config', i),
								tenantFilter,
							},
							{},
						);
					} else if (operation === 'assign') {
						const policyId = this.getNodeParameter('policyId', i) as string;
						const assignTo = this.getNodeParameter('assignTo', i) as string;
						const body: IDataObject = {
							tenantFilter,
							ID: policyId,
							AssignTo: assignTo,
						};
						if (assignTo === 'customGroup') {
							body.customGroupNames = this.getNodeParameter('customGroupNames', i) as string;
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AssignPolicy', body, {});
					} else if (operation === 'remove') {
						const policyId = this.getNodeParameter('policyId', i) as string;
						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/RemovePolicy',
							{
								tenantFilter,
								ID: policyId,
							},
							{},
						);
					} else if (operation === 'listDefenderTvm') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListDefenderTVM',
							{},
							{ tenantFilter },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					}
				}

				// ==================== ONEDRIVE ====================
				else if (resource === 'onedrive') {
					const tenantFilter = getTenantFilter();
					const userId = this.getNodeParameter('userId', i) as string;

					if (operation === 'provision') {
						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecOneDriveProvision',
							{
								tenantFilter,
								UserPrincipalName: userId,
							},
							{},
						);
					} else if (operation === 'addShortcut') {
						const shortcutUrl = this.getNodeParameter('shortcutUrl', i) as string;
						const shortcutName = this.getNodeParameter('shortcutName', i, '') as string;
						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecOneDriveShortCut',
							{
								tenantFilter,
								UserPrincipalName: userId,
								URL: shortcutUrl,
								ShortcutName: shortcutName,
							},
							{},
						);
					}
				}

				// ==================== EMAIL SECURITY ====================
				else if (resource === 'emailSecurity') {
					const tenantFilter = getTenantFilter();

					if (operation === 'listSpamFilters') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListSpamfilter', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listSpamFilterTemplates') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListSpamFilterTemplates', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addSpamFilter') {
						const policyJson = this.getNodeParameter('esSpamFilterJson', i) as string;
						let policyData: IDataObject;
						try {
							policyData = JSON.parse(policyJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Policy JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddSpamFilter', {
							...policyData,
							tenantFilter,
						}, {});
					} else if (operation === 'editSpamFilter') {
						const policyJson = this.getNodeParameter('esSpamFilterJson', i) as string;
						let policyData: IDataObject;
						try {
							policyData = JSON.parse(policyJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Policy JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/EditSpamFilter', {
							...policyData,
							tenantFilter,
						}, {});
					} else if (operation === 'removeSpamFilter') {
						const name = this.getNodeParameter('esName', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/RemoveSpamfilter', {
							tenantFilter,
							Name: name,
						}, {});
					} else if (operation === 'listTransportRules') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListTransportRules', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addTransportRule') {
						const ruleJson = this.getNodeParameter('esTransportRuleJson', i) as string;
						let ruleData: IDataObject;
						try {
							ruleData = JSON.parse(ruleJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Rule JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddTransportRule', {
							...ruleData,
							tenantFilter,
						}, {});
					} else if (operation === 'editTransportRule') {
						const ruleJson = this.getNodeParameter('esTransportRuleJson', i) as string;
						let ruleData: IDataObject;
						try {
							ruleData = JSON.parse(ruleJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Rule JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/EditTransportRule', {
							...ruleData,
							tenantFilter,
						}, {});
					} else if (operation === 'removeTransportRule') {
						const name = this.getNodeParameter('esName', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/RemoveTransportRule', {
							tenantFilter,
							Name: name,
						}, {});
					} else if (operation === 'listExchangeConnectors') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListExchangeConnectors', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addExConnector') {
						const connectorJson = this.getNodeParameter('esConnectorJson', i) as string;
						let connectorData: IDataObject;
						try {
							connectorData = JSON.parse(connectorJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Connector JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddExConnector', {
							...connectorData,
							tenantFilter,
						}, {});
					} else if (operation === 'editExConnector') {
						const connectorJson = this.getNodeParameter('esConnectorJson', i) as string;
						let connectorData: IDataObject;
						try {
							connectorData = JSON.parse(connectorJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Connector JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/EditExConnector', {
							...connectorData,
							tenantFilter,
						}, {});
					} else if (operation === 'removeExConnector') {
						const name = this.getNodeParameter('esName', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/RemoveExConnector', {
							tenantFilter,
							Name: name,
						}, {});
					} else if (operation === 'listConnectionFilters') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListConnectionFilter', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addConnectionFilter') {
						const filterJson = this.getNodeParameter('esConnectionFilterJson', i) as string;
						let filterData: IDataObject;
						try {
							filterData = JSON.parse(filterJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Filter JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddConnectionFilter', {
							...filterData,
							tenantFilter,
						}, {});
					} else if (operation === 'listAntiPhishingFilters') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListAntiPhishingFilters', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'editAntiPhishingFilter') {
						const filterJson = this.getNodeParameter('esAntiPhishingFilterJson', i) as string;
						let filterData: IDataObject;
						try {
							filterData = JSON.parse(filterJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Filter JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/EditAntiPhishingFilter', {
							...filterData,
							tenantFilter,
						}, {});
					} else if (operation === 'listMalwareFilters') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListMalwareFilters', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'editMalwareFilter') {
						const filterJson = this.getNodeParameter('esMalwareFilterJson', i) as string;
						let filterData: IDataObject;
						try {
							filterData = JSON.parse(filterJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Filter JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/EditMalwareFilter', {
							...filterData,
							tenantFilter,
						}, {});
					} else if (operation === 'listSafeAttachmentsFilters') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListSafeAttachmentsFilters', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addTenantAllowBlockList') {
						const blockListJson = this.getNodeParameter('esBlockListJson', i) as string;
						let blockListData: IDataObject;
						try {
							blockListData = JSON.parse(blockListJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Block List JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddTenantAllowBlockList', {
							...blockListData,
							tenantFilter,
						}, {});
					} else if (operation === 'removeTenantAllowBlockList') {
						const blockListJson = this.getNodeParameter('esBlockListJson', i) as string;
						let blockListData: IDataObject;
						try {
							blockListData = JSON.parse(blockListJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Block List JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/RemoveTenantAllowBlockList', {
							...blockListData,
							tenantFilter,
						}, {});
					} else if (operation === 'listTenantAllowBlockList') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListTenantAllowBlockList', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					}
				}

				// ==================== EXCHANGE RESOURCE ====================
				else if (resource === 'exchangeResource') {
					const tenantFilter = getTenantFilter();

					if (operation === 'listRooms') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListRooms', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addRoomMailbox') {
						const displayName = this.getNodeParameter('erDisplayName', i) as string;
						const username = this.getNodeParameter('erUsername', i) as string;
						const domain = this.getNodeParameter('erDomain', i) as string;
						const additionalJson = this.getNodeParameter('erAdditionalJson', i) as string;
						let additionalData: IDataObject = {};
						if (additionalJson && additionalJson !== '{}') {
							try {
								additionalData = JSON.parse(additionalJson) as IDataObject;
							} catch {
								throw new NodeOperationError(this.getNode(), 'Additional JSON must be valid JSON', { itemIndex: i });
							}
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddRoomMailbox', {
							...additionalData,
							tenantFilter,
							displayName,
							username,
							domain,
						}, {});
					} else if (operation === 'editRoomMailbox') {
						const roomJson = this.getNodeParameter('erRoomJson', i) as string;
						let roomData: IDataObject;
						try {
							roomData = JSON.parse(roomJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Room JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/EditRoomMailbox', {
							...roomData,
							tenantFilter,
						}, {});
					} else if (operation === 'listEquipment') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListEquipment', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addEquipmentMailbox') {
						const displayName = this.getNodeParameter('erDisplayName', i) as string;
						const username = this.getNodeParameter('erUsername', i) as string;
						const domain = this.getNodeParameter('erDomain', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddEquipmentMailbox', {
							tenantFilter,
							displayName,
							username,
							domain,
						}, {});
					} else if (operation === 'editEquipmentMailbox') {
						const equipmentJson = this.getNodeParameter('erEquipmentJson', i) as string;
						let equipmentData: IDataObject;
						try {
							equipmentData = JSON.parse(equipmentJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Equipment JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/EditEquipmentMailbox', {
							...equipmentData,
							tenantFilter,
						}, {});
					} else if (operation === 'listRoomLists') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListRoomLists', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addRoomList') {
						const displayName = this.getNodeParameter('erDisplayName', i) as string;
						const username = this.getNodeParameter('erUsername', i) as string;
						const domain = this.getNodeParameter('erDomain', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddRoomList', {
							tenantFilter,
							displayName,
							username,
							domain,
						}, {});
					} else if (operation === 'editRoomList') {
						const roomListJson = this.getNodeParameter('erRoomListJson', i) as string;
						let roomListData: IDataObject;
						try {
							roomListData = JSON.parse(roomListJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Room List JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/EditRoomList', {
							...roomListData,
							tenantFilter,
						}, {});
					}
				}

				// ==================== GDAP ====================
				else if (resource === 'gdap') {
					const tenantFilter = getTenantFilter();

					if (operation === 'listRoles') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(
							this,
							'GET',
							'/api/ListGDAPRoles',
							{},
							{ tenantFilter },
						);
						if (Array.isArray(responseData) && !returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'sendInvite') {
						const gdapRoles = this.getNodeParameter('gdapRoles', i) as string;
						responseData = await cippApiRequest.call(
							this,
							'POST',
							'/api/ExecGDAPInvite',
							{
								tenantFilter,
								Roles: gdapRoles.split(',').map((r) => r.trim()),
							},
							{},
						);
					}
				}

				// ==================== STANDARDS ====================
				else if (resource === 'standards') {
					const tenantFilter = (['listStandardTemplates', 'addStandardTemplate', 'removeStandardTemplate', 'listDomainHealth'].includes(operation))
						? undefined
						: getTenantFilter();

					if (operation === 'listStandards') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListStandards', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addStandardsDeploy') {
						const standardsJson = this.getNodeParameter('standardsJson', i) as string;
						let standardsData: IDataObject;
						try {
							standardsData = JSON.parse(standardsJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Standards JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddStandardsDeploy', {
							...standardsData,
							tenantFilter,
						}, {});
					} else if (operation === 'removeStandard') {
						const standardId = this.getNodeParameter('standardId', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/RemoveStandard', {
							tenantFilter,
							ID: standardId,
						}, {});
					} else if (operation === 'listStandardTemplates') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/listStandardTemplates', {}, {});
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addStandardTemplate') {
						const templateJson = this.getNodeParameter('standardTemplateJson', i) as string;
						let templateData: IDataObject;
						try {
							templateData = JSON.parse(templateJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Template JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddStandardsTemplate', {
							...templateData,
						}, {});
					} else if (operation === 'removeStandardTemplate') {
						const templateId = this.getNodeParameter('standardTemplateId', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/RemoveStandardTemplate', {
							ID: templateId,
						}, {});
					} else if (operation === 'runStandards') {
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecStandardsRun', {
							tenantFilter,
						}, {});
					} else if (operation === 'listBPA') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListBPA', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'execBPA') {
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecBPA', {
							tenantFilter,
						}, {});
					} else if (operation === 'listDomainAnalyser') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListDomainAnalyser', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'execDomainAnalyser') {
						const domain = this.getNodeParameter('domain', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecDomainAnalyser', {
							tenantFilter,
							Domain: domain,
						}, {});
					} else if (operation === 'listDomainHealth') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const domain = this.getNodeParameter('domain', i) as string;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListDomainHealth', {}, { Domain: domain });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listTenantDrift') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListTenantDrift', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listTenantAlignment') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListTenantAlignment', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'execDriftClone') {
						const driftJson = this.getNodeParameter('driftJson', i) as string;
						let driftData: IDataObject;
						try {
							driftData = JSON.parse(driftJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Drift JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecDriftClone', {
							...driftData,
							tenantFilter,
						}, {});
					}
				}

				// ==================== INTUNE ====================
				else if (resource === 'intune') {
					const tenantFilter = getTenantFilter();

					if (operation === 'listIntuneScripts') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListIntuneScript', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'editIntuneScript') {
						const scriptJson = this.getNodeParameter('intuneScriptJson', i) as string;
						let scriptData: IDataObject;
						try {
							scriptData = JSON.parse(scriptJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Script JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/EditIntuneScript', {
							...scriptData,
							tenantFilter,
						}, {});
					} else if (operation === 'removeIntuneScript') {
						const id = this.getNodeParameter('intuneId', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/RemoveIntuneScript', {
							tenantFilter,
							ID: id,
						}, {});
					} else if (operation === 'listCompliancePolicies') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListCompliancePolicies', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listAppProtectionPolicies') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListAppProtectionPolicies', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listAssignmentFilters') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListAssignmentFilters', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addAssignmentFilter') {
						const filterJson = this.getNodeParameter('intuneFilterJson', i) as string;
						let filterData: IDataObject;
						try {
							filterData = JSON.parse(filterJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Filter JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddAssignmentFilter', {
							...filterData,
							tenantFilter,
						}, {});
					} else if (operation === 'listIntuneReusableSettings') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListIntuneReusableSettings', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addIntuneReusableSetting') {
						const settingJson = this.getNodeParameter('intuneSettingJson', i) as string;
						let settingData: IDataObject;
						try {
							settingData = JSON.parse(settingJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Setting JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddIntuneReusableSetting', {
							...settingData,
							tenantFilter,
						}, {});
					} else if (operation === 'removeIntuneReusableSetting') {
						const id = this.getNodeParameter('intuneId', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/RemoveIntuneReusableSetting', {
							tenantFilter,
							ID: id,
						}, {});
					} else if (operation === 'listIntuneTemplates') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListIntuneTemplates', {}, {});
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addWin32ScriptApp') {
						const appJson = this.getNodeParameter('intuneAppJson', i) as string;
						let appData: IDataObject;
						try {
							appData = JSON.parse(appJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'App JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddWin32ScriptApp', {
							...appData,
							tenantFilter,
						}, {});
					}
				}

				// ==================== SHAREPOINT ====================
				else if (resource === 'sharepoint') {
					const tenantFilter = getTenantFilter();

					if (operation === 'deleteSharepointSite') {
						const siteUrl = this.getNodeParameter('siteUrl', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/DeleteSharepointSite', {
							tenantFilter,
							SiteUrl: siteUrl,
						}, {});
					} else if (operation === 'listSharepointQuota') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListSharepointQuota', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listSharepointSettings') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListSharepointSettings', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listSharepointAdminUrl') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						// ReturnUrl=true makes the endpoint return JSON ({ AdminUrl }) instead of a 302 redirect to the admin center
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListSharepointAdminUrl', {}, { tenantFilter, ReturnUrl: true });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					}
				}

				// ==================== TESTING ====================
				else if (resource === 'testing') {
					const tenantFilter = getTenantFilter();

					if (operation === 'listTests') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListTests', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'listAvailableTests') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListAvailableTests', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'execTestRun') {
						const testJson = this.getNodeParameter('testJson', i) as string;
						let testData: IDataObject;
						try {
							testData = JSON.parse(testJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Test JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/ExecTestRun', {
							...testData,
							tenantFilter,
						}, {});
					} else if (operation === 'listTestReports') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						responseData = await cippApiRequest.call(this, 'GET', '/api/ListTestReports', {}, { tenantFilter });
						if (Array.isArray(responseData) && !returnAll) {
							responseData = responseData.slice(0, this.getNodeParameter('limit', i) as number);
						}
					} else if (operation === 'addTestReport') {
						const reportJson = this.getNodeParameter('reportJson', i) as string;
						let reportData: IDataObject;
						try {
							reportData = JSON.parse(reportJson) as IDataObject;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Report JSON must be valid JSON', { itemIndex: i });
						}
						responseData = await cippApiRequest.call(this, 'POST', '/api/AddTestReport', {
							...reportData,
							tenantFilter,
						}, {});
					} else if (operation === 'deleteTestReport') {
						const id = this.getNodeParameter('testReportId', i) as string;
						responseData = await cippApiRequest.call(this, 'POST', '/api/DeleteTestReport', {
							tenantFilter,
							ID: id,
						}, {});
					}
				}

				// Handle response
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject[]),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
