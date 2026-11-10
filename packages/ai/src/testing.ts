import { simulateReadableStream } from 'ai'
import { MockEmbeddingModelV4, MockLanguageModelV4 } from 'ai/test'

/**
 * Modelos falsos para testes de integração no CI: rápidos, grátis e
 * determinísticos. Eles testam o encanamento (rota, auth, ferramentas,
 * streaming, telemetria), não a qualidade das respostas. Qualidade se mede
 * com evals contra o modelo real (web/tests/evals).
 */

const mockUsage = (input = 10, output = 5) => ({
  inputTokens: { total: input, noCache: input, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: output, text: output, reasoning: 0 },
})

const stop = { unified: 'stop' as const, raw: 'stop' }

/** Modelo que sempre responde o mesmo texto (gerado ou em streaming). */
export function mockTextModel(text: string) {
  return new MockLanguageModelV4({
    doGenerate: async () => ({
      content: [{ type: 'text', text }],
      finishReason: stop,
      usage: mockUsage(),
      warnings: [],
    }),
    doStream: async () => {
      const chunks = [
        { type: 'text-start', id: 't1' },
        { type: 'text-delta', id: 't1', delta: text },
        { type: 'text-end', id: 't1' },
        { type: 'finish', finishReason: stop, usage: mockUsage() },
      ] as const
      return { stream: simulateReadableStream({ chunks: [...chunks] }) }
    },
  })
}

/** Modelo que devolve um JSON, para testar saída estruturada. */
export function mockJsonModel(value: unknown) {
  return mockTextModel(JSON.stringify(value))
}

/** Vetor determinístico a partir do texto: o mesmo texto gera o mesmo vetor. */
export function fakeVector(text: string, dimensions = 8): number[] {
  const vector = new Array<number>(dimensions).fill(0)
  for (let i = 0; i < text.length; i++) vector[i % dimensions] += text.charCodeAt(i) / 1000
  const norm = Math.hypot(...vector) || 1
  return vector.map((v) => v / norm)
}

export function mockEmbeddingModel(dimensions = 8) {
  return new MockEmbeddingModelV4({
    doEmbed: async ({ values }: { values: string[] }) => ({
      embeddings: values.map((value) => fakeVector(value, dimensions)),
      usage: { tokens: values.join(' ').length },
      warnings: [],
    }),
  })
}
