---
name: setup
description: Initialize this monorepo template for a new project. Prompts for project name, description, target scope (web or web + mobile), and optional integrations. Updates CLAUDE.md and CI/CD workflows accordingly.
argument-hint: [project-name]
allowed-tools: [Read, Edit, Write, Bash, Glob, AskUserQuestion]
---

# Project Setup Wizard

You are initializing the NTec monorepo template for a new project. Guide the user through configuration step by step, then apply all changes.

---

## Step 0 — Present what this template offers

Before asking anything, show the user a summary of what's available in this template:

```
NTec Monorepo Template
══════════════════════════════════════════════════

Stack
  web/    Next.js 16 App Router · Prisma/MongoDB · Better Auth · shadcn/ui · Tailwind 4
  mobile/ Expo 55 · React Native · NativeWind · Expo Router   (optional scope)
  CI/CD   GitHub Actions (lint · typecheck · tests · e2e · EAS build/deploy)
  IA      packages/ai · AI SDK 7 · agentes, RAG, evals, guardrails   (opcional)

Agents  (invoke with /agent:name — specializados em Next.js)
  frontend  → componentes, shadcn/ui, SWR, estrutura de páginas
  backend   → controller/service/schema, Better Auth, Prisma, Zod
  security  → auditoria de auth, OWASP, revisão de rotas
  ai        → recursos de IA embarcada: ferramentas, RAG, extração, evals (se IA ativa)

Skills — scaffolding  (slash commands)
  /new-route  <recurso>          scaffolda route.ts + services/ + schema.ts + teste
  /new-page   <nome> [--flags]   scaffolda página Next.js com _components/ e actions/
  /new-screen <nome> [--flags]   scaffolda tela Expo com NativeWind e auth guard
  /check      [web|mobile|all]   lint + tsc antes do push
  /new-ai-tool <nome> [--risk]   ferramenta do agente sobre um service + teste + casos de eval (se IA ativa)

Skills — Caveman  (compressão de tokens ~75%)
  /caveman           ativa modo comprimido (desative: "stop caveman")
  /caveman-commit    commit message convencional sem ruído
  /caveman-compress  comprime arquivos .md e notas de memória
  /caveman-review    review de diff: uma linha por finding
  /cavecrew          subagents comprimidos: investigator · builder · reviewer

Skills automáticas  (Claude ativa sozinho pelo contexto)
  backend-patterns   → ao criar rotas/services
  frontend-patterns  → ao criar componentes/páginas
  security-patterns  → ao tocar auth/env/inputs
  ai-patterns        → ao tocar IA, prompts, ferramentas, RAG ou evals (se IA ativa)

══════════════════════════════════════════════════
```

---

## Step 1 — Gather project information

Ask the user in Brazilian Portuguese (PTBR) (single AskUserQuestion call, multiple questions):

