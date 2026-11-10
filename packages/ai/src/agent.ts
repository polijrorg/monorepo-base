import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  generateText,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai'
import { gatewayProviderOptions, resolveModel, type ModelAlias } from './models'
import { buildToolApproval, checkToolset } from './guardrails/policy'
import { trimHistory, UNTRUSTED_CONTENT_RULE } from './guardrails/input'
import { buildTools, type AiContext, type NtecToolMap } from './tools'
import { estimateCostUsd } from './pricing'
import { normalizeUsage } from './usage'
import { safeRecord, startTimer, type TelemetrySink } from './telemetry'

/** Modelo aceito pelo AI SDK: slug do Gateway ou instância (mock em teste). */
export type LanguageModelInput = Parameters<typeof streamText>[0]['model']

export interface StreamAgentOptions {
  ctx: AiContext
  /** Nome do recurso, para telemetria e custo: "assistente", "triagem"... */
  feature: string
  instructions: string
  /** Versão do prompt (ex.: "assistente@3"); muda a cada alteração do texto. */
  promptVersion: string
  messages: UIMessage[]
  tools: NtecToolMap
  telemetry: TelemetrySink
  model?: ModelAlias
  /** Teto de passos do loop de ferramentas. A maioria dos agentes em produção para em até 10. */
  maxSteps?: number
  /** Quantas mensagens recentes vão para o modelo. */
  historyWindow?: number
  /** Só para testes e evals: substitui o modelo do Gateway. */
  modelOverride?: LanguageModelInput
  /** Liberar um conjunto de ferramentas com a "lethal trifecta". Exige justificativa no PR. */
  allowRiskyToolset?: boolean
}

const STREAM_ERROR_MESSAGE = 'Não consegui concluir agora. Tente de novo em instantes.'

/**
 * Agente com ferramentas e resposta em streaming, já com:
 * - modelo por apelido, com fallback e prompt caching pelo AI Gateway;
 * - aprovação humana para ferramentas de escrita (toolApproval);
 * - teto de passos, janela de histórico e regra contra prompt injection;
 * - telemetria de custo, tokens, latência e ferramentas usadas.
 *
 * Mensagens de sistema vindas do navegador são rejeitadas pelo AI SDK 7
 * por padrão (`allowSystemInMessages` desligado); não ligue isso.
 */
export async function streamAgent(options: StreamAgentOptions): Promise<Response> {
  const { tools, metas } = buildTools(options.tools, options.ctx)

  const issues = checkToolset(metas)
  if (issues.length > 0 && !options.allowRiskyToolset) {
    throw new Error(issues.map((i) => `${i.message} (${i.tools.join(', ')})`).join(' '))
  }

  const spec = resolveModel(options.model ?? 'smart')
  const elapsed = startTimer()
  const base = {
    userId: options.ctx.userId,
    feature: options.feature,
    model: spec.id,
    promptVersion: options.promptVersion,
    conversationId: options.ctx.conversationId,
  }

  const result = streamText({
    model: options.modelOverride ?? spec.id,
    instructions: `${options.instructions}\n\n${UNTRUSTED_CONTENT_RULE}`,
    messages: await convertToModelMessages(trimHistory(options.messages, options.historyWindow ?? 20)),
    tools,
    toolApproval: buildToolApproval(metas),
    stopWhen: isStepCount(options.maxSteps ?? 6),
    providerOptions: gatewayProviderOptions(spec, { sessionId: options.ctx.conversationId }),
    onEnd: async (event) => {
      const usage = normalizeUsage(event.usage)
      await safeRecord(options.telemetry, {
        ...base,
        usage,
        costUsd: estimateCostUsd(spec.id, usage),
        latencyMs: elapsed(),
        steps: event.steps?.length,
        toolNames: event.toolCalls?.map((call) => call.toolName),
        finishReason: event.finishReason,
      })
    },
    onError: async ({ error }: { error: unknown }) => {
      await safeRecord(options.telemetry, {
        ...base,
        usage: normalizeUsage(undefined),
        costUsd: null,
        latencyMs: elapsed(),
        error: error instanceof Error ? error.message : String(error),
      })
    },
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream, onError: () => STREAM_ERROR_MESSAGE }),
  })
}

export interface RunAgentOptions extends Omit<StreamAgentOptions, 'messages'> {
  /** Pedido do usuário em texto (evals, tarefas em segundo plano). */
  prompt: string
}

export interface RunAgentResult {
  text: string
  toolCalls: { toolName: string; input: unknown }[]
  /** Ferramentas que pediram aprovação: em modo não interativo, elas não executam. */
  pendingApprovals: string[]
  costUsd: number | null
}

/**
 * Mesmo agente, sem streaming. Usado pelas evals (que precisam do texto
 * final e das ferramentas chamadas) e por tarefas que rodam sem usuário na
 * tela. Ferramentas de escrita continuam exigindo aprovação: aqui elas
 * ficam pendentes em vez de executar.
 */
export async function runAgent(options: RunAgentOptions): Promise<RunAgentResult> {
  const { tools, metas } = buildTools(options.tools, options.ctx)
  const issues = checkToolset(metas)
  if (issues.length > 0 && !options.allowRiskyToolset) {
    throw new Error(issues.map((i) => i.message).join(' '))
  }

  const spec = resolveModel(options.model ?? 'smart')
  const elapsed = startTimer()

  const result = await generateText({
    model: options.modelOverride ?? spec.id,
    instructions: `${options.instructions}\n\n${UNTRUSTED_CONTENT_RULE}`,
    prompt: options.prompt,
    tools,
    toolApproval: buildToolApproval(metas),
    stopWhen: isStepCount(options.maxSteps ?? 6),
    providerOptions: gatewayProviderOptions(spec, { sessionId: options.ctx.conversationId }),
  })

  const usage = normalizeUsage(result.usage)
  const costUsd = estimateCostUsd(spec.id, usage)
  const toolCalls: RunAgentResult['toolCalls'] = result.toolCalls.map((call: { toolName: string; input: unknown }) => ({
    toolName: call.toolName,
    input: call.input,
  }))
  const pendingApprovals = result.content
    .filter((part) => part.type === 'tool-approval-request')
    .map((part) => ('toolCall' in part ? String(part.toolCall.toolName) : 'desconhecida'))

  await safeRecord(options.telemetry, {
    userId: options.ctx.userId,
    feature: options.feature,
    model: spec.id,
    promptVersion: options.promptVersion,
    conversationId: options.ctx.conversationId,
    usage,
    costUsd,
    latencyMs: elapsed(),
    steps: result.steps.length,
    toolNames: toolCalls.map((c) => c.toolName),
    finishReason: result.finishReason,
  })

  return { text: result.text, toolCalls, pendingApprovals, costUsd }
}
