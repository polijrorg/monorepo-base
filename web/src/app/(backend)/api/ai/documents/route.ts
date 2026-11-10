import { NextRequest, NextResponse } from "next/server";

import { documentSchema } from "@/backend/schemas/ai.schema";
import { indexDocument, toAiContext } from "@/backend/services/ai";
import { getUserFromRequest, returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api/server";

// Indexa um documento de texto para a busca do assistente (RAG).
// Os trechos ficam visíveis só para o usuário que enviou.
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

    const validationResult = documentSchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const result = await indexDocument(
      toAiContext({ id: user.id, role: String(user.role) }),
      validationResult.data
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);
  }
}
