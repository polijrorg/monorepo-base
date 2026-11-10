/**
 * Política de ferramentas: quanto risco cada ferramenta carrega e o que
 * isso exige. É a aplicação do princípio "least agency" do OWASP Top 10
 * for Agentic Applications: o agente recebe só a autonomia necessária.
 */

/**
 * - `read`: só consulta dados. Roda sem aprovação.
 * - `write`: altera dados de forma reversível. Pede aprovação do usuário.
 * - `irreversible`: apaga, envia, paga, notifica terceiros. Pede aprovação.
 */
export type ToolRisk = 'read' | 'write' | 'irreversible'

export interface ToolMeta {
  risk: ToolRisk
  /** A ferramenta devolve dados privados do cliente ou do usuário. */
  readsPrivateData?: boolean
  /** A ferramenta traz texto que o time não controla (documento enviado, e-mail, página web). */
  readsUntrustedContent?: boolean
  /** A ferramenta manda algo para fora do sistema (e-mail, webhook, API externa). */
  sendsExternally?: boolean
}

export function needsApproval(risk: ToolRisk): boolean {
  return risk !== 'read'
}

/**
 * Monta a opção `toolApproval` do AI SDK 7 a partir dos riscos.
 * Só as ferramentas que exigem aprovação aparecem no objeto.
 */
export function buildToolApproval(metas: Record<string, ToolMeta>): Record<string, 'user-approval'> {
  const approval: Record<string, 'user-approval'> = {}
  for (const [name, meta] of Object.entries(metas)) {
    if (needsApproval(meta.risk)) approval[name] = 'user-approval'
  }
  return approval
}

export interface ToolsetIssue {
  code: 'lethal-trifecta'
  message: string
  tools: string[]
}

/**
 * "Lethal trifecta" (Simon Willison, 2025): um agente que lê dados privados,
 * lê conteúdo não confiável e consegue mandar dados para fora pode ser levado,
 * por prompt injection, a vazar os dados. Nenhum filtro de texto resolve isso
 * de forma confiável; a defesa é não juntar as três capacidades no mesmo
 * agente, ou exigir aprovação humana em toda saída externa.
 */
export function checkToolset(metas: Record<string, ToolMeta>): ToolsetIssue[] {
  const entries = Object.entries(metas)
  const privateData = entries.filter(([, m]) => m.readsPrivateData).map(([k]) => k)
  const untrusted = entries.filter(([, m]) => m.readsUntrustedContent).map(([k]) => k)
  const unguardedExternal = entries
    .filter(([, m]) => m.sendsExternally && !needsApproval(m.risk))
    .map(([k]) => k)

  if (privateData.length && untrusted.length && unguardedExternal.length) {
    return [
      {
        code: 'lethal-trifecta',
        message:
          'O agente lê dados privados, lê conteúdo não confiável e envia dados para fora sem aprovação. ' +
          'Separe em dois agentes ou marque as ferramentas de envio como `write`/`irreversible`.',
        tools: [...new Set([...privateData, ...untrusted, ...unguardedExternal])],
      },
    ]
  }
  return []
}
