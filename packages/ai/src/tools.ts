import { tool, type ToolSet } from 'ai'
import type { z } from 'zod'
import type { ToolMeta } from './guardrails/policy'
import { limitToolResult } from './guardrails/output'

/**
 * Quem está usando a IA. Montado no servidor a partir da sessão
 * (getUserFromRequest), nunca a partir do que o modelo ou o navegador
 * mandam. Toda ferramenta recebe este contexto e decide o que o usuário
 * pode ver ou fazer, exatamente como uma rota faz.
 */
export interface AiContext {
  userId: string
  role: string
  tenantId?: string
  conversationId?: string
}

/** Erro com mensagem segura para o modelo (e, por tabela, para o usuário). */
export class ToolError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ToolError'
  }
}

export interface NtecTool<S extends z.ZodType = z.ZodType, R = unknown> extends ToolMeta {
  /** O modelo escolhe ferramentas lendo isto. Diga quando usar e quando não usar. */
  description: string
  /** Reaproveite o schema Zod da rota sempre que possível. */
  inputSchema: S
  execute: (input: z.infer<S>, ctx: AiContext) => Promise<R>
  /** Limite do resultado devolvido ao modelo, em caracteres. */
  maxResultChars?: number
}

/** Define uma ferramenta com tipagem da entrada inferida do schema. */
export function defineTool<S extends z.ZodType, R>(definition: NtecTool<S, R>): NtecTool<S, R> {
  return definition
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NtecToolMap = Record<string, NtecTool<any, any>>

/**
 * Converte as definições do projeto em ferramentas do AI SDK, presas ao
 * contexto do usuário da requisição. Erros inesperados viram uma mensagem
 * genérica: detalhes internos (stack, query) não vão para o modelo.
 */
export function buildTools(definitions: NtecToolMap, ctx: AiContext): { tools: ToolSet; metas: Record<string, ToolMeta> } {
  const tools: ToolSet = {}
  const metas: Record<string, ToolMeta> = {}

  for (const [name, def] of Object.entries(definitions)) {
    metas[name] = {
      risk: def.risk,
      readsPrivateData: def.readsPrivateData,
      readsUntrustedContent: def.readsUntrustedContent,
      sendsExternally: def.sendsExternally,
    }
    tools[name] = tool({
      description: def.description,
      inputSchema: def.inputSchema,
      execute: async (input: unknown) => {
        try {
          const result = await def.execute(input, ctx)
          return limitToolResult(result, def.maxResultChars)
        } catch (error) {
          if (error instanceof ToolError) throw error
          console.error(`[ai] ferramenta ${name} falhou`, error)
          throw new ToolError('A ferramenta falhou. Diga ao usuário que não foi possível consultar agora.')
        }
      },
    })
  }

  return { tools, metas }
}
