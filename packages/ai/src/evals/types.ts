import { z } from 'zod'

/**
 * Um caso de teste do conjunto de aceite ("golden set").
 *
 * Os casos vêm do cliente: 50 a 100 situações reais, com a resposta
 * esperada definida pelo especialista de domínio dele. O arquivo de casos
 * fica versionado em web/tests/evals/ e é anexo do critério de aceite.
 */
export const evalCaseSchema = z.object({
  id: z.string().min(1),
  /** O que o usuário pergunta ou o documento que entra no sistema. */
  input: z.string().min(1),
  /** Campos esperados na saída estruturada, quando houver. */
  expected: z.record(z.string(), z.unknown()).optional(),
  /** Termos que a resposta precisa conter (sem diferenciar acentos e maiúsculas). */
  mustInclude: z.array(z.string()).optional(),
  /** Termos que a resposta não pode conter. */
  mustNotInclude: z.array(z.string()).optional(),
  /** Ferramenta que o agente deve chamar. */
  expectTool: z.string().optional(),
  /** O agente deve dizer que não sabe, em vez de inventar. */
  expectDontKnow: z.boolean().optional(),
  /** Para agrupar o relatório: tipo de caso, dificuldade, origem. */
  tags: z.array(z.string()).default([]),
  /** Comentário do especialista do cliente. */
  notes: z.string().optional(),
})

export type EvalCase = z.infer<typeof evalCaseSchema>

export const evalSuiteSchema = z.object({
  name: z.string(),
  /** Meta de acerto acordada com o cliente (0 a 1). */
  target: z.number().min(0).max(1),
  cases: z.array(evalCaseSchema).min(1),
})

export type EvalSuite = z.infer<typeof evalSuiteSchema>

/** O que a tarefa avaliada devolve para os avaliadores. */
export interface TaskOutput {
  text?: string
  output?: unknown
  toolCalls?: { toolName: string; input: unknown }[]
  costUsd?: number | null
}

export interface GradeResult {
  pass: boolean
  reason?: string
}

/** Avaliador binário: passa ou não passa. Escalas de 1 a 5 escondem os erros. */
export interface Grader<C extends EvalCase = EvalCase> {
  name: string
  grade: (evalCase: C, output: TaskOutput) => GradeResult | Promise<GradeResult>
}
