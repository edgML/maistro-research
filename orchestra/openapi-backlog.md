---
title: OpenAPI spec backlog
description: Known gaps in the published OpenAPI spec versus narrative docs and backend improvements
keywords: [OpenAPI, backlog, spec, documentation gaps]
---

The public HTTP API is described by OpenAPI specs fetched into `docs/public/openapi.json` (v3.1) and `docs/public/openapi-v3.json` (v3.0) by `docs/scripts/fetch-openapi.mjs`. This page tracks **what the spec does not fully carry** and whether fixes belong to the **platform/OpenAPI source** or **documentation only**.

## Maintainer reference

Detailed pipeline notes, Fumadocs customization, and known rendering quirks live in the repository at `docs/.claude/context/api-reference.md` (not duplicated here).

## Backend / OpenAPI source (outside this repo)

These improvements require changes to the **published spec** or API implementation:

| Gap | Impact | Suggested direction |
|-----|--------|---------------------|
| Empty or minimal `info.description` (historical) | Harder onboarding from spec alone | Rich overview + links in `info` |
| Missing **response examples** on operations | Playground and docs less illustrative | Add examples per major routes |
| Inconsistent **`deprecated`** vs required fields with confusing names | SDK generators and readers misinterpret | Align JSON Schema and OpenAPI `deprecated` flag |
| Internal endpoints in raw spec | Noise in public docs | Continue filtering in `fetch-openapi.mjs` (already strips many CLI/Admin paths) |

## This repository (docs-only)

| Action | Owner |
|--------|--------|
| Narrative **API design** pages (this section) | Docs PRs |
| **fetch-openapi.mjs** filters (tags, paths, `operationId` cleanup) | Docs repo |
| **SDK–API mapping** updates | SDK + docs when surfaces change |
| Linking to [Authentication](/reference/authentication), [Errors](/reference/errors), [Rate limits](/reference/rate-limits) | Docs |

## Filtering script (`fetch-openapi.mjs`)

The fetch script removes certain paths and tags (e.g. CLI, Admin, Profiling) so Fumadocs sidebars stay usable. When new internal tags appear, **reconcile filters** in the script and document why endpoints are hidden.

## Related: scripts README

See `docs/scripts/README.md` for environment variables (`OPENAPI_SPEC_URL`, staging URLs) and the rationale for filtering duplicate tags.
