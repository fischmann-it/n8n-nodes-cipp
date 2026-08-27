import { alertFields, alertOperations } from './AlertDescription';
import { applicationFields, applicationOperations } from './ApplicationDescription';
import { cippAdminFields, cippAdminOperations } from './CippAdminDescription';
import { cippCoreFields, cippCoreOperations } from './CippCoreDescription';
import {
	conditionalAccessFields,
	conditionalAccessOperations,
} from './ConditionalAccessDescription';
import { contactFields, contactOperations } from './ContactDescription';
import {
	backupFields,
	backupOperations,
	scheduledItemFields,
	scheduledItemOperations,
	toolsFields,
	toolsOperations,
} from './CippDescription';
import {
	autopilotFields,
	autopilotOperations,
	deviceFields,
	deviceOperations,
} from './DeviceDescription';
import {
	exchangeResourceFields,
	exchangeResourceOperations,
} from './ExchangeResourceDescription';
import { gdapFields, gdapOperations } from './GdapDescription';
import { groupFields, groupOperations } from './GroupDescription';
import { identityFields, identityOperations } from './IdentityDescription';
import { mailboxFields, mailboxOperations } from './MailboxDescription';
import { onedriveFields, onedriveOperations } from './OneDriveDescription';
import { policyFields, policyOperations } from './PolicyDescription';
import { quarantineFields, quarantineOperations } from './QuarantineDescription';
import { safeLinksFields, safeLinksOperations } from './SafeLinksDescription';
import { shiftFields, shiftOperations } from './ShiftDescription';
import { spamfilterFields, spamfilterOperations } from './SpamfilterDescription';
import { standardFields, standardOperations } from './StandardDescription';
import { teamFields, teamOperations, voiceFields, voiceOperations } from './TeamDescription';
import { tenantFields, tenantOperations } from './TenantDescription';
import { transportFields, transportOperations } from './TransportDescription';
import { userFields, userOperations } from './UserDescription';
import { workflowsFields, workflowsOperations } from './WorkflowsDescription';

export const operationFields = [
	...alertOperations,
	...applicationOperations,
	...autopilotOperations,
	...cippAdminOperations,
	...cippCoreOperations,
	...conditionalAccessOperations,
	...contactOperations,
	...backupOperations,
	...deviceOperations,
	...exchangeResourceOperations,
	...gdapOperations,
	...groupOperations,
	...identityOperations,
	...mailboxOperations,
	...onedriveOperations,
	...policyOperations,
	...quarantineOperations,
	...safeLinksOperations,
	...scheduledItemOperations,
	...shiftOperations,
	...spamfilterOperations,
	...standardOperations,
	...teamOperations,
	...tenantOperations,
	...toolsOperations,
	...transportOperations,
	...userOperations,
	...voiceOperations,
	...workflowsOperations,
];

export const resourceFields = [
	...alertFields,
	...applicationFields,
	...autopilotFields,
	...cippAdminFields,
	...cippCoreFields,
	...conditionalAccessFields,
	...contactFields,
	...backupFields,
	...deviceFields,
	...exchangeResourceFields,
	...gdapFields,
	...groupFields,
	...identityFields,
	...mailboxFields,
	...onedriveFields,
	...policyFields,
	...quarantineFields,
	...safeLinksFields,
	...scheduledItemFields,
	...shiftFields,
	...spamfilterFields,
	...standardFields,
	...teamFields,
	...tenantFields,
	...toolsFields,
	...transportFields,
	...userFields,
	...voiceFields,
	...workflowsFields,
];
