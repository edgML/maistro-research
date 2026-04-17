---
title: API design overview
description: Deep-dive documentation for the Maistro HTTP API, SDK mapping, and OpenAPI lifecycle
keywords: [API design, OpenAPI, architecture, SDK, Maistro API]
---

This section documents **how** the Maistro platform HTTP API is structured and how official SDKs map to it—not a replacement for the [interactive API reference](/reference/api-reference), which is generated from the OpenAPI spec.

Use these pages when you need:

- A **domain map** of tags, path prefixes, and responsibilities
- **Sequence-level** understanding (tool execution, Tool Router sessions, auth)
- **Contract** notes on errors, versioning, and rate limits with links to reference material
- A **SDK ↔ API** matrix for maintainers debugging drift between `@maistro/core` / Python and the wire format
- **DDD bounded contexts** and ubiquitous language (see [Domain model](/docs/api-design/domain-model))

## How this relates to other docs

| Topic | Where to go |
|-------|-------------|
| Endpoint schemas, try-it playground | [API reference](/reference/api-reference) (v3.1 default) and [v3.0 tree](/reference/v3/api-reference) |
| Product concepts (sessions, meta tools) | [How Maistro works](/docs/how-maistro-works) |
| Auth headers and keys | [Authentication](/reference/authentication) |
| Rate limits | [Rate limits](/reference/rate-limits) |
| Error format | [Errors](/reference/errors) |
| OpenAPI fetch & doc pipeline | Maintainer context in [api-reference.md](https://github.com/MaistroHQ/maistro/blob/next/docs/.claude/context/api-reference.md) (in-repo) |

## Page map

1. [Domain model (DDD)](/docs/api-design/domain-model) — bounded contexts, ubiquitous language, context map
2. [Architecture](/docs/api-design/architecture) — system context, API versions, resource domains, path prefixes
3. [Lifecycles](/docs/api-design/lifecycles) — tool discovery/execution, Tool Router, files, MCP
4. [Contracts](/docs/api-design/contracts) — errors, toolkit/API versioning, links to rate limits
5. [SDK–API mapping](/docs/api-design/sdk-api-mapping) — TypeScript and Python client surfaces → HTTP operations
6. [OpenAPI backlog](/docs/api-design/openapi-backlog) — spec gaps vs narrative-only improvements

The [Domain model](/docs/api-design/domain-model) page includes **Evolution and maintenance**—when and how to update these docs as OpenAPI and SDKs change.

**Maintainers:** Per-domain OpenAPI 3 slices live in [`docs/openapi/domains/`](https://github.com/MaistroHQ/maistro/blob/next/docs/openapi/domains/README.md) (regenerate with `node docs/openapi/domains/generate-domain-openapi.mjs`). Canonical spec remains [`docs/public/openapi.json`](https://github.com/MaistroHQ/maistro/blob/next/docs/public/openapi.json).
