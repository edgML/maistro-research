# Per-domain OpenAPI design slices

This directory holds **OpenAPI 3.0.3 YAML files**, one per **DDD bounded context** (domain slug) defined in [`content/docs/api-design/domain-model.md`](../content/docs/api-design/domain-model.md).

## Regenerate from the canonical spec

After `docs/public/openapi.json` changes (e.g. post-`fetch-openapi.mjs`), re-run:

```bash
# from repository root
node docs/openapi/domains/generate-domain-openapi.mjs
```

Then review diffs. The script copies **paths and methods** from the monolith; [`composition.openapi.yaml`](./composition.openapi.yaml) stays a **placeholder** until Recipe routes exist in the filtered spec.

## Purpose

- Give teams a **clear, reviewable slice** of HTTP routes (`paths`) and `tags` aligned with domain ownership.
- Support **evolution**: when the public API changes, update the matching `{slug}.openapi.yaml` in the same PR as [`domain-model.md`](../content/docs/api-design/domain-model.md) (see **Evolution and maintenance** there).

## Canonical spec

The **authoritative** contract for documentation and clients remains:

- [`public/openapi.json`](../public/openapi.json) (v3.1, filtered by [`scripts/fetch-openapi.mjs`](../scripts/fetch-openapi.mjs))

These domain files are **curated subsets** with minimal `responses` blocks—they are **not** a full duplicate of schemas and request bodies. For complete operation definitions, use the monolithic spec or the [API reference](https://docs.maistro.dev/reference/api-reference).

## Files

| File | Domain slug | Notes |
|------|-------------|--------|
| `integration-catalog.openapi.yaml` | `integration-catalog` | Tool and toolkit discovery (GET on `/tools`, `/toolkits`, …) |
| `tool-runtime.openapi.yaml` | `tool-runtime` | Execute, proxy, input, scopes |
| `agent-session.openapi.yaml` | `agent-session` | Tool Router session routes |
| `connection-trust.openapi.yaml` | `connection-trust` | Auth configs, connected accounts, auth session info |
| `developer-tenant.openapi.yaml` | `developer-tenant` | Org and project usage |
| `eventing.openapi.yaml` | `eventing` | Trigger instances and trigger types |
| `outbound-webhooks.openapi.yaml` | `outbound-webhooks` | Webhook subscriptions |
| `mcp-bridge.openapi.yaml` | `mcp-bridge` | MCP servers and instances |
| `file-delivery.openapi.yaml` | `file-delivery` | File list and upload request |
| `composition.openapi.yaml` | `composition` | Placeholder until Recipe routes appear in filtered public spec |
| `platform-supporting.openapi.yaml` | `platform-supporting` | Migration and other supporting routes |

Each file sets `x-domain-slug` to match the registry.

## Drift

Domain slices can fall behind `openapi.json`. When bumping or regenerating the public spec, diff paths under `/api/v3.1` and update the relevant YAML files. Optionally run a validator:

```bash
npx --yes @redocly/cli lint docs/openapi/domains/*.openapi.yaml
```

## Recipes / composition

The filtered [`openapi.json`](../public/openapi.json) may not include Recipe paths. [`composition.openapi.yaml`](./composition.openapi.yaml) documents a **placeholder** until those routes are published in the spec consumers use.
