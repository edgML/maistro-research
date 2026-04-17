/**
 * Regenerates per-domain OpenAPI YAML slices from docs/public/openapi.json.
 * Run from repo root: node docs/openapi/domains/generate-domain-openapi.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OPENAPI = join(__dirname, '../../public/openapi.json');

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

const spec = JSON.parse(readFileSync(OPENAPI, 'utf8'));
const allPaths = spec.paths ?? {};

function emitPathParameters(pathKey) {
  const names = [...pathKey.matchAll(/\{([^}]+)\}/g)].map((x) => x[1]);
  if (!names.length) return '';
  let y = '      parameters:\n';
  for (const name of names) {
    y +=
      `        - name: ${name}\n` +
      `          in: path\n` +
      `          required: true\n` +
      `          schema:\n` +
      `            type: string\n`;
  }
  return y;
}

function emitOp(op, fallbackTags, pathKey) {
  const tags = op?.tags?.length ? op.tags : fallbackTags;
  const summary = (op?.summary || op?.operationId || 'Operation').replace(/\n/g, ' ');
  const tagLines = (tags?.length ? tags : ['API']).map((t) => `        - ${t}\n`).join('');
  return (
    emitPathParameters(pathKey) +
    `      tags:\n${tagLines}` +
    `      summary: ${JSON.stringify(summary)}\n` +
    `      responses:\n` +
    `        '200':\n` +
    `          description: See full operation in docs/public/openapi.json\n`
  );
}

function buildPaths(pathKeys, fallbackTags) {
  let out = '';
  for (const pk of pathKeys) {
    const item = allPaths[pk];
    if (!item) {
      console.warn('Missing path in openapi.json:', pk);
      continue;
    }
    out += `  ${JSON.stringify(pk)}:\n`;
    for (const m of METHODS) {
      if (item[m]) {
        out += `    ${m}:\n`;
        out += emitOp(item[m], fallbackTags, pk);
      }
    }
  }
  return out;
}

function writeSlice({
  slug,
  title,
  description,
  tags,
  pathKeys,
}) {
  const pathsYaml = buildPaths(pathKeys, tags);
  const tagsYaml = tags.map((t) => `  - name: ${JSON.stringify(t)}\n`).join('');
  const securitySchemes = `
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: x-api-key
      description: Project API key authentication
    UserApiKeyAuth:
      type: apiKey
      in: header
      name: x-user-api-key
      description: User API key authentication
    OrgApiKeyAuth:
      type: apiKey
      in: header
      name: x-org-api-key
      description: Organization API key authentication
`;

  const body = `openapi: 3.0.3
info:
  title: ${JSON.stringify(title)}
  description: |
    ${description.trim().split('\n').join('\n    ')}
  version: "1.0.0"
  x-domain-slug: ${JSON.stringify(slug)}
servers:
  - url: https://backend.maistro.dev
    description: Production
tags:
${tagsYaml}
paths:
${pathsYaml}
${securitySchemes}
security:
  - ApiKeyAuth: []
`;

  const file = join(__dirname, `${slug}.openapi.yaml`);
  writeFileSync(file, body, 'utf8');
  console.log('Wrote', file);
}

const v31 = (p) => `/api/v3.1${p}`;

// --- Domain path sets (must exist in filtered openapi.json) ---
writeSlice({
  slug: 'integration-catalog',
  title: 'Maistro API — Integration catalog (domain slice)',
  description: `
    DDD bounded context: **integration-catalog** — tool and toolkit discovery (no execution).
    Curated slice; canonical spec: \`docs/public/openapi.json\`. Not exhaustive.
  `,
  tags: ['Toolkits', 'Tools'],
  pathKeys: [
    v31('/tools'),
    v31('/tools/enum'),
    v31('/tools/{tool_slug}'),
    v31('/toolkits'),
    v31('/toolkits/categories'),
    v31('/toolkits/changelog'),
    v31('/toolkits/multi'),
    v31('/toolkits/{slug}'),
  ],
});

writeSlice({
  slug: 'tool-runtime',
  title: 'Maistro API — Tool runtime (domain slice)',
  description: `
    DDD bounded context: **tool-runtime** — execute, proxy, input, scopes.
    Curated slice; canonical spec: \`docs/public/openapi.json\`.
  `,
  tags: ['Tools'],
  pathKeys: [
    v31('/tools/execute/{tool_slug}'),
    v31('/tools/execute/{tool_slug}/input'),
    v31('/tools/execute/proxy'),
    v31('/tools/scopes/required'),
  ],
});

writeSlice({
  slug: 'agent-session',
  title: 'Maistro API — Agent session / Tool Router (domain slice)',
  description: `
    DDD bounded context: **agent-session** — Tool Router session lifecycle and session-scoped execution.
    Curated slice; canonical spec: \`docs/public/openapi.json\`.
  `,
  tags: ['Tool Router'],
  pathKeys: [
    v31('/tool_router/session'),
    v31('/tool_router/session/{session_id}'),
    v31('/tool_router/session/{session_id}/execute'),
    v31('/tool_router/session/{session_id}/execute_meta'),
    v31('/tool_router/session/{session_id}/link'),
    v31('/tool_router/session/{session_id}/proxy_execute'),
    v31('/tool_router/session/{session_id}/toolkits'),
    v31('/tool_router/session/{session_id}/tools'),
    v31('/tool_router/session/{session_id}/search'),
    v31('/tool_router/session/{session_id}/mounts/{mount_id}/items'),
    v31('/tool_router/session/{session_id}/mounts/{mount_id}/download_url'),
    v31('/tool_router/session/{session_id}/mounts/{mount_id}/upload_url'),
    v31('/tool_router/session/{session_id}/mounts/{mount_id}/delete'),
  ],
});

writeSlice({
  slug: 'connection-trust',
  title: 'Maistro API — Connection and trust (domain slice)',
  description: `
    DDD bounded context: **connection-trust** — auth configs, connected accounts, link flows, auth session info.
    Curated slice; canonical spec: \`docs/public/openapi.json\`.
  `,
  tags: ['Authentication', 'Auth Configs', 'Connected Accounts'],
  pathKeys: [
    v31('/auth/session/info'),
    v31('/auth_configs'),
    v31('/auth_configs/{nanoid}'),
    v31('/auth_configs/{nanoid}/{status}'),
    v31('/connected_accounts'),
    v31('/connected_accounts/{nanoid}'),
    v31('/connected_accounts/{nanoId}/status'),
    v31('/connected_accounts/{nanoid}/refresh'),
    v31('/connected_accounts/link'),
  ],
});

writeSlice({
  slug: 'developer-tenant',
  title: 'Maistro API — Developer and tenant platform (domain slice)',
  description: `
    DDD bounded context: **developer-tenant** — organization and project configuration, usage, API keys.
    Curated slice; canonical spec: \`docs/public/openapi.json\`.
  `,
  tags: ['Organization', 'API Keys', 'Team', 'Payments'],
  pathKeys: [
    v31('/org/usage/summary'),
    v31('/org/project/config'),
    v31('/org/project/usage/summary'),
    v31('/org/owner/project/new'),
    v31('/org/owner/project/list'),
    v31('/org/owner/project/{nano_id}'),
    v31('/org/owner/project/{nano_id}/regenerate_api_key'),
  ],
});

writeSlice({
  slug: 'eventing',
  title: 'Maistro API — Eventing and automation (domain slice)',
  description: `
    DDD bounded context: **eventing** — trigger types and trigger instances.
    Curated slice; canonical spec: \`docs/public/openapi.json\`.
  `,
  tags: ['Triggers'],
  pathKeys: [
    v31('/trigger_instances/{slug}/upsert'),
    v31('/trigger_instances/active'),
    v31('/trigger_instances/manage/{triggerId}'),
    v31('/triggers_types'),
    v31('/triggers_types/list/enum'),
    v31('/triggers_types/{slug}'),
  ],
});

writeSlice({
  slug: 'outbound-webhooks',
  title: 'Maistro API — Outbound webhooks (domain slice)',
  description: `
    DDD bounded context: **outbound-webhooks** — customer webhook subscriptions.
    Curated slice; canonical spec: \`docs/public/openapi.json\`.
  `,
  tags: ['Webhooks'],
  pathKeys: [
    v31('/webhook_subscriptions'),
    v31('/webhook_subscriptions/{id}'),
    v31('/webhook_subscriptions/{id}/rotate_secret'),
    v31('/webhook_subscriptions/event_types'),
  ],
});

writeSlice({
  slug: 'mcp-bridge',
  title: 'Maistro API — MCP bridge (domain slice)',
  description: `
    DDD bounded context: **mcp-bridge** — MCP servers and instances.
    Curated slice; canonical spec: \`docs/public/openapi.json\`.
  `,
  tags: ['MCP', 'MCP Partner'],
  pathKeys: [
    v31('/mcp/servers'),
    v31('/mcp/servers/custom'),
    v31('/mcp/servers/generate'),
    v31('/mcp/{id}'),
    v31('/mcp/app/{appKey}'),
    v31('/mcp/servers/{serverId}/instances'),
    v31('/mcp/servers/{serverId}/instances/{instanceId}'),
  ],
});

writeSlice({
  slug: 'file-delivery',
  title: 'Maistro API — File delivery (domain slice)',
  description: `
    DDD bounded context: **file-delivery** — file list and upload request.
    Curated slice; canonical spec: \`docs/public/openapi.json\`.
  `,
  tags: ['Files'],
  pathKeys: [v31('/files/list'), v31('/files/upload/request')],
});

writeSlice({
  slug: 'platform-supporting',
  title: 'Maistro API — Platform supporting (domain slice)',
  description: `
    DDD bounded context: **platform-supporting** — migration helpers and supporting routes present in filtered spec.
    Curated slice; canonical spec: \`docs/public/openapi.json\`. Logs/OpenAPI meta may be internal-only.
  `,
  tags: ['Migration'],
  pathKeys: [v31('/migration/get-nanoid')],
});

// composition: placeholder — no recipe paths in filtered openapi.json
const compositionBody = `openapi: 3.0.3
info:
  title: "Maistro API — Composition / Recipes (domain slice — placeholder)"
  description: |
    DDD bounded context: **composition** — Recipes (reusable modules combining tools).
    No Recipe routes are present in the current filtered \`docs/public/openapi.json\`.
    This placeholder keeps the domain slice valid; extend when routes are published.
  version: "1.0.0"
  x-domain-slug: composition
servers:
  - url: https://backend.maistro.dev
    description: Production
tags:
  - name: Recipes
    description: Recipe management (placeholder)
  - name: Recipe
    description: Recipe execution (placeholder)
paths:
  "/api/v3.1/recipes/placeholder":
    get:
      tags:
        - Recipes
      summary: "Placeholder — no public Recipe paths in filtered spec yet"
      x-not-implemented-in-slice: true
      responses:
        '501':
          description: Extend this slice when Recipe paths exist in openapi.json
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: x-api-key
      description: Project API key authentication
security:
  - ApiKeyAuth: []
`;

writeFileSync(join(__dirname, 'composition.openapi.yaml'), compositionBody, 'utf8');
console.log('Wrote', join(__dirname, 'composition.openapi.yaml'));

console.log('Done.');
