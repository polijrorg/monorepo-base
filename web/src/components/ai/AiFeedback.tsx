"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { sendFeedback, type AiRating } from "./actions";

import { ThumbsDown, ThumbsUp } from "lucide-react";

interface AiFeedbackProps {
  messageId: string;
  conversationId?: string;
}

// Polegar para cima/baixo. As respostas ruins viram casos novos de eval.
export function AiFeedback({ messageId, conversationId }: AiFeedbackProps) {
  const [rating, setRating] = useState<AiRating | null>(null);

  async function rate(value: AiRating) {
    try {
      await sendFeedback({ messageId, conversationId, rating: value });
      setRating(value);
      toast.success("Obrigado pela avaliação");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao avaliar");
    }
  }

  const base = "rounded p-1 text-muted-foreground transition-colors hover:text-foreground";

  return (
    <div className="flex gap-1" aria-label="Avaliar resposta">
      <button type="button" className={base} aria-pressed={rating === "UP"} onClick={() => rate("UP")} title="Resposta útil">
        <ThumbsUp className={`size-4 ${rating === "UP" ? "fill-current" : ""}`} />
      </button>
      <button type="button" className={base} aria-pressed={rating === "DOWN"} onClick={() => rate("DOWN")} title="Resposta ruim">
        <ThumbsDown className={`size-4 ${rating === "DOWN" ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}
