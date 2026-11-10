export type AiRating = "UP" | "DOWN";

export async function sendFeedback(input: {
  messageId: string;
  conversationId?: string;
  rating: AiRating;
  comment?: string;
}) {
  const response = await fetch("/api/ai/feedbacks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error?.message ?? "Não foi possível enviar a avaliação");
  }
  return response.json();
}
