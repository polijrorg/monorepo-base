import { describe, expect, it } from 'vitest'
import { runEvals } from '../src/evals/run'
import { defaultGraders, expectedFields, admitsNotKnowing } from '../src/evals/graders'
import { evalReportToMarkdown } from '../src/evals/report'
import { evalSuiteSchema, type EvalCase } from '../src/evals/types'

const cases: EvalCase[] = [
  { id: 'nf-1', input: 'NF 123 de R$ 10,00', expected: { numero: '123', valor: 10 }, tags: ['nota-fiscal'] },
  { id: 'nf-2', input: 'NF 456 de R$ 99,90', expected: { numero: '456', valor: 99.9 }, tags: ['nota-fiscal'] },
  { id: 'fora', input: 'Qual a cor do céu em Marte?', expectDontKnow: true, tags: ['fora-do-escopo'] },
]

describe('graders', () => {
  it('compara só os campos esperados e aceita número como texto', async () => {
    const r = await expectedFields.grade(cases[0], { output: { numero: 123, valor: '10', extra: 'x' } })
    expect(r.pass).toBe(true)
  })

  it('aponta o campo errado', async () => {
    const r = await expectedFields.grade(cases[0], { output: { numero: '124', valor: 10 } })
    expect(r.pass).toBe(false)
    expect(r.reason).toContain('numero')
  })

  it('reconhece "não sei" sem depender de acento', async () => {
    expect((await admitsNotKnowing.grade(cases[2], { text: 'Nao encontrei essa informacao nos documentos.' })).pass).toBe(true)
    expect((await admitsNotKnowing.grade(cases[2], { text: 'É vermelho.' })).pass).toBe(false)
  })
})

describe('runEvals', () => {
  it('calcula acerto, consistência, meta e falhas por tag', async () => {
    // nf-2 acerta na primeira tentativa e erra na segunda: instável.
    const attempts: Record<string, number> = {}
    const report = await runEvals({
      name: 'extração de NF',
      target: 0.8,
      cases,
      trials: 2,
      graders: defaultGraders,
      task: async (c) => {
        attempts[c.id] = (attempts[c.id] ?? 0) + 1
        if (c.id === 'nf-1') return { output: { numero: '123', valor: 10 }, costUsd: 0.001 }
        if (c.id === 'nf-2') return { output: { numero: '456', valor: attempts[c.id] === 1 ? 99.9 : 9.99 }, costUsd: 0.001 }
        return { text: 'Não sei responder isso.', costUsd: 0.001 }
      },
    })

    expect(report.total).toBe(3)
    expect(report.passRate).toBeCloseTo(5 / 6)
    expect(report.passAllRate).toBeCloseTo(2 / 3)
    expect(report.meetsTarget).toBe(true)
    expect(report.byTag['nota-fiscal']).toEqual({ total: 2, passed: 1 })
    expect(report.totalCostUsd).toBeCloseTo(0.006)

    const md = evalReportToMarkdown(report)
    expect(md).toContain('Atingiu a meta')
    expect(md).toContain('nf-2')
  })

  it('conta erro da tarefa como falha, sem derrubar a rodada', async () => {
    const report = await runEvals({
      name: 'erro',
      target: 1,
      cases: [cases[0]],
      graders: defaultGraders,
      task: async () => {
        throw new Error('timeout do provedor')
      },
    })
    expect(report.passRate).toBe(0)
    expect(report.results[0].trials[0].error).toBe('timeout do provedor')
  })
})

describe('evalSuiteSchema', () => {
  it('valida o arquivo de casos e aplica tags vazias por padrão', () => {
    const suite = evalSuiteSchema.parse({ name: 's', target: 0.9, cases: [{ id: 'a', input: 'b' }] })
    expect(suite.cases[0].tags).toEqual([])
    expect(() => evalSuiteSchema.parse({ name: 's', target: 2, cases: [] })).toThrow()
  })
})
