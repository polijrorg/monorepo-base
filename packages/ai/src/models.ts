/**
 * Registro de modelos do projeto.
 *
 * O código do app nunca escreve o nome de um modelo: ele pede um apelido
 * ("fast" ou "smart"). Trocar de modelo vira uma mudança de uma linha aqui
 * (ou de uma variável de ambiente), validada pela suíte de evals.
 *
 * Os ids são slugs do Vercel AI Gateway (`provedor/modelo`). Cada slug já é
 * uma versão fixa do modelo: nada muda de comportamento sem alguém alterar
 * este arquivo. A Anthropic aposenta modelos com 60 dias de aviso
 * (docs "Model deprecations"), então revise esta tabela a cada semestre.
 */

export type ModelAlias = 'fast' | 'smart'

export interface ModelSpec {
  /** Slug do AI Gateway, ex.: `anthropic/claude-sonnet-5.5`. */
  id: string
  /** Tentados em ordem se o modelo principal falhar ou estiver indisponível. */
  fallbacks: string[]
  /** Para que serve, para quem lê o código. */
  purpose: string
}

export const DEFAULT_MODELS: Record<ModelAlias, ModelSpec> = {
  fast: {
    id: 'anthropic/claude-haiku-5.5',
    fallbacks: ['anthropic/claude-sonnet-5.5'],
    purpose: 'Roteamento, classificação e extração simples. Barato e rápido.',
  },
  smart: {
    id: 'anthropic/claude-sonnet-5.5',
    fallbacks: ['anthropic/claude-opus-5.5'],
    purpose: 'Agente com ferramentas e respostas ao usuário.',
  },
}

/**
 * Para ter fallback em outro provedor (não só em outro modelo da Anthropic),
 * acrescente o slug em `AI_MODEL_FALLBACKS_SMART` depois de conferir o nome
 * exato no catálogo do AI Gateway. O Gateway já troca de provedor sozinho
 * para o mesmo modelo (Anthropic, Bedrock, Vertex) quando um deles cai.
 */
export const EMBEDDING_DEFAULTS = {
  id: 'openai/text-embedding-3-small',
  dimensions: 1536,
}

type Env = Record<string, string | undefined>

function parseList(value: string | undefined): string[] | undefined {
  if (!value) return undefined
  const items = value.split(',').map((s) => s.trim()).filter(Boolean)
  return items.length > 0 ? items : undefined
}

/** Resolve um apelido, permitindo sobrescrever por variável de ambiente. */
export function resolveModel(alias: ModelAlias, env: Env = process.env): ModelSpec {
  const base = DEFAULT_MODELS[alias]
  const suffix = alias.toUpperCase()
  return {
    ...base,
    id: env[`AI_MODEL_${suffix}`]?.trim() || base.id,
    fallbacks: parseList(env[`AI_MODEL_FALLBACKS_${suffix}`]) ?? base.fallbacks,
  }
}

export function resolveEmbeddingModel(env: Env = process.env) {
  const dims = Number(env.AI_EMBEDDING_DIMENSIONS)
  return {
    id: env.AI_EMBEDDING_MODEL?.trim() || EMBEDDING_DEFAULTS.id,
    dimensions: Number.isInteger(dims) && dims > 0 ? dims : EMBEDDING_DEFAULTS.dimensions,
  }
}

/**
 * Opções do AI Gateway aplicadas a toda chamada:
 * - `models`: cadeia de fallback;
 * - `caching: 'auto'`: o Gateway marca o prefixo estável (instruções e
 *   ferramentas) para prompt caching, o que corta o custo de entrada;
 * - `sessionId`: mantém a conversa no provedor que guarda o cache dela.
 */
export function gatewayProviderOptions(
  spec: ModelSpec,
  opts: { sessionId?: string } = {},
): { gateway: Record<string, string | string[]> } {
  // montado sem chaves opcionais/undefined: providerOptions só aceita valores JSON
  const gateway: Record<string, string | string[]> = { models: spec.fallbacks, caching: 'auto' }
  if (opts.sessionId) gateway.sessionId = opts.sessionId
  return { gateway }
}
