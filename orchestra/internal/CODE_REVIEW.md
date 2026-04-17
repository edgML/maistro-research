# Maistro SDK monorepo — code review notes

This document captures a structured review of the Maistro SDK repository (TypeScript and Python clients, CLI, docs, and tests). It is intended for onboarding and PR review context, not as an audit sign-off.

For a **published** deep-dive on HTTP API domains, lifecycles, contracts, and SDK–OpenAPI mapping, see the docs site section **API design** (`content/docs/api-design/`, routes `/docs/api-design/...`).

## 1. Scope

| Area | Location | Notes |
|------|----------|--------|
| TypeScript SDK | `ts/packages/core`, `ts/packages/providers/*` | Primary development surface |
| Python SDK | `python/maistro`, `python/providers/*` | Parallel API surface; separate HTTP client |
| CLI | `ts/packages/cli`, `ts/packages/cli-keyring` | Effect-based; binary CI |
| Tooling | `ts/packages/json-schema-to-zod`, `ts/packages/ts-builders` | Schema/codegen support |
| Docs | `docs/` | Fumadocs; generated SDK reference |
| CI | `.github/workflows/` | Build, test, e2e, releases |

**Out of scope for this repo:** Maistro backend service implementation (API server, workers, OAuth broker). This repository contains **clients** that call the hosted HTTP API.

## 2. Architecture summary

- **Remote boundary:** Both SDKs authenticate with `MAISTRO_API_KEY` and call the Maistro API (default base URL `https://backend.maistro.dev` in TS via `DEFAULT_BASE_URL` in `ts/packages/core/src/utils/constants.ts`).
- **TypeScript:** `Maistro` (`ts/packages/core/src/maistro.ts`) constructs `MaistroClient` from `@maistro/client`, then attaches domain modules: `tools`, `mcp`, `toolkits`, `triggers`, `authConfigs`, `files`, `connectedAccounts`, `toolRouter`, with `create` / `use` bound to the tool router.
- **Python:** `Maistro` (`python/maistro/sdk.py`) builds `HttpClient` with similar namespaces (`tools`, `toolkits`, `triggers`, `auth_configs`, `connected_accounts`, `mcp`, `tool_router`, `create` / `use`).
- **Providers:** Map Maistro tool definitions to framework-specific shapes (OpenAI, Anthropic, LangChain, etc.). TS default provider lives in core (`OpenAIProvider`); separate npm packages extend or re-export. Python mirrors with `maistro-*` PyPI packages.

## 3. Strengths

1. **Clear layering:** Core client → models (`Tools`, `Toolkits`, …) → provider adapters keeps framework concerns out of raw HTTP details.
2. **Explicit API versioning for execution:** TS `tools.execute` path enforces toolkit version when resolving to `latest` (`MaistroToolVersionRequiredError`), steering production use toward pinned versions.
3. **Cross-runtime coverage:** E2E tests exercise Node (multiple versions), Deno, Cloudflare Workers, and CLI in Docker-isolated jobs (`.github/workflows/ts.test-e2e.yml`), which reduces “works on my machine” drift.
4. **Monorepo discipline:** pnpm workspaces + Turbo (`turbo.jsonc`), Changesets for TS releases, documented env vars and commands in `AGENTS.md`.
5. **Documentation pipeline:** SDK reference generation from TS JSDoc and Python docstrings (`docs/.claude/context/sdk-reference.md`) keeps docs tied to source.

## 4. Review findings and recommendations

### 4.1 Consistency across languages

- **Finding:** Provider and feature coverage differs between TS and Python (see root `README.md` matrix). This is product-intentional but easy to miss in PRs that only touch one SDK.
- **Recommendation:** For changes that affect public API behavior, confirm whether the sibling SDK, docs, and changelog need updates in the same release train.

### 4.2 Secrets and CI

- **Finding:** E2E workflows require `MAISTRO_API_KEY`, `MAISTRO_USER_API_KEY`, and `OPENAI_API_KEY`. Fork PRs cannot use repository secrets the same way as maintainers.
- **Recommendation:** Document expected CI behavior for external contributors (skipped or limited jobs) in `CONTRIBUTING.md` if not already present.

### 4.3 Client duplication

- **Finding:** TS uses `@maistro/client` (generated); Python uses `HttpClient` in `maistro.client`. Behavior should align at the API contract level, but implementation is not shared source code.
- **Recommendation:** When fixing request/response handling bugs, verify whether both clients need parallel fixes and add regression tests on the affected side.

### 4.4 Vendor submodules

- **Finding:** `ts/vendor/` is documented as read-only reference (`AGENTS.md`).
- **Recommendation:** Avoid drive-by edits; treat updates as intentional dependency bumps with full test runs.

### 4.5 Telemetry and privacy

- **Finding:** TS `Maistro` initializes telemetry when `allowTracking` is true; env `MAISTRO_DISABLE_TELEMETRY` is documented in `AGENTS.md`.
- **Recommendation:** PRs that touch telemetry or default opt-in/out should be reviewed for user-visible behavior and docs updates.

## 5. What to verify in a typical SDK PR

1. **Types and exports:** Public API changes in `ts/packages/core/src/index.ts` (or package `exports`) and matching consumer packages.
2. **Errors:** New failure modes should use existing error classes in `ts/packages/core/src/errors/` where possible for stable handling.
3. **Tests:** Unit tests in package `test/`; for cross-runtime risk, consider whether e2e under `ts/e2e-tests/` needs a new fixture or matrix entry.
4. **Python parity:** If the change is user-facing, update `python/maistro` or the relevant `python/providers/*` package and pytest coverage where applicable.
5. **Docs:** User-facing behavior changes should propagate to `docs/` or generated reference per `docs/CLAUDE.md` / team process.

## 6. File pointers (quick navigation)

| Topic | Path |
|-------|------|
| TS entry / wiring | `ts/packages/core/src/maistro.ts` |
| Tool execution | `ts/packages/core/src/models/Tools.ts` |
| SDK config / env | `ts/packages/core/src/utils/sdk.ts` |
| Python entry | `python/maistro/sdk.py` |
| Agent onboarding | `AGENTS.md` |
| E2E CI | `.github/workflows/ts.test-e2e.yml` |
| Turbo tasks | `turbo.jsonc` |

## 7. Summary

The repository is a **well-structured dual-SDK monorepo** with strong separation between core domain logic and provider adapters, solid automated testing across runtimes, and clear documentation hooks. Review effort should focus on **cross-language parity**, **API contract stability**, **CI constraints for contributors**, and **telemetry/security** when defaults change.
