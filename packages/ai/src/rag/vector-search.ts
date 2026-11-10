/**
 * Busca vetorial no MongoDB Atlas.
 *
 * O Prisma não modela `$vectorSearch`, então a busca roda por
 * `prisma.<modelo>.aggregateRaw({ pipeline })` com o pipeline gerado aqui,
 * e o índice vetorial é criado no Atlas por script (o `prisma db push`
 * não cria índices de busca). Veja web/scripts/ai-vector-index.mjs.
 *
 * Regra de segurança: toda busca exige um escopo (ex.: `ownerId`,
 * `tenantId`). Sem escopo, o pipeline nem é montado. É isso que garante
 * que o usuário só recupera trechos que ele teria direito de ver.
 */

export type VectorScope = Record<string, string>

export interface VectorSearchParams {
  /** Nome do índice criado no Atlas. */
  index: string
  queryVector: number[]
  /** Filtro obrigatório de permissão. Cada chave precisa estar no índice como `filter`. */
  scope: VectorScope
  /** Campo do vetor no documento. */
  path?: string
  limit?: number
  /** Candidatos avaliados antes do corte. A MongoDB recomenda de 10 a 20 vezes o limit. */
  numCandidates?: number
  /** Descarta resultados com score abaixo deste valor (0 a 1 na similaridade de cosseno). */
  minScore?: number
}

export function buildScopeFilter(scope: VectorScope) {
  const entries = Object.entries(scope)
  if (entries.length === 0) {
    throw new Error('Busca vetorial sem escopo de permissão. Passe ao menos um filtro (ex.: ownerId).')
  }
  for (const [key, value] of entries) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Escopo inválido para "${key}": valor vazio.`)
    }
  }
  const conditions = entries.map(([key, value]) => ({ [key]: { $eq: value } }))
  return conditions.length === 1 ? conditions[0] : { $and: conditions }
}

export function buildVectorSearchPipeline(params: VectorSearchParams): Record<string, unknown>[] {
  const limit = params.limit ?? 5
  if (params.queryVector.length === 0) throw new Error('queryVector vazio.')

  const pipeline: Record<string, unknown>[] = [
    {
      $vectorSearch: {
        index: params.index,
        path: params.path ?? 'embedding',
        queryVector: params.queryVector,
        numCandidates: params.numCandidates ?? limit * 20,
        limit,
        filter: buildScopeFilter(params.scope),
      },
    },
    { $set: { score: { $meta: 'vectorSearchScore' } } },
    { $project: { [params.path ?? 'embedding']: 0 } },
  ]

  if (params.minScore !== undefined) {
    pipeline.push({ $match: { score: { $gte: params.minScore } } })
  }
  return pipeline
}

/** Definição do índice `vectorSearch` para o Atlas. */
export function vectorIndexDefinition(opts: { dimensions: number; filterPaths: string[]; path?: string }) {
  return {
    fields: [
      { type: 'vector', path: opts.path ?? 'embedding', numDimensions: opts.dimensions, similarity: 'cosine' },
      ...opts.filterPaths.map((path) => ({ type: 'filter', path })),
    ],
  }
}
