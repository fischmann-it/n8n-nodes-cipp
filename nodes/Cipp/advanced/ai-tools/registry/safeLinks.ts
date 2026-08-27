import type { ResourceConfig } from './types'
import { P, TENANT } from './types'

export const resourceConfig: ResourceConfig = {
	label: 'Safe Links',
	description: 'Manage Safe Links policies and templates',
	operations: {
		listPolicies: {
			method: 'GET',
			endpoint: '/api/ListSafeLinksPolicy',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {},
			description: 'List Safe Links policies',
		},
		getPolicyDetails: {
			method: 'POST',
			endpoint: '/api/ListSafeLinksPolicyDetails',
			isWrite: false,
			isList: false,
			tenant: TENANT.body,
			params: {
				PolicyName: P.qs('Policy name'),
				RuleName: P.qs('Rule name'),
			},
			description: 'Get Safe Links policy details',
		},
		addPolicy: {
			method: 'POST',
			endpoint: '/api/ExecNewSafeLinksPolicy',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				PolicyName: P.body('Policy name', true),
			},
			description: 'Add a Safe Links policy',
		},
		editPolicy: {
			method: 'POST',
			endpoint: '/api/EditSafeLinksPolicy',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				PolicyName: P.body('Policy name', true),
			},
			description: 'Edit a Safe Links policy',
		},
		deletePolicy: {
			method: 'POST',
			endpoint: '/api/ExecDeleteSafeLinksPolicy',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				PolicyName: P.body('Policy name', true),
				RuleName: P.body('Rule name'),
			},
			description: 'Delete a Safe Links policy',
		},
		listTemplates: {
			method: 'GET',
			endpoint: '/api/ListSafeLinksPolicyTemplates',
			isWrite: false,
			isList: true,
			tenant: TENANT.none,
			params: {
				id: P.qs('Template ID'),
			},
			description: 'List Safe Links policy templates',
		},
		getTemplateDetails: {
			method: 'POST',
			endpoint: '/api/ListSafeLinksPolicyTemplateDetails',
			isWrite: false,
			isList: false,
			tenant: TENANT.none,
			params: {
				ID: P.qs('Template ID'),
			},
			description: 'Get Safe Links policy template details',
		},
		addTemplate: {
			method: 'POST',
			endpoint: '/api/AddSafeLinksPolicyTemplate',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				TemplateName: P.body('Template name'),
				PolicyName: P.body('Policy name'),
			},
			description: 'Add a Safe Links policy template',
		},
		createTemplate: {
			method: 'POST',
			endpoint: '/api/CreateSafeLinksPolicyTemplate',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				TemplateName: P.body('Template name', true),
			},
			description: 'Create a Safe Links policy template',
		},
		editTemplate: {
			method: 'POST',
			endpoint: '/api/EditSafeLinksPolicyTemplate',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				ID: P.body('Template ID', true),
				TemplateName: P.body('Template name'),
			},
			description: 'Edit a Safe Links policy template',
		},
		removeTemplate: {
			method: 'POST',
			endpoint: '/api/RemoveSafeLinksPolicyTemplate',
			isWrite: true,
			isList: false,
			tenant: TENANT.none,
			params: {
				ID: P.body('Template ID', true),
			},
			description: 'Remove a Safe Links policy template',
		},
		deployFromTemplate: {
			method: 'POST',
			endpoint: '/api/AddSafeLinksPolicyFromTemplate',
			isWrite: true,
			isList: false,
			tenant: TENANT.bodySelected,
			params: {
				TemplateList: P.bodyJson('Template list JSON', true),
			},
			description: 'Deploy Safe Links policy from template',
		},
	},
}
