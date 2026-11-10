// Cria o índice de busca vetorial da coleção ai_chunk no MongoDB Atlas.
// O `prisma db push` não cria índices de busca, por isso este script.
// Uso: pnpm --filter web ai:vector-index   (lê DATABASE_URL e AI_EMBEDDING_DIMENSIONS do .env)
// Rode de novo se trocar o modelo de embedding: o número de dimensões muda.
import prismaPkg from "../src/generated/prisma/index.js";

const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

const INDEX_NAME = "ai_chunk_vector";
const dimensions = Number(process.env.AI_EMBEDDING_DIMENSIONS) || 1536;

const definition = {
  fields: [
    { type: "vector", path: "embedding", numDimensions: dimensions, similarity: "cosine" },
    // campos usados no filtro de permissão da busca (ver packages/ai/src/rag/vector-search.ts)
    { type: "filter", path: "ownerId" },
  ],
};

try {
  const existing = await prisma.$runCommandRaw({ listSearchIndexes: "ai_chunk" }).catch(() => null);
  const found = existing?.cursor?.firstBatch?.some((index) => index.name === INDEX_NAME);

  if (found) {
    await prisma.$runCommandRaw({ updateSearchIndex: "ai_chunk", name: INDEX_NAME, definition });
    console.log(`Índice ${INDEX_NAME} atualizado (${dimensions} dimensões).`);
  } else {
    await prisma.$runCommandRaw({
      createSearchIndexes: "ai_chunk",
      indexes: [{ name: INDEX_NAME, type: "vectorSearch", definition }],
    });
    console.log(`Índice ${INDEX_NAME} criado (${dimensions} dimensões). O Atlas leva alguns minutos para deixá-lo pronto.`);
  }
} catch (error) {
  console.error("Falha ao criar o índice. Confira se o cluster é Atlas e se a coleção ai_chunk existe.", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
