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
	// Contacts
	// ══════════════════════════════════════════════════════════════

	if (operation === 'listContacts') {
		const tenantFilter = getTenantFilter(context, i);
		const filters = context.getNodeParameter('listContactsFilters', i, {}) as IDataObject;
		const qs: IDataObject = { tenantFilter };
		if (filters.id) qs.id = filters.id;
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListContacts',
			{},
			qs,
		);

	} else if (operation === 'addContact') {
		const tenantFilter = getTenantFilter(context, i);
		const displayName = context.getNodeParameter('displayName', i) as string;
		const email = context.getNodeParameter('email', i) as string;
		const additionalFields = context.getNodeParameter('addContactFields', i, {}) as IDataObject;
		const body: IDataObject = {
			tenantid: tenantFilter,
			displayName,
			email,
		};
		if (additionalFields.firstName) body.firstName = additionalFields.firstName;
		if (additionalFields.lastName) body.lastName = additionalFields.lastName;
		if (additionalFields.phone) body.phone = additionalFields.phone;
		if (additionalFields.mobilePhone) body.mobilePhone = additionalFields.mobilePhone;
		if (additionalFields.Company) body.Company = additionalFields.Company;
		if (additionalFields.Title) body.Title = additionalFields.Title;
		if (additionalFields.StreetAddress) body.StreetAddress = additionalFields.StreetAddress;
		if (additionalFields.City) body.City = additionalFields.City;
		if (additionalFields.State) body.State = additionalFields.State;
		if (additionalFields.PostalCode) body.PostalCode = additionalFields.PostalCode;
		if (additionalFields.CountryOrRegion) body.CountryOrRegion = additionalFields.CountryOrRegion;
		if (additionalFields.website) body.website = additionalFields.website;
		if (additionalFields.mailTip) body.mailTip = additionalFields.mailTip;
		if (additionalFields.hidefromGAL) body.hidefromGAL = additionalFields.hidefromGAL;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddContact',
			body,
			{},
		);

	} else if (operation === 'editContact') {
		const tenantFilter = getTenantFilter(context, i);
		const contactId = context.getNodeParameter('contactID', i) as string;
		const editFields = context.getNodeParameter('editContactFields', i, {}) as IDataObject;
		const body: IDataObject = {
			tenantID: tenantFilter,
			ContactID: contactId,
		};
		if (editFields.displayName) body.displayName = editFields.displayName;
		if (editFields.firstName) body.firstName = editFields.firstName;
		if (editFields.LastName) body.LastName = editFields.LastName;
		if (editFields.email) body.email = editFields.email;
		if (editFields.phone) body.phone = editFields.phone;
		if (editFields.mobilePhone) body.mobilePhone = editFields.mobilePhone;
		if (editFields.Company) body.Company = editFields.Company;
		if (editFields.Title) body.Title = editFields.Title;
		if (editFields.StreetAddress) body.StreetAddress = editFields.StreetAddress;
		if (editFields.City) body.City = editFields.City;
		if (editFields.State) body.State = editFields.State;
		if (editFields.PostalCode) body.PostalCode = editFields.PostalCode;
		if (editFields.CountryOrRegion) body.CountryOrRegion = editFields.CountryOrRegion;
		if (editFields.website) body.website = editFields.website;
		if (editFields.mailTip) body.mailTip = editFields.mailTip;
		if (editFields.hidefromGAL !== undefined) body.hidefromGAL = editFields.hidefromGAL;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/EditContact',
			body,
			{},
		);

	} else if (operation === 'removeContact') {
		const guid = context.getNodeParameter('gUID', i) as string;
		const additionalFields = context.getNodeParameter('removeContactFields', i, {}) as IDataObject;
		const extra: IDataObject = { GUID: guid };
		if (additionalFields.Mail) extra.Mail = additionalFields.Mail;
		responseData = await postAction(
			context,
			i,
			'/api/RemoveContact',
			extra,
		);

	// ══════════════════════════════════════════════════════════════
	// Contact Templates
	// ══════════════════════════════════════════════════════════════

	} else if (operation === 'listContactTemplates') {
		const returnAll = context.getNodeParameter('returnAll', i) as boolean;
		const filters = context.getNodeParameter('listContactTemplatesFilters', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (filters.id) qs.id = filters.id;
		responseData = await cippApiRequest.call(
			context,
			'GET',
			'/api/ListContactTemplates',
			{},
			qs,
		);
		if (!Array.isArray(responseData) && responseData !== null && typeof responseData === 'object') {
			const obj = responseData as IDataObject;
			if (obj.error || obj.Error) {
				throw new NodeOperationError(context.getNode(), (obj.error || obj.Error) as string, { itemIndex: i });
			}
		}
		if (Array.isArray(responseData) && !returnAll) {
			const limit = context.getNodeParameter('limit', i) as number;
			responseData = responseData.slice(0, limit);
		}

	} else if (operation === 'addContactTemplate') {
		const displayName = context.getNodeParameter('displayName', i) as string;
		const additionalFields = context.getNodeParameter('addContactTemplateFields', i, {}) as IDataObject;
		const body: IDataObject = { displayName };
		if (additionalFields.firstName) body.firstName = additionalFields.firstName;
		if (additionalFields.lastName) body.lastName = additionalFields.lastName;
		if (additionalFields.email) body.email = additionalFields.email;
		if (additionalFields.hidefromGAL !== undefined) body.hidefromGAL = additionalFields.hidefromGAL;
		if (additionalFields.streetAddress) body.streetAddress = additionalFields.streetAddress;
		if (additionalFields.postalCode) body.postalCode = additionalFields.postalCode;
		if (additionalFields.city) body.city = additionalFields.city;
		if (additionalFields.state) body.state = additionalFields.state;
		if (additionalFields.country) body.country = additionalFields.country;
		if (additionalFields.companyName) body.companyName = additionalFields.companyName;
		if (additionalFields.mobilePhone) body.mobilePhone = additionalFields.mobilePhone;
		if (additionalFields.businessPhone) body.businessPhone = additionalFields.businessPhone;
		if (additionalFields.jobTitle) body.jobTitle = additionalFields.jobTitle;
		if (additionalFields.website) body.website = additionalFields.website;
		if (additionalFields.mailTip) body.mailTip = additionalFields.mailTip;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/AddContactTemplates',
			body,
			{},
		);

	} else if (operation === 'editContactTemplate') {
		const contactTemplateId = context.getNodeParameter('contactTemplateID', i) as string;
		const editFields = context.getNodeParameter('editContactTemplateFields', i, {}) as IDataObject;
		const body: IDataObject = { ContactTemplateID: contactTemplateId };
		if (editFields.displayName) body.displayName = editFields.displayName;
		if (editFields.firstName) body.firstName = editFields.firstName;
		if (editFields.lastName) body.lastName = editFields.lastName;
		if (editFields.email) body.email = editFields.email;
		if (editFields.hidefromGAL !== undefined) body.hidefromGAL = editFields.hidefromGAL;
		if (editFields.streetAddress) body.streetAddress = editFields.streetAddress;
		if (editFields.postalCode) body.postalCode = editFields.postalCode;
		if (editFields.city) body.city = editFields.city;
		if (editFields.state) body.state = editFields.state;
		if (editFields.country) body.country = editFields.country;
		if (editFields.companyName) body.companyName = editFields.companyName;
		if (editFields.mobilePhone) body.mobilePhone = editFields.mobilePhone;
		if (editFields.businessPhone) body.businessPhone = editFields.businessPhone;
		if (editFields.jobTitle) body.jobTitle = editFields.jobTitle;
		if (editFields.website) body.website = editFields.website;
		if (editFields.mailTip) body.mailTip = editFields.mailTip;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/EditContactTemplates',
			body,
			{},
		);

	} else if (operation === 'removeContactTemplate') {
		const id = context.getNodeParameter('templateID', i) as string;
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/RemoveContactTemplates',
			{ ID: id },
			{},
		);

	// ══════════════════════════════════════════════════════════════
	// Deploy Contact Templates
	// ══════════════════════════════════════════════════════════════

	} else if (operation === 'deployContactTemplates') {
		const tenantFilter = getTenantFilter(context, i);
		const templateList = context.getNodeParameter('templateList', i) as string;
		const body: IDataObject = {
			selectedTenants: tenantFilter,
			TemplateList: parseJsonPayload(
				context.getNode(),
				templateList,
				'Template List',
				i,
			),
		};
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/DeployContactTemplates',
			body,
			{},
		);

	// ══════════════════════════════════════════════════════════════
	// Contact Permissions
	// ══════════════════════════════════════════════════════════════

	} else if (operation === 'listContactPermissions') {
		const tenantFilter = getTenantFilter(context, i);
		const filters = context.getNodeParameter('listContactPermissionsFilters', i, {}) as IDataObject;
		const qs: IDataObject = { tenantFilter };
		if (filters.UserID) qs.UserID = filters.UserID;
		responseData = await listWithSlice(
			context,
			i,
			'GET',
			'/api/ListContactPermissions',
			{},
			qs,
		);

	} else if (operation === 'modifyContactPermissions') {
		const userID = context.getNodeParameter('userID', i) as string;
		const permissions = context.getNodeParameter('permissions', i) as string;
		responseData = await postAction(
			context,
			i,
			'/api/ExecModifyContactPerms',
			{ userID, permissions },
		);

	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}

	return responseData;
}
