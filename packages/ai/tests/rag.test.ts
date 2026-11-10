import { describe, expect, it } from 'vitest'
import { chunkText } from '../src/rag/chunk'
import { buildVectorSearchPipeline, vectorIndexDefinition } from '../src/rag/vector-search'

const paragraph = (n: number) =>
  `Parágrafo ${n}. ` + 'A política de reembolso vale para compras feitas em até trinta dias. '.repeat(6)

describe('chunkText', () => {
  const doc = Array.from({ length: 12 }, (_, i) => paragraph(i + 1)).join('\n\n')

  it('nenhum trecho passa do tamanho máximo', () => {
    const chunks = chunkText(doc, { maxChars: 800, overlapChars: 150 })
    expect(chunks.length).toBeGreaterThan(1)
    for (const c of chunks) expect(c.text.length).toBeLessThanOrEqual(800)
  })

  it('repete o fim do trecho anterior no começo do seguinte', () => {
    const chunks = chunkText(doc, { maxChars: 800, overlapChars: 150 })
    const tailWords = chunks[0].text.slice(-60).split(' ').slice(1, 4).join(' ')
    expect(chunks[1].text).toContain(tailWords)
  })

  it('quebra parágrafo gigante sem perder conteúdo', () => {
    const giant = 'palavra '.repeat(2000)
    const chunks = chunkText(giant, { maxChars: 500, overlapChars: 0 })
    const rebuilt = chunks.map((c) => c.text).join(' ').replace(/\s+/g, ' ').trim()
    expect(rebuilt).toBe(giant.trim())
    for (const c of chunks) expect(c.text.length).toBeLessThanOrEqual(500)
  })

  it('numera os trechos em ordem e ignora texto vazio', () => {
    expect(chunkText('   \n\n  ')).toEqual([])
    expect(chunkText('Um.\n\nDois.').map((c) => c.index)).toEqual([0])
  })

  it('rejeita configuração inválida', () => {
    expect(() => chunkText('x', { maxChars: 50 })).toThrow()
    expect(() => chunkText('x', { maxChars: 1000, overlapChars: 600 })).toThrow()
  })
})

describe('buildVectorSearchPipeline', () => {
  it('sempre aplica o escopo de permissão no filtro', () => {
    const [stage] = buildVectorSearchPipeline({
      index: 'ai_chunk_vector',
      queryVector: [0.1, 0.2],
      scope: { ownerId: 'user-1' },
    }) as { $vectorSearch: { filter: unknown; numCandidates: number; limit: number } }[]
    expect(stage.$vectorSearch.filter).toEqual({ ownerId: { $eq: 'user-1' } })
    expect(stage.$vectorSearch.numCandidates).toBe(100)
  })

  it('combina vários escopos com $and', () => {
    const [stage] = buildVectorSearchPipeline({
      index: 'i',
      queryVector: [1],
      scope: { tenantId: 't1', ownerId: 'u1' },
    }) as { $vectorSearch: { filter: unknown } }[]
    expect(stage.$vectorSearch.filter).toEqual({ $and: [{ tenantId: { $eq: 't1' } }, { ownerId: { $eq: 'u1' } }] })
  })

  it('se recusa a buscar sem escopo ou com escopo vazio', () => {
    expect(() => buildVectorSearchPipeline({ index: 'i', queryVector: [1], scope: {} })).toThrow(/escopo/)
    expect(() => buildVectorSearchPipeline({ index: 'i', queryVector: [1], scope: { ownerId: '' } })).toThrow()
  })

  it('remove o vetor do resultado e aplica score mínimo', () => {
    const pipeline = buildVectorSearchPipeline({ index: 'i', queryVector: [1], scope: { ownerId: 'u' }, minScore: 0.7 })
    expect(pipeline).toContainEqual({ $project: { embedding: 0 } })
    expect(pipeline.at(-1)).toEqual({ $match: { score: { $gte: 0.7 } } })
  })
})

describe('vectorIndexDefinition', () => {
  it('declara o vetor e os campos de filtro', () => {
    expect(vectorIndexDefinition({ dimensions: 1536, filterPaths: ['ownerId'] }).fields).toEqual([
      { type: 'vector', path: 'embedding', numDimensions: 1536, similarity: 'cosine' },
      { type: 'filter', path: 'ownerId' },
    ])
  })
})
