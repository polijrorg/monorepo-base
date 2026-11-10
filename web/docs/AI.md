# IA embarcada no monorepo

Guia da camada de IA do template: o que ela entrega pronto, como construir um recurso de IA num projeto e o que precisa ser combinado com o cliente.

A camada é **opcional**. No `/setup`, quem não marca "IA embarcada" fica com o monorepo exatamente como antes: sem dependência a mais, sem chave de API e sem custo.

## Sumário
1. [O que vem pronto](#o-que-vem-pronto)
2. [Como as peças se encaixam](#como-as-peças-se-encaixam)
3. [Primeiros passos](#primeiros-passos)
4. [Criar uma ferramenta](#criar-uma-ferramenta)
5. [Extração estruturada](#extração-estruturada)
6. [RAG: busca nos documentos](#rag-busca-nos-documentos)
7. [Evals: o critério de aceite](#evals-o-critério-de-aceite)
8. [Guardrails](#guardrails)
9. [Custo e telemetria](#custo-e-telemetria)
10. [Troca de modelo](#troca-de-modelo)
11. [LGPD e conta do cliente](#lgpd-e-conta-do-cliente)
12. [O que a IA não faz neste template](#o-que-a-ia-não-faz-neste-template)
13. [Checklist antes de produção](#checklist-antes-de-produção)

## O que vem pronto

| Peça | Onde | Para que serve |
|---|---|---|
| Registro de modelos | `packages/ai/src/models.ts` | O código pede `fast` ou `smart`, nunca o nome do modelo. Fallback e prompt caching pelo AI Gateway |
| Agente com ferramentas | `packages/ai/src/agent.ts` | Streaming, teto de passos, aprovação humana, janela de histórico, telemetria |
| Extração estruturada | `packages/ai/src/structured.ts` | Texto livre entra, objeto validado pelo Zod sai |
| Ferramentas | `packages/ai/src/tools.ts` | Contexto do usuário injetado pelo servidor, erros sem vazar detalhes internos |
| Guardrails | `packages/ai/src/guardrails/` | Política de risco, limite de gasto, limites de entrada e saída, delimitação de conteúdo não confiável |
| RAG | `packages/ai/src/rag/` + `services/ai/rag.ts` | Divisão em trechos, embeddings, busca vetorial no Atlas com escopo de permissão obrigatório |
| Evals | `packages/ai/src/evals/` + `web/tests/evals/` | Conjunto de casos, avaliadores binários, juiz por LLM, relatório em markdown |
| Telemetria | `services/ai/telemetry.ts` + modelo `AiCall` | Custo, tokens, latência e ferramentas por chamada, por usuário e por recurso |
| Chat | `src/components/ai/` | Streaming, status das ferramentas, aprovação de ações, fontes, feedback |
| Exemplo completo | `services/ai/`, `api/ai/*`, `/assistente` | Assistente com 3 ferramentas: busca em documentos, leitura com permissão e escrita com aprovação |

## Como as peças se encaixam

```
navegador (AiChat, useChat)
   │  POST /api/ai/chat
   ▼
route.ts ── auth (getUserFromRequest) ── schema Zod ── limite de entrada ── limite de gasto
   │
   ▼
services/ai/assistant.ts ── prompt versionado + ferramentas do projeto
   │
   ▼
@ntec/ai streamAgent ── AI Gateway (modelo + fallback + cache)
   │                         │
   │ ferramenta chamada      └── telemetria (ai_call)
   ▼
services/ai/tools ── services que já existem (users, rag, ...) ── Prisma
```

A regra que mais importa: **a IA não ganha acesso a nada que uma rota comum não teria**. Cada ferramenta chama um service existente, com o usuário da sessão, e checa permissão do mesmo jeito que a rota checaria.

## Primeiros passos

1. No `web/.env`, preencha `AI_GATEWAY_API_KEY` (crie em Vercel > AI Gateway, **na conta do cliente**). Em produção na Vercel, o OIDC do projeto dispensa a chave.
2. `pnpm install` e `pnpm --filter web exec prisma db push` (cria `ai_call`, `ai_feedback` e `ai_chunk`).
3. Se o projeto usar busca em documentos: `pnpm --filter web ai:vector-index` (cria o índice vetorial no Atlas; leva alguns minutos para ficar pronto).
4. `pnpm --filter web dev` e abra `/assistente`. Use a requisição `bruno/ai/documents` para indexar um texto de teste.

## Criar uma ferramenta

Use `/new-ai-tool <nome>` no Claude Code. Ele segue estes passos:

1. Ache o service que já faz a operação. Se não existir, crie primeiro a rota com `/new-route`; a ferramenta vem depois.
2. Defina a ferramenta em `services/ai/tools/` com `defineTool`:

```ts
consultarPedido: defineTool({
  risk: "read",                 // read | write | irreversible
  readsPrivateData: true,
  description: "Busca um pedido do usuário pelo número. Use quando ele citar um número de pedido.",
  inputSchema: z.object({ numero: z.string().describe("Número do pedido, ex.: 10234") }),
  execute: async ({ numero }, ctx) => {
    const pedido = await findPedido(numero);
    if (!pedido || pedido.userId !== ctx.userId) throw new ToolError("Pedido não encontrado.");
    return { numero: pedido.numero, status: pedido.status, prazo: pedido.prazo };
  },
}),
```

3. Regras:
   - **Permissão dentro da ferramenta**, com `ctx` (vem da sessão). Nunca confie em id de usuário vindo do modelo.
   - **Devolva só o necessário**. Nada de ids internos, tokens ou campos que o modelo não precisa. Resultado grande é cortado em 12 mil caracteres.
   - **Descrição diz quando usar e quando não usar.** É o que o modelo lê para escolher.
   - **Escrita é `write`; enviar, apagar, pagar ou notificar terceiros é `irreversible`.** As duas pedem confirmação do usuário na tela.
   - Marque `readsUntrustedContent` se a ferramenta traz texto que o time não controla (documento enviado, e-mail, página web), e `sendsExternally` se manda algo para fora. O agente se recusa a subir com a "lethal trifecta" sem aprovação (ver [Guardrails](#guardrails)).
4. Acrescente o rótulo da ferramenta em `src/components/ai/toolLabels.ts`.
5. Escreva o teste em `tests/integration/api/ai/tools.test.ts` (permissão e formato do retorno).
6. Acrescente casos em `tests/evals/` que exijam a ferramenta nova.

## Extração estruturada

O caso de uso mais seguro: formato fixo, acerto medido campo a campo, revisão humana antes de virar registro.

```ts
import { extractStructured } from "@ntec/ai";

const { output } = await extractStructured({
  ctx, feature: "extracao-nf", promptVersion: "nf@1",
  instructions: "Extraia os dados da nota fiscal. Valores em reais, datas em ISO.",
  schema: z.object({ numero: z.string(), cnpjEmitente: z.string(), valorTotal: z.number(), emissao: z.string() }),
  input: textoDaNota, source: "nota.pdf",
  telemetry: prismaTelemetry,
});
```

Use o modelo `fast` (padrão) e só suba para `smart` se as evals mostrarem que precisa.

## RAG: busca nos documentos

- `indexDocument` divide o texto em trechos de até 1.500 caracteres com sobreposição de 200, gera os embeddings e grava em `ai_chunk`.
- `searchDocuments` busca **sempre** com o escopo do usuário (`ownerId`). Sem escopo, o pipeline nem é montado.
- Em projeto com empresas ou equipes, troque ou some um `tenantId` no modelo `AiChunk`, no filtro do índice (`scripts/ai-vector-index.mjs`) e no `scope` da busca.
- Os trechos voltam delimitados como conteúdo não confiável: o prompt instrui o modelo a nunca seguir instruções que estejam dentro deles.
- PDF, Word e planilha precisam virar texto antes. A extração de texto de arquivos não está no template porque depende do tipo de documento de cada cliente.

## Evals: o critério de aceite

Este é o ponto que faz o NTec conseguir entregar IA sem um núcleo de dados: **a qualidade vira um teste que roda**, com meta combinada com o cliente.

**Protocolo mínimo por projeto:**

1. **Sprint 1:** o cliente entrega 50 a 100 casos reais com a resposta esperada, definidos pelo especialista de domínio dele. Eles vão para `tests/evals/<recurso>.cases.json`. Sem esses casos, o projeto não começa a parte de IA.
2. **Meta acordada** (`target`), comparada com o processo atual do cliente, não com 100%. Ela entra no critério de aceite do PRD.
3. **Avaliadores binários** (passa ou não passa). Use os de código (`defaultGraders`) para tudo que é verificável. Juiz por LLM (`llmJudge`) só para o que código não pega, e só depois de validado contra 100 a 200 casos rotulados por uma pessoa.
4. **A cada duas sprints:** leia cerca de 100 conversas reais (ou de teste), anote os erros, transforme os erros novos em casos. As respostas com polegar para baixo (`ai_feedback`, `rating = DOWN`) são a fonte principal.
5. **Antes de cada entrega e de toda troca de modelo ou prompt:** rode `pnpm --filter web test:evals` (ou o workflow "CI IA" com a label `evals`). O relatório sai em `tests/evals/report.md`.

**Consistência:** com `AI_EVALS_TRIALS=3`, cada caso roda três vezes. Um agente com 75% de acerto por tentativa acerta 3 de 3 só em cerca de 42% dos casos. Para recursos que falam com o cliente final, olhe a linha "Casos certos em todas as tentativas".

Os dois níveis de teste não se confundem:

| | Testes de integração (`pnpm test`) | Evals (`pnpm test:evals`) |
|---|---|---|
| Modelo | Falso (`@ntec/ai/testing`) | Real, pelo AI Gateway |
| Testa | Encanamento: rota, auth, permissão, formato | Qualidade: acerto, "não sei", resistência a injeção |
| Custo | Zero | Tokens (centavos a poucos dólares por rodada) |
| Quando | Todo PR | Manual, label `evals`, antes de entregar |

## Guardrails

| Risco (OWASP) | Proteção no template |
|---|---|
| Prompt injection direta | Mensagem `system` do navegador recusada no schema; o AI SDK 7 também recusa por padrão |
| Prompt injection indireta (documento malicioso) | Conteúdo externo delimitado + regra no prompt + caso de eval `injecao-no-documento` |
| Agência excessiva | Risco por ferramenta; escrita e ações irreversíveis exigem confirmação na tela; teto de 6 passos |
| Vazamento de dados | Permissão dentro de cada ferramenta com o contexto da sessão; RAG com escopo obrigatório; erro interno não vai para o modelo |
| "Lethal trifecta" | `checkToolset` impede subir um agente que lê dados privados, lê conteúdo não confiável e envia para fora sem aprovação |
| Consumo descontrolado | Limite de gasto por usuário em 24h (`AI_DAILY_BUDGET_USD_PER_USER`), limite de tamanho de mensagem, histórico limitado a 20 mensagens, resultado de ferramenta cortado |
| Saída inválida | Saída estruturada validada pelo Zod antes de chegar ao app |

`flagSuspiciousInstructions` só registra tentativas no log. Detectar injeção por texto não é proteção; a proteção é o que a IA consegue fazer, não o que ela lê.

## Custo e telemetria

Cada chamada grava uma linha em `ai_call` com tokens, custo estimado, latência, passos e ferramentas usadas. Dá para responder ao cliente "quanto custa por interação" com uma consulta:

```js
db.ai_call.aggregate([
  { $match: { feature: "assistente", createdAt: { $gte: ISODate("2027-03-01") } } },
  { $group: { _id: null, chamadas: { $sum: 1 }, custo: { $sum: "$costUsd" }, latenciaMedia: { $avg: "$latencyMs" } } },
])
```

O custo é estimado pela tabela `packages/ai/src/pricing.ts` (preços de lista com data). A fatura real vem do AI Gateway. Referência do estudo de viabilidade: um assistente interno com ferramentas, 50 usuários e 20 interações por dia, custa cerca de US$ 66/mês no Haiku 5.5 e US$ 930 a 1.260/mês no Sonnet 5.5 (preços de 09/11/2026). Por isso o padrão é `fast` para tarefas simples e `smart` só onde as evals mostrarem que precisa.

O AI Gateway aplica prompt caching automático (`caching: 'auto'`): instruções e definições de ferramentas, que se repetem em toda chamada, custam até 20 vezes menos depois da primeira.

## Troca de modelo

A Anthropic avisa com 60 dias de antecedência antes de aposentar um modelo, e chamadas a um modelo aposentado falham. Um sistema entregue hoje provavelmente vai precisar trocar de modelo em 6 a 12 meses.

Com este template, a troca é uma tarefa de manutenção:

1. Altere o slug em `models.ts` (ou `AI_MODEL_SMART` no ambiente) e acrescente o preço em `pricing.ts`.
2. Rode as evals com 3 tentativas. Compare com o último relatório.
3. Se a taxa de acerto ficou na meta, suba. Se não, ajuste o prompt e rode de novo.

## LGPD e conta do cliente

- **A conta do AI Gateway (e a fatura) fica no nome do cliente**, como toda infraestrutura do projeto. O cliente é o controlador dos dados e quem contrata o provedor de IA.
- Mandar dados pessoais a um modelo hospedado fora do Brasil é **transferência internacional**. O cliente precisa ter base legal e as cláusulas-padrão da ANPD (Resolução CD/ANPD nº 19/2024). Confirme isso no Diagnóstico.
- Envie ao modelo só o necessário. Ferramentas devolvem campos mínimos; não mande dados sensíveis (saúde, biometria, origem racial, religião, dados de crianças).
- A telemetria guarda números e ids, nunca o texto da conversa.
- Para clientes que exigem, o AI Gateway oferece zero data retention por requisição e roteamento por região.

## O que a IA não faz neste template

Lista do estudo de viabilidade do NTec, para combinar no Diagnóstico:

- Decidir sobre crédito, contratação, demissão, saúde, seleção acadêmica ou benefícios (são usos de alto risco no PL 2338/2023).
- Biometria ou reconhecimento de emoção.
- Executar ação irreversível sem confirmação humana.
- Treinar ou ajustar modelo (fine-tuning), prever números, recomendar ou pontuar a partir de base histórica: isso é trabalho de dados (NDados).
- Executar código ou navegar livremente na web.

## Checklist antes de produção

- [ ] Casos de eval do cliente no repositório e meta registrada no PRD
- [ ] Evals rodadas com 3 tentativas, relatório anexado ao aceite
- [ ] Toda ferramenta de escrita marcada como `write` ou `irreversible`
- [ ] Teste de permissão para cada ferramenta que lê dado privado
- [ ] `AI_DAILY_BUDGET_USD_PER_USER` definido com o cliente
- [ ] Conta do AI Gateway no nome do cliente, com limite de gasto configurado lá também
- [ ] Base legal e cláusulas de transferência internacional confirmadas pelo cliente
- [ ] Índice vetorial criado no Atlas (se houver RAG)
- [ ] Rótulos das ferramentas em `toolLabels.ts`
- [ ] Runbook entregue: como trocar de modelo, como ler a telemetria, como acrescentar casos de eval
