import { z } from "zod";

export const idSchema = z.string().uuid('ID inválido');

export const passwordSchema = z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/\d/, "Senha deve conter pelo menos um número");

export const emailSchema = z
    .string()
    .email("Email inválido")
    .transform(str => str.toLowerCase().trim());

export const nameSchema = z
    .string({
      error: (issue) => issue.input === undefined 
    ? "Nome é obrigatório" 
    : "Nome deve ser um texto" 
    })
    .min(1, "Nome não pode estar vazio")
    .max(100, "Nome não pode ter mais de 100 caracteres")
    .trim()
    
export const corSchema = z
    .string({
      error: (issue) => issue.input === undefined 
      ? "Cor é obrigatória" 
      : "Cor deve ser um texto" 
    })
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor deve estar no formato hexadecimal válido (ex: #FF0000)")
    .trim()

export const slugSchema = z
    .string({
      error: (issue) => issue.input === undefined 
      ? "Slug é obrigatório" 
      : "Slug deve ser um texto" 
    })
    .min(1, "Slug não pode estar vazio")
    .max(100, "Slug não pode ter mais de 100 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hífens, sem espaços")
    .trim()