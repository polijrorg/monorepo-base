import { z } from "zod";
import { emailSchema, passwordSchema } from "./base.schema";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
});

const registerBaseObject = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços")
    .transform(str => str.trim()),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
});

export const registerSchema = registerBaseObject
  .refine((data) => data.password === data.confirmPassword, {
    error: "Senhas não conferem",
    path: ["confirmPassword"],
})

// devemos atualizar email e senha apenas via better-auth
// (para garantir que a verificação de email e o hash da senha sejam feitos corretamente)
export const patchSchema = registerBaseObject
  .omit({ email: true, password: true, confirmPassword: true }) // remove esses campos do schema aceito
  .partial() // manter a semântica de "patch" (todos opcionais)
  .strict() // ERRO se houver campos extras (ex: email enviado)
  .refine((obj) => Object.keys(obj).length > 0, {
    error: "Pelo menos um campo precisa ser fornecido para atualização",
  });

export const updatePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
}).strict()

export type LoginData = z.infer<typeof loginSchema>;
