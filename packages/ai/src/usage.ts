/**
 * Uso de tokens num formato único, independente do provedor.
 *
 * No AI SDK 7, `usage` soma todos os passos de uma chamada com ferramentas,
 * e o detalhe de cache fica em `inputTokenDetails` (cacheReadTokens,
 * cacheWriteTokens, noCacheTokens). O tipo abaixo é estrutural de propósito:
 * aceita o objeto do SDK sem acoplar este arquivo à versão dele.
 */
export interface NormalizedUsage {
  /** Total de tokens de entrada (com e sem cache). */
  inputTokens: number
  /** Entrada cobrada pelo preço cheio. */
  uncachedInputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  outputTokens: number
}

export interface UsageLike {
  inputTokens?: number
  outputTokens?: number
  inputTokenDetails?: {
    noCacheTokens?: number
    cacheReadTokens?: number
    cacheWriteTokens?: number
  }
}

const n = (value: number | undefined) => (Number.isFinite(value) ? Math.max(0, value as number) : 0)

export function normalizeUsage(usage?: UsageLike | null): NormalizedUsage {
  const inputTokens = n(usage?.inputTokens)
  const cacheReadTokens = n(usage?.inputTokenDetails?.cacheReadTokens)
  const cacheWriteTokens = n(usage?.inputTokenDetails?.cacheWriteTokens)
  const reported = usage?.inputTokenDetails?.noCacheTokens
  const uncachedInputTokens = Number.isFinite(reported)
    ? n(reported)
    : Math.max(0, inputTokens - cacheReadTokens - cacheWriteTokens)

  return {
    inputTokens,
    uncachedInputTokens,
    cacheReadTokens,
    cacheWriteTokens,
    outputTokens: n(usage?.outputTokens),
  }
}

export function addUsage(a: NormalizedUsage, b: NormalizedUsage): NormalizedUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    uncachedInputTokens: a.uncachedInputTokens + b.uncachedInputTokens,
    cacheReadTokens: a.cacheReadTokens + b.cacheReadTokens,
    cacheWriteTokens: a.cacheWriteTokens + b.cacheWriteTokens,
    outputTokens: a.outputTokens + b.outputTokens,
  }
}
