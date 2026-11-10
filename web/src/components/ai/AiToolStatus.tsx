"use client";

import type { DynamicToolUIPart, ToolUIPart } from "ai";
import { toolLabel } from "./toolLabels";

import { Check, Loader2, X } from "lucide-react";
import { AiApproval } from "./AiApproval";

interface AiToolStatusProps {
  part: ToolUIPart | DynamicToolUIPart;
  onApproval: (approvalId: string, approved: boolean) => void;
}

export function toolNameOf(part: ToolUIPart | DynamicToolUIPart): string {
  return part.type === "dynamic-tool" ? part.toolName : part.type.slice("tool-".length);
}

// Mostra o que o agente está fazendo, para o usuário não ficar olhando uma tela parada.
export function AiToolStatus({ part, onApproval }: AiToolStatusProps) {
  const name = toolNameOf(part);
  const label = toolLabel(name);
  const line = "flex items-center gap-2 text-xs text-muted-foreground";

  switch (part.state) {
    case "approval-requested":
      return (
        <AiApproval
          toolName={name}
          input={part.input}
          onRespond={(approved) => onApproval(part.approval.id, approved)}
        />
      );
    case "output-available":
      return (
        <p className={line}>
          <Check className="size-3.5 text-green-600" /> {label.done}
        </p>
      );
    case "output-error":
      return (
        <p className={line}>
          <X className="size-3.5 text-red-600" /> Não foi possível concluir: {label.running.toLowerCase()}
        </p>
      );
    case "output-denied":
      return (
        <p className={line}>
          <X className="size-3.5" /> Ação recusada por você
        </p>
      );
    default:
      return (
        <p className={line}>
          <Loader2 className="size-3.5 animate-spin" /> {label.running}…
        </p>
      );
  }
}
