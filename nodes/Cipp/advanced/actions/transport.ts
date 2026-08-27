import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	cippApiRequest,
	getTenantFilter,
	listWithSlice,
	parseJsonPayload,
	postAction,
} from '../GenericFunctions';

export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	// ══════════════════════════════════════════════
	// ── Transport Rules ──
	// ══════════════════════════════════════════════

	if (operation === 'listRules') {
		const tenantFilter = getTenantFilter(context, i);

		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListTransportRules',
			{},
			{ tenantFilter },
		);
	} else if (operation === 'addRule') {
		// Uses selectedTenants instead of tenantFilter
		const tenantFilter = getTenantFilter(context, i);
		const powerShellCommand = context.getNodeParameter('powerShellCommand', i, '') as string;
		const additionalFields = context.getNodeParameter('addRuleFields', i, {}) as IDataObject;

		const body: IDataObject = {
			selectedTenants: tenantFilter,
		};
		if (powerShellCommand) body.PowerShellCommand = powerShellCommand;
		if (additionalFields.name) body.name = additionalFields.name;
		if (additionalFields.PSObject) body.PSObject = additionalFields.PSObject;
		if (additionalFields.TemplateList) {
			body.TemplateList = parseJsonPayload(
				context.getNode(),
				additionalFields.TemplateList,
				'Template',
				i,
			);
		}

		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddTransportRule',
			body,
			{},
		);
	} else if (operation === 'addEditRule') {
		// Uses tenantFilter in body (required)
		const tenantFilter = getTenantFilter(context, i);
		const name = context.getNodeParameter('addEditRuleName', i) as string;
		const enabled = context.getNodeParameter('addEditRuleEnabled', i) as boolean;
		const conditions = context.getNodeParameter('addEditRuleConditions', i, {}) as IDataObject;
		const actions = context.getNodeParameter('addEditRuleActions', i, {}) as IDataObject;
		const additionalFields = context.getNodeParameter('addEditRuleFields', i, {}) as IDataObject;

		const body: IDataObject = {
			tenantFilter,
			name,
			Enabled: enabled,
		};

		// Merge conditions
		for (const [key, value] of Object.entries(conditions)) {
			if (value !== undefined && value !== '') {
				body[key] = value;
			}
		}

		// Merge actions
		for (const [key, value] of Object.entries(actions)) {
			if (value !== undefined && value !== '') {
				body[key] = value;
			}
		}

		// Merge additional fields
		if (additionalFields.ActivationDate) body.ActivationDate = additionalFields.ActivationDate;
		if (additionalFields.Comments) body.Comments = additionalFields.Comments;

		// Merge extra properties JSON
		if (additionalFields.extraProperties) {
			const extra = parseJsonPayload(
				context.getNode(),
				additionalFields.extraProperties,
				'Extra Properties',
				i,
			);
			Object.assign(body, extra);
		}

		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddEditTransportRule',
			body,
			{},
		);
	} else if (operation === 'editRule') {
		const guid = context.getNodeParameter('editRuleGuid', i) as string;
		const state = context.getNodeParameter('editRuleState', i) as string;

		responseData = await postAction(
			context,
			i,
			'/api/EditTransportRule',
			{ guid, state },
		);
	} else if (operation === 'removeRule') {
		const guid = context.getNodeParameter('removeRuleGuid', i) as string;

		responseData = await postAction(
			context,
			i,
			'/api/RemoveTransportRule',
			{ guid },
		);

	// ══════════════════════════════════════════════
	// ── Transport Rule Templates ──
	// ══════════════════════════════════════════════

	} else if (operation === 'listRuleTemplates') {
		const returnAll = context.getNodeParameter('returnAll', i) as boolean;
		const filters = context.getNodeParameter('listRuleTemplatesFilters', i, {}) as IDataObject;

		const qs: IDataObject = {};
		if (filters.id) qs.id = filters.id;

		responseData = await cippApiRequest.call(
			context,
			'GET',
			'/api/ListTransportRulesTemplates',
			{},
			qs,
		);

		if (Array.isArray(responseData) && !returnAll) {
			const limit = context.getNodeParameter('limit', i) as number;
			responseData = responseData.slice(0, limit);
		}
	} else if (operation === 'addRuleTemplate') {
		const name = context.getNodeParameter('ruleTemplateName', i) as string;
		const powerShellCommand = context.getNodeParameter('ruleTemplatePowerShell', i, '') as string;

		const body: IDataObject = { name };
		if (powerShellCommand) body.PowerShellCommand = powerShellCommand;

		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddTransportTemplate',
			body,
			{},
		);
	} else if (operation === 'removeRuleTemplate') {
		const templateId = context.getNodeParameter('removeRuleTemplateId', i) as string;

		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/RemoveTransportRuleTemplate',
			{ ID: templateId },
			{},
		);

	// ══════════════════════════════════════════════
	// ── Exchange Connectors ──
	// ══════════════════════════════════════════════

	} else if (operation === 'listConnectors') {
		const tenantFilter = getTenantFilter(context, i);

		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListExchangeConnectors',
			{},
			{ tenantFilter },
		);
	} else if (operation === 'addConnector') {
		// Uses selectedTenants instead of tenantFilter
		const tenantFilter = getTenantFilter(context, i);
		const powerShellCommand = context.getNodeParameter('connectorPowerShell', i, '') as string;
		const additionalFields = context.getNodeParameter('addConnectorFields', i, {}) as IDataObject;

		const body: IDataObject = {
			selectedTenants: tenantFilter,
		};
		if (powerShellCommand) body.PowerShellCommand = powerShellCommand;
		if (additionalFields.comment) body.comment = additionalFields.comment;
		if (additionalFields.TemplateList) {
			body.TemplateList = parseJsonPayload(
				context.getNode(),
				additionalFields.TemplateList,
				'Template',
				i,
			);
		}

		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddExConnector',
			body,
			{},
		);
	} else if (operation === 'editConnector') {
		const guid = context.getNodeParameter('editConnectorGuid', i) as string;
		const state = context.getNodeParameter('editConnectorState', i) as string;
		const type = context.getNodeParameter('editConnectorType', i, '') as string;

		const body: IDataObject = { GUID: guid, State: state };
		if (type) body.Type = type;

		responseData = await postAction(
			context,
			i,
			'/api/EditExConnector',
			body,
		);
	} else if (operation === 'removeConnector') {
		const guid = context.getNodeParameter('removeConnectorGuid', i) as string;
		const type = context.getNodeParameter('removeConnectorType', i, '') as string;

		const body: IDataObject = { GUID: guid };
		if (type) body.Type = type;

		responseData = await postAction(
			context,
			i,
			'/api/RemoveExConnector',
			body,
		);

	// ══════════════════════════════════════════════
	// ── Connector Templates ──
	// ══════════════════════════════════════════════

	} else if (operation === 'listConnectorTemplates') {
		const returnAll = context.getNodeParameter('returnAll', i) as boolean;
		const filters = context.getNodeParameter('listConnectorTemplatesFilters', i, {}) as IDataObject;

		const qs: IDataObject = {};
		if (filters.id) qs.id = filters.id;

		responseData = await cippApiRequest.call(
			context,
			'GET',
			'/api/ListExConnectorTemplates',
			{},
			qs,
		);

		if (Array.isArray(responseData) && !returnAll) {
			const limit = context.getNodeParameter('limit', i) as number;
			responseData = responseData.slice(0, limit);
		}
	} else if (operation === 'addConnectorTemplate') {
		const name = context.getNodeParameter('connectorTemplateName', i) as string;
		const cippconnectortype = context.getNodeParameter('connectorTemplateType', i, '') as string;

		const body: IDataObject = { name };
		if (cippconnectortype) body.cippconnectortype = cippconnectortype;

		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddExConnectorTemplate',
			body,
			{},
		);
	} else if (operation === 'removeConnectorTemplate') {
		const templateId = context.getNodeParameter('removeConnectorTemplateId', i) as string;

		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/RemoveExConnectorTemplate',
			{ ID: templateId },
			{},
		);

	// ══════════════════════════════════════════════
	// ── Connection Filters ──
	// ══════════════════════════════════════════════

	} else if (operation === 'listConnectionFilters') {
		const tenantFilter = getTenantFilter(context, i);

		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListConnectionFilter',
			{},
			{ tenantFilter },
		);
	} else if (operation === 'addConnectionFilter') {
		// Uses selectedTenants instead of tenantFilter
		const tenantFilter = getTenantFilter(context, i);
		const powerShellCommand = context.getNodeParameter('connectionFilterPowerShell', i, '') as string;
		const additionalFields = context.getNodeParameter('addConnectionFilterFields', i, {}) as IDataObject;

		const body: IDataObject = {
			selectedTenants: tenantFilter,
		};
		if (powerShellCommand) body.PowerShellCommand = powerShellCommand;
		if (additionalFields.TemplateList) {
			body.TemplateList = parseJsonPayload(
				context.getNode(),
				additionalFields.TemplateList,
				'Template',
				i,
			);
		}

		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddConnectionFilter',
			body,
			{},
		);
	} else if (operation === 'listConnectionFilterTemplates') {
		const returnAll = context.getNodeParameter('returnAll', i) as boolean;
		const filters = context.getNodeParameter('listConnectionFilterTemplatesFilters', i, {}) as IDataObject;

		const qs: IDataObject = {};
		if (filters.id) qs.id = filters.id;

		responseData = await cippApiRequest.call(
			context,
			'GET',
			'/api/ListConnectionFilterTemplates',
			{},
			qs,
		);

		if (Array.isArray(responseData) && !returnAll) {
			const limit = context.getNodeParameter('limit', i) as number;
			responseData = responseData.slice(0, limit);
		}
	} else if (operation === 'addConnectionFilterTemplate') {
		const name = context.getNodeParameter('connectionFilterTemplateName', i) as string;
		const powerShellCommand = context.getNodeParameter('connectionFilterTemplatePowerShell', i, '') as string;

		const body: IDataObject = { name };
		if (powerShellCommand) body.PowerShellCommand = powerShellCommand;

		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddConnectionFilterTemplate',
			body,
			{},
		);
	} else if (operation === 'removeConnectionFilterTemplate') {
		const templateId = context.getNodeParameter('removeConnectionFilterTemplateId', i) as string;

		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/RemoveConnectionfilterTemplate',
			{ ID: templateId },
			{},
		);
	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}

	return responseData;
}
