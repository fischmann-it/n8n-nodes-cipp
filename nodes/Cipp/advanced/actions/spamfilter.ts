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

	// ══════════════════════════════════════════════════════════════
	// Spam Filters
	// ══════════════════════════════════════════════════════════════

	if (operation === 'listSpamfilters') {
		const tenantFilter = getTenantFilter(context, i);
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListSpamfilter',
			{},
			{ tenantFilter },
		);

	} else if (operation === 'addSpamFilter') {
		const tenantFilter = getTenantFilter(context, i);
		const additionalFields = context.getNodeParameter('addSpamFilterFields', i, {}) as IDataObject;
		const body: IDataObject = { selectedTenants: tenantFilter };
		if (additionalFields.TemplateList) {
			body.TemplateList = parseJsonPayload(
				context.getNode(),
				additionalFields.TemplateList,
				'Template',
				i,
			);
		}
		if (additionalFields.PowerShellCommand) {
			body.PowerShellCommand = additionalFields.PowerShellCommand;
		}
		if (additionalFields.name) {
			body.name = additionalFields.name;
		}
		if (additionalFields.Priority) {
			body.Priority = additionalFields.Priority;
		}
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddSpamFilter',
			body,
			{},
		);

	} else if (operation === 'editSpamFilter') {
		const name = context.getNodeParameter('spamFilterName', i) as string;
		const state = context.getNodeParameter('spamFilterState', i) as string;
		responseData = await postAction(
			context,
			i,
			'/api/EditSpamFilter',
			{ name, state },
		);

	} else if (operation === 'removeSpamfilter') {
		const name = context.getNodeParameter('spamFilterName', i) as string;
		responseData = await postAction(
			context,
			i,
			'/api/RemoveSpamfilter',
			{ name },
		);

	// ══════════════════════════════════════════════════════════════
	// Spam Filter Templates
	// ══════════════════════════════════════════════════════════════

	} else if (operation === 'listSpamFilterTemplates') {
		const qs: IDataObject = {};
		const filters = context.getNodeParameter(
			'listSpamFilterTemplatesFilters', i, {},
		) as IDataObject;
		if (filters.id) qs.id = filters.id;
		const returnAll = context.getNodeParameter('returnAll', i) as boolean;
		const result = await cippApiRequest.call(
			context,
			'GET',
			'/api/ListSpamFilterTemplates',
			{},
			qs,
		);
		if (!Array.isArray(result) && result !== null && typeof result === 'object') {
			const obj = result as IDataObject;
			if (obj.error || obj.Error) {
				throw new NodeOperationError(context.getNode(), (obj.error || obj.Error) as string, { itemIndex: i });
			}
		}
		const items = Array.isArray(result) ? result : [result as IDataObject];
		if (returnAll) {
			responseData = items;
		} else {
			const limit = context.getNodeParameter('limit', i) as number;
			responseData = items.slice(0, limit);
		}

	} else if (operation === 'addSpamFilterTemplate') {
		const name = context.getNodeParameter('templateName', i) as string;
		const body: IDataObject = { name };
		const additionalFields = context.getNodeParameter(
			'addSpamFilterTemplateFields', i, {},
		) as IDataObject;
		if (additionalFields.PowerShellCommand) {
			body.PowerShellCommand = additionalFields.PowerShellCommand;
		}
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddSpamFilterTemplate',
			body,
			{},
		);

	} else if (operation === 'removeSpamFilterTemplate') {
		const ID = context.getNodeParameter('templateID', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/RemoveSpamfilterTemplate',
			{ ID },
			{},
		);

	// ══════════════════════════════════════════════════════════════
	// Quarantine Policies
	// ══════════════════════════════════════════════════════════════

	} else if (operation === 'listQuarantinePolicies') {
		const tenantFilter = getTenantFilter(context, i);
		const qs: IDataObject = {};
		const filters = context.getNodeParameter(
			'listQuarantinePoliciesFilters', i, {},
		) as IDataObject;
		if (filters.Type) qs.Type = filters.Type;
		responseData = await listWithSlice(
			context,
			i,
			'POST',
			'/api/ListQuarantinePolicy',
			{ TenantFilter: tenantFilter },
			qs,
		);

	} else if (operation === 'addQuarantinePolicy') {
		const tenantFilter = getTenantFilter(context, i);
		const additionalFields = context.getNodeParameter(
			'addQuarantinePolicyFields', i, {},
		) as IDataObject;
		const body: IDataObject = { selectedTenants: tenantFilter };
		if (additionalFields.TemplateList) {
			body.TemplateList = parseJsonPayload(
				context.getNode(),
				additionalFields.TemplateList,
				'Template',
				i,
			);
		}
		if (additionalFields.Name) body.Name = additionalFields.Name;
		if (additionalFields.AllowSender !== undefined) {
			body.AllowSender = additionalFields.AllowSender;
		}
		if (additionalFields.BlockSender !== undefined) {
			body.BlockSender = additionalFields.BlockSender;
		}
		if (additionalFields.Delete !== undefined) {
			body.Delete = additionalFields.Delete;
		}
		if (additionalFields.Preview !== undefined) {
			body.Preview = additionalFields.Preview;
		}
		if (additionalFields.QuarantineNotification !== undefined) {
			body.QuarantineNotification = additionalFields.QuarantineNotification;
		}
		if (additionalFields.IncludeMessagesFromBlockedSenderAddress !== undefined) {
			body.IncludeMessagesFromBlockedSenderAddress =
				additionalFields.IncludeMessagesFromBlockedSenderAddress;
		}
		if (additionalFields.ReleaseActionPreference) {
			body.ReleaseActionPreference = parseJsonPayload(
				context.getNode(),
				additionalFields.ReleaseActionPreference,
				'Release Action Preference',
				i,
			);
		}
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddQuarantinePolicy',
			body,
			{},
		);

	} else if (operation === 'editQuarantinePolicy') {
		const tenantFilter = getTenantFilter(context, i);
		const Identity = context.getNodeParameter('quarantinePolicyIdentity', i) as string;
		const body: IDataObject = { TenantFilter: tenantFilter, Identity };
		const additionalFields = context.getNodeParameter(
			'editQuarantinePolicyFields', i, {},
		) as IDataObject;
		for (const [key, value] of Object.entries(additionalFields)) {
			if (value !== undefined && value !== '') {
				body[key] = value;
			}
		}
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/EditQuarantinePolicy',
			body,
			{},
		);

	} else if (operation === 'removeQuarantinePolicy') {
		const tenantFilter = getTenantFilter(context, i);
		const Identity = context.getNodeParameter('quarantinePolicyIdentity', i) as string;
		const body: IDataObject = { TenantFilter: tenantFilter, Identity };
		const additionalFields = context.getNodeParameter(
			'removeQuarantinePolicyFields', i, {},
		) as IDataObject;
		if (additionalFields.Name) body.Name = additionalFields.Name;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/RemoveQuarantinePolicy',
			body,
			{},
		);

	// ══════════════════════════════════════════════════════════════
	// Allow/Block List
	// ══════════════════════════════════════════════════════════════

	} else if (operation === 'addTenantAllowBlockList') {
		const tenantFilter = getTenantFilter(context, i);
		const entries = context.getNodeParameter('entries', i) as string;
		const listType = context.getNodeParameter('listType', i) as string;
		const listMethod = context.getNodeParameter('listMethod', i) as string;
		const body: IDataObject = {
			tenantID: tenantFilter,
			entries,
			listType: { label: listType, value: listType },
			listMethod: { label: listMethod, value: listMethod },
		};
		const additionalFields = context.getNodeParameter(
			'addTenantAllowBlockListFields', i, {},
		) as IDataObject;
		if (additionalFields.notes) body.notes = additionalFields.notes;
		if (additionalFields.NoExpiration !== undefined) {
			body.NoExpiration = additionalFields.NoExpiration;
		}
		if (additionalFields.RemoveAfter !== undefined) {
			body.RemoveAfter = additionalFields.RemoveAfter;
		}
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddTenantAllowBlockList',
			body,
			{},
		);

	// ══════════════════════════════════════════════════════════════
	// Exchange Reports (filter lists)
	// ══════════════════════════════════════════════════════════════

	} else if (operation === 'listAntiPhishingFilters') {
		const tenantFilter = getTenantFilter(context, i);
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListAntiPhishingFilters',
			{},
			{ tenantFilter },
		);

	} else if (operation === 'listMalwareFilters') {
		const tenantFilter = getTenantFilter(context, i);
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListMalwareFilters',
			{},
			{ tenantFilter },
		);

	} else if (operation === 'listSafeAttachmentsFilters') {
		const tenantFilter = getTenantFilter(context, i);
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListSafeAttachmentsFilters',
			{},
			{ tenantFilter },
		);

	// ══════════════════════════════════════════════════════════════
	// Filter Edits (Anti-Phishing, Malware, Safe Attachments)
	// ══════════════════════════════════════════════════════════════

	} else if (operation === 'editAntiPhishingFilter') {
		const RuleName = context.getNodeParameter('filterRuleName', i) as string;
		const State = context.getNodeParameter('filterState', i) as string;
		responseData = await postAction(
			context,
			i,
			'/api/EditAntiPhishingFilter',
			{ RuleName, State },
		);

	} else if (operation === 'editMalwareFilter') {
		const RuleName = context.getNodeParameter('filterRuleName', i) as string;
		const State = context.getNodeParameter('filterState', i) as string;
		responseData = await postAction(
			context,
			i,
			'/api/EditMalwareFilter',
			{ RuleName, State },
		);

	} else if (operation === 'editSafeAttachmentsFilter') {
		const RuleName = context.getNodeParameter('filterRuleName', i) as string;
		const State = context.getNodeParameter('filterState', i) as string;
		responseData = await postAction(
			context,
			i,
			'/api/EditSafeAttachmentsFilter',
			{ RuleName, State },
		);

	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}

	return responseData;
}
