import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	cippApiRequest,
	getTenantFilter,
	listWithSlice,
	parseJsonObjectPayload,
	parseJsonPayload,
	postAction,
} from '../GenericFunctions';
export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};
	const tenantFilter = getTenantFilter(context, i);
	if (operation === 'edit') {
		const userId = context.getNodeParameter('userId', i) as string;
		const editFields = context.getNodeParameter('editFields', i, {}) as IDataObject;
		const body: IDataObject = {
			...editFields,
			tenantFilter,
			id: userId,
		};
		// Parse JSON array fields
		for (const key of ['AddToGroups', 'RemoveFromGroups', 'licenses']) {
			if (typeof body[key] === 'string' && (body[key] as string).trim() !== '') {
				body[key] = parseJsonPayload(context.getNode(), body[key] as string, key, i);
			}
		}
		// Parse JSON LabelValue object fields
		for (const key of ['setManager', 'setSponsor']) {
			if (typeof body[key] === 'string' && (body[key] as string).trim() !== '') {
				body[key] = parseJsonObjectPayload(context.getNode(), body[key] as string, key, i);
			}
		}
		responseData = await cippApiRequest.call(context, 'PATCH', '/api/EditUser', body, {});
	} else if (operation === 'addUserBulk') {
		const bulkUser = context.getNodeParameter('BulkUser', i) as string;
		const bulkOptions = context.getNodeParameter('bulkUserOptions', i, {}) as IDataObject;
		const body: IDataObject = {
			tenantFilter,
			BulkUser: parseJsonPayload(context.getNode(), bulkUser, 'BulkUser', i),
		};
		if (typeof bulkOptions.usageLocation === 'string' && bulkOptions.usageLocation.trim() !== '') {
			body.usageLocation = parseJsonObjectPayload(
				context.getNode(),
				bulkOptions.usageLocation as string,
				'usageLocation',
				i,
			);
		}
		if (typeof bulkOptions.licenses === 'string' && bulkOptions.licenses.trim() !== '') {
			body.licenses = (bulkOptions.licenses as string).split(',').map((s) => s.trim());
		}
		responseData = await cippApiRequest.call(context, 'POST', '/api/AddUserBulk', body, {});
	} else if (operation === 'execBecCheck') {
		const becFilters = context.getNodeParameter('becCheckFilters', i, {}) as IDataObject;
		const qs: IDataObject = { tenantFilter };
		for (const key of ['GUID', 'userid', 'userName', 'overwrite']) {
			if (becFilters[key]) {
				qs[key] = becFilters[key];
			}
		}
		responseData = await cippApiRequest.call(context, 'GET', '/api/ExecBECCheck', {}, qs);
	} else if (operation === 'execBecRemediate') {
		const becFields = context.getNodeParameter('becRemediateFields', i, {}) as IDataObject;
		responseData = await postAction(context, i, '/api/ExecBECRemediate', {
			...becFields,
		});
	} else if (operation === 'triggerBulkLicense') {
		responseData = await cippApiRequest.call(context, 'GET', '/api/ExecBulkLicense', {}, {});
	} else if (operation === 'setPasswordNeverExpires') {
		const fields = context.getNodeParameter('passwordNeverExpiresFields', i, {}) as IDataObject;
		responseData = await postAction(context, i, '/api/ExecPasswordNeverExpires', {
			...fields,
		});
	} else if (operation === 'reprocessLicenses') {
		const fields = context.getNodeParameter('reprocessLicensesFields', i, {}) as IDataObject;
		const body: IDataObject = { ...fields, tenantFilter };
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ExecReprocessUserLicenses',
			body,
			{},
		);
	} else if (operation === 'listUserMailboxRules') {
		const filter = context.getNodeParameter('mailboxRulesFilter', i, {}) as IDataObject;
		const qs: IDataObject = { tenantFilter };
		if (filter.userID) qs.UserID = filter.userID;
		if (filter.userEmail) qs.userEmail = filter.userEmail;
		responseData = await listWithSlice(context, i, 'GET', '/api/ListUserMailboxRules', {}, qs);
	} else if (operation === 'listTrustedBlockedSenders') {
		const filters = context.getNodeParameter('userListFilters', i, {}) as IDataObject;
		const upnFilter = context.getNodeParameter('trustedBlockedUpnFilter', i, {}) as IDataObject;
		const qs: IDataObject = { tenantFilter };
		if (filters.UserID) qs.UserID = filters.UserID;
		if (upnFilter.userPrincipalName) qs.userPrincipalName = upnFilter.userPrincipalName;
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListUserTrustedBlockedSenders',
			{},
			qs,
		);
	} else if (operation === 'removeTrustedBlockedSender') {
		const typeProperty = context.getNodeParameter('senderType', i) as string;
		const value = context.getNodeParameter('senderValue', i) as string;
		const userPrincipalName = context.getNodeParameter('senderUpn', i) as string;
		responseData = await postAction(context, i, '/api/RemoveTrustedBlockedSender', {
			typeProperty,
			value,
			userPrincipalName,
		});
	} else if (operation === 'addJitTemplate') {
		const templateName = context.getNodeParameter('jitTemplateName', i) as string;
		const templateFields = context.getNodeParameter('jitTemplateFields', i, {}) as IDataObject;
		const body: IDataObject = { templateName, ...templateFields };
		// Parse LabelValue JSON fields
		for (const key of [
			'defaultDomain',
			'defaultDuration',
			'defaultExistingUser',
			'defaultExpireAction',
			'defaultRoles',
		]) {
			if (typeof body[key] === 'string' && (body[key] as string).trim() !== '') {
				body[key] = parseJsonObjectPayload(context.getNode(), body[key] as string, key, i);
			}
		}
		// Parse notification actions array
		if (
			typeof body.defaultNotificationActions === 'string' &&
			(body.defaultNotificationActions as string).trim() !== ''
		) {
			body.defaultNotificationActions = parseJsonPayload(
				context.getNode(),
				body.defaultNotificationActions as string,
				'defaultNotificationActions',
				i,
			);
		}
		responseData = await postAction(context, i, '/api/AddJITAdminTemplate', body);
	} else if (operation === 'editJitTemplate') {
		const templateName = context.getNodeParameter('jitTemplateName', i) as string;
		const guid = context.getNodeParameter('jitTemplateGuid', i) as string;
		const templateFields = context.getNodeParameter('jitTemplateFields', i, {}) as IDataObject;
		const body: IDataObject = { templateName, GUID: guid, ...templateFields };
		// Parse LabelValue JSON fields
		for (const key of [
			'defaultDomain',
			'defaultDuration',
			'defaultExistingUser',
			'defaultExpireAction',
			'defaultRoles',
		]) {
			if (typeof body[key] === 'string' && (body[key] as string).trim() !== '') {
				body[key] = parseJsonObjectPayload(context.getNode(), body[key] as string, key, i);
			}
		}
		// Parse notification actions array
		if (
			typeof body.defaultNotificationActions === 'string' &&
			(body.defaultNotificationActions as string).trim() !== ''
		) {
			body.defaultNotificationActions = parseJsonPayload(
				context.getNode(),
				body.defaultNotificationActions as string,
				'defaultNotificationActions',
				i,
			);
		}
		responseData = await postAction(context, i, '/api/EditJITAdminTemplate', body);
	} else if (operation === 'removeJitTemplate') {
		const templateId = context.getNodeParameter('jitRemoveId', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/RemoveJITAdminTemplate',
			{ ID: templateId },
			{},
		);
	} else if (operation === 'listJitTemplates') {
		// POST method but tenantFilter as QS — cannot use postAction
		const filters = context.getNodeParameter('jitTemplateListFilters', i, {}) as IDataObject;
		const qs: IDataObject = { tenantFilter };
		if (filters.GUID) qs.GUID = filters.GUID;
		if (filters.includeAllTenants) qs.includeAllTenants = filters.includeAllTenants;
		responseData = await listWithSlice(context, i, 'POST', '/api/ListJITAdminTemplates', {}, qs);
		// ── New operations (ListUsers, EditUserAliases, ListUserPhoto, ListUserSigninLogs, PatchUser, AddUserDefaults, RemoveUserDefaultTemplate, ListNewUserDefaults) ──
	} else if (operation === 'listUsers') {
		const filters = context.getNodeParameter('listUsersFilters', i, {}) as IDataObject;
		const qs: IDataObject = { tenantFilter };
		if (filters.graphFilter) qs.graphFilter = filters.graphFilter;
		if (filters.IncludeLogonDetails) qs.IncludeLogonDetails = filters.IncludeLogonDetails;
		if (filters.UserID) qs.UserID = filters.UserID;
		responseData = await listWithSlice(context, i, 'GET', '/api/ListUsers', {}, qs);
	} else if (operation === 'editUserAliases') {
		const aliasUserId = context.getNodeParameter('aliasUserId', i) as string;
		const aliasFields = context.getNodeParameter('aliasFields', i, {}) as IDataObject;
		responseData = await postAction(context, i, '/api/EditUserAliases', {
			id: aliasUserId,
			...aliasFields,
		});
	} else if (operation === 'listUserSigninLogs') {
		const filters = context.getNodeParameter('listUserSigninLogsFilters', i, {}) as IDataObject;
		const qs: IDataObject = { tenantFilter };
		if (filters.top) qs.top = filters.top;
		if (filters.UserID) qs.UserID = filters.UserID;
		responseData = await listWithSlice(context, i, 'GET', '/api/ListUserSigninLogs', {}, qs);
	} else if (operation === 'patchUser') {
		const patchUserId = context.getNodeParameter('patchUserId', i) as string;
		const patchFields = context.getNodeParameter('patchFields', i, {}) as IDataObject;
		const body: IDataObject = {
			...patchFields,
			tenantFilter,
			id: patchUserId,
		};
		responseData = await cippApiRequest.call(context, 'PATCH', '/api/PatchUser', body, {});
	} else if (operation === 'addUserDefaults') {
		const fields = context.getNodeParameter('addUserDefaultsFields', i, {}) as IDataObject;
		const body: IDataObject = { ...fields, tenantFilter };
		// Parse LabelValue JSON fields
		for (const key of ['copyFrom', 'primDomain', 'setManager', 'setSponsor', 'usageLocation']) {
			if (typeof body[key] === 'string' && (body[key] as string).trim() !== '') {
				body[key] = parseJsonObjectPayload(context.getNode(), body[key] as string, key, i);
			}
		}
		// Parse licenses as comma-separated array
		if (typeof body.licenses === 'string' && (body.licenses as string).trim() !== '') {
			body.licenses = (body.licenses as string).split(',').map((s) => s.trim());
		}
		// Parse otherMails as comma-separated array
		if (typeof body.otherMails === 'string' && (body.otherMails as string).trim() !== '') {
			body.otherMails = (body.otherMails as string).split(',').map((s) => s.trim());
		}
		responseData = await cippApiRequest.call(context, 'POST', '/api/AddUserDefaults', body, {});
	} else if (operation === 'removeUserDefaultTemplate') {
		const templateId = context.getNodeParameter('removeUserDefaultTemplateId', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/RemoveUserDefaultTemplate',
			{ ID: templateId },
			{},
		);
	} else if (operation === 'listUsersAndGroups') {
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListUsersAndGroups',
			{},
			{ tenantFilter },
		);
	} else if (operation === 'listNewUserDefaults') {
		// POST method but tenantFilter as QS — cannot use postAction
		const filters = context.getNodeParameter('listNewUserDefaultsFilters', i, {}) as IDataObject;
		const qs: IDataObject = { tenantFilter };
		if (filters.ID) qs.ID = filters.ID;
		if (filters.includeAllTenants) qs.includeAllTenants = filters.includeAllTenants;
		const body: IDataObject = {};
		if (filters.includeAllTenants) body.includeAllTenants = filters.includeAllTenants;
		responseData = await listWithSlice(context, i, 'POST', '/api/ListNewUserDefaults', body, qs);
	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}
	return responseData;
}
