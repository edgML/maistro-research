---
title: API contracts
description: Errors, versioning, authentication headers, and rate limits for Maistro APIs
keywords: [errors, versioning, rate limits, API contract, x-api-key]
---

## Authentication

All API requests must authenticate. The standard pattern is the **`x-api-key`** header (project API key). Organization- and user-level keys are documented on the [Authentication](/reference/authentication) page (`x-org-api-key`, `x-user-api-key` where applicable).

Security schemes in OpenAPI include `ApiKeyAuth`, `UserApiKeyAuth`, and `OrgApiKeyAuth`—see the [API reference](/reference/api-reference) for operation-level requirements.

## Error model

Responses use a shared **`Error`** component in the OpenAPI spec (`#/components/schemas/Error`). Per-endpoint descriptions often carry the most specific failure semantics.

For human-readable guidance and examples, use:

- [Errors](/reference/errors) (current reference tree)
- [v3 Errors](/reference/v3/errors) if you are pinned to the v3.0 URL tree

At build time, the docs UI may hide redundant generic error schema panels; business logic should still rely on **HTTP status** and **response body** fields from the spec.

Categories to expect in integration code:

| Class | Typical meaning |
|-------|-----------------|
| **4xx** | Invalid parameters, missing auth, unknown resource, version mismatch |
| **5xx** | Server or upstream failures—retry with backoff where safe |

## API version vs toolkit version

- **API version (v3.0 vs v3.1):** Chosen by **URL path** (`/api/v3/...` vs `/api/v3.1/...`). The docs site exposes both [v3.1](/reference/api-reference) and [v3.0](/reference/v3/api-reference) reference trees.
- **Toolkit version:** Identifies a **snapshot of integration definitions** for a toolkit (e.g. GitHub). SDKs accept `toolkitVersions` in config and/or per-execute overrides; environment variables like `MAISTRO_TOOLKIT_VERSION_<NAME>` may apply. See [Toolkit versioning](/docs/tools-direct/toolkit-versioning).

Manual `tools.execute` in TypeScript may **require** a concrete toolkit version when the resolved version is `latest`—see SDK error `MaistroToolVersionRequiredError` and the [Tools](/docs/tools-direct/executing-tools) guides.

## Rate limits and quotas

Operational limits are documented for customers here:

- [Rate limits](/reference/rate-limits)
- [v3 Rate limits](/reference/v3/rate-limits)

Keep these pages aligned when platform limits change; this **API design** section does not duplicate numeric limits.

## Pagination and lists

List endpoints (tools, toolkits, connected accounts, etc.) follow query parameters defined per operation in OpenAPI (`cursor`, `limit`, filters). The TypeScript SDK includes pagination helpers in `ts/packages/core/src/utils/pagination.ts` for consumers; wire format remains authoritative in the spec.

## Stability and deprecation

Schema fields may be marked deprecated in OpenAPI; some historical quirks exist where names collide with JSON Schema keywords—see [OpenAPI backlog](/docs/api-design/openapi-backlog) and maintainer notes in `docs/.claude/context/api-reference.md`. For product-facing change communication, use the [changelog](/changelog) and migration guides under [Migration](/docs/migration-guide).
