/**
 * Testes que usam o AI SDK de verdade com modelos falsos (ai/test).
 * Verificam o encanamento: ferramentas presas ao contexto, erro seguro,
 * saída estruturada validada, streaming e telemetria.
 */
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { buildTools, defineTool, ToolError, type AiContext } from '../src/tools'
import { streamAgent } from '../src/agent'
import { extractStructured } from '../src/structured'
import { embedQuery, embedTexts } from '../src/rag/embed'
import { mockEmbeddingModel, mockJsonModel, mockTextModel } from '../src/testing'
import type { AiCallRecord, TelemetrySink } from '../src/telemetry'

const ctx: AiContext = { userId: 'u1', role: 'USER', conversationId: 'c1' }

function memoryTelemetry() {
  const calls: AiCallRecord[] = []
  const sink: TelemetrySink = { record: async (call) => void calls.push(call) }
  return { calls, sink }
}

const execOptions = { toolCallId: 't', messages: [] } as never

describe('buildTools', () => {
  it('passa o contexto do servidor para a ferramenta e esconde erros internos', async () => {
    const seen: AiContext[] = []
    const { tools, metas } = buildTools(
      {
        meusPedidos: defineTool({
          risk: 'read',
          description: 'Lista pedidos do usuário',
          inputSchema: z.object({ limite: z.number() }),
          execute: async (_input, c) => (seen.push(c), [{ id: 1 }]),
        }),
        quebrada: defineTool({
          risk: 'write',
          description: 'Sempre falha',
          inputSchema: z.object({}),
          execute: async () => {
            throw new Error('ECONNREFUSED mongodb://usuario:senha@cluster')
          },
        }),
      },
      ctx,
    )

    await tools.meusPedidos.execute?.({ limite: 5 }, execOptions)
    expect(seen[0].userId).toBe('u1')
    expect(metas.quebrada.risk).toBe('write')
    await expect(tools.quebrada.execute?.({}, execOptions)).rejects.toThrow(ToolError)
    await expect(tools.quebrada.execute?.({}, execOptions)).rejects.not.toThrow(/senha/)
  })
})

describe('streamAgent', () => {
  it('responde em streaming e registra telemetria', async () => {
    const { calls, sink } = memoryTelemetry()
    const response = await streamAgent({
      ctx,
      feature: 'teste',
      instructions: 'Responda curto.',
      promptVersion: 'teste@1',
      messages: [{ id: 'm1', role: 'user', parts: [{ type: 'text', text: 'Oi' }] }],
      tools: {},
      telemetry: sink,
      modelOverride: mockTextModel('Olá!'),
    })

    const body = await response.text()
    expect(body).toContain('Olá!')
    expect(calls).toHaveLength(1)
    expect(calls[0].feature).toBe('teste')
    expect(calls[0].usage.outputTokens).toBe(5)
  })

  it('recusa um conjunto de ferramentas com a lethal trifecta', async () => {
    const t = (meta: object) => defineTool({ risk: 'read', description: 'x', inputSchema: z.object({}), execute: async () => null, ...meta })
    await expect(
      streamAgent({
        ctx,
        feature: 'teste',
        instructions: '',
        promptVersion: 'teste@1',
        messages: [],
        tools: { a: t({ readsPrivateData: true }), b: t({ readsUntrustedContent: true }), c: t({ sendsExternally: true }) },
        telemetry: memoryTelemetry().sink,
        modelOverride: mockTextModel(''),
      }),
    ).rejects.toThrow(/lethal|dados privados/)
  })
})

describe('extractStructured', () => {
  it('devolve objeto validado pelo schema e registra custo', async () => {
    const { calls, sink } = memoryTelemetry()
    const { output } = await extractStructured({
      ctx,
      feature: 'extracao-nf',
      promptVersion: 'nf@1',
      instructions: 'Extraia número e valor.',
      schema: z.object({ numero: z.string(), valor: z.number() }),
      input: 'NF 123, total R$ 10,00',
      telemetry: sink,
      modelOverride: mockJsonModel({ numero: '123', valor: 10 }),
    })
    expect(output).toEqual({ numero: '123', valor: 10 })
    expect(calls[0].error).toBeUndefined()
  })

  it('falha (e registra o erro) quando o modelo devolve fora do schema', async () => {
    const { calls, sink } = memoryTelemetry()
    await expect(
      extractStructured({
        ctx,
        feature: 'extracao-nf',
        promptVersion: 'nf@1',
        instructions: '',
        schema: z.object({ numero: z.string() }),
        input: 'x',
        telemetry: sink,
        modelOverride: mockJsonModel({ outroCampo: true }),
      }),
    ).rejects.toThrow()
    expect(calls[0].error).toBeDefined()
  })
})

describe('embeddings', () => {
  it('gera vetores em lote e da pergunta', async () => {
    const model = mockEmbeddingModel(8)
    const { embeddings } = await embedTexts(['a', 'b'], { modelOverride: model })
    const { embedding } = await embedQuery('a', { modelOverride: model })
    expect(embeddings).toHaveLength(2)
    expect(embedding).toEqual(embeddings[0])
  })
})
