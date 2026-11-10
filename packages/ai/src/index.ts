/**
 * @ntec/ai: núcleo de IA embarcada do monorepo do NTec.
 * Uso só no servidor (rotas e services). Componentes de UI usam
 * `@ai-sdk/react` diretamente. Guia completo: web/docs/AI.md.
 */
export * from './models'
export * from './pricing'
export * from './usage'
export * from './telemetry'
export * from './tools'
export * from './agent'
export * from './structured'

export * from './guardrails/policy'
export * from './guardrails/budget'
export * from './guardrails/input'
export * from './guardrails/output'

export * from './rag/chunk'
export * from './rag/embed'
export * from './rag/vector-search'

export * from './evals/types'
export * from './evals/graders'
export * from './evals/run'
export * from './evals/report'
export * from './evals/judge'
