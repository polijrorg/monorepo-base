import type { UIMessage } from "ai";
import { flagSuspiciousInstructions, runAgent, streamAgent, type AiContext, type TelemetrySink } from "@ntec/ai";
import { ASSISTENTE_INSTRUCTIONS, ASSISTENTE_PROMPT_VERSION } from "./prompts/assistente";
import { assistantTools } from "./tools";
import { prismaTelemetry } from "./telemetry";

const FEATURE = "assistente";

export interface AssistantUser {
  id: string;
  role: string;
}

export function toAiContext(user: AssistantUser, conversationId?: string): AiContext {
  return { userId: user.id, role: user.role, conversationId };
}

/** Texto da última mensagem do usuário (para validação e log). */
export function lastUserText(messages: { role: string; parts: { type: string; text?: unknown }[] }[]): string {
  const last = [...messages].reverse().find((m) => m.role === "user");
  return (last?.parts ?? [])
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text as string)
    .join("\n");
}

/** Resposta do assistente em streaming, para o chat. */
export async function runAssistant(params: { user: AssistantUser; messages: UIMessage[]; conversationId?: string }) {
  const suspicious = flagSuspiciousInstructions(lastUserText(params.messages));
  if (suspicious.length > 0) {
    // sinal para revisão; a proteção real são as permissões e a aprovação nas ferramentas
    console.warn("[ai] possível prompt injection", { userId: params.user.id, trechos: suspicious });
  }

  return streamAgent({
    ctx: toAiContext(params.user, params.conversationId),
    feature: FEATURE,
    instructions: ASSISTENTE_INSTRUCTIONS,
    promptVersion: ASSISTENTE_PROMPT_VERSION,
    messages: params.messages,
    tools: assistantTools,
    telemetry: prismaTelemetry,
    model: "smart",
  });
}

/** Mesmo assistente sem streaming: usado pelas evals (web/tests/evals). */
export function answerOnce(params: { user: AssistantUser; prompt: string; telemetry: TelemetrySink }) {
  return runAgent({
    ctx: toAiContext(params.user),
    feature: FEATURE,
    instructions: ASSISTENTE_INSTRUCTIONS,
    promptVersion: ASSISTENTE_PROMPT_VERSION,
    prompt: params.prompt,
    tools: assistantTools,
    telemetry: params.telemetry,
    model: "smart",
  });
}
