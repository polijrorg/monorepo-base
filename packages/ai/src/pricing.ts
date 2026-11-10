import type { NormalizedUsage } from './usage'

/**
 * Tabela de preços de lista, em US$ por 1 milhão de tokens.
 * Fonte: páginas oficiais de preço lidas em PRICES_AS_OF.
 * Serve para estimar o custo por interação e alimentar o limite de
 * orçamento. A fatura real vem do provedor (ou do AI Gateway).
 *
 * Ao trocar um modelo em models.ts, acrescente o preço dele aqui:
 * modelo sem preço é registrado com custo `null` e aparece no relatório.
 */
export const PRICES_AS_OF = '2026-11-09'

export interface ModelPrice {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

export const PRICES: Record<string, ModelPrice> = {
  // Haiku 5.5: preço válido para prompts de até 100 mil tokens.
  // Acima disso ele fica 5x mais caro (US$ 0,50 / 2,50); mantenha o contexto enxuto.
  'anthropic/claude-haiku-5.5': { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 },
  'anthropic/claude-sonnet-5.5': { input: 2, output: 10, cacheRead: 0.1, cacheWrite: 2.5 },
  'anthropic/claude-opus-5.5': { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
  'openai/text-embedding-3-small': { input: 0.02, output: 0, cacheRead: 0, cacheWrite: 0 },
}

const PER_MILLION = 1_000_000

/** Estima o custo em US$. Retorna `null` se o modelo não estiver na tabela. */
export function estimateCostUsd(
  modelId: string,
  usage: NormalizedUsage,
  prices: Record<string, ModelPrice> = PRICES,
): number | null {
  const price = prices[modelId]
  if (!price) return null

  const cost =
    (usage.uncachedInputTokens * price.input +
      usage.cacheReadTokens * price.cacheRead +
      usage.cacheWriteTokens * price.cacheWrite +
      usage.outputTokens * price.output) /
    PER_MILLION

  // Arredonda para 6 casas (milionésimo de dólar) para não acumular ruído.
  return Math.round(cost * 1e6) / 1e6
}
