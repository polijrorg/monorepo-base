import { NextRequest, NextResponse } from "next/server";

import { registerSchema } from "@/backend/schemas";
import { returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api";
import { findUserByEmail } from "../../services/users";
import { authClient } from "@/lib/auth-client";
import { AllowedRoutes } from "@/types";

const allowedRoles: AllowedRoutes = {
  GET: ["SUPER_ADMIN", "ADMIN"]
}

// rota de get all users
export async function GET() {
  
}

export async function POST(request: NextRequest) {
  try {
    const body = await validBody(request);
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult);
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
    
    const user = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
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