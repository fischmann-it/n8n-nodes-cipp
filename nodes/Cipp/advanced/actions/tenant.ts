import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	cippApiRequest,
	getSecureScoreCached,
	getTenantFilter,
	listWithSlice,
	parseJsonObjectPayload,
	postAction,
} from '../GenericFunctions';
import { applyOutputMode, effectiveTop } from './helpers/secureScoreTransform';
export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};
	if (operation === 'getDetails') {
		// GET /api/ListTenantDetails — standard tenantFilter QS
		responseData = await cippApiRequest.call(
			context,
			'GET',
			'/api/ListTenantDetails',
			{},
			{ tenantFilter: getTenantFilter(context, i) },
		);
	} else if (operation === 'edit') {
		// POST /api/EditTenant — no tenantFilter, uses customerId
		const customerId = context.getNodeParameter('customerId', i) as string;
		const fields = context.getNodeParameter('editFields', i, {}) as IDataObject;
		const body: IDataObject = { customerId };
		if (fields.tenantAlias) body.tenantAlias = fields.tenantAlias as string;
		if (fields.tenantGroups) body.tenantGroups = fields.tenantGroups as string;
		if (fields.GroupId) body.GroupId = fields.GroupId as string;
		responseData = await cippApiRequest.call(context, 'POST', '/api/EditTenant', body, {});
	} else if (operation === 'add') {
		// POST /api/AddTenant — no tenantFilter
		const fields = context.getNodeParameter('addFields', i, {}) as IDataObject;
		const body: IDataObject = {};
		if (fields.Action) body.Action = fields.Action as string;
		if (fields.TenantName) body.TenantName = fields.TenantName as string;
		if (fields.CompanyName) body.CompanyName = fields.CompanyName as string;
		if (fields.FirstName) body.FirstName = fields.FirstName as string;
		if (fields.LastName) body.LastName = fields.LastName as string;
		if (fields.Email) body.Email = fields.Email as string;
		if (fields.PhoneNumber) body.PhoneNumber = fields.PhoneNumber as string;
		if (fields.AddressLine1) body.AddressLine1 = fields.AddressLine1 as string;
		if (fields.AddressLine2) body.AddressLine2 = fields.AddressLine2 as string;
		if (fields.City) body.City = fields.City as string;
		if (fields.State) body.State = fields.State as string;
		if (fields.PostalCode) body.PostalCode = fields.PostalCode as string;
		if (fields.Country) body.Country = fields.Country as string;
		responseData = await cippApiRequest.call(context, 'POST', '/api/AddTenant', body, {});
	} else if (operation === 'addSpn') {
		// GET /api/ExecAddSPN — no params at all
		responseData = await cippApiRequest.call(context, 'GET', '/api/ExecAddSPN', {}, {});
	} else if (operation === 'offboard') {
		// PATCH /api/ExecOffboardTenant — TenantFilter PascalCase LabelValue in body
		const tenantFilterLv = context.getNodeParameter('offboardTenantFilter', i) as string;
		const fields = context.getNodeParameter('offboardFields', i, {}) as IDataObject;
		const body: IDataObject = {
			TenantFilter: parseJsonObjectPayload(context.getNode(), tenantFilterLv, 'Tenant Filter', i),
		};
		if (fields.RemoveCSPGuestUsers !== undefined)
			body.RemoveCSPGuestUsers = fields.RemoveCSPGuestUsers;
		if (fields.RemoveCSPnotificationContacts !== undefined)
			body.RemoveCSPnotificationContacts = fields.RemoveCSPnotificationContacts;
		if (fields.RemoveDomainAnalyserData !== undefined)
			body.RemoveDomainAnalyserData = fields.RemoveDomainAnalyserData;
		if (fields.RemoveMultitenantCSPApps !== undefined)
			body.RemoveMultitenantCSPApps = fields.RemoveMultitenantCSPApps;
		if (fields.TerminateContract !== undefined) body.TerminateContract = fields.TerminateContract;
		if (fields.TerminateGDAP !== undefined) body.TerminateGDAP = fields.TerminateGDAP;
		if (fields.vendorApplications) {
			body.vendorApplications = parseJsonObjectPayload(
				context.getNode(),
				fields.vendorApplications,
				'Vendor Applications',
				i,
			);
		}
		responseData = await cippApiRequest.call(context, 'PATCH', '/api/ExecOffboardTenant', body, {});
	} else if (operation === 'onboard') {
		// POST /api/ExecOnboardTenant — no tenantFilter, uses id LabelValue
		const fields = context.getNodeParameter('onboardFields', i, {}) as IDataObject;
		const body: IDataObject = {};
		if (fields.id) {
			body.id = parseJsonObjectPayload(context.getNode(), fields.id, 'Tenant ID', i);
		}
		if (fields.gdapRoles) {
			body.gdapRoles = parseJsonObjectPayload(context.getNode(), fields.gdapRoles, 'GDAP Roles', i);
		}
		if (fields.addMissingGroups) body.addMissingGroups = fields.addMissingGroups as string;
		if (fields.autoMapRoles) body.autoMapRoles = fields.autoMapRoles as string;
		if (fields.remapRoles) body.remapRoles = fields.remapRoles as string;
		if (fields.Cancel) body.Cancel = fields.Cancel as string;
		if (fields.Retry) body.Retry = fields.Retry as string;
		if (fields.ignoreMissingRoles !== undefined)
			body.ignoreMissingRoles = fields.ignoreMissingRoles;
		if (fields.standardsExcludeAllTenants !== undefined)
			body.standardsExcludeAllTenants = fields.standardsExcludeAllTenants;
		responseData = await cippApiRequest.call(context, 'POST', '/api/ExecOnboardTenant', body, {});
	} else if (operation === 'updateSecureScore') {
		// POST /api/ExecUpdateSecureScore — TenantFilter PascalCase in body
		const body: IDataObject = {
			TenantFilter: getTenantFilter(context, i),
		};
		const fields = context.getNodeParameter('secureScoreFields', i, {}) as IDataObject;
		if (fields.ControlName) body.ControlName = fields.ControlName as string;
		if (fields.reason) body.reason = fields.reason as string;
		if (fields.resolutionType) body.resolutionType = fields.resolutionType as string;
		if (fields.vendorInformation) body.vendorInformation = fields.vendorInformation as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ExecUpdateSecureScore',
			body,
			{},
		);
	} else if (operation === 'getSecureScore') {
		// GET /api/ListGraphRequest → security/secureScores
		const opts = context.getNodeParameter('secureScoreOptions', i, {}) as IDataObject;
		const historyCount = Math.max(1, (opts.historyCount as number) ?? 1);
		const outputMode = (opts.outputMode as string) ?? 'summary';
		const includeDescriptions = (opts.includeDescriptions as boolean) ?? false;
		const tenantFilter = getTenantFilter(context, i);
		const top = effectiveTop(outputMode, historyCount);
		const raw = await getSecureScoreCached.call(context, tenantFilter, top);
		responseData = applyOutputMode(raw, outputMode, includeDescriptions);
	} else if (operation === 'listAppConsentRequests') {
		// GET /api/ListAppConsentRequests — standard tenantFilter QS
		const qs: IDataObject = { tenantFilter: getTenantFilter(context, i) };
		const filters = context.getNodeParameter('consentFilters', i, {}) as IDataObject;
		if (filters.Filter) qs.Filter = filters.Filter as string;
		if (filters.RequestStatus) qs.RequestStatus = filters.RequestStatus as string;
		responseData = await listWithSlice(context, i, 'GET', '/api/ListAppConsentRequests', {}, qs);
	} else if (operation === 'setAuthMethod') {
		// POST /api/SetAuthMethod — tenantFilter in body (standard camelCase)
		const fields = context.getNodeParameter('authMethodFields', i, {}) as IDataObject;
		const body: IDataObject = {};
		if (fields.Id) body.Id = fields.Id as string;
		if (fields.GroupIds) body.GroupIds = fields.GroupIds as string;
		if (fields.state) body.state = fields.state as string;
		responseData = await postAction(context, i, '/api/SetAuthMethod', body);
	} else if (operation === 'editOffboardingDefaults') {
		// POST /api/EditTenantOffboardingDefaults — no tenantFilter, uses customerId
		const customerId = context.getNodeParameter('offboardDefaultsCustomerId', i) as string;
		const fields = context.getNodeParameter('offboardDefaultsFields', i, {}) as IDataObject;
		const body: IDataObject = { customerId };
		if (fields.Alias) body.Alias = fields.Alias as string;
		if (fields.defaultDomainName) body.defaultDomainName = fields.defaultDomainName as string;
		if (fields.offboardingDefaults) body.offboardingDefaults = fields.offboardingDefaults as string;
		if (fields.Groups) {
			body.Groups = parseJsonObjectPayload(context.getNode(), fields.Groups, 'Groups', i);
		}
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/EditTenantOffboardingDefaults',
			body,
			{},
		);
	} else if (operation === 'removeCapabilitiesCache') {
		// GET /api/RemoveTenantCapabilitiesCache — optional defaultDomainName QS
		const qs: IDataObject = {};
		const domain = context.getNodeParameter('cacheDomainName', i, '') as string;
		if (domain) qs.defaultDomainName = domain;
		responseData = await cippApiRequest.call(
			context,
			'GET',
			'/api/RemoveTenantCapabilitiesCache',
			{},
			qs,
		);
	} else if (operation === 'listOAuthApps') {
		// GET /api/ListOAuthApps — standard tenantFilter QS
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListOAuthApps',
			{},
			{ tenantFilter: getTenantFilter(context, i) },
		);
	} else if (operation === 'listServiceHealth') {
		// GET /api/ListServiceHealth — standard tenantFilter QS + optional filters
		const qs: IDataObject = { tenantFilter: getTenantFilter(context, i) };
		const filters = context.getNodeParameter('serviceHealthFilters', i, {}) as IDataObject;
		if (filters.defaultDomainName) qs.defaultDomainName = filters.defaultDomainName as string;
		if (filters.displayName) qs.displayName = filters.displayName as string;
		responseData = await listWithSlice(context, i, 'GET', '/api/ListServiceHealth', {}, qs);
		// ── Tenant Group operations ══════════════════════════════════════════
	} else if (operation === 'listTenantGroups') {
		// POST /api/ListTenantGroups — no tenantFilter, optional groupId QS
		const qs: IDataObject = {};
		const filters = context.getNodeParameter('tenantGroupFilters', i, {}) as IDataObject;
		if (filters.groupId) qs.groupId = filters.groupId as string;
		const returnAll = context.getNodeParameter('returnAll', i) as boolean;
		const raw = await cippApiRequest.call(context, 'POST', '/api/ListTenantGroups', {}, qs);
		const arr = Array.isArray(raw) ? raw : [raw as IDataObject];
		responseData = returnAll ? arr : arr.slice(0, context.getNodeParameter('limit', i) as number);
	} else if (operation === 'deleteTenantGroup') {
		// DELETE /api/ExecTenantGroup — no tenantFilter, groupId in body
		const groupId = context.getNodeParameter('tenantGroupId', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'DELETE',
			'/api/ExecTenantGroup',
			{ groupId },
			{},
		);
	} else if (operation === 'runTenantGroupRule') {
		// POST /api/ExecRunTenantGroupRule — no tenantFilter, groupId in body
		const groupId = context.getNodeParameter('tenantGroupId', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ExecRunTenantGroupRule',
			{ groupId },
			{},
		);
		// ── Tenant Exclusion + Removal ══════════════════════════════════════
	} else if (operation === 'excludeTenant') {
		// POST /api/ExecExcludeTenant — tenantFilter QS + AddExclusion QS + value body
		const qs: IDataObject = {
			tenantFilter: getTenantFilter(context, i),
			AddExclusion: 'true',
		};
		const fields = context.getNodeParameter('excludeFields', i, {}) as IDataObject;
		const body: IDataObject = {};
		if (fields.value) body.value = fields.value as string;
		responseData = await cippApiRequest.call(context, 'POST', '/api/ExecExcludeTenant', body, qs);
	} else if (operation === 'removeTenant') {
		// POST /api/ExecRemoveTenant — no tenantFilter, TenantID in body
		const tenantID = context.getNodeParameter('removeTenantId', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ExecRemoveTenant',
			{ TenantID: tenantID },
			{},
		);
		// ── Allow/Block List ══════════════════════════════════════════════════
	} else if (operation === 'listTenantAllowBlockList') {
		// GET /api/ListTenantAllowBlockList — standard tenantFilter QS
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListTenantAllowBlockList',
			{},
			{ tenantFilter: getTenantFilter(context, i) },
		);
	} else if (operation === 'removeTenantAllowBlockList') {
		// POST /api/RemoveTenantAllowBlockList — tenantFilter in body
		const fields = context.getNodeParameter('allowBlockFields', i, {}) as IDataObject;
		const body: IDataObject = {
			tenantFilter: getTenantFilter(context, i),
		};
		if (fields.Entries) body.Entries = fields.Entries as string;
		if (fields.ListType) body.ListType = fields.ListType as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/RemoveTenantAllowBlockList',
			body,
			{},
		);
		// ── Onboarding + Offboarding Status ══════════════════════════════════
	} else if (operation === 'listTenantOnboarding') {
		// GET /api/ListTenantOnboarding — no tenantFilter, optional QS params
		const qs: IDataObject = {};
		const filters = context.getNodeParameter('onboardingFilters', i, {}) as IDataObject;
		if (filters.id) qs.id = filters.id as string;
		if (filters.standardsExcludeAllTenants)
			qs.standardsExcludeAllTenants = filters.standardsExcludeAllTenants as string;
		if (filters.remapRoles) qs.remapRoles = filters.remapRoles as string;
		if (filters.gdapRoles) qs.gdapRoles = filters.gdapRoles as string;
		if (filters.ignoreMissingRoles) qs.ignoreMissingRoles = filters.ignoreMissingRoles as string;
		const returnAll = context.getNodeParameter('returnAll', i) as boolean;
		const raw = await cippApiRequest.call(context, 'GET', '/api/ListTenantOnboarding', {}, qs);
		const arr = Array.isArray(raw) ? raw : [raw as IDataObject];
		responseData = returnAll ? arr : arr.slice(0, context.getNodeParameter('limit', i) as number);
	} else if (operation === 'getOffboardingJob') {
		// GET /api/CIPPOffboardingJob — parameterless, no tenantFilter
		responseData = await cippApiRequest.call(context, 'GET', '/api/CIPPOffboardingJob', {}, {});
		// ── Exec Add Tenant (by token/domain) ════════════════════════════════
	} else if (operation === 'execAddTenant') {
		// POST /api/ExecAddTenant — no tenantFilter, different from AddTenant
		const fields = context.getNodeParameter('execAddTenantFields', i, {}) as IDataObject;
		const body: IDataObject = {};
		if (fields.accessToken) body.accessToken = fields.accessToken as string;
		if (fields.defaultDomainName) body.defaultDomainName = fields.defaultDomainName as string;
		if (fields.tenantId) body.tenantId = fields.tenantId as string;
		responseData = await cippApiRequest.call(context, 'POST', '/api/ExecAddTenant', body, {});
		// ── Domain operations (TODO-14j) ══════════════════════════════════════
	} else if (operation === 'listDomains') {
		// GET /api/ListDomains — standard tenantFilter QS
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListDomains',
			{},
			{ tenantFilter: getTenantFilter(context, i) },
		);
	} else if (operation === 'addDomain') {
		// POST /api/AddDomain — tenantFilter in body + domain
		const domain = context.getNodeParameter('domainName', i) as string;
		responseData = await postAction(context, i, '/api/AddDomain', {
			domain,
		});
	} else if (operation === 'removeDomain') {
		// DELETE /api/ExecDomainAction — tenantFilter in body + domain + Action
		const domain = context.getNodeParameter('domainName', i) as string;
		const action = context.getNodeParameter('domainAction', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'DELETE',
			'/api/ExecDomainAction',
			{
				tenantFilter: getTenantFilter(context, i),
				domain,
				Action: action,
			},
			{},
		);
	} else if (operation === 'listAdminPortalLicenses') {
		// GET /api/ListAdminPortalLicenses — standard tenantFilter QS
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListAdminPortalLicenses',
			{},
			{ tenantFilter: getTenantFilter(context, i) },
		);
	} else if (operation === 'listServicePrincipals') {
		// GET /api/ExecServicePrincipals — optional QS params, no tenantFilter
		const fields = context.getNodeParameter('servicePrincipalFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (fields.Action) qs.Action = fields.Action;
		if (fields.AppId) qs.AppId = fields.AppId;
		if (fields.Id) qs.Id = fields.Id;
		if (fields.Select) qs.Select = fields.Select;
		responseData = await listWithSlice(context, i, 'GET', '/api/ExecServicePrincipals', {}, qs);
	} else if (operation === 'runAccessChecks') {
		// POST /api/ExecAccessChecks — TenantId in body, optional SkipCache + Type QS
		const body: IDataObject = {
			TenantId: getTenantFilter(context, i),
		};
		const qs: IDataObject = {};
		const options = context.getNodeParameter('accessCheckOptions', i, {}) as IDataObject;
		if (options.SkipCache) qs.SkipCache = options.SkipCache as string;
		if (options.Type) qs.Type = options.Type as string;
		responseData = await cippApiRequest.call(context, 'POST', '/api/ExecAccessChecks', body, qs);
	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}
	return responseData;
}
