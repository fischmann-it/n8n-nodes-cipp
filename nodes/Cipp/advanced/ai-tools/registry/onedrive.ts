import type { ResourceConfig } from './types'
import { P, TENANT } from './types'

export const resourceConfig: ResourceConfig = {
	label: 'OneDrive',
	description: 'Provision and manage OneDrive',
	operations: {
		provision: {
			method: 'POST',
			endpoint: '/api/ExecOnedriveProvision',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				UserPrincipalName: P.body('User UPN', true),
			},
			description: 'Provision OneDrive for a user',
		},
		addShortcut: {
			method: 'POST',
			endpoint: '/api/ExecOneDriveShortCut',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				userid: P.body('User ID', true),
				siteUrl: P.body('SharePoint site URL', true),
			},
			description: 'Add a OneDrive shortcut to a SharePoint site',
		},
	},
}
