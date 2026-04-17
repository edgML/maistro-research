# Platform alignment — DDD map vs backend

The public doc **Domain model (DDD)** ([`../content/docs/api-design/domain-model.md`](../content/docs/api-design/domain-model.md)) proposes **bounded contexts** aligned with OpenAPI tags and SDK surfaces. This internal note is for **platform/backend** teams to reconcile that **API-facing** map with actual services, data ownership, and team boundaries.

## When to use this checklist

- Before reorganizing squads or ownership of API surface areas
- After major API version or OpenAPI tag changes
- When onboarding new services that touch tools, sessions, connections, or triggers

## When to refresh (keep aligned with the domain doc)

Re-run this checklist whenever:

- **`docs/public/openapi.json`** changes in a PR that adds/renames tags or large path groups (see `docs/scripts/fetch-openapi.mjs` and [docs-update-data.yml](https://github.com/MaistroHQ/maistro/blob/next/.github/workflows/docs-update-data.yml)).
- **`@maistro/core`** or **`python/maistro`** gains a new top-level namespace on `Maistro` / `HttpClient`.
- The [Domain model](/docs/api-design/domain-model) **revision log** records a structural change—verify backend ownership still matches.

Longer-lived guidance for evolving the DDD page lives under **“Evolution and maintenance”** in [`../content/docs/api-design/domain-model.md`](../content/docs/api-design/domain-model.md). That page also holds **domain** and **entity registries**—when backend ownership or persisted models change, confirm the registries still match reality or update them in the same docs PR.

## Review checklist

Work through with backend leads; capture decisions in ADRs or team runbooks.

1. **Catalog vs runtime**
   - [ ] Are toolkit/tool definition stores and execution workers owned by distinct services? If merged, document why.
   - [ ] Is toolkit versioning enforced at the same boundary as the public API contract?

2. **Tool Router session**
   - [ ] Does session state live in a dedicated service or module? Does it match the `ToolRouterSession` aggregate in the API?
   - [ ] Are session file mounts owned by the same team as session API or file storage?

3. **Connection and trust**
   - [ ] Is OAuth token storage clearly owned by one system? Who is on-call for token refresh failures?
   - [ ] Is `connected_account_id` stable as a cross-context reference everywhere execution runs?

4. **Developer / tenant platform**
   - [ ] Org, project, API keys: single billing/identity service or split? How does that relate to `x-api-key` validation path?

5. **Triggers vs webhooks**
   - [ ] Confirm naming in internal runbooks matches: *trigger instance* (inbound automation) vs *webhook subscription* (outbound to customer URLs).

6. **MCP**
   - [ ] MCP server lifecycle: shared with catalog/runtime or separate deployable? Any divergence from REST tool paths?

7. **Events between contexts**
   - [ ] List the async boundaries (queues, topics) between catalog, runtime, connections, and triggers. Do they match anti-corruption rules in the domain-model doc?

## Outcome

- **Aligned:** Update this file with a one-line pointer to the canonical architecture doc (Confluence/Notion/etc.) if one exists.
- **Gaps found:** File issues or ADRs; optionally update `domain-model.md` caveat section with dated notes.

## Related

- [CODE_REVIEW.md](./CODE_REVIEW.md) — SDK monorepo overview
- `docs/.claude/context/api-reference.md` — OpenAPI docs pipeline
