import prisma from "@/backend/services/db";
import { patchSchema } from "../../schemas";
import { z } from "zod";

export async function getAllUsers() {
  return await prisma.user.findMany();
}

export async function findUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id }
  })
}

export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email }
  })
}

export async function updateUser(id: string, data: z.infer<typeof patchSchema>) {
  return await prisma.user.update({
    where: { id },
    data
  })
}

export async function deleteUser(id: string) {
  await prisma.session.deleteMany({ where: { userId: id } });
  await prisma.account.deleteMany({ where: { userId: id } });
  return await prisma.user.delete({
    where: { id }
  })
}