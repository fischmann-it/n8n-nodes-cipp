import type { ResourceConfig } from './types';
export type { ResourceConfig, OperationDef, CompositeOperationDef, AnyOperationDef, ParamDef } from './types';
export { TENANT, P, N8N_METADATA_FIELDS, isWriteOperation } from './types';

import { resourceConfig as alert } from './alert';
import { resourceConfig as application } from './application';
import { resourceConfig as autopilot } from './autopilot';
import { resourceConfig as backup } from './backup';
import { resourceConfig as cippAdmin } from './cippAdmin';
import { resourceConfig as cippCore } from './cippCore';
import { resourceConfig as conditionalAccess } from './conditionalAccess';
import { resourceConfig as contact } from './contact';
import { resourceConfig as device } from './device';
import { resourceConfig as exchangeResource } from './exchangeResource';
import { resourceConfig as gdap } from './gdap';
import { resourceConfig as group } from './group';
import { resourceConfig as identity } from './identity';
import { resourceConfig as mailbox } from './mailbox';
import { resourceConfig as onedrive } from './onedrive';
import { resourceConfig as policy } from './policy';
import { resourceConfig as quarantine } from './quarantine';
import { resourceConfig as safeLinks } from './safeLinks';
import { resourceConfig as scheduledItem } from './scheduledItem';
import { resourceConfig as spamfilter } from './spamfilter';
import { resourceConfig as standard } from './standard';
import { resourceConfig as team } from './team';
import { resourceConfig as teamsShift } from './teamsShift';
import { resourceConfig as tenant } from './tenant';
import { resourceConfig as tools } from './tools';
import { resourceConfig as transport } from './transport';
import { resourceConfig as user } from './user';
import { resourceConfig as voice } from './voice';
import { resourceConfig as workflows } from './workflows';

export const RESOURCE_REGISTRY: Record<string, ResourceConfig> = {
	alert,
	application,
	autopilot,
	backup,
	cippAdmin,
	cippCore,
	conditionalAccess,
	contact,
	device,
	exchangeResource,
	gdap,
	group,
	identity,
	mailbox,
	onedrive,
	policy,
	quarantine,
	safeLinks,
	scheduledItem,
	spamfilter,
	standard,
	team,
	teamsShift,
	tenant,
	tools,
	transport,
	user,
	voice,
	workflows,
};
