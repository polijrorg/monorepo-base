import { generateText, Output } from 'ai'
import { z } from 'zod'
import { resolveModel, type ModelAlias } from '../models'
import type { LanguageModelInput } from '../agent'
import type { EvalCase, Grader } from './types'

const verdictSchema = z.object({
  pass: z.boolean().describe('true só se a resposta cumpre o critério por completo'),
  reason: z.string().describe('Uma frase explicando o veredito'),
})

export interface JudgeOptions {
  name: string
  /**
   * Um critério só, binário e verificável. Ex.: "A resposta cita o número
   * do pedido e o prazo informado pela ferramenta". Um juiz por modo de falha.
   */
  criterion: string
  model?: ModelAlias
  modelOverride?: LanguageModelInput
}

/**
 * Juiz por LLM, para o que código não consegue verificar (tom, completude,
 * se a resposta usa só a fonte).
 *
 * Antes de confiar nele, valide contra 100 a 200 casos rotulados por uma
 * pessoa e meça quantas falhas ele pega e quantos falsos alarmes dá
 * (Hamel Husain, AI Evals FAQ). Um juiz não validado só dá falsa segurança.
 */
export function llmJudge<C extends EvalCase = EvalCase>(options: JudgeOptions): Grader<C> {
  return {
    name: options.name,
    async grade(evalCase, out) {
      const { output } = await generateText({
        model: options.modelOverride ?? resolveModel(options.model ?? 'smart').id,
        instructions:
          'Você é um avaliador rigoroso de respostas de um sistema de IA. Julgue apenas o critério dado. ' +
          'Na dúvida, reprove.',
        prompt:
          `Critério: ${options.criterion}\n\n` +
          `Entrada do usuário:\n${evalCase.input}\n\n` +
          `Resposta do sistema:\n${out.text ?? JSON.stringify(out.output ?? null)}`,
        output: Output.object({ schema: verdictSchema }),
      })
      return output
    },
  }
}
