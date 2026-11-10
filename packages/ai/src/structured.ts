import { generateText, Output } from 'ai'
import type { z } from 'zod'
import { gatewayProviderOptions, resolveModel, type ModelAlias } from './models'
import { UNTRUSTED_CONTENT_RULE, wrapUntrusted } from './guardrails/input'
import { estimateCostUsd } from './pricing'
import { normalizeUsage, type NormalizedUsage } from './usage'
import { safeRecord, startTimer, type TelemetrySink } from './telemetry'
import type { LanguageModelInput } from './agent'
import type { AiContext } from './tools'

export interface ExtractOptions<S extends z.ZodType> {
  ctx: AiContext
  feature: string
  promptVersion: string
  /** O que extrair e as regras de negócio (ex.: "valor sempre em reais, sem centavos arredondados"). */
  instructions: string
  /** Formato da saída. A resposta é validada contra ele antes de chegar ao app. */
  schema: S
  /** Texto de entrada (documento, e-mail, transcrição). Tratado como conteúdo não confiável. */
  input: string
  /** Nome da origem, para o modelo saber do que se trata (ex.: "nota-fiscal.pdf"). */
  source?: string
  telemetry: TelemetrySink
  model?: ModelAlias
  modelOverride?: LanguageModelInput
}

export interface ExtractResult<T> {
  output: T
  usage: NormalizedUsage
  costUsd: number | null
}

/**
 * Extração estruturada: texto livre entra, objeto validado sai.
 * É o caso de uso mais seguro de IA embarcada (zona verde do estudo):
 * a saída tem formato fixo, dá para medir acerto campo a campo e o
 * resultado passa por revisão humana antes de virar registro.
 */
export async function extractStructured<S extends z.ZodType>(options: ExtractOptions<S>): Promise<ExtractResult<z.infer<S>>> {
  const spec = resolveModel(options.model ?? 'fast')
  const elapsed = startTimer()
  const base = {
    userId: options.ctx.userId,
    feature: options.feature,
    model: spec.id,
    promptVersion: options.promptVersion,
  }

  try {
    const result = await generateText({
      model: options.modelOverride ?? spec.id,
      instructions: `${options.instructions}\n\n${UNTRUSTED_CONTENT_RULE}`,
      prompt: wrapUntrusted(options.input, options.source ?? 'entrada'),
      output: Output.object({ schema: options.schema }),
      providerOptions: gatewayProviderOptions(spec),
    })

    const output = result.output as z.infer<S>
    const usage = normalizeUsage(result.usage)
    const costUsd = estimateCostUsd(spec.id, usage)
    await safeRecord(options.telemetry, { ...base, usage, costUsd, latencyMs: elapsed() })
    return { output, usage, costUsd }
  } catch (error) {
    await safeRecord(options.telemetry, {
      ...base,
      usage: normalizeUsage(undefined),
      costUsd: null,
      latencyMs: elapsed(),
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}
