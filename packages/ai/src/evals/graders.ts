import type { EvalCase, Grader, GradeResult } from './types'

/**
 * Avaliadores determinísticos (código). Use-os primeiro: são grátis,
 * instantâneos e não erram. Um juiz por LLM (judge.ts) só entra para o que
 * código não consegue verificar.
 */

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') {
    // números como string ("10") e número (10) contam como iguais na extração
    return typeof a !== 'object' && typeof b !== 'object' && String(a).trim() === String(b).trim()
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const ka = Object.keys(a as object)
  const kb = Object.keys(b as object)
  if (ka.length !== kb.length) return false
  return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
}

const ok: GradeResult = { pass: true }
const fail = (reason: string): GradeResult => ({ pass: false, reason })

/** Compara só os campos listados em `case.expected` com a saída estruturada. */
export const expectedFields: Grader = {
  name: 'campos esperados',
  grade(evalCase, out) {
    if (!evalCase.expected) return ok
    if (!out.output || typeof out.output !== 'object') return fail('sem saída estruturada')
    const actual = out.output as Record<string, unknown>
    const wrong = Object.entries(evalCase.expected)
      .filter(([key, value]) => !deepEqual(actual[key], value))
      .map(([key, value]) => `${key}: esperado ${JSON.stringify(value)}, veio ${JSON.stringify(actual[key])}`)
    return wrong.length ? fail(wrong.join('; ')) : ok
  },
}

export const includesTerms: Grader = {
  name: 'contém termos',
  grade(evalCase, out) {
    if (!evalCase.mustInclude?.length) return ok
    const text = normalizeText(out.text ?? '')
    const missing = evalCase.mustInclude.filter((t) => !text.includes(normalizeText(t)))
    return missing.length ? fail(`faltou: ${missing.join(', ')}`) : ok
  },
}

export const excludesTerms: Grader = {
  name: 'não contém termos',
  grade(evalCase, out) {
    if (!evalCase.mustNotInclude?.length) return ok
    const text = normalizeText(out.text ?? '')
    const found = evalCase.mustNotInclude.filter((t) => text.includes(normalizeText(t)))
    return found.length ? fail(`não deveria conter: ${found.join(', ')}`) : ok
  },
}

export const calledExpectedTool: Grader = {
  name: 'ferramenta esperada',
  grade(evalCase, out) {
    if (!evalCase.expectTool) return ok
    const called = (out.toolCalls ?? []).map((c) => c.toolName)
    return called.includes(evalCase.expectTool)
      ? ok
      : fail(`esperava ${evalCase.expectTool}, chamou [${called.join(', ') || 'nenhuma'}]`)
  },
}

const DONT_KNOW = /\b(nao sei|nao encontrei|nao tenho (essa |esta )?informac|nao consigo responder|nao ha informac)/

export const admitsNotKnowing: Grader = {
  name: 'admite não saber',
  grade(evalCase, out) {
    if (evalCase.expectDontKnow === undefined) return ok
    const said = DONT_KNOW.test(normalizeText(out.text ?? ''))
    if (evalCase.expectDontKnow && !said) return fail('deveria dizer que não sabe e respondeu')
    if (!evalCase.expectDontKnow && said) return fail('disse que não sabe, mas a resposta existe')
    return ok
  },
}

export function maxCostUsd(limit: number): Grader {
  return {
    name: `custo até US$ ${limit}`,
    grade(_case, out) {
      if (out.costUsd === undefined || out.costUsd === null) return ok
      return out.costUsd <= limit ? ok : fail(`custou US$ ${out.costUsd}`)
    },
  }
}

/** Avaliadores que todo projeto usa; cada um só age se o caso pedir. */
export const defaultGraders: Grader<EvalCase>[] = [
  expectedFields,
  includesTerms,
  excludesTerms,
  calledExpectedTool,
  admitsNotKnowing,
]
