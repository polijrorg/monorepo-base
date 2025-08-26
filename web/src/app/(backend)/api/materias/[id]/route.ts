import { NextResponse } from 'next/server'
import { getMateriaById } from '@/backend/services/materia'
import { idSchema } from '@/backend/schemas';
import { zodErrorHandler } from '@/utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const validationResult = idSchema.safeParse(id);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'ID inválido', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const materia = await getMateriaById(id);

    if (!materia) {
      return NextResponse.json(
        { error: 'Matéria não encontrada' },
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