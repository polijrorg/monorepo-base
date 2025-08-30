import { NextResponse } from 'next/server'
import { getMateriaBySlug } from '@/app/(backend)/services/materias'
import { slugSchema } from '@/backend/schemas'
import { returnInvalidDataErrors, zodErrorHandler } from '@/utils'
import { toErrorMessage } from '@/utils/api/toErrorMessage'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const parseResult = slugSchema.safeParse(slug)
    if (!parseResult.success) {
      return returnInvalidDataErrors(parseResult.error)
    }
    const materia = await getMateriaBySlug(slug)

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
