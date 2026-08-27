import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	cippApiRequest,
	getTenantFilter,
	listWithSlice,
	postAction,
	parseJsonObjectPayload,
	withTrustedTenant,
} from '../GenericFunctions';

export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};
	const tenantFilter = getTenantFilter(context, i);

	// ── Group 1: Assignment Filters ────────────────────────────────────

	if (operation === 'listAssignmentFilters') {
		const qs: IDataObject = { tenantFilter };
		const filterId = context.getNodeParameter('filterId', i, '') as string;
		if (filterId) qs.filterId = filterId;
		responseData = await listWithSlice(context, i,
			'GET',
			'/api/ListAssignmentFilters',
			{},
			qs,
		);
	} else if (operation === 'addAssignmentFilter') {
		const body: IDataObject = {
			tenantFilter,
			displayName: context.getNodeParameter('displayName', i) as string,
		};
		const opts = context.getNodeParameter(
			'assignmentFilterOptions',
			i,
			{},
		) as IDataObject;
		if (opts.description) body.description = opts.description;
		if (opts.assignmentFilterManagementType)
			body.assignmentFilterManagementType = opts.assignmentFilterManagementType;
		if (opts.platform) body.platform = opts.platform;
		if (opts.rule) body.rule = opts.rule;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddAssignmentFilter',
			body,
			{},
		);
	} else if (operation === 'editAssignmentFilter') {
		const body: IDataObject = {
			tenantFilter,
			filterId: context.getNodeParameter('filterId', i) as string,
		};
		const opts = context.getNodeParameter(
			'editAssignmentFilterFields',
			i,
			{},
		) as IDataObject;
		if (opts.displayName) body.displayName = opts.displayName;
		if (opts.description) body.description = opts.description;
		if (opts.assignmentFilterManagementType)
			body.assignmentFilterManagementType = opts.assignmentFilterManagementType;
		if (opts.platform) body.platform = opts.platform;
		if (opts.rule) body.rule = opts.rule;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/EditAssignmentFilter',
			body,
			{},
		);
	} else if (operation === 'deleteAssignmentFilter') {
		const body: IDataObject = {
			Action: 'Delete',
			ID: context.getNodeParameter('assignmentFilterId', i) as string,
			tenantFilter,
		};
		responseData = await cippApiRequest.call(
			context,
			'DELETE',
			'/api/ExecAssignmentFilter',
			body,
			{},
		);
	} else if (operation === 'listAssignmentFilterTemplates') {
		const qs: IDataObject = {};
		const id = context.getNodeParameter('templateId', i, '') as string;
		if (id) qs.ID = id;
		responseData = await listWithSlice(context, i,
			'GET',
			'/api/ListAssignmentFilterTemplates',
			{},
			qs,
		);
	} else if (operation === 'addAssignmentFilterTemplate') {
		const body: IDataObject = {
			displayname: context.getNodeParameter('displayName', i) as string,
		};
		const opts = context.getNodeParameter(
			'assignmentFilterTemplateOptions',
			i,
			{},
		) as IDataObject;
		if (opts.GUID) body.GUID = opts.GUID;
		if (opts.Description) body.Description = opts.Description;
		if (opts.assignmentFilterManagementType)
			body.assignmentFilterManagementType = opts.assignmentFilterManagementType;
		if (opts.platform) body.platform = opts.platform;
		if (opts.rule) body.rule = opts.rule;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddAssignmentFilterTemplate',
			body,
			{},
		);
	} else if (operation === 'removeAssignmentFilterTemplate') {
		const id = context.getNodeParameter('templateId', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/RemoveAssignmentFilterTemplate',
			{ ID: id },
			{},
		);

		// ── Group 2: Intune Templates ──────────────────────────────────────

	} else if (operation === 'listIntuneTemplates') {
		const qs: IDataObject = {};
		const opts = context.getNodeParameter('intuneTemplateFilters', i, {}) as IDataObject;
		if (opts.id) qs.id = opts.id;
		if (opts.mode) qs.mode = opts.mode;
		if (opts.View) qs.View = opts.View;
		responseData = await listWithSlice(context, i,
			'GET',
			'/api/ListIntuneTemplates',
			{},
			qs,
		);
	} else if (operation === 'addIntuneTemplate') {
		const body: IDataObject = {
			tenantFilter,
			RawJSON: context.getNodeParameter('rawJSON', i) as string,
		};
		const qs: IDataObject = {};
		const opts = context.getNodeParameter('intuneTemplateOptions', i, {}) as IDataObject;
		if (opts.description) body.description = opts.description;
		if (opts.displayName) body.displayName = opts.displayName;
		if (opts.ID) {
			body.ID = opts.ID;
			qs.ID = opts.ID;
		}
		if (opts.ODataType) {
			body.ODataType = opts.ODataType;
			qs.ODataType = opts.ODataType;
		}
		if (opts.policySource)
			body.policySource = parseJsonObjectPayload(
				context.getNode(),
				opts.policySource as string,
				'Policy Source',
				i,
			);
		if (opts.TemplateType) body.TemplateType = opts.TemplateType;
		if (opts.URLName) {
			body.URLName = opts.URLName;
			qs.URLName = opts.URLName;
		}
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddIntuneTemplate',
			body,
			qs,
		);
	} else if (operation === 'removeIntuneTemplate') {
		const id = context.getNodeParameter('templateId', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/RemoveIntuneTemplate',
			{ ID: id },
			{},
		);

		// ── Group 3: Intune Scripts ────────────────────────────────────────

	} else if (operation === 'listIntuneScripts') {
		responseData = await listWithSlice(context, i,
			'GET',
			'/api/ListIntuneScript',
			{},
			{ tenantFilter },
		);
	} else if (operation === 'editIntuneScript') {
		const scriptId = context.getNodeParameter('scriptId', i) as string;
		const body: IDataObject = {
			TenantFilter: tenantFilter,
			ScriptId: scriptId,
		};
		const opts = context.getNodeParameter('editIntuneScriptFields', i, {}) as IDataObject;
		if (opts.IntuneScript) body.IntuneScript = opts.IntuneScript;
		if (opts.ScriptType) body.ScriptType = opts.ScriptType;
		responseData = await cippApiRequest.call(
			context,
			'PATCH',
			'/api/EditIntuneScript',
			body,
			{},
		);
	} else if (operation === 'removeIntuneScript') {
		const body: IDataObject = {
			TenantFilter: tenantFilter,
			ID: context.getNodeParameter('scriptId', i) as string,
		};
		const opts = context.getNodeParameter('removeIntuneScriptFields', i, {}) as IDataObject;
		if (opts.DisplayName) body.DisplayName = opts.DisplayName;
		if (opts.ScriptType) body.ScriptType = opts.ScriptType;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/RemoveIntuneScript',
			body,
			{},
		);

		// ── Group 4: Reusable Settings ─────────────────────────────────────

	} else if (operation === 'listReusableSettings') {
		const qs: IDataObject = { tenantFilter };
		const id = context.getNodeParameter('settingId', i, '') as string;
		if (id) qs.ID = id;
		responseData = await listWithSlice(context, i,
			'GET',
			'/api/ListIntuneReusableSettings',
			{},
			qs,
		);
	} else if (operation === 'addReusableSetting') {
		const body: IDataObject = {
			tenantFilter,
			rawJSON: context.getNodeParameter('rawJSON', i) as string,
		};
		const qs: IDataObject = {};
		const opts = context.getNodeParameter('reusableSettingOptions', i, {}) as IDataObject;
		if (opts.ID) body.ID = opts.ID;
		if (opts.TemplateId) {
			body.TemplateId = opts.TemplateId;
			qs.TemplateId = opts.TemplateId;
		}
		if (opts.displayName) body.displayName = opts.displayName;
		if (opts.description) body.description = opts.description;
		if (opts.TemplateList) body.TemplateList = opts.TemplateList;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddIntuneReusableSetting',
			body,
			qs,
		);
	} else if (operation === 'removeReusableSetting') {
		const body: IDataObject = {
			ID: context.getNodeParameter('settingId', i) as string,
		};
		const displayName = context.getNodeParameter('settingDisplayName', i, '') as string;
		if (displayName) body.DisplayName = displayName;
		responseData = await postAction(context, i, '/api/RemoveIntuneReusableSetting', body);
	} else if (operation === 'listReusableSettingTemplates') {
		const qs: IDataObject = {};
		const id = context.getNodeParameter('templateId', i, '') as string;
		if (id) qs.ID = id;
		responseData = await listWithSlice(context, i,
			'GET',
			'/api/ListIntuneReusableSettingTemplates',
			{},
			qs,
		);
	} else if (operation === 'addReusableSettingTemplate') {
		const body: IDataObject = {
			tenantFilter,
			rawJSON: context.getNodeParameter('rawJSON', i) as string,
			displayName: context.getNodeParameter('displayName', i) as string,
		};
		const opts = context.getNodeParameter(
			'reusableSettingTemplateOptions',
			i,
			{},
		) as IDataObject;
		if (opts.GUID) body.GUID = opts.GUID;
		if (opts.description) body.description = opts.description;
		if (opts.package) body.package = opts.package;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddIntuneReusableSettingTemplate',
			body,
			{},
		);
	} else if (operation === 'removeReusableSettingTemplate') {
		const id = context.getNodeParameter('templateId', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/RemoveIntuneReusableSettingTemplate',
			{ ID: id },
			{},
		);

		// ── Group 5: Policy Edit / List ────────────────────────────────────

	} else if (operation === 'editPolicy') {
		const body: IDataObject = {
			tenantid: tenantFilter,
		};
		const opts = context.getNodeParameter('editPolicyFields', i, {}) as IDataObject;
		if (opts.Displayname) body.Displayname = opts.Displayname;
		if (opts.Description) body.Description = opts.Description;
		if (opts.Assignto) body.Assignto = opts.Assignto;
		if (opts.groupid) body.groupid = opts.groupid;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/EditPolicy',
			body,
			{},
		);
	} else if (operation === 'editIntunePolicy') {
		const body: IDataObject = {
			tenantFilter,
			ID: context.getNodeParameter('policyId', i) as string,
		};
		const opts = context.getNodeParameter('editIntunePolicyFields', i, {}) as IDataObject;
		if (opts.newDisplayName) body.newDisplayName = opts.newDisplayName;
		if (opts.policyType) body.policyType = opts.policyType;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/EditIntunePolicy',
			body,
			{},
		);
	} else if (operation === 'listCompliancePolicies') {
		responseData = await listWithSlice(context, i,
			'GET',
			'/api/ListCompliancePolicies',
			{},
			{ tenantFilter },
		);
	} else if (operation === 'listAppProtectionPolicies') {
		responseData = await listWithSlice(context, i,
			'GET',
			'/api/ListAppProtectionPolicies',
			{},
			{ tenantFilter },
		);
	} else if (operation === 'listDefenderState') {
		const qs: IDataObject = { tenantFilter };
		const deviceId = context.getNodeParameter('deviceId', i, '') as string;
		if (deviceId) qs.DeviceID = deviceId;
		responseData = await listWithSlice(context, i,
			'GET',
			'/api/ListDefenderState',
			{},
			qs,
		);

		// ── Group 6: Defender Deployment + Passcode ────────────────────────

	} else if (operation === 'addDefenderDeployment') {
		const deployConfig = context.getNodeParameter('deploymentConfig', i) as string;
		const body = withTrustedTenant(
			parseJsonObjectPayload(
				context.getNode(),
				deployConfig,
				'Deployment Config',
				i,
			),
			'selectedTenants',
			tenantFilter,
		);
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddDefenderDeployment',
			body,
			{},
		);
	} else if (operation === 'execDevicePasscodeAction') {
		responseData = await postAction(context, i, '/api/ExecDevicePasscodeAction', {
			Action: context.getNodeParameter('passcodeAction', i) as string,
			GUID: context.getNodeParameter('deviceGuid', i) as string,
		});

		// ── Group 7: Intune Intents ───────────────────────────────────────────

	} else if (operation === 'listIntuneIntents') {
		responseData = await listWithSlice(context, i,
			'GET',
			'/api/ListIntuneIntents',
			{},
			{ tenantFilter },
		);
	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}

	return responseData;
}
