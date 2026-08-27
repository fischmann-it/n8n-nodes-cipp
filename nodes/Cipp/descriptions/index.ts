import { alertFields, alertOperations } from './AlertDescription';
import { applicationFields, applicationOperations } from './ApplicationDescription';
import {
	conditionalAccessFields,
	conditionalAccessOperations,
} from './ConditionalAccessDescription';
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
import { emailSecurityFields, emailSecurityOperations } from './EmailSecurityDescription';
import { exchangeResourceFields, exchangeResourceOperations } from './ExchangeResourceDescription';
import { gdapFields, gdapOperations } from './GdapDescription';
import { groupFields, groupOperations } from './GroupDescription';
import { identityFields, identityOperations } from './IdentityDescription';
import { intuneFields, intuneOperations } from './IntuneDescription';
import { mailboxFields, mailboxOperations } from './MailboxDescription';
import { onedriveFields, onedriveOperations } from './OneDriveDescription';
import { policyFields, policyOperations } from './PolicyDescription';
import { quarantineFields, quarantineOperations } from './QuarantineDescription';
import { safeLinksFields, safeLinksOperations } from './SafeLinksDescription';
import { sharepointFields, sharepointOperations } from './SharePointDescription';
import { shiftFields, shiftOperations } from './ShiftDescription';
import { standardsFields, standardsOperations } from './StandardsDescription';
import { teamFields, teamOperations, voiceFields, voiceOperations } from './TeamDescription';
import { tenantFields, tenantOperations } from './TenantDescription';
import { testingFields, testingOperations } from './TestingDescription';
import { userFields, userOperations } from './UserDescription';
import { v105Fields, v105Operations } from './V105Description';
import { v106Fields, v106Operations } from './V106Description';
import { getAdvancedOnlyResourceFields, mergeAdvancedOperationFields } from './AdvancedOperations';

const baseOperationFields = [
	...alertOperations,
	...applicationOperations,
	...autopilotOperations,
	...backupOperations,
	...conditionalAccessOperations,
	...deviceOperations,
	...emailSecurityOperations,
	...exchangeResourceOperations,
	...gdapOperations,
	...groupOperations,
	...identityOperations,
	...intuneOperations,
	...mailboxOperations,
	...onedriveOperations,
	...policyOperations,
	...quarantineOperations,
	...safeLinksOperations,
	...scheduledItemOperations,
	...sharepointOperations,
	...shiftOperations,
	...standardsOperations,
	...teamOperations,
	...tenantOperations,
	...testingOperations,
	...toolsOperations,
	...userOperations,
	...v105Operations,
	...v106Operations,
	...voiceOperations,
];

export const operationFields = mergeAdvancedOperationFields(baseOperationFields);

const baseResourceFields = [
	...alertFields,
	...applicationFields,
	...autopilotFields,
	...backupFields,
	...conditionalAccessFields,
	...deviceFields,
	...emailSecurityFields,
	...exchangeResourceFields,
	...gdapFields,
	...groupFields,
	...identityFields,
	...intuneFields,
	...mailboxFields,
	...onedriveFields,
	...policyFields,
	...quarantineFields,
	...safeLinksFields,
	...scheduledItemFields,
	...sharepointFields,
	...shiftFields,
	...standardsFields,
	...teamFields,
	...tenantFields,
	...testingFields,
	...toolsFields,
	...userFields,
	...v105Fields,
	...v106Fields,
	...voiceFields,
];

export const resourceFields = [
	...baseResourceFields,
	...getAdvancedOnlyResourceFields(baseResourceFields),
];
