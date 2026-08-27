# Changelog

## 0.1.6

- Removed the Graph-only `timeout` and `abortSignal` options passed into n8n's HTTP helper; the same `/api/ListGraphRequest` request completes through the generic CIPP API Request path without those transport controls.
- Kept Graph operations bounded with standalone outer deadlines: 60 seconds for one-page requests and one shared 120-second deadline for Return All.
- Applied the same transport fix to the regular CIPP node and CIPP.app AI Tools node without changing the CIPP pagination flags or cursor contract.
- Added an exact 56-item `{ Results, Metadata }` collection regression that asserts one request, complete output, and immediate termination.
- Added request-shape coverage proving Graph calls no longer pass `timeout` or `abortSignal`, while permanently pending requests still fail through the outer deadline.

## 0.1.5

- Replaced CIPP's unbounded native Return All path with bounded manual pagination shared by the regular node and AI tool.
- Every page explicitly uses `manualPagination=true` and `NoPagination=true`; continuation requests pass the exact absolute Microsoft Graph `nextLink` without duplicating the original OData query.
- Pagination now stops immediately when `nextLink` is absent and rejects repeated cursors, repeated page content, non-Microsoft Graph cursor URLs, and requests beyond the configurable 25-page default (maximum 100).
- Applied one 120-second deadline to the entire pagination operation, including authentication, instead of resetting the timeout for every page.
- Added request-aware two-page regressions that only return page two when the exact cursor is submitted, plus termination, progress, cap, queued-response, and pending-request coverage.

## 0.1.4

- Removed the duplicate n8n-side `@odata.nextLink` loop that could repeatedly request page one against older or diverged CIPP forks.
- Return All now delegates pagination to CIPP's native Graph pager in one API call with a 120-second deadline.
- One-page mode now sends only `NoPagination=true` and never follows a returned cursor.
- Return All fails clearly if the CIPP backend returns a leftover `nextLink`, preventing silent truncation or an unbounded client loop.
- Added coverage for the native one-call contract in both the regular node and AI tool paths.

## 0.1.3

- Fixed package-wide node loading failures caused by n8n installations that omitted Zod's CommonJS entry file.
- Removed the package-local Zod runtime dependency; AI tool schemas are now built directly with n8n's own Zod instance.
- Added a release regression test that loads the package root and both published node entry points with package-local Zod unavailable.

## 0.1.2

- Fixed the remaining CIPP pagination compatibility failure by sending both `manualPagination=true` and `NoPagination=true` for every page request.
- Added an abortable Promise deadline around Graph requests, ensuring a non-returning CIPP request fails after 60 seconds even if n8n's HTTP timeout does not settle the underlying helper.
- Added regression coverage for a permanently pending HTTP helper and explicit one-page flags on initial and continuation requests.

## 0.1.1

- Fixed Graph Request collection calls hanging inside CIPP pagination by using the manual one-page contract for every request.
- Added a 60-second timeout for each Graph Request page.
- Added repeated-`nextLink` detection so a non-advancing cursor fails after the second response instead of looping.
- Added end-to-end regular-node and AI-tool regression coverage for one-page requests, OData parameters, repeated cursors, and max-page termination.

## 0.1.0

- Expanded the regular CIPP.app node to 631 operations while preserving existing operation values and payload handlers.
- Added coverage for CIPP Admin, CIPP Core, contacts, spam filters, and transport resources.
- Added 275 operations across tenant, policy, application, GDAP, alert, Autopilot, mailbox, user, and other existing resources.
- Added five read-only composite workflows: license audit, security posture, BEC investigation, User 360, and cross-tenant sweep.
- Added the CIPP.app AI Tools node with 480 operations across 29 resources for n8n AI Agent and MCP Trigger workflows.
- Kept AI write operations disabled by default and enforced the write gate at selection and execution time.
- Expanded user-offboarding options and payload normalization.
- Retained all 28 Teams Shifts operations backed by `ExecGraphRequest`.
- Fixed Graph Request so OData parameters embedded in the endpoint are preserved, including `$filter`, `$select`, `$top`, `$orderby`, `$search`, `$count`, `$expand`, and `$format`.
- Added explicit one-page and Return All modes for Graph Request, with `@odata.nextLink` pagination and a configurable max-pages safety cap.

A huge thank-you to Max Soukhomlinov for creating and open-sourcing `n8n-nodes-cipp-advanced`. His work provided the foundation for many of the expanded handlers and AI tools in this release, and we are deeply grateful that he shared it with the community under the MIT license. What a beast!
