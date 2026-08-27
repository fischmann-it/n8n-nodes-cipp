import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { cippApiRequest, getTenantFilter, listWithSlice, postAction } from '../GenericFunctions';
export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const tenantFilter = getTenantFilter(context, i);
	if (operation === 'listMailboxPermissions') {
		const qs: IDataObject = { tenantFilter };
		const filterUserId = context.getNodeParameter('listUserId', i, '') as string;
		if (filterUserId) qs.userId = filterUserId;
		return listWithSlice(context, i, 'GET', '/api/ListmailboxPermissions', {}, qs);
	}
	if (operation === 'listMobileDevices') {
		const qs: IDataObject = { tenantFilter };
		const mailbox = context.getNodeParameter('mailboxFilter', i, '') as string;
		if (mailbox) qs.Mailbox = mailbox;
		return listWithSlice(context, i, 'GET', '/api/ListMailboxMobileDevices', {}, qs);
	}
	if (operation === 'listGlobalAddressList') {
		return listWithSlice(context, i, 'GET', '/api/ListGlobalAddressList', {}, { tenantFilter });
	}
	if (operation === 'listMailboxRestores') {
		const qs: IDataObject = { tenantFilter };
		const identity = context.getNodeParameter('restoreIdentity', i, '') as string;
		const includeReport = context.getNodeParameter('includeReport', i, false) as boolean;
		const statistics = context.getNodeParameter('statistics', i, false) as boolean;
		if (identity) qs.Identity = identity;
		if (includeReport) qs.IncludeReport = 'true';
		if (statistics) qs.Statistics = 'true';
		return listWithSlice(context, i, 'GET', '/api/ListMailboxRestores', {}, qs);
	}
	if (operation === 'runExoRequest') {
		const body: IDataObject = {
			TenantFilter: tenantFilter,
			Cmdlet: context.getNodeParameter('cmdlet', i) as string,
		};
		const options = context.getNodeParameter('exoOptions', i, {}) as IDataObject;
		if (options.Anchor) body.Anchor = options.Anchor;
		if (options.AsApp !== undefined) body.AsApp = options.AsApp;
		if (options.AvailableCmdlets) body.AvailableCmdlets = options.AvailableCmdlets;
		if (options.cmdParams) body.cmdParams = options.cmdParams;
		if (options.Compliance !== undefined) body.Compliance = options.Compliance;
		if (options.Select) body.Select = options.Select;
		if (options.UseSystemMailbox) body.UseSystemMailbox = options.UseSystemMailbox;
		return listWithSlice(context, i, 'POST', '/api/ListExoRequest', body, {});
	}
	if (operation === 'createHighVolumeEmail') {
		return cippApiRequest.call(
			context,
			'POST',
			'/api/ExecHVEUser',
			{
				TenantFilter: tenantFilter,
				displayName: context.getNodeParameter('displayName', i) as string,
				primarySMTPAddress: context.getNodeParameter('primarySMTPAddress', i) as string,
				password: context.getNodeParameter('password', i) as string,
			},
			{},
		);
	}
	if (operation === 'restoreMailbox') {
		const body: IDataObject = {
			TenantFilter: tenantFilter,
			SourceMailbox: context.getNodeParameter('sourceMailbox', i) as string,
			TargetMailbox: context.getNodeParameter('targetMailbox', i) as string,
		};
		const options = context.getNodeParameter('restoreOptions', i, {}) as IDataObject;
		if (options.RequestName) body.RequestName = options.RequestName;
		if (options.BadItemLimit !== undefined && options.BadItemLimit !== 0) {
			body.BadItemLimit = options.BadItemLimit;
		}
		if (options.LargeItemLimit !== undefined && options.LargeItemLimit !== 0) {
			body.LargeItemLimit = options.LargeItemLimit;
		}
		if (options.AcceptLargeDataLoss !== undefined)
			body.AcceptLargeDataLoss = options.AcceptLargeDataLoss;
		if (options.AssociatedMessagesCopyOption)
			body.AssociatedMessagesCopyOption = options.AssociatedMessagesCopyOption;
		if (options.ExcludeFolders) {
			body.ExcludeFolders = (options.ExcludeFolders as string)
				.split(',')
				.map((s: string) => s.trim());
		}
		if (options.IncludeFolders) {
			body.IncludeFolders = (options.IncludeFolders as string)
				.split(',')
				.map((s: string) => s.trim());
		}
		if (options.BatchName) body.BatchName = options.BatchName;
		if (options.CompletedRequestAgeLimit !== undefined && options.CompletedRequestAgeLimit !== 0) {
			body.CompletedRequestAgeLimit = options.CompletedRequestAgeLimit;
		}
		if (options.ConflictResolutionOption)
			body.ConflictResolutionOption = options.ConflictResolutionOption;
		if (options.SourceRootFolder) body.SourceRootFolder = options.SourceRootFolder;
		if (options.TargetRootFolder) body.TargetRootFolder = options.TargetRootFolder;
		if (options.TargetType) body.TargetType = options.TargetType;
		if (options.ExcludeDumpster !== undefined) body.ExcludeDumpster = options.ExcludeDumpster;
		if (options.SourceIsArchive !== undefined) body.SourceIsArchive = options.SourceIsArchive;
		if (options.TargetIsArchive !== undefined) body.TargetIsArchive = options.TargetIsArchive;
		if (options.Action) body.Action = options.Action;
		if (options.Identity) body.Identity = options.Identity;
		return cippApiRequest.call(context, 'POST', '/api/ExecMailboxRestore', body, {});
	}
	// ── All remaining operations use the shared userId field ───────────
	const userId = context.getNodeParameter('userId', i) as string;
	if (operation === 'setDefaultCalendarPerms') {
		return postAction(context, i, '/api/ExecModifyCalPerms', {
			userID: userId,
			permissions: context.getNodeParameter('permissions', i) as string,
		});
	}
	if (operation === 'setDefaultContactPerms') {
		return postAction(context, i, '/api/ExecModifyContactPerms', {
			userID: userId,
			permissions: context.getNodeParameter('permissions', i) as string,
		});
	}
	if (operation === 'setDefaultMailboxPerms') {
		return postAction(context, i, '/api/ExecModifyMBPerms', {
			userID: userId,
			permissions: context.getNodeParameter('permissions', i) as string,
		});
	}
	if (operation === 'setEmailSize') {
		return postAction(context, i, '/api/ExecSetMailboxEmailSize', {
			UPN: userId,
			maxSendSize: context.getNodeParameter('maxSendSize', i) as string,
			maxReceiveSize: context.getNodeParameter('maxReceiveSize', i) as string,
		});
	}
	if (operation === 'setLocale') {
		return postAction(context, i, '/api/ExecSetMailboxLocale', {
			user: userId,
			locale: context.getNodeParameter('locale', i) as string,
		});
	}
	if (operation === 'setCopyForSent') {
		return postAction(context, i, '/api/ExecCopyForSent', {
			ID: userId,
			messageCopyState: context.getNodeParameter('messageCopyState', i) as string,
		});
	}
	if (operation === 'setCalendarProcessing') {
		const options = context.getNodeParameter('calendarProcessingOptions', i) as IDataObject;
		return postAction(context, i, '/api/ExecSetCalendarProcessing', {
			UPN: userId,
			...options,
		});
	}
	if (operation === 'enableAutoExpandArchive') {
		return postAction(context, i, '/api/ExecEnableAutoExpandingArchive', {
			ID: userId,
			username: userId,
		});
	}
	if (operation === 'manageMobileDevice') {
		const deviceAction = context.getNodeParameter('deviceAction', i) as string;
		const qs: IDataObject = {
			tenantFilter,
			Userid: userId,
			deviceid: context.getNodeParameter('deviceId', i) as string,
		};
		if (deviceAction === 'delete') qs.Delete = 'true';
		else if (deviceAction === 'quarantine') qs.Quarantine = 'true';
		return cippApiRequest.call(context, 'GET', '/api/ExecMailboxMobileDevices', {}, qs);
	}
	if (operation === 'repairExchangeRole') {
		// Uses tenantId (not tenantFilter) in body
		const body: IDataObject = { tenantId: tenantFilter };
		return cippApiRequest.call(context, 'POST', '/api/ExecExchangeRoleRepair', body, {});
	}
	if (operation === 'sendOrgMessage') {
		// GET with tenantFilter QS + optional params
		const filters = context.getNodeParameter('sendOrgMessageFields', i, {}) as IDataObject;
		const qs: IDataObject = { tenantFilter };
		if (filters.ID) qs.ID = filters.ID;
		if (filters.freq) qs.freq = filters.freq;
		if (filters.type) qs.type = filters.type;
		if (filters.URL) qs.URL = filters.URL;
		return cippApiRequest.call(context, 'GET', '/api/ExecSendOrgMessage', {}, qs);
	}
	throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
		itemIndex: i,
	});
}
