# n8n-nodes-cipp

[![npm version](https://badge.fury.io/js/%40joshuanode%2Fn8n-nodes-cipp.svg)](https://www.npmjs.com/package/@joshuanode/n8n-nodes-cipp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

n8n community node for [CIPP.app](https://cipp.app) - Comprehensive Microsoft 365 multi-tenant management.

![CIPP Node](https://img.shields.io/badge/n8n-Community%20Node-ff6d5a)
![Beta](https://img.shields.io/badge/Status-Beta-orange)

> ⚠️ **Beta Notice**: This node is currently in beta and may not be fully functional yet. Some operations may be incomplete or require adjustments. Use in production at your own risk.
>
> 🤝 **Contributions Welcome!** We welcome bug reports, feature requests, and pull requests. If you encounter issues or have improvements, please open an issue or PR on GitHub.

## Features

This node provides full integration with the CIPP API, enabling automation of:

- **Identity Management** - Users, groups, MFA, devices
- **Tenant Administration** - Alerts, licenses, standards
- **Intune** - Applications, Autopilot, device actions
- **Teams & SharePoint** - Teams, sites, voice numbers, shifts scheduling
- **Security & Compliance** - Defender alerts, incidents
- **CIPP v10.5 APIs** - Purview compliance, enrollment profiles, mailbox restores, alert snoozing, license reports
- **CIPP v10.6 APIs** - Copilot and Shadow AI, SharePoint sharing and recovery, CVE management, audit coverage, and Agent 365 reports
- **Tools** - Breach search, Graph API requests, ExecGraphRequest
- **CIPP System** - Scheduled jobs, backups
- **Expanded API Coverage** - 631 operations across the original and expanded CIPP resources
- **AI Agent Tools** - 480 schema-driven operations for n8n AI Agent and MCP Trigger workflows
- **Composite Workflows** - License audit, security posture, BEC investigation, User 360, and cross-tenant sweep

### User-Friendly Design

- **Tenant Selector** - Searchable dropdown to select tenants by name
- **Field Picker** - Multi-select for user properties (no need to memorize Graph API field names)
- **Smart Defaults** - Sensible default selections to keep responses fast and small

### CIPP.app AI Tools

The package also installs a separate **CIPP.app AI Tools** node. Connect it to an n8n AI Agent or MCP Trigger using the AI Tool connection, select a resource, and explicitly choose which operations the agent may call.

- Write operations are hidden and blocked by default.
- Enabling **Allow Write Operations** is required before mutating operations can be selected or executed.
- The write restriction is checked both when constructing the tool and immediately before execution.
- Each selected resource exposes a runtime-generated parameter schema to the agent.
- Composite workflows remain read-only and can also be run through the regular CIPP.app node.

`Run Exchange Request` is treated as a write-capable AI operation because the selected Exchange cmdlet can mutate tenant state.

## Installation

### n8n (Self-hosted)

```bash
npm install @joshuanode/n8n-nodes-cipp
```

Or add to your n8n Docker container:

```bash
# In your Dockerfile
RUN npm install -g @joshuanode/n8n-nodes-cipp
```

### n8n Cloud

Community nodes can be installed via **Settings → Community Nodes → Install**.

## Credentials Setup

1. **Create an Azure AD App Registration** for CIPP API access
2. Configure the following in n8n:
   - **CIPP Instance URL**: Your CIPP deployment URL (e.g., `https://cipp.yourdomain.com`)
   - **Azure AD Tenant ID**: The tenant where your CIPP app registration lives
   - **Application (Client) ID**: From your Azure AD app registration
   - **Client Secret**: Generated from your app registration

For detailed authentication setup, see the [CIPP API Documentation](https://docs.cipp.app/api-documentation/setup-and-authentication).

## Resources & Operations

| Resource           | Operations                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tenant**         | Get Many, Get Licenses, Get CSP Licenses, CSP License Action, Clear Cache                                                                                     |
| **User**           | Get Many, Add, Disable, Enable, Reset Password, Reset MFA, Revoke Sessions, Remove, Create TAP, Set Per-User MFA, Send MFA Push, Clear Immutable ID, Offboard |
| **Group**          | Add, Edit Members, Delete, Hide from GAL, Set Delivery Management, Get Many                                                                                   |
| **Device**         | Get Many, Manage, Execute Action, Get Recovery Key, Get LAPS Password                                                                                         |
| **Autopilot**      | Get Many, Assign, Remove, Sync, Sync DEP (ABM), Get Configurations                                                                                            |
| **Mailbox**        | Convert, Enable Archive, Set Out of Office, Set Email Forwarding                                                                                              |
| **Alert**          | Add, Get Many, Get Security Alerts, Get Security Incidents, Set Alert Status, Set Incident Status                                                             |
| **Application**    | Get Many, Assign, Remove, Add WinGet/Store/Chocolatey/MSP/Office Apps                                                                                         |
| **Team**           | Add, Get Many, Get Sites, Get Activity, Manage Site Members/Permissions                                                                                       |
| **Teams Shift**    | List/Create/Update/Delete Shifts, Open Shifts, Scheduling Groups, Time Off Reasons; List/Create/Approve/Decline Time Off, Swap Shift & Offer Shift Requests   |
| **Voice**          | Get Phone Numbers, Get Locations, Assign/Unassign Numbers                                                                                                     |
| **Scheduled Item** | Add, Get Many, Remove                                                                                                                                         |
| **Backup**         | Get Many, Run, Restore, Set Auto-Backup                                                                                                                       |
| **CIPP v10.5**     | Purview compliance policy/SIT/sensitivity label actions, enrollment profile actions, mailbox restore/CAS/HVE reports, alert snoozing, package tags, license reports |
| **CIPP v10.6**     | Copilot/Shadow AI settings and reports, SharePoint sharing/recovery/permissions, CVE exceptions, audit coverage, Agent 365, GDAP repair, and Intune policy cloning |
| **Tools**          | Breach Search (Account/Tenant), Exec Graph Request, Graph Request (List), Graph Request (Exec)                                                                |

## Example Usage

### List All Tenants

```
Resource: Tenant
Operation: Get Many
Return All: true
```

### List Users with Sign-In Activity

```
Resource: User
Operation: Get Many
Tenant: Select from dropdown
Fields to Return: Display Name, User Principal Name, Mail, Sign-In Activity
Return All: true
```

### Create a New User

```
Resource: User
Operation: Add
Tenant: Select from dropdown
First Name: John
Last Name: Doe
Domain: contoso.com
```

### Execute Device Action

```
Resource: Device
Operation: Execute Action
Tenant: Select from dropdown
Device ID: <device-guid>
Action: SyncDevice
```

### Custom Graph Request

```
Resource: Tools
Operation: Graph Request (List)
Tenant: Select from dropdown
Endpoint: users
$select: id,displayName,userPrincipalName
$filter: startsWith(displayName,'John')
```

OData parameters may be entered in the dedicated Options fields or directly in the endpoint, such as `users?$filter=accountEnabled eq true&$select=id,displayName&$top=5`. Dedicated fields take precedence when both are supplied. By default the operation requests one Graph page with a 60-second timeout. Enable **Return All** to follow CIPP's manual pagination cursor with a 25-page safety cap (configurable up to 100) and one 120-second deadline for the whole operation. Continuation calls pass CIPP the exact absolute Microsoft Graph `nextLink`; repeated cursors, repeated page content, invalid cursor hosts, and overlong pagination all fail safely instead of hanging a worker.

### CIPP v10.5 APIs

```
Resource: CIPP v10.5
Operation: List Licenses Report
Tenant: Select from dropdown
Return All: true
```

Complex CIPP v10.5 create/edit/action operations use a validated JSON body so requests can match CIPP's current API fields without the node guessing incomplete schemas. The node only allows the enumerated CIPP v10.5 endpoints, validates query/body JSON objects, and enforces a maximum serialized body size.

### CIPP v10.6 APIs

```
Resource: CIPP v10.6
Operation: List Copilot Usage
Tenant: Select from dropdown
Return All: true
```

CIPP v10.6 actions provide typed fields for Copilot settings, Shadow AI sanctions, CVE exceptions, and common SharePoint management operations. Advanced Body Overrides can supply additional CIPP request fields when needed. This resource requires CIPP v10.6.0 or newer and the permissions introduced by that release.

### Teams Shifts (Dedicated Resource)

```
Resource: Teams Shift
Operation: List Shifts
Tenant: Select from dropdown
Team ID: <team-guid>
Filters → Start Date: 2024-03-01T00:00:00Z
Filters → End Date: 2024-03-31T23:59:59Z
```

```
Resource: Teams Shift
Operation: Create Shift
Tenant: Select from dropdown
Team ID: <team-guid>
User ID: <aad-user-id>
Start Date Time: 2024-03-15T08:00:00Z
End Date Time: 2024-03-15T16:00:00Z
Options → Display Name: Morning Shift
Options → Theme: blue
```

> ⚠️ **CIPP-API Requirement**: The Teams Shift resource and the Exec Graph Request tool both use `POST /api/ExecGraphRequest`, which is **not part of the standard CIPP API**. You must be running a custom fork of [CIPP-API](https://github.com/KelvinTegelaar/CIPP-API) that exposes the `ExecGraphRequest` endpoint. Without this, all Teams Shift operations and the Exec Graph Request tool will return a 404 or 400 error.
>
> If your fork uses a different route name (e.g., `/api/GraphRequest`), the `Graph Request (Exec)` tool has a built-in fallback. The dedicated Teams Shift resource does not — it expects `/api/ExecGraphRequest` to exist.

### Graph Request (Exec) — Raw Graph Calls

```
Resource: Tools
Operation: Graph Request (Exec)
Tenant: Select from dropdown
Endpoint: teams/<team-id>/schedule/shifts
Method: POST
Body: {"userId":"<aad-user-id>","schedulingGroupId":"<group-id>","sharedShift":{...}}
```

Notes:

- `Graph Request (Exec)` sends a `POST` to `/api/ExecGraphRequest` and falls back to `/api/GraphRequest` if your fork uses that route name.
- By default, client-side validation requires endpoints matching `teams/{id}/schedule/*` (can be disabled in `Exec Options`).

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Lint
npm run lint

# Link for local testing
npm link
```

## Links

- [CIPP.app](https://cipp.app)
- [CIPP Documentation](https://docs.cipp.app)
- [CIPP API Endpoints](https://docs.cipp.app/api-documentation/endpoints/)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)

## Acknowledgements

Expanded operation coverage, modular handlers, composite workflows, and AI-tool support were adapted from [Max Soukhomlinov's n8n-nodes-cipp-advanced](https://github.com/msoukhomlinov/n8n-nodes-cipp-advanced), an MIT-licensed rewrite originally based on this project.

## License

MIT
