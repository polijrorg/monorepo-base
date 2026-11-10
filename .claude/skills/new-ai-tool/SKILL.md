---
name: new-ai-tool
description: Scaffold a new AI tool (tool calling) for the embedded AI agent, wrapping an existing service with permission checks, risk level, UI label, integration test and eval cases.
argument-hint: <toolName> [--service <path>] [--risk read|write|irreversible]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# New AI Tool

Create a tool the embedded agent can call, following `web/docs/AI.md`. A tool is a thin wrapper around a service that already exists: the AI must never get access that a regular API route would not have.

## Arguments

- `$ARGUMENTS`:
  - Tool name (required), camelCase in Portuguese, verb first: `consultarPedido`, `listarFaturas`, `cancelarReserva`
  - `--service <path>`: service function to wrap (ask if missing)
  - `--risk read|write|irreversible`: default `read`. Anything that changes data is `write`. Sending, deleting, paying or notifying third parties is `irreversible`.

## Steps

1. **Find the service.** Search `web/src/app/(backend)/services/` for the operation. If it does not exist, stop and tell the user to create the route first with `/new-route`. Reuse the route's Zod schema from `web/src/app/(backend)/schemas/` as `inputSchema` when the input matches.

2. **Add the tool** to `web/src/app/(backend)/services/ai/tools/index.ts` using `defineTool` from `@ntec/ai`:
   - `description`: when to use it AND when not to use it, in Portuguese. This is what the model reads to choose.
   - `risk`, plus `readsPrivateData`, `readsUntrustedContent` (text the team does not control: uploaded documents, e-mails, web pages) and `sendsExternally` (anything leaving the system).
   - `execute(input, ctx)`: check permission with `ctx.userId` / `ctx.role` (from the server session). Never trust a user id coming from the model. Throw `ToolError("mensagem segura")` for denials and not-found.
   - Return only the fields the model needs, with Portuguese keys. No internal ids, tokens or timestamps unless needed.
   - Wrap any free text from outside the system with `wrapUntrusted(text, source)`.

3. **Add the UI label** to `web/src/components/ai/toolLabels.ts` (`running`, `done`, and `approval` for write/irreversible tools).

4. **Add integration tests** to `web/tests/integration/api/ai/tools.test.ts`, mocking the service:
   - permission denied for a user without access
   - returned shape (only the expected fields)
   - for write tools: `risk` is not `read`, and the service is called with `ctx.userId`

5. **Add 3 to 5 eval cases** to the relevant `web/tests/evals/*.cases.json` with `expectTool` set to the new tool, including one case where the tool must NOT be used. If fixtures are needed, add them to `web/tests/evals/fixtures.ts` and mock the service in the eval test.

6. Run `pnpm --filter web test` and `pnpm --filter @ntec/ai test`. Remind the user to run `pnpm --filter web test:evals` before merging.

## Never

- Call Prisma directly inside a tool (use services).
- Give one agent a tool that sends data out without approval when it also reads private data and untrusted content (`checkToolset` will block it).
- Mark a data-changing tool as `read` to skip the confirmation step.
