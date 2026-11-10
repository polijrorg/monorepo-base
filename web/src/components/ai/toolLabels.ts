// Como cada ferramenta aparece para o usuário enquanto o agente trabalha.
// Acrescente aqui toda ferramenta nova (o /new-ai-tool faz isso).
export const TOOL_LABELS: Record<string, { running: string; done: string; approval?: string }> = {
  buscarDocumentos: { running: "Consultando documentos", done: "Documentos consultados" },
  listarUsuarios: { running: "Consultando usuários", done: "Usuários consultados" },
  atualizarMeuNome: {
    running: "Preparando alteração do nome",
    done: "Nome alterado",
    approval: "O assistente quer alterar o seu nome de exibição.",
  },
};

export function toolLabel(name: string) {
  return TOOL_LABELS[name] ?? { running: `Executando ${name}`, done: `${name} concluído` };
}
