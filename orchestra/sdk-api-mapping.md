---
title: SDK–API mapping
description: How TypeScript and Python SDK modules map to Maistro HTTP client resources
keywords: [SDK mapping, MaistroClient, HttpClient, OpenAPI]
---

This matrix helps maintainers trace from **public SDK surface** to **generated client** resources. It is derived from `@maistro/core` and `python/maistro` as of the current repository layout; regenerate mentally when new namespaces ship.

## TypeScript (`@maistro/core`)

The `Maistro` class constructs `MaistroClient` from `@maistro/client`. Domain modules call **resource methods** on `this.client`.

| SDK module | `Maistro` property | Representative `client` paths |
|------------|----------------------|-------------------------------|
| `Tools` | `tools` | `client.tools.list`, `retrieve`, `execute`, `proxy`, `getInput`, `retrieveEnum` |
| `Toolkits` | `toolkits` | `client.toolkits.list`, `retrieve`, `retrieveCategories` |
| `AuthConfigs` | `authConfigs` | `client.authConfigs.list`, `create`, `retrieve`, `update`, `delete`, `updateStatus` |
| `ConnectedAccounts` | `connectedAccounts` | `client.connectedAccounts.list`, `create`, `retrieve`, `delete`, `refresh`, `updateStatus`, `patch` |
| Link / OAuth helper | (via `ConnectedAccounts`) | `client.link.create` |
| `Triggers` | `triggers` | `client.triggerInstances.*`, `client.triggersTypes.*` |
| `MCP` | `mcp` | `client.mcp.list`, `retrieve`, `create` (custom), `update`, `delete`, `generate.url` |
| `Files` | `files` | `client.files.*` (used with file utils / presigned flows) |
| `ToolRouter` | `toolRouter`, `create`, `use` | `client.toolRouter.session.create`, `retrieve`, `session.execute`, `proxyExecute`, `session.tools`, `session.search`, `session.toolkits`, `session.link`, `session.executeMeta` |
| Session file mounts | `ToolRouterSession` helpers | `client.toolRouter.session.files.list`, `createUploadURL`, `createDownloadURL`, `delete` |
| `CustomTools` | under tools | `client.toolkits.retrieve`, `client.connectedAccounts.list`, `client.tools.proxy` |
| Internal / realtime | services | `client.request` for specialized routes |

**Source files:** `ts/packages/core/src/models/*.ts`, `ts/packages/core/src/maistro.ts`.

## Python (`maistro`)

The `Maistro` class builds `HttpClient` (`maistro.client.HttpClient`), a generated sibling to the TS client (Stainless-style naming in comments).

| SDK module | `Maistro` attribute | Representative `_client` paths |
|------------|----------------------|--------------------------------|
| `Tools` | `tools` | `_client.tools.list`, `retrieve`, `execute`, `proxy`; `_client.tool_router.session.tools`, `execute_meta` |
| `Toolkits` | `toolkits` | `_client.toolkits.list`, `retrieve`, `retrieve_categories`; uses `_client.auth_configs` for related flows |
| `AuthConfigs` | `auth_configs` | `_client.auth_configs.list`, `create`, etc. |
| `ConnectedAccounts` | `connected_accounts` | `_client.connected_accounts.*`, `_client.link.create` |
| `Triggers` | `triggers` | Trigger types and instances per `triggers.py` models |
| `MCP` | `mcp` | `_client.mcp.*` |
| `ToolRouter` | `tool_router`, `create`, `use` | `_client.tool_router.session.create`, `retrieve`, session execute/search/toolkits |
| Session files | `tool_router_session_files` | `_client.tool_router.session.files.*` |

**Source files:** `python/maistro/sdk.py`, `python/maistro/core/models/tools.py`, `tool_router.py`, `connected_accounts.py`, etc.

## Parity notes

- Both SDKs target the **same REST API**. Naming differs (`authConfigs` vs `auth_configs`) due to language conventions.
- **Not every OpenAPI operation** has a first-class SDK wrapper; some are accessed via low-level `client.request` (TS) or reserved for CLI/dashboard.
- When OpenAPI adds a tag or path, update this table in the same PR or file a docs follow-up.
