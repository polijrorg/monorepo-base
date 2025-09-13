import { NextRequest, NextResponse } from "next/server";

import { registerSchema } from "@/backend/schemas";
import { blockForbiddenRequests, returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api";
import { findUserByEmail, getAllUsers } from "../../services/users";
import { AllowedRoutes } from "@/types";
import { auth } from "@/auth";

const allowedRoles: AllowedRoutes = {
  GET: ["SUPER_ADMIN", "ADMIN"]
}

// rota de get all users
export async function GET(request: NextRequest) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.POST);
    if (forbidden) {
      return forbidden;
    }

    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);    
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await validBody(request);
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }
    
    const validatedData = validationResult.data

    const { name, email, password } = validatedData;

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { 
          error: "Usuário já existe",
          field: "email" 
        },
        { status: 409 }
      );
    }    
    
    const user = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        callbackURL: "/",
      }
    });

    return NextResponse.json(
      { 
        message: "Usuário criado com sucesso",
        user 
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);    
  }
}