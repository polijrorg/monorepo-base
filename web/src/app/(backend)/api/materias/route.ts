import { NextRequest, NextResponse } from 'next/server'
import { createMateria, getAllMaterias } from '@/backend/services/materia'
import { createMateriaSchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
  POST: ["SUPER_ADMIN", "ADMIN"]
}

export async function GET() {
  try {
    const materias = await getAllMaterias()

    return NextResponse.json(materias, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar matérias:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar matérias' },
      { status: 500 }
    )
  }
}

export async function POST (request: NextRequest) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.POST);

    if (forbidden) {
      return forbidden;
    }

    const body = await validBody(request);

    const validationResult = createMateriaSchema.safeParse(body)
    
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult);
    }

    const validatedData = validationResult.data

    const materia = await createMateria(validatedData)

    return NextResponse.json(materia, { status: 201 })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        if (error.message.includes('slug')) {
          return NextResponse.json(
            { error: 'Uma matéria com esse slug já existe' },
            { status: 409 }
          )
        }
        return NextResponse.json(
          { error: 'Uma matéria com esses dados já existe' },
          { status: 409 }
        )
      }
      
      if (error.message.includes('Prisma')) {
        return NextResponse.json(
          { error: 'Erro no banco de dados - Verifique os dados fornecidos' },
          { status: 400 }
        )
      }
    }

    return zodErrorHandler(error);
  }
}