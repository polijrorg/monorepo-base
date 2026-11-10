/**
 * Limite de gasto por usuário numa janela móvel de 24 horas.
 * Protege o cliente de custo descontrolado (OWASP LLM10, "Unbounded
 * Consumption"): um loop de agente ou um usuário abusivo não consegue
 * gerar uma fatura surpresa.
 */

export interface BudgetStore {
  /** Soma do custo estimado (US$) do usuário desde `since`. */
  costSince(userId: string, since: Date): Promise<number>
}

export interface BudgetPolicy {
  /** Teto em US$ por usuário a cada 24 horas. `0` ou negativo desliga o limite. */
  dailyUsdPerUser: number
}

export interface BudgetStatus {
  allowed: boolean
  spentUsd: number
  limitUsd: number
  remainingUsd: number
}

const DAY_MS = 24 * 60 * 60 * 1000

export async function checkBudget(
  store: BudgetStore,
  userId: string,
  policy: BudgetPolicy,
  now: Date = new Date(),
): Promise<BudgetStatus> {
  const limitUsd = policy.dailyUsdPerUser
  if (!(limitUsd > 0)) {
    return { allowed: true, spentUsd: 0, limitUsd: Infinity, remainingUsd: Infinity }
  }

  const spentUsd = await store.costSince(userId, new Date(now.getTime() - DAY_MS))
  const remainingUsd = Math.max(0, limitUsd - spentUsd)
  return { allowed: spentUsd < limitUsd, spentUsd, limitUsd, remainingUsd }
}

export function budgetPolicyFromEnv(env: Record<string, string | undefined> = process.env): BudgetPolicy {
  const value = Number(env.AI_DAILY_BUDGET_USD_PER_USER)
  return { dailyUsdPerUser: Number.isFinite(value) ? value : 1 }
}
