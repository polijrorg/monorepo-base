import { NextRequest, NextResponse } from "next/server";

import { blockForbiddenRequests, returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api";
import { AllowedRoutes } from "@/types";
import { emailSchema, idSchema } from "@/backend/schemas";
import { auth } from "@/auth";
import { toErrorMessage } from "@/utils/api/toErrorMessage";

const allowedRoles: AllowedRoutes = {
  PATCH: ['SUPER_ADMIN', 'ADMIN', 'USER'],
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.PATCH);
    if (forbidden) {
      return forbidden;
    }

    const { id } = await params;

    const idValidationResult = idSchema.safeParse(id);

    if (!idValidationResult.success) {
      return NextResponse.json(
        toErrorMessage('ID Inválido'),
        { status: 400 }
      )
    }

    const { newEmail } = await validBody(request);
    const validationResult = emailSchema.safeParse(newEmail);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }
    
    const user = await auth.api.changeEmail({ body: {
      newEmail: validationResult.data,
    }})
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);
  }
}