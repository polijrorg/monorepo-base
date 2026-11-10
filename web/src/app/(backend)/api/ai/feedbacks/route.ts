import { NextRequest, NextResponse } from "next/server";

import { feedbackSchema } from "@/backend/schemas/ai.schema";
import { saveFeedback } from "@/backend/services/ai";
import { getUserFromRequest, returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api/server";

// Avaliação (polegar para cima ou para baixo) de uma resposta da IA.
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

    const validationResult = feedbackSchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const feedback = await saveFeedback(user.id, validationResult.data);
    return NextResponse.json({ id: feedback.id, rating: feedback.rating }, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);
  }
}
