import { describe, expect, it } from 'vitest'
import { estimateCostUsd, PRICES } from '../src/pricing'
import { normalizeUsage } from '../src/usage'
import { checkBudget } from '../src/guardrails/budget'
import { gatewayProviderOptions, resolveModel } from '../src/models'

describe('normalizeUsage', () => {
  it('separa entrada com e sem cache a partir do formato do AI SDK 7', () => {
    const usage = normalizeUsage({
      inputTokens: 30_000,
      outputTokens: 1_600,
      inputTokenDetails: { cacheReadTokens: 24_000, cacheWriteTokens: 0 },
    })
    expect(usage.uncachedInputTokens).toBe(6_000)
    expect(usage.cacheReadTokens).toBe(24_000)
    expect(usage.outputTokens).toBe(1_600)
  })

  it('usa noCacheTokens quando o provedor informa', () => {
    const usage = normalizeUsage({ inputTokens: 100, inputTokenDetails: { noCacheTokens: 40, cacheReadTokens: 60 } })
    expect(usage.uncachedInputTokens).toBe(40)
  })

  it('aceita uso ausente', () => {
    expect(normalizeUsage(undefined).inputTokens).toBe(0)
  })
})

describe('estimateCostUsd', () => {
  it('reproduz o exemplo do estudo: interação de agente com Sonnet 5.5 e cache quente (~US$ 0,042)', () => {
    const usage = normalizeUsage({
      inputTokens: 36_000,
      outputTokens: 1_600,
      inputTokenDetails: { cacheReadTokens: 24_000, cacheWriteTokens: 0 },
    })
    expect(estimateCostUsd('anthropic/claude-sonnet-5.5', usage)).toBeCloseTo(0.0424, 4)
  })

  it('retorna null para modelo sem preço na tabela', () => {
    expect(estimateCostUsd('modelo/desconhecido', normalizeUsage({ inputTokens: 10 }))).toBeNull()
  })

  it('tem preço para todos os modelos padrão', () => {
    for (const alias of ['fast', 'smart'] as const) {
      const spec = resolveModel(alias, {})
      expect(PRICES[spec.id], spec.id).toBeDefined()
    }
  })
})

describe('resolveModel', () => {
  it('permite trocar modelo e fallbacks por variável de ambiente', () => {
    const spec = resolveModel('smart', { AI_MODEL_SMART: 'x/y', AI_MODEL_FALLBACKS_SMART: 'a/b, c/d' })
    expect(spec.id).toBe('x/y')
    expect(spec.fallbacks).toEqual(['a/b', 'c/d'])
  })

  it('monta as opções do Gateway com fallback, cache automático e sessão', () => {
    const opts = gatewayProviderOptions(resolveModel('fast', {}), { sessionId: 'conv-1' })
    expect(opts.gateway.caching).toBe('auto')
    expect(opts.gateway.sessionId).toBe('conv-1')
    expect(opts.gateway.models.length).toBeGreaterThan(0)
  })
})

describe('checkBudget', () => {
  const store = (spent: number) => ({ costSince: async () => spent })

  it('bloqueia quando o usuário passou do teto diário', async () => {
    const status = await checkBudget(store(1.2), 'u1', { dailyUsdPerUser: 1 })
    expect(status.allowed).toBe(false)
    expect(status.remainingUsd).toBe(0)
  })

  it('libera abaixo do teto', async () => {
    const status = await checkBudget(store(0.3), 'u1', { dailyUsdPerUser: 1 })
    expect(status.allowed).toBe(true)
    expect(status.remainingUsd).toBeCloseTo(0.7)
  })

  it('teto zero desliga o limite', async () => {
    expect((await checkBudget(store(999), 'u1', { dailyUsdPerUser: 0 })).allowed).toBe(true)
  })

  it('consulta só as últimas 24 horas', async () => {
    let since: Date | undefined
    const now = new Date('2026-11-10T12:00:00Z')
    await checkBudget({ costSince: async (_u, s) => ((since = s), 0) }, 'u1', { dailyUsdPerUser: 1 }, now)
    expect(since?.toISOString()).toBe('2026-11-09T12:00:00.000Z')
  })
})
