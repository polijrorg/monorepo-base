import type { NormalizedUsage } from './usage'

/**
 * Registro de cada chamada de IA: quem, qual recurso, qual modelo, quantos
 * tokens, quanto custou e quanto demorou. É o que permite responder ao
 * cliente "quanto custa por interação" e achar regressões depois de trocar
 * de modelo. O app grava no Mongo (web/.../services/ai/telemetry.ts).
 *
 * Não grave o texto das mensagens aqui: telemetria guarda números e ids.
 * Conteúdo de conversa é dado pessoal (LGPD) e tem política própria.
 */
export interface AiCallRecord {
  userId: string
  /** Nome do recurso de IA, ex.: "assistente", "extracao-nf". */
  feature: string
  model: string
  promptVersion?: string
  conversationId?: string
  usage: NormalizedUsage
  costUsd: number | null
  latencyMs: number
  steps?: number
  toolNames?: string[]
  finishReason?: string
  error?: string
}

export interface TelemetrySink {
  record(call: AiCallRecord): Promise<void>
}

/** Sink de desenvolvimento: só imprime. */
export const consoleTelemetry: TelemetrySink = {
  async record(call) {
    console.info('[ai]', call.feature, call.model, `${call.latencyMs}ms`, `US$ ${call.costUsd ?? '?'}`, call.error ?? '')
  },
}

/** Nunca deixa uma falha de telemetria derrubar a resposta ao usuário. */
export async function safeRecord(sink: TelemetrySink, call: AiCallRecord) {
  try {
    await sink.record(call)
  } catch (error) {
    console.error('[ai] falha ao registrar telemetria', error)
  }
}

export function startTimer() {
  const start = performance.now()
  return () => Math.round(performance.now() - start)
}
