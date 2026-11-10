import prisma from "@/backend/services/db";
import {
  buildVectorSearchPipeline,
  chunkText,
  embedQuery,
  embedTexts,
  type AiContext,
} from "@ntec/ai";

/** Nome do índice criado por `pnpm --filter web ai:vector-index`. */
export const AI_CHUNK_INDEX = "ai_chunk_vector";

export interface RetrievedChunk {
  id: string;
  sourceId: string;
  sourceName: string;
  text: string;
  score: number;
}

/**
 * Indexa (ou reindexa) um documento do usuário: divide em trechos, gera os
 * embeddings e substitui os trechos antigos da mesma fonte.
 */
export async function indexDocument(
  ctx: AiContext,
  doc: { sourceId: string; sourceName: string; text: string }
) {
  const chunks = chunkText(doc.text);
  const { embeddings } = await embedTexts(chunks.map((c) => c.text));

  await prisma.aiChunk.deleteMany({ where: { ownerId: ctx.userId, sourceId: doc.sourceId } });
  if (chunks.length > 0) {
    await prisma.aiChunk.createMany({
      data: chunks.map((chunk, i) => ({
        ownerId: ctx.userId,
        sourceId: doc.sourceId,
        sourceName: doc.sourceName,
        index: chunk.index,
        text: chunk.text,
        embedding: embeddings[i],
      })),
    });
  }

  return { sourceId: doc.sourceId, chunks: chunks.length };
}

type RawChunk = {
  _id: { $oid: string } | string;
  sourceId: string;
  sourceName: string;
  text: string;
  score: number;
};

/**
 * Busca semântica restrita aos documentos do próprio usuário. O escopo
 * vem do contexto do servidor, nunca do que o modelo pede.
 */
export async function searchDocuments(ctx: AiContext, query: string, limit = 5): Promise<RetrievedChunk[]> {
  const { embedding } = await embedQuery(query);
  const pipeline = buildVectorSearchPipeline({
    index: AI_CHUNK_INDEX,
    queryVector: embedding,
    scope: { ownerId: ctx.userId },
    limit,
    minScore: 0.5,
  });

  const raw = (await prisma.aiChunk.aggregateRaw({
    pipeline: pipeline as never,
  })) as unknown as RawChunk[];

  return raw.map((doc) => ({
    id: typeof doc._id === "string" ? doc._id : doc._id.$oid,
    sourceId: doc.sourceId,
    sourceName: doc.sourceName,
    text: doc.text,
    score: doc.score,
  }));
}
