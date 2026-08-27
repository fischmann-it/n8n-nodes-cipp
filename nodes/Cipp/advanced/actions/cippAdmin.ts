import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	cippApiRequest,
	getTenantFilter,
	listWithSlice,
	parseJsonObjectPayload,
} from '../GenericFunctions';

export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {

	// ══════════════════════════════════════════════════════════════
	// Setup
	// ══════════════════════════════════════════════════════════════

	if (operation === 'createSamApp') {
		const accessToken = context.getNodeParameter('access_token', i) as string;
		return cippApiRequest.call(context, 'POST', '/api/ExecCreateSAMApp', {
			access_token: accessToken,
		});
	}

	if (operation === 'runCombinedSetup') {
		const fields = context.getNodeParameter('combinedSetupFields', i, {}) as IDataObject;
		const body: IDataObject = {};
		if (fields.applicationId) body.applicationId = fields.applicationId;
		if (fields.applicationSecret) body.applicationSecret = fields.applicationSecret;
		if (fields.baselineOption) body.baselineOption = fields.baselineOption;
		if (fields.email) body.email = fields.email;
		if (fields.RefreshToken) body.RefreshToken = fields.RefreshToken;
		if (fields.selectedBaselines) body.selectedBaselines = fields.selectedBaselines;
		if (fields.selectedOption) body.selectedOption = fields.selectedOption;
		if (fields.tenantid) body.tenantid = fields.tenantid;
		if (fields.webhook) body.webhook = fields.webhook;
		return cippApiRequest.call(context, 'POST', '/api/ExecCombinedSetup', body);
	}

	if (operation === 'runSamSetup') {
		const qsFields = context.getNodeParameter('setupQueryParams', i, {}) as IDataObject;
		const bodyFields = context.getNodeParameter('setupBodyParams', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (qsFields.CheckSetupProcess) qs.CheckSetupProcess = qsFields.CheckSetupProcess;
		if (qsFields.code) qs.code = qsFields.code;
		if (qsFields.count) qs.count = qsFields.count;
		if (qsFields.CreateSAM) qs.CreateSAM = qsFields.CreateSAM;
		if (qsFields.error) qs.error = qsFields.error;
		if (qsFields.error_description) qs.error_description = qsFields.error_description;
		if (qsFields.step) qs.step = qsFields.step;
		const body: IDataObject = {};
		if (bodyFields.applicationid) body.applicationid = bodyFields.applicationid;
		if (bodyFields.applicationsecret) body.applicationsecret = bodyFields.applicationsecret;
		if (bodyFields.RefreshToken) body.RefreshToken = bodyFields.RefreshToken;
		if (bodyFields.setkeys) body.setkeys = bodyFields.setkeys;
		if (bodyFields.tenantid) body.tenantid = bodyFields.tenantid;
		return cippApiRequest.call(context, 'POST', '/api/ExecSAMSetup', body, qs);
	}

	// ══════════════════════════════════════════════════════════════
	// Settings
	// ══════════════════════════════════════════════════════════════

	if (operation === 'setBackupRetention') {
		const fields = context.getNodeParameter('backupRetentionFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		const body: IDataObject = {};
		if (fields.List) qs.List = fields.List;
		if (fields.RetentionDays) body.RetentionDays = fields.RetentionDays;
		return cippApiRequest.call(context, 'POST', '/api/ExecBackupRetentionConfig', body, qs);
	}

	if (operation === 'setBranding') {
		const fields = context.getNodeParameter('brandingFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		const body: IDataObject = {};
		if (fields.Action) {
			qs.Action = fields.Action;
			body.Action = fields.Action;
		}
		if (fields.colour) body.colour = fields.colour;
		if (fields.logo) body.logo = fields.logo;
		return cippApiRequest.call(context, 'POST', '/api/ExecBrandingSettings', body, qs);
	}

	if (operation === 'setDnsConfig') {
		const fields = context.getNodeParameter('dnsConfigFields', i, {}) as IDataObject;
		// Send as both QS and body per spec
		const params: IDataObject = {};
		if (fields.Action) params.Action = fields.Action;
		if (fields.Domain) params.Domain = fields.Domain;
		if (fields.Resolver) params.Resolver = fields.Resolver;
		if (fields.Selector) params.Selector = fields.Selector;
		return cippApiRequest.call(context, 'POST', '/api/ExecDnsConfig', { ...params }, { ...params });
	}

	if (operation === 'setExtensionsConfig') {
		const fields = context.getNodeParameter('extensionsConfigFields', i, {}) as IDataObject;
		const body: IDataObject = {};
		if (fields.Hudu) body.Hudu = fields.Hudu;
		if (fields.NinjaOne) body.NinjaOne = fields.NinjaOne;
		if (fields.PSObject) body.PSObject = fields.PSObject;
		return cippApiRequest.call(context, 'POST', '/api/ExecExtensionsConfig', body);
	}

	if (operation === 'setJitAdminSettings') {
		const fields = context.getNodeParameter('jitAdminFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		const body: IDataObject = {};
		if (fields.Action) {
			qs.Action = fields.Action;
			body.Action = fields.Action;
		}
		if (fields.MaxDuration) body.MaxDuration = fields.MaxDuration;
		return cippApiRequest.call(context, 'POST', '/api/ExecJITAdminSettings', body, qs);
	}

	if (operation === 'setLogRetention') {
		const fields = context.getNodeParameter('logRetentionFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		const body: IDataObject = {};
		if (fields.List) qs.List = fields.List;
		if (fields.RetentionDays) body.RetentionDays = fields.RetentionDays;
		return cippApiRequest.call(context, 'POST', '/api/ExecLogRetentionConfig', body, qs);
	}

	if (operation === 'setNotificationConfig') {
		const fields = context.getNodeParameter('notificationFields', i, {}) as IDataObject;
		const body: IDataObject = {};
		if (fields.email) body.email = fields.email;
		if (fields.webhook) body.webhook = fields.webhook;
		if (fields.logsToInclude) {
			body.logsToInclude = parseJsonObjectPayload(
				context.getNode(), fields.logsToInclude, 'Logs to Include', i,
			);
		}
		if (fields.Severity) {
			body.Severity = parseJsonObjectPayload(
				context.getNode(), fields.Severity, 'Severity', i,
			);
		}
		if (fields.onePerTenant !== undefined) body.onePerTenant = fields.onePerTenant;
		if (fields.sendtoIntegration !== undefined) body.sendtoIntegration = fields.sendtoIntegration;
		return cippApiRequest.call(context, 'POST', '/api/ExecNotificationConfig', body);
	}

	if (operation === 'setPasswordConfig') {
		const fields = context.getNodeParameter('passwordConfigFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		const body: IDataObject = {};
		if (fields.List) qs.List = fields.List;
		if (fields.passwordType) body.passwordType = fields.passwordType;
		return cippApiRequest.call(context, 'POST', '/api/ExecPasswordConfig', body, qs);
	}

	if (operation === 'setTimeSettings') {
		const fields = context.getNodeParameter('timeSettingsFields', i, {}) as IDataObject;
		const body: IDataObject = {};
		if (fields.BusinessHoursStart) {
			body.BusinessHoursStart = parseJsonObjectPayload(
				context.getNode(), fields.BusinessHoursStart, 'Business Hours Start', i,
			);
		}
		if (fields.Timezone) {
			body.Timezone = parseJsonObjectPayload(
				context.getNode(), fields.Timezone, 'Timezone', i,
			);
		}
		return cippApiRequest.call(context, 'POST', '/api/ExecTimeSettings', body);
	}

	// ══════════════════════════════════════════════════════════════
	// Extensions
	// ══════════════════════════════════════════════════════════════

	if (operation === 'getExtensionCacheData') {
		const tenantFilter = getTenantFilter(context, i);
		const fields = context.getNodeParameter('cacheDataFields', i, {}) as IDataObject;
		const body: IDataObject = { tenantFilter };
		if (fields.dataTypes) body.dataTypes = fields.dataTypes;
		return cippApiRequest.call(context, 'POST', '/api/ListExtensionCacheData', body);
	}

	if (operation === 'getExtensionMapping') {
		const fields = context.getNodeParameter('extensionMappingFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (fields.AddMapping) qs.AddMapping = fields.AddMapping;
		if (fields.AutoMapping) qs.AutoMapping = fields.AutoMapping;
		if (fields.List) qs.List = fields.List;
		return cippApiRequest.call(context, 'GET', '/api/ExecExtensionMapping', {}, qs);
	}

	if (operation === 'getExtensionsConfig') {
		return cippApiRequest.call(context, 'GET', '/api/ListExtensionsConfig');
	}

	if (operation === 'getNinjaOneQueue') {
		return cippApiRequest.call(context, 'GET', '/api/ExecExtensionNinjaOneQueue');
	}

	if (operation === 'listExtensionSync') {
		return cippApiRequest.call(context, 'GET', '/api/ListExtensionSync');
	}

	if (operation === 'syncExtension') {
		const fields = context.getNodeParameter('syncExtensionFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (fields.Extension) qs.Extension = fields.Extension;
		if (fields.TenantID) qs.TenantID = fields.TenantID;
		return cippApiRequest.call(context, 'GET', '/api/ExecExtensionSync', {}, qs);
	}

	if (operation === 'testExtension') {
		const fields = context.getNodeParameter('testExtensionFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (fields.extensionName) qs.extensionName = fields.extensionName;
		return cippApiRequest.call(context, 'GET', '/api/ExecExtensionTest', {}, qs);
	}

	// ══════════════════════════════════════════════════════════════
	// CPV / Onboarding
	// ══════════════════════════════════════════════════════════════

	if (operation === 'refreshCpvPermissions') {
		const tenantFilter = getTenantFilter(context, i);
		const fields = context.getNodeParameter('cpvPermissionsFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (fields.ResetSP) qs.ResetSP = fields.ResetSP;
		return cippApiRequest.call(context, 'POST', '/api/ExecCPVPermissions', { tenantFilter }, qs);
	}

	if (operation === 'refreshCpvAll') {
		return cippApiRequest.call(context, 'GET', '/api/ExecCPVRefresh');
	}

	// ══════════════════════════════════════════════════════════════
	// Webhooks
	// ══════════════════════════════════════════════════════════════

	if (operation === 'managePartnerWebhook') {
		const fields = context.getNodeParameter('partnerWebhookFields', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (fields.Action) qs.Action = fields.Action;
		if (fields.CorrelationId) qs.CorrelationId = fields.CorrelationId;
		const body: IDataObject = {};
		if (fields.enabled !== undefined) body.enabled = fields.enabled;
		if (fields.EventType) {
			body.EventType = parseJsonObjectPayload(
				context.getNode(), fields.EventType, 'Event Type', i,
			);
		}
		if (fields.standardsExcludeAllTenants !== undefined) body.standardsExcludeAllTenants = fields.standardsExcludeAllTenants;
		return cippApiRequest.call(context, 'POST', '/api/ExecPartnerWebhook', body, qs);
	}

	if (operation === 'listPendingWebhooks') {
		return listWithSlice(context, i, 'GET', '/api/ListPendingWebhooks', {}, {});
	}

	// ══════════════════════════════════════════════════════════════
	// Extension Alerts
	// ══════════════════════════════════════════════════════════════

	if (operation === 'listExtAlerts') {
		const tenantFilter = getTenantFilter(context, i);
		return listWithSlice(context, i, 'GET', '/api/ListCheckExtAlerts', {}, { tenantFilter });
	}

	throw new NodeOperationError(
		context.getNode(), `Unknown operation: ${operation}`, { itemIndex: i },
	);
}
