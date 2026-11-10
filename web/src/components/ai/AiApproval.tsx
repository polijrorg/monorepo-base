"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toolLabel } from "./toolLabels";

interface AiApprovalProps {
  toolName: string;
  input: unknown;
  onRespond: (approved: boolean) => void;
}

// Pedido de confirmação antes de uma ferramenta de escrita executar.
export function AiApproval({ toolName, input, onRespond }: AiApprovalProps) {
  const label = toolLabel(toolName);

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
      <p className="font-medium">{label.approval ?? `O assistente quer executar: ${toolName}.`}</p>
      <pre className="mt-2 max-h-40 overflow-auto rounded bg-white/70 p-2 text-xs">
        {JSON.stringify(input, null, 2)}
      </pre>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={() => onRespond(true)}>
          <Check className="size-4" /> Confirmar
        </Button>
        <Button size="sm" variant="outline" onClick={() => onRespond(false)}>
          <X className="size-4" /> Recusar
        </Button>
      </div>
    </div>
  );
}
