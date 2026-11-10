import { embed, embedMany } from 'ai'
import { resolveEmbeddingModel } from '../models'

/** Modelo de embedding aceito pelo AI SDK: slug do Gateway ou instância (mock em teste). */
export type EmbeddingModelInput = Parameters<typeof embed>[0]['model']

export interface EmbedOptions {
  modelOverride?: EmbeddingModelInput
}

/** Gera embeddings em lote (ingestão de documentos). */
export async function embedTexts(texts: string[], options: EmbedOptions = {}) {
  const spec = resolveEmbeddingModel()
  if (texts.length === 0) return { embeddings: [] as number[][], tokens: 0, modelId: spec.id }

  const { embeddings, usage } = await embedMany({
    model: options.modelOverride ?? spec.id,
    values: texts,
    maxParallelCalls: 4,
  })
  return { embeddings, tokens: usage?.tokens ?? 0, modelId: spec.id }
}

/** Gera o embedding de uma pergunta (busca). */
export async function embedQuery(text: string, options: EmbedOptions = {}) {
  const spec = resolveEmbeddingModel()
  const { embedding, usage } = await embed({ model: options.modelOverride ?? spec.id, value: text })
  return { embedding, tokens: usage?.tokens ?? 0, modelId: spec.id }
}
