import { z } from "zod";

// Mensagem no formato do useChat (UIMessage). Só "user" e "assistant":
// uma mensagem "system" vinda do navegador é recusada aqui, antes do modelo.
const uiMessageSchema = z.looseObject({
  id: z.string().min(1).max(200),
  role: z.enum(["user", "assistant"], { error: "Papel de mensagem inválido" }),
  parts: z.array(z.looseObject({ type: z.string() })).max(100),
});

export const chatRequestSchema = z.looseObject({
  // id da conversa, gerado pelo useChat
  id: z.string().min(1).max(200).optional(),
  messages: z
    .array(uiMessageSchema)
    .min(1, "Envie pelo menos uma mensagem")
    .max(200, "Conversa longa demais"),
});

export const feedbackSchema = z
  .object({
    messageId: z.string().min(1).max(200),
    conversationId: z.string().max(200).optional(),
    feature: z.string().min(1).max(60).default("assistente"),
    rating: z.enum(["UP", "DOWN"], { error: "Avaliação deve ser UP ou DOWN" }),
    comment: z.string().trim().max(1000).optional(),
  })
  .strict();

export const documentSchema = z
  .object({
    sourceId: z.string().min(1).max(200),
    sourceName: z.string().min(1).max(200),
    text: z
      .string()
      .min(1, "Documento vazio")
      .max(200_000, "Documento grande demais (máximo de 200 mil caracteres)"),
  })
  .strict();

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type FeedbackData = z.infer<typeof feedbackSchema>;
export type DocumentData = z.infer<typeof documentSchema>;
