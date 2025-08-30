import { NextResponse } from 'next/server'
import { getMateriaById } from '@/app/(backend)/services/materias'
import { idSchema } from '@/backend/schemas';
import { zodErrorHandler } from '@/utils';
import { toErrorMessage } from '@/utils/api/toErrorMessage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const validationResult = idSchema.safeParse(id);
    
    if (!validationResult.success) {
      return NextResponse.json(
        toErrorMessage('ID inválido'),
        { status: 400 }
      )
    }

    const materia = await getMateriaById(id);

    if (!materia) {
      return NextResponse.json(
        toErrorMessage('Matéria não encontrada'),
        { status: 404 }
      )
    }

    return NextResponse.json(materia, { status: 200 })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);
  }
}