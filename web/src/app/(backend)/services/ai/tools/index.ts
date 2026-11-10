import { z } from "zod";
import { defineTool, ToolError, wrapUntrusted, type NtecToolMap } from "@ntec/ai";
import { getAllUsers, updateUser } from "@/backend/services/users";
import { patchSchema } from "@/backend/schemas";
import { searchDocuments } from "../rag";

/**
 * Ferramentas do assistente. Regra do template: cada ferramenta chama um
 * service que já existe e reaproveita o schema Zod da rota. A IA não ganha
 * nenhum acesso ao banco que uma rota comum não teria, e a checagem de
 * permissão acontece aqui, com o contexto do servidor.
 *
 * As três abaixo são exemplos dos três tipos de ferramenta: busca em
 * documentos (RAG), leitura com permissão por papel e escrita com aprovação.
 */
export const assistantTools: NtecToolMap = {
  buscarDocumentos: defineTool({
    risk: "read",
    readsPrivateData: true,
    // documentos enviados pelo usuário são conteúdo não confiável (podem conter prompt injection)
    readsUntrustedContent: true,
    description:
      "Busca trechos nos documentos que o usuário enviou ao sistema. Use para perguntas sobre políticas, manuais, contratos e procedimentos. Não use para dados de cadastro.",
    inputSchema: z.object({
      consulta: z.string().min(3).max(300).describe("O que procurar, em linguagem natural"),
    }),
    execute: async ({ consulta }, ctx) => {
      const trechos = await searchDocuments(ctx, consulta);
      if (trechos.length === 0) return { trechos: [], aviso: "Nenhum trecho relevante encontrado." };
      return {
        trechos: trechos.map((t) => ({
          fonte: t.sourceName,
          relevancia: Number(t.score.toFixed(2)),
          texto: wrapUntrusted(t.text, t.sourceName),
        })),
      };
    },
  }),

  listarUsuarios: defineTool({
    risk: "read",
    readsPrivateData: true,
    description:
      "Lista nome, e-mail e papel dos usuários cadastrados. Só administradores podem usar. Use quando pedirem quem tem acesso ao sistema.",
    inputSchema: z.object({}),
    execute: async (_input, ctx) => {
      if (ctx.role !== "ADMIN" && ctx.role !== "SUPER_ADMIN") {
        throw new ToolError("O usuário não tem permissão para listar usuários.");
      }
      const users = await getAllUsers();
      // devolve só o necessário: nada de ids internos, datas ou tokens
      return users.map((u) => ({ nome: u.name, email: u.email, papel: u.role }));
    },
  }),

  atualizarMeuNome: defineTool({
    risk: "write",
    description: "Altera o nome de exibição do próprio usuário. O sistema pede confirmação antes de executar.",
    // mesmo schema da rota PATCH /api/users/[id]
    inputSchema: patchSchema,
    execute: async (input, ctx) => {
      const user = await updateUser(ctx.userId, input);
      return { nome: user.name, atualizado: true };
    },
  }),
};
