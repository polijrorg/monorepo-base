# @ntec/ai

Núcleo de IA embarcada do monorepo do NTec. Opcional: o `/setup` remove este pacote se o projeto não usar IA.

O que tem aqui é igual em todo projeto (modelos, custo, guardrails, RAG, harness de evals). O que é específico do cliente (ferramentas, prompts, casos de teste) fica no `web`, nos padrões de sempre.

```
src/
  models.ts           apelidos fast/smart, fallback, opções do AI Gateway
  pricing.ts          preços de lista com data, custo por chamada
  usage.ts            tokens num formato único
  telemetry.ts        registro por chamada (o app grava no Mongo)
  tools.ts            defineTool, contexto do servidor, erro seguro
  agent.ts            streamAgent (chat) e runAgent (evals, segundo plano)
  structured.ts       extração com saída validada pelo Zod
  guardrails/         risco por ferramenta, gasto, entrada, saída
  rag/                trechos, embeddings, busca vetorial com escopo
  evals/              casos, avaliadores, juiz, execução, relatório
  testing.ts          modelos falsos para testes (import "@ntec/ai/testing")
```

Comandos:

```bash
pnpm --filter @ntec/ai test        # testes unitários
pnpm --filter @ntec/ai typecheck
```

Uso no servidor apenas. Guia completo: [`web/docs/AI.md`](../../web/docs/AI.md).
