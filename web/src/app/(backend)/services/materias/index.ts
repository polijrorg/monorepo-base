import prisma from '../db';

export async function getAllMaterias() {
  try {
    const materias = await prisma.materia.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    return materias
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar matérias')
  }
}

export async function getMateriaById(id: string) {
  try {
    const materia = await prisma.materia.findUnique({
      where: {
        id,
      }
    })
    return materia
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar matéria')
  }
}

export async function getMateriaBySlug(slug: string) {
  try {
    const materia = await prisma.materia.findUnique({
      where: {
        slug,
      }
    })
    return materia
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar matéria')
  }
}

export async function createMateria(data: { 
  name: string; 
  descricao: string; 
  cor: string; 
  slug: string; 
}) {
  try {
    const materia = await prisma.materia.create({
      data: {
        name: data.name,
        descricao: data.descricao,
        cor: data.cor,
        slug: data.slug
      }
    })
    return materia
  } catch (error) {
    throw new Error(String(error) || 'Falha ao criar matéria')
  }
}