"use client";

import { isToolUIPart, type UIMessage } from "ai";

import { FileText } from "lucide-react";
import { AiFeedback } from "./AiFeedback";
import { AiToolStatus, toolNameOf } from "./AiToolStatus";

interface AiMessageProps {
  message: UIMessage;
  conversationId?: string;
  isStreaming: boolean;
  onApproval: (approvalId: string, approved: boolean) => void;
}

// Fontes citadas: nomes dos documentos devolvidos pela busca (RAG).
function sourcesOf(message: UIMessage): string[] {
  const names = new Set<string>();
  for (const part of message.parts) {
    if (!isToolUIPart(part) || toolNameOf(part) !== "buscarDocumentos") continue;
    if (part.state !== "output-available") continue;
    const output = part.output as { trechos?: { fonte?: string }[] } | undefined;
    for (const trecho of output?.trechos ?? []) if (trecho.fonte) names.add(trecho.fonte);
  }
  return [...names];
}

export function AiMessage({ message, conversationId, isStreaming, onApproval }: AiMessageProps) {
  if (message.role === "user") {
    const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
    return (
      <div className="ml-auto max-w-[80%] whitespace-pre-wrap rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">
        {text}
      </div>
    );
  }

  const sources = sourcesOf(message);

  return (
    <div className="max-w-[90%] space-y-2 text-sm">
      {message.parts.map((part, i) => {
        const key = `${message.id}-${i}`;
        if (part.type === "text") {
          return (
            <p key={key} className="whitespace-pre-wrap leading-relaxed">
              {part.text}
            </p>
          );
        }
        if (isToolUIPart(part)) {
          return <AiToolStatus key={key} part={part} onApproval={onApproval} />;
        }
        return null;
      })}

      {sources.length > 0 && (
        <ul className="flex flex-wrap gap-2 pt-1" aria-label="Fontes consultadas">
          {sources.map((name) => (
            <li key={name} className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
              <FileText className="size-3" /> {name}
            </li>
          ))}
        </ul>
      )}

      {!isStreaming && <AiFeedback messageId={message.id} conversationId={conversationId} />}
    </div>
  );
}
