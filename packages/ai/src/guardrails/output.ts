/**
 * Guardrails de saída de ferramentas.
 *
 * Resultado de ferramenta volta inteiro para a janela de contexto do modelo.
 * Uma consulta que devolve 5 mil registros estoura o contexto, encarece a
 * chamada e piora a resposta. Este limite corta o excesso e avisa o modelo
 * para refinar a busca.
 */

export const DEFAULT_MAX_TOOL_RESULT_CHARS = 12_000

export interface TruncatedResult {
  truncated: true
  totalChars: number
  preview: string
  note: string
}

export function limitToolResult<T>(
  value: T,
  maxChars: number = DEFAULT_MAX_TOOL_RESULT_CHARS,
): T | TruncatedResult {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value)
  if (serialized === undefined || serialized.length <= maxChars) return value
  return {
    truncated: true,
    totalChars: serialized.length,
    preview: serialized.slice(0, maxChars),
    note: 'Resultado cortado por tamanho. Refine a busca com filtros mais específicos.',
  }
}
