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
	let responseData: IDataObject | IDataObject[] = {};
	if (operation === 'listAccessAssignments') {
		// GET /api/ListGDAPAccessAssignments — optional Id QS, no tenant
		const qs: IDataObject = {};
		const assignmentId = context.getNodeParameter('assignmentId', i, '') as string;
		if (assignmentId) qs.Id = assignmentId;
		responseData = await listWithSlice(context, i, 'GET', '/api/ListGDAPAccessAssignments', {}, qs);
	} else if (operation === 'listInvites') {
		// GET /api/ListGDAPInvite — optional RelationshipId QS, no tenant
		const qs: IDataObject = {};
		const relationshipId = context.getNodeParameter('relationshipId', i, '') as string;
		if (relationshipId) qs.RelationshipId = relationshipId;
		responseData = await listWithSlice(context, i, 'GET', '/api/ListGDAPInvite', {}, qs);
	} else if (operation === 'listApprovedInvites') {
		// GET /api/ExecGDAPInviteApproved — no params, no tenant
		responseData = await listWithSlice(context, i, 'GET', '/api/ExecGDAPInviteApproved', {}, {});
		// ── Write operations ──
	} else if (operation === 'addRole') {
		// POST /api/ExecAddGDAPRole — Action in QS, body fields, no tenant
		const action = context.getNodeParameter('addRoleAction', i) as string;
		const fields = context.getNodeParameter('addRoleFields', i, {}) as IDataObject;
		const body: IDataObject = { Action: action };
		const qs: IDataObject = { Action: action };
		if (fields.gdapTemplate) {
			body.gdapTemplate = parseJsonObjectPayload(
				context.getNode(),
				fields.gdapTemplate,
				'GDAP Template',
				i,
			);
		}
		if (fields.inviteCount !== undefined) body.inviteCount = fields.inviteCount;
		if (fields.Reference) body.Reference = fields.Reference;
		if (fields.gdapRoles) {
			body.gdapRoles = (fields.gdapRoles as string).split(',').map((r) => r.trim());
		}
		if (fields.customSuffix) body.customSuffix = fields.customSuffix;
		if (fields.templateId) body.templateId = fields.templateId;
		if (fields.mappings) body.mappings = fields.mappings;
		if (fields.replace) body.replace = fields.replace;
		responseData = await cippApiRequest.call(context, 'POST', '/api/ExecAddGDAPRole', body, qs);
	} else if (operation === 'autoExtend') {
		// POST /api/ExecAutoExtendGDAP — ID in body, no tenant
		const id = context.getNodeParameter('autoExtendId', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ExecAutoExtendGDAP',
			{ ID: id },
			{},
		);
	} else if (operation === 'deleteRelationship') {
		// POST /api/ExecDeleteGDAPRelationship — GDAPId in body, no tenant
		const gdapId = context.getNodeParameter('deleteRelationshipId', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ExecDeleteGDAPRelationship',
			{ GDAPId: gdapId },
			{},
		);
	} else if (operation === 'deleteRoleMapping') {
		// POST /api/ExecDeleteGDAPRoleMapping — GroupId in body, no tenant
		const groupId = context.getNodeParameter('deleteRoleMappingGroupId', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ExecDeleteGDAPRoleMapping',
			{ GroupId: groupId },
			{},
		);
	} else if (operation === 'manageAccessAssignment') {
		// PATCH /api/ExecGDAPAccessAssignment — Action, Id, RoleTemplateId in body, no tenant
		const action = context.getNodeParameter('accessAssignmentAction', i) as string;
		const id = context.getNodeParameter('accessAssignmentId', i) as string;
		const roleTemplateId = context.getNodeParameter('roleTemplateId', i, '') as string;
		const body: IDataObject = { Action: action, Id: id };
		if (roleTemplateId) body.RoleTemplateId = roleTemplateId;
		responseData = await cippApiRequest.call(
			context,
			'PATCH',
			'/api/ExecGDAPAccessAssignment',
			body,
			{},
		);
	} else if (operation === 'removeGARole') {
		// POST /api/ExecGDAPRemoveGArole — GDAPId in body, no tenant
		const gdapId = context.getNodeParameter('removeGARoleId', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ExecGDAPRemoveGArole',
			{ GDAPId: gdapId },
			{},
		);
	} else if (operation === 'deleteRoleTemplate') {
		// DELETE /api/ExecGDAPRoleTemplate — TemplateId required, optional body fields, no tenant
		const templateId = context.getNodeParameter('deleteTemplateId', i) as string;
		const fields = context.getNodeParameter('deleteTemplateFields', i, {}) as IDataObject;
		const body: IDataObject = { TemplateId: templateId };
		const qs: IDataObject = { TemplateId: templateId };
		if (fields.Action) {
			body.Action = fields.Action;
			qs.Action = fields.Action as string;
		}
		if (fields.gdapTemplate) {
			body.gdapTemplate = parseJsonObjectPayload(
				context.getNode(),
				fields.gdapTemplate,
				'GDAP Template',
				i,
			);
		}
		if (fields.GroupId) body.GroupId = fields.GroupId;
		if (fields.inviteCount !== undefined) body.inviteCount = fields.inviteCount;
		if (fields.OriginalTemplateId) body.OriginalTemplateId = fields.OriginalTemplateId;
		if (fields.Reference) body.Reference = fields.Reference;
		if (fields.RoleMappings) {
			body.RoleMappings = parseJsonObjectPayload(
				context.getNode(),
				fields.RoleMappings,
				'Role Mappings',
				i,
			);
		}
		responseData = await cippApiRequest.call(
			context,
			'DELETE',
			'/api/ExecGDAPRoleTemplate',
			body,
			qs,
		);
	} else if (operation === 'traceAccess') {
		// GET /api/ExecGDAPTrace — tenantFilter + optional UPN as QS
		const tenantFilter = getTenantFilter(context, i);
		const qs: IDataObject = { tenantFilter };
		const upn = context.getNodeParameter('traceUpn', i, '') as string;
		if (upn) qs.UPN = upn;
		responseData = await cippApiRequest.call(context, 'GET', '/api/ExecGDAPTrace', {}, qs);
	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}
	return responseData;
}
