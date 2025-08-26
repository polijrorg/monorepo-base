import { NextResponse } from 'next/server'
import { getMateriaBySlug } from '@/backend/services/materia'
import { slugSchema } from '@/backend/schemas'
import { zodErrorHandler } from '@/utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const parseResult = slugSchema.safeParse(slug)
    if (!parseResult.success) {
      const erros = parseResult.error.errors.map((err) => ({
        campo: err.path.join('.'),
        mensagem: err.message,
      }))
      return NextResponse.json(
        { error: 'Slug inválido', detalhes: erros },
        { status: 400 }
      )
    }

    const materia = await getMateriaBySlug(slug)

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
