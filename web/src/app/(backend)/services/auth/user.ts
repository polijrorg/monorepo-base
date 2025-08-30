import prisma from "../db";

export async function getUserRole(userId: string) {
    if (!userId) return [];
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });
    return user?.role;
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  return user;
}