import type { ResourceConfig } from './types';
import { P, TENANT } from './types';

export const resourceConfig: ResourceConfig = {
	label: 'Voice',
	description: 'Manage Teams Voice phone numbers and locations',
	operations: {
		getPhoneNumbers: {
			method: 'GET',
			endpoint: '/api/ListTeamsVoice',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {},
			description: 'List Teams Voice phone numbers for a tenant',
		},
		getLocations: {
			method: 'GET',
			endpoint: '/api/ListTeamsLisLocation',
			isWrite: false,
			isList: true,
			tenant: TENANT.qs,
			params: {},
			description: 'List Teams LIS locations for a tenant',
		},
		assignNumber: {
			method: 'POST',
			endpoint: '/api/ExecTeamsVoicePhoneNumberAssignment',
			isWrite: true,
			isList: false,
			tenant: TENANT.bodyPascal,
			params: {
				PhoneNumber: P.body('Phone number', true),
				PhoneNumberType: P.body('Number type'),
				locationOnly: P.body('Location only flag'),
				input: P.body('User to assign to', true),
			},
			description: 'Assign a phone number to a user',
		},
		unassignNumber: {
			method: 'POST',
			endpoint: '/api/ExecRemoveTeamsVoicePhoneNumberAssignment',
			isWrite: true,
			isList: false,
			tenant: TENANT.body,
			params: {
				PhoneNumber: P.body('Phone number', true),
				PhoneNumberType: P.body('Number type'),
				AssignedTo: P.body('Currently assigned user', true),
			},
			description: 'Unassign a phone number from a user',
		},
	},
};