1. **Project name** — used in package.json, CLAUDE.md header, app.json
2. **Short description** — one sentence describing what the app does
3. **Scope** — "web only" or "web + mobile"
4. **Optional integrations** (multi-select):
   - Google OAuth (`GOOGLE_ID` / `GOOGLE_SECRET`)
   - Resend email (`RESEND_API_KEY` / `EMAIL_FROM`)
   - AWS S3 (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` / `AWS_S3_BUCKET`)
   - PostHog analytics (`NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST`)
   - IA embarcada (`AI_GATEWAY_API_KEY`): agentes com ferramentas, extração estruturada, busca em documentos e evals. Marque só se o escopo vendido inclui IA.

---

## Step 2 — Apply changes

### Always (web or web + mobile):

1. **Update `CLAUDE.md`** — replace the template header with project name and description. Keep all architectural patterns intact.

2. **Update `web/package.json`** — set `"name"` to the project slug (lowercase, hyphens).

3. **Update `web/.env.example`** — keep only the env vars for selected integrations:
   - Always include: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
   - Add only selected optional integrations with comments explaining each

4. **Update `web/src/auth.ts`** — uncomment Google OAuth plugin block only if Google OAuth was selected.

5. **Update** — change every noctiluz name or mention and insert the new project name 

### If "IA embarcada" was selected:

Keep everything listed below. Then:
1. Add `AI_GATEWAY_API_KEY` to the GitHub Secrets list printed in Step 3 (used by the evals workflow).
2. Add to `CLAUDE.md`, under Repository Overview: `> **IA embarcada:** ativa. Guia em web/docs/AI.md.`
3. Remind the user that the client must provide 50 to 100 real eval cases by the end of sprint 1 (see web/docs/AI.md, "Evals").

### If "IA embarcada" was NOT selected:

Remove the whole AI layer so the project carries no extra dependency, key or cost:

1. Delete these paths:
   - `packages/ai/`
   - `web/src/app/(backend)/api/ai/`
   - `web/src/app/(backend)/services/ai/`
   - `web/src/app/(backend)/schemas/ai.schema.ts`
   - `web/src/components/ai/`
   - `web/src/app/(frontend)/(user-protected)/assistente/`
   - `web/tests/integration/api/ai/`
   - `web/tests/evals/`
   - `web/vitest.evals.config.ts`
   - `web/scripts/ai-vector-index.mjs`
   - `web/docs/AI.md`
   - `bruno/ai/`
   - `.github/workflows/ci-ai.yml`
   - `.claude/skills/new-ai-tool/`, `.claude/skills/ai-patterns/`, `.claude/agents/ai.md`
2. Remove every block between the markers `>>> IA embarcada` and `<<< IA embarcada` (inclusive) in `web/prisma/schema.prisma` and `web/.env.example`.
3. Remove every line that carries the comment `o /setup remove` in: `pnpm-workspace.yaml` (the comment and the `- packages/*` line), `web/next.config.ts` (the comment and `transpilePackages`), `web/src/proxy.ts` (`/assistente`).
4. In `web/package.json`, remove the dependencies `@ai-sdk/react`, `@ntec/ai` and `ai`, and the scripts `test:evals` and `ai:vector-index`.
5. In `CLAUDE.md`, remove the `## IA embarcada` section, the `packages/ai/` line in Repository Overview and the `web/docs/AI.md` line in Key Docs. In `README.md`, remove the `## IA embarcada` section and its line in the Sumário.
6. Run `pnpm install` to update `pnpm-lock.yaml`, then `pnpm --filter web exec tsc --noEmit` to confirm nothing still imports the removed code.

### If "web only":

5. Rename `.github/workflows/eas.yml` → `.github/workflows/eas.yml.disabled` and add a comment at the top explaining it can be re-enabled if mobile is added later.

6. Add a note to `CLAUDE.md` under Repository Overview:
   ```
   > **Scope:** web only. The `mobile/` directory exists but is not active for this project.
   ```

### If "web + mobile":

5. **Update `mobile/app.json`** — set `name`, `slug` (lowercase-hyphenated), `bundleIdentifier` and `package` to `com.polijr.{slug}`.

6. **Update `mobile/package.json`** — set `"name"` to the project slug.

---

## Step 3 — Report

Print a summary table of what was changed:

```
Setup complete
──────────────────────────────
✓ CLAUDE.md              updated with project context
✓ web/package.json       name: {slug}
✓ web/.env.example       {N} variables configured
✓ mobile/app.json        name: {name}, slug: {slug}    ← if web+mobile
✗ eas.yml                disabled (web only)            ← if web-only
✓ IA embarcada           ativa (packages/ai)            ← if selected
✗ IA embarcada           removida (sem dependências)    ← if not selected
──────────────────────────────
```

Then print the next steps:

```
Next steps
  1. cp web/.env.example web/.env  →  fill in values
  2. pnpm install
  3. pnpm --filter web dev

GitHub Secrets to configure:
  DATABASE_URL · BETTER_AUTH_SECRET
  {list selected optional secrets}
  {if mobile: EXPO_TOKEN · EXPO_ACCOUNT_NAME · GOOGLE_SERVICES_JSON}
```
