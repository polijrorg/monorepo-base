"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";

import { RotateCcw, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiMessage } from "./AiMessage";

interface AiChatProps {
  /** Rota do backend. Padrão: /api/ai/chat. */
  api?: string;
  placeholder?: string;
  /** Sugestões mostradas com a conversa vazia. */
  suggestions?: string[];
}

// O servidor responde erros como { error: { message } }; o transporte entrega isso como texto.
function friendlyError(error: Error): string {
  try {
    return JSON.parse(error.message)?.error?.message ?? "Não foi possível responder agora.";
  } catch {
    return "Não foi possível responder agora.";
  }
}

export function AiChat({ api = "/api/ai/chat", placeholder = "Pergunte algo…", suggestions = [] }: AiChatProps) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { id, messages, sendMessage, status, stop, error, regenerate, addToolApprovalResponse } = useChat({
    transport: new DefaultChatTransport({ api }),
    // depois que o usuário confirma ou recusa uma ação, a conversa continua sozinha
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function send(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    sendMessage({ text: value });
    setInput("");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    send(input);
  }

  return (
    <div className="flex h-full min-h-[70vh] flex-col rounded-xl border bg-background">
      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {messages.length === 0 && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>
                {s}
              </Button>
            ))}
          </div>
        )}

        {messages.map((message, i) => (
          <AiMessage
            key={message.id}
            message={message}
            conversationId={id}
            isStreaming={busy && i === messages.length - 1}
            onApproval={(approvalId, approved) => addToolApprovalResponse({ id: approvalId, approved })}
          />
        ))}

        {status === "submitted" && <p className="text-xs text-muted-foreground">Pensando…</p>}

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            <span className="flex-1">{friendlyError(error)}</span>
            <Button size="sm" variant="outline" onClick={() => regenerate()}>
              <RotateCcw className="size-4" /> Tentar de novo
            </Button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 border-t p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder={placeholder}
          rows={1}
          maxLength={8000}
          className="flex-1 resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Mensagem para o assistente"
        />
        {busy ? (
          <Button type="button" variant="outline" size="icon" onClick={() => stop()} title="Parar">
            <Square className="size-4" />
          </Button>
        ) : (
          <Button type="submit" size="icon" disabled={!input.trim()} title="Enviar">
            <Send className="size-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
