import { NextRequest, NextResponse } from "next/server";
import type { UIMessage } from "ai";
import { checkUserInput } from "@ntec/ai";

import { chatRequestSchema } from "@/backend/schemas/ai.schema";
import { checkUserBudget, lastUserText, runAssistant } from "@/backend/services/ai";
import { getUserFromRequest, returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api/server";
import { toErrorMessage } from "@/utils/api/toErrorMessage";

// Agentes com ferramentas podem levar mais que uma requisição comum.
// Na Vercel (Fluid compute) o padrão é 300s; tarefas longas vão para Vercel Workflows.
export const maxDuration = 120;

// Rota do chat do assistente (padrão do useChat). Responde em streaming.
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const body = await validBody(request);
    if (body instanceof NextResponse) {
      return body;
    }

    const validationResult = chatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const { id, messages } = validationResult.data;

    const inputCheck = checkUserInput({
      lastUserText: lastUserText(messages),
      messageCount: messages.length,
    });
    if (!inputCheck.ok) {
      return NextResponse.json(toErrorMessage(inputCheck.reason), { status: 400 });
    }

    const budget = await checkUserBudget(user.id);
    if (!budget.allowed) {
      return NextResponse.json(
        toErrorMessage("Você atingiu o limite diário de uso do assistente. Tente novamente amanhã."),
        { status: 429 }
      );
    }

    return await runAssistant({
      user: { id: user.id, role: String(user.role) },
      messages: messages as unknown as UIMessage[],
      conversationId: id,
    });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);
  }
}
