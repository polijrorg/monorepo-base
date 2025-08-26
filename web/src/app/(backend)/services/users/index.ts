import prisma from "@/backend/services/db";

export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email }
  })
}