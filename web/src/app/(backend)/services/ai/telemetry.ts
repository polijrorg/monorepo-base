import prisma from "@/backend/services/db";
import { budgetPolicyFromEnv, checkBudget, type BudgetStore, type TelemetrySink } from "@ntec/ai";

/** Grava cada chamada de IA na coleção ai_call. */
export const prismaTelemetry: TelemetrySink = {
  async record(call) {
    await prisma.aiCall.create({
      data: {
        userId: call.userId,
        feature: call.feature,
        model: call.model,
        promptVersion: call.promptVersion,
        conversationId: call.conversationId,
        inputTokens: call.usage.inputTokens,
        uncachedInputTokens: call.usage.uncachedInputTokens,
        cacheReadTokens: call.usage.cacheReadTokens,
        cacheWriteTokens: call.usage.cacheWriteTokens,
        outputTokens: call.usage.outputTokens,
        costUsd: call.costUsd,
        latencyMs: call.latencyMs,
        steps: call.steps,
        toolNames: call.toolNames ?? [],
        finishReason: call.finishReason,
        error: call.error,
      },
    });
  },
};

const budgetStore: BudgetStore = {
  async costSince(userId, since) {
    const result = await prisma.aiCall.aggregate({
      _sum: { costUsd: true },
      where: { userId, createdAt: { gte: since } },
    });
    return result._sum.costUsd ?? 0;
  },
};

export function checkUserBudget(userId: string) {
  return checkBudget(budgetStore, userId, budgetPolicyFromEnv());
}
