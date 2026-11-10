import { writeFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { defaultGraders, evalReportToMarkdown, evalSuiteSchema, runEvals, type TelemetrySink } from "@ntec/ai";
import { fixtureSearch, fixtureUsers } from "./fixtures";
import suiteFile from "./assistente.cases.json";

// Ferramentas leem dados fixos; o modelo é o real (via AI Gateway).
vi.mock("@/backend/services/users", () => ({
  getAllUsers: async () => fixtureUsers,
  updateUser: async () => {
    throw new Error("Nas evals, nenhuma escrita pode executar sem aprovação.");
  },
}));
vi.mock("@/backend/services/ai/rag", () => ({
  searchDocuments: async (_ctx: unknown, query: string) => fixtureSearch(query),
}));
vi.mock("@/backend/services/ai/telemetry", () => ({ prismaTelemetry: { record: async () => {} } }));

import { answerOnce } from "@/backend/services/ai/assistant";

const hasKey = Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
const silentTelemetry: TelemetrySink = { record: async () => {} };

describe.skipIf(!hasKey)("evals: assistente", () => {
  it("atinge a meta de acerto acordada com o cliente", async () => {
    const suite = evalSuiteSchema.parse(suiteFile);
    const trials = Number(process.env.AI_EVALS_TRIALS ?? 1);

    const report = await runEvals({
      name: suite.name,
      target: suite.target,
      cases: suite.cases,
      trials,
      concurrency: 2,
      graders: defaultGraders,
      task: async (evalCase) => {
        const result = await answerOnce({
          user: { id: "u-ana", role: "ADMIN" },
          prompt: evalCase.input,
          telemetry: silentTelemetry,
        });
        // ferramenta que pediu aprovação conta como "chamada" (o modelo escolheu certo)
        const pending = result.pendingApprovals.map((toolName) => ({ toolName, input: null }));
        return { text: result.text, toolCalls: [...result.toolCalls, ...pending], costUsd: result.costUsd };
      },
    });

    const markdown = evalReportToMarkdown(report);
    await writeFile("tests/evals/report.md", markdown);
    console.info(markdown);

    expect(report.passRate).toBeGreaterThanOrEqual(suite.target);
  });
});
