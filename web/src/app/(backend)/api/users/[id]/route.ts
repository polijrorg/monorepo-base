import { NextRequest, NextResponse } from "next/server";

import { blockForbiddenRequests, getUserFromRequest, returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api";
import { AllowedRoutes } from "@/types";
import { idSchema, patchSchema } from "@/backend/schemas";
import { deleteUser, findUserById, updateUser } from "@/backend/services/users";
import { toErrorMessage } from "@/utils/api/toErrorMessage";

const allowedRoles: AllowedRoutes = {
  PATCH: ['SUPER_ADMIN', 'ADMIN', 'USER'],
  DELETE: ['SUPER_ADMIN', 'ADMIN', 'USER']
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const validationResult = idSchema.safeParse(id);
    
    if (!validationResult.success) {
      return NextResponse.json(
        toErrorMessage('ID Inválido'),
        { status: 400 }
      )
    }

    const user = await findUserById(id);
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);    
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.DELETE);
    if (forbidden) {
      return forbidden;
    }

    const userFromRequest = await getUserFromRequest(request);

    // se for um erro
    if (userFromRequest instanceof NextResponse) {
      return userFromRequest;
    }

    const { id } = await params;

    const validationResult = idSchema.safeParse(id);

    if (!validationResult.success) {
      return NextResponse.json(
        toErrorMessage('ID Inválido'),
        { status: 400 }
      )
    }

    // só permite um usuário de role USER se auto deletar
    if (userFromRequest.role === 'USER' && id !== userFromRequest.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const user = await deleteUser(id);
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.PATCH);
    if (forbidden) {
      return forbidden;
    }

    const userFromRequest = await getUserFromRequest(request);

    // se for um erro
    if (userFromRequest instanceof NextResponse) {
      return userFromRequest;
    }

    const { id } = await params;

    const idValidationResult = idSchema.safeParse(id);

    if (!idValidationResult.success) {
      return NextResponse.json(
        toErrorMessage('ID Inválido'),
        { status: 400 }
      )
    }

    // só permite um usuário de role USER se auto atualizar
    if (userFromRequest.role === 'USER' && id !== userFromRequest.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await validBody(request);
    const validationResult = patchSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }
    
    const user = await updateUser(id, validationResult.data);
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);
  }
}