import type { EvalCase, Grader, TaskOutput } from './types'

export interface TrialResult {
  pass: boolean
  failures: { grader: string; reason: string }[]
  costUsd: number | null
  error?: string
}

export interface CaseResult {
  id: string
  tags: string[]
  trials: TrialResult[]
  /** Passou em todas as tentativas (pass^k). */
  passAll: boolean
}

export interface EvalReport {
  name: string
  target: number
  total: number
  trialsPerCase: number
  /** Fração das tentativas que passaram. */
  passRate: number
  /** Fração dos casos que passaram em todas as tentativas. Mede consistência. */
  passAllRate: number
  /** `passRate >= target`. */
  meetsTarget: boolean
  byTag: Record<string, { total: number; passed: number }>
  totalCostUsd: number
  results: CaseResult[]
}

export interface RunEvalsOptions<C extends EvalCase> {
  name: string
  target: number
  cases: C[]
  task: (evalCase: C) => Promise<TaskOutput>
  graders: Grader<C>[]
  /**
   * Repetições por caso. Com 75% de acerto por tentativa, acertar 3 de 3
   * acontece só ~42% das vezes; para agentes que falam com o cliente,
   * meça a consistência com 3 ou mais.
   */
  trials?: number
  /** Casos rodando em paralelo. Mantenha baixo para não bater no rate limit. */
  concurrency?: number
}

async function runTrial<C extends EvalCase>(
  evalCase: C,
  task: (c: C) => Promise<TaskOutput>,
  graders: Grader<C>[],
): Promise<TrialResult> {
  let output: TaskOutput
  try {
    output = await task(evalCase)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { pass: false, failures: [{ grader: 'execução', reason: message }], costUsd: null, error: message }
  }

  const failures: TrialResult['failures'] = []
  for (const grader of graders) {
    try {
      const result = await grader.grade(evalCase, output)
      if (!result.pass) failures.push({ grader: grader.name, reason: result.reason ?? 'falhou' })
    } catch (error) {
      failures.push({ grader: grader.name, reason: `erro no avaliador: ${String(error)}` })
    }
  }
  return { pass: failures.length === 0, failures, costUsd: output.costUsd ?? null }
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  })
  await Promise.all(workers)
  return results
}

export async function runEvals<C extends EvalCase>(options: RunEvalsOptions<C>): Promise<EvalReport> {
  const trialsPerCase = Math.max(1, options.trials ?? 1)

  const results = await mapWithConcurrency(options.cases, options.concurrency ?? 4, async (evalCase) => {
    const trials: TrialResult[] = []
    for (let t = 0; t < trialsPerCase; t++) trials.push(await runTrial(evalCase, options.task, options.graders))
    return { id: evalCase.id, tags: evalCase.tags ?? [], trials, passAll: trials.every((t) => t.pass) }
  })

  const allTrials = results.flatMap((r) => r.trials)
  const passedTrials = allTrials.filter((t) => t.pass).length
  const byTag: EvalReport['byTag'] = {}
  for (const r of results) {
    for (const tag of r.tags) {
      byTag[tag] ??= { total: 0, passed: 0 }
      byTag[tag].total++
      if (r.passAll) byTag[tag].passed++
    }
  }

  const passRate = allTrials.length ? passedTrials / allTrials.length : 0
  return {
    name: options.name,
    target: options.target,
    total: results.length,
    trialsPerCase,
    passRate,
    passAllRate: results.length ? results.filter((r) => r.passAll).length / results.length : 0,
    meetsTarget: passRate >= options.target,
    byTag,
    totalCostUsd: allTrials.reduce((sum, t) => sum + (t.costUsd ?? 0), 0),
    results,
  }
}
