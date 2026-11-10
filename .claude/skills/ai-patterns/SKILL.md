---
name: ai-patterns
description: This skill should be used when the user asks to add or change an AI feature, LLM call, agent, chatbot, assistant, tool calling, RAG, embeddings, structured extraction, prompt, eval or anything that imports from "ai", "@ai-sdk/*" or "@ntec/ai". Provides the embedded-AI patterns of this monorepo.
version: 1.0.0
---

# Embedded AI Patterns

Apply whenever touching AI code. Full guide: `web/docs/AI.md`.

## Non-negotiable rules

1. **Use `@ntec/ai`**, not raw `streamText`/`generateText`, in app code: `streamAgent` for chat, `runAgent` for non-interactive runs, `extractStructured` for extraction. They add fallback, caching, approval, limits and telemetry.
2. **Models by alias** (`fast`, `smart`). Never hardcode a model id outside `packages/ai/src/models.ts`. New model → add its price to `pricing.ts`.
3. **Tools wrap services** and check permission with the server `ctx`. See `/new-ai-tool`.
4. **Write and irreversible tools require user approval** (`risk: 'write' | 'irreversible'`). Never downgrade a risk to skip it.
5. **Every AI route** follows the backend pattern: `getUserFromRequest` → Zod schema → `checkUserInput` → `checkUserBudget` → service.
6. **Prompts live in `services/ai/prompts/`** with a version constant. Any change to the text bumps the version.
7. **RAG queries always pass a permission `scope`** (`ownerId`/`tenantId`) from the server context.
8. **Untrusted text** (documents, e-mails, web) goes through `wrapUntrusted` before reaching the model.
9. **Tests:** integration tests use fake models from `@ntec/ai/testing` (free, deterministic). Quality is measured by evals in `web/tests/evals/` against the real model.
10. **Any change to prompt, tools or model** requires running `pnpm --filter web test:evals` and attaching the report to the PR.

## Choosing the approach

| Need | Use |
|---|---|
| Turn a document/e-mail into fields | `extractStructured` with model `fast` |
| Classify or route (ticket, request) | `extractStructured` with an enum schema |
| Answer questions about documents | agent + `buscarDocumentos`-style RAG tool |
| Act on the system via chat | agent + service-backed tools, writes with approval |
| Forecast, score, recommend from historical data, fine-tune | Not this template: data work (NDados) |

Prefer a fixed workflow (one LLM call at a defined point) over an autonomous agent whenever it solves the problem.

## Never

- Send a `system` role message from the client or enable `allowSystemInMessages`.
- Store conversation text in telemetry.
- Put API keys in the client or in `NEXT_PUBLIC_*` variables.
- Use AI for decisions about credit, hiring, health, academic selection or benefits.
