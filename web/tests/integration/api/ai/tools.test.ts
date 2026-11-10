import { describe, it, vi, beforeEach, expect, Mock } from "vitest";
import { ToolError, type AiContext } from "@ntec/ai";
import * as userService from "@/backend/services/users";
import * as rag from "@/backend/services/ai/rag";

vi.mock("@/backend/services/users", () => ({
  getAllUsers: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("@/backend/services/ai/rag", () => ({
  searchDocuments: vi.fn(),
}));

import { assistantTools } from "@/backend/services/ai/tools";

const ctx = (role: string): AiContext => ({ userId: "u1", role });

// As ferramentas são testadas como funções comuns: permissão e formato do retorno.
describe("ferramentas do assistente", () => {
  beforeEach(() => vi.clearAllMocks());

  it("listarUsuarios nega acesso a quem não é admin", async () => {
    await expect(assistantTools.listarUsuarios.execute({}, ctx("USER"))).rejects.toThrow(ToolError);
    expect(userService.getAllUsers).not.toHaveBeenCalled();
  });

  it("listarUsuarios devolve só nome, e-mail e papel", async () => {
    (userService.getAllUsers as Mock).mockResolvedValue([
      { id: "x", name: "Ana", email: "ana@ex.com", role: "ADMIN", emailVerified: true, createdAt: new Date() },
    ]);
    const result = await assistantTools.listarUsuarios.execute({}, ctx("ADMIN"));
    expect(result).toEqual([{ nome: "Ana", email: "ana@ex.com", papel: "ADMIN" }]);
  });

  it("atualizarMeuNome é de escrita (pede aprovação) e só altera o próprio usuário", async () => {
    expect(assistantTools.atualizarMeuNome.risk).toBe("write");
    (userService.updateUser as Mock).mockResolvedValue({ name: "Maria" });
    await assistantTools.atualizarMeuNome.execute({ name: "Maria" }, ctx("USER"));
    expect(userService.updateUser).toHaveBeenCalledWith("u1", { name: "Maria" });
  });

  it("buscarDocumentos busca no escopo do usuário e marca o texto como não confiável", async () => {
    (rag.searchDocuments as Mock).mockResolvedValue([
      { id: "c1", sourceId: "d1", sourceName: "reembolso.pdf", text: "Prazo de 30 dias.", score: 0.91 },
    ]);
    const result = (await assistantTools.buscarDocumentos.execute({ consulta: "prazo de reembolso" }, ctx("USER"))) as {
      trechos: { fonte: string; texto: string }[];
    };
    expect(rag.searchDocuments).toHaveBeenCalledWith(ctx("USER"), "prazo de reembolso");
    expect(result.trechos[0].fonte).toBe("reembolso.pdf");
    expect(result.trechos[0].texto).toContain("<conteudo_nao_confiavel");
  });

  it("o conjunto de ferramentas não forma a lethal trifecta", async () => {
    const { checkToolset } = await import("@ntec/ai");
    expect(checkToolset(assistantTools)).toEqual([]);
  });
});
