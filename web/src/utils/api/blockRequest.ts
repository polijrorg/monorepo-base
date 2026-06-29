import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Role } from "@/generated/prisma";
import { headers } from "next/headers";

export async function blockForbiddenRequests(
  request: NextRequest,
  allowedRoles: Role[] | undefined
) {
  const session = await auth.api.getSession({ ...request, headers: await headers() });

  if (!session?.user) {
    return NextResponse.json(
      { error: "Não autorizado - Faça login para continuar" },
      { status: 401 }
    );
  }

  const userRole = session.role as Role;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { error: "Acesso negado - Permissões insuficientes" },
      { status: 403 }
    );
  }

  return null;
}
