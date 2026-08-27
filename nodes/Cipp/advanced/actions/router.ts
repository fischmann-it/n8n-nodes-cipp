import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import * as alert from './alert';
import * as application from './application';
import * as autopilot from './autopilot';
import * as cippAdmin from './cippAdmin';
import * as cippCore from './cippCore';
import * as conditionalAccess from './conditionalAccess';
import * as contact from './contact';
import * as device from './device';
import * as gdap from './gdap';
import * as group from './group';
import * as identity from './identity';
import * as mailbox from './mailbox';
import * as policy from './policy';
import * as safeLinks from './safeLinks';
import * as scheduledItem from './scheduledItem';
import * as spamfilter from './spamfilter';
import * as standard from './standard';
import * as team from './team';
import * as tenant from './tenant';
import * as tools from './tools';
import * as transport from './transport';
import * as user from './user';
import * as workflows from './workflows';

type ResourceHandler = {
	execute: (
		context: IExecuteFunctions,
		operation: string,
		i: number,
	) => Promise<IDataObject | IDataObject[]>;
};

type ResourceName =
	| 'alert'
	| 'application'
	| 'autopilot'
	| 'cippAdmin'
	| 'cippCore'
	| 'conditionalAccess'
	| 'contact'
	| 'device'
	| 'gdap'
	| 'group'
	| 'identity'
	| 'mailbox'
	| 'policy'
	| 'safeLinks'
	| 'scheduledItem'
	| 'spamfilter'
	| 'standard'
	| 'team'
	| 'tenant'
	| 'tools'
	| 'transport'
	| 'user'
	| 'workflows';

const resourceHandlers = {
	alert,
	application,
	autopilot,
	cippAdmin,
	cippCore,
	conditionalAccess,
	contact,
	device,
	gdap,
	group,
	identity,
	mailbox,
	policy,
	safeLinks,
	scheduledItem,
	spamfilter,
	standard,
	team,
	tenant,
	tools,
	transport,
	user,
	workflows,
} satisfies Record<ResourceName, ResourceHandler>;

export async function router(
	context: IExecuteFunctions,
	resource: string,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const handler = (resourceHandlers as Record<string, ResourceHandler>)[resource];
	if (!handler) {
		throw new NodeOperationError(context.getNode(), `Unknown resource: ${resource}`, {
			itemIndex: i,
		});
	}
	return handler.execute(context, operation, i);
}
