import prisma from "@/backend/services/db";
import type { FeedbackData } from "@/backend/schemas/ai.schema";

/**
 * Guarda a avaliação do usuário sobre uma resposta. Avaliar de novo a mesma
 * mensagem substitui a anterior. As respostas com DOWN são a fonte de casos
 * novos para o conjunto de evals (ver web/docs/AI.md).
 */
export async function saveFeedback(userId: string, data: FeedbackData) {
  return prisma.aiFeedback.upsert({
    where: { userId_messageId: { userId, messageId: data.messageId } },
    create: { userId, ...data },
    update: { rating: data.rating, comment: data.comment },
  });
}
