# Template base de Front (web/mobile) e Back

## Sumário
1. [Introdução](#introdução)
2. [Setup e Início de Projeto](#setup-e-início-de-projeto)
3. [Tecnologias Usadas](#tecnologias-usadas)
4. [Claude Code — Agents, Skills e Comandos](#claude-code--agents-skills-e-comandos)
5. [Specs e Padrões de Projeto](#specs-e-padrões-de-projeto)
6. [Atualizando o monorepo](#atualizando-o-monorepo)

## Introdução
Esse é o repositório principal do NTec e engloba todo nosso escopo de dev/delivery. Nele temos algumas pastas que correspondem a uma funcionalidade no geral:
- `/.github` — workflows de CI/CD (GitHub Actions para web e EAS para mobile)
- `/.husky` — hooks de git: lint no commit, typecheck no push
- `/.claude` — agents, skills e comandos do Claude Code (ver seção abaixo)
- `/bruno` — documentador de APIs, usado pra mandar requests e facilitar a vida do front
- `/mobile` — front mobile com Expo e NativeWind
- `/web` — Next.js, Prisma e tecnologias de front web e back
- `/.vscode` — configs do editor, sinta-se à vontade pra customizar

## Setup e Início de Projeto

Para começar um projeto novo, clique em **Use this template** e marque o owner como `polijr` (se não for treinamento).

```bash
git clone <link>
pnpm install
```

#### Início com Claude Code (recomendado)

Se estiver usando Claude Code, rode o comando de setup interativo:

```
/setup
```

Ele guia você pelo nome do projeto, escopo (web ou web + mobile), integrações opcionais e configura automaticamente o `CLAUDE.md`, `.env.example` e os workflows de CI/CD.

#### Início manual

1. Copie `web/.env.example` → `web/.env` e preencha as variáveis
2. Se web + mobile: copie `mobile/.env.example` → `mobile/.env`
3. Configure os GitHub Secrets necessários (ver `.env.example` para a lista)
4. Rode `pnpm --filter web dev` para iniciar o servidor de desenvolvimento

O monorepo já vem com modelos, telas e componentes base. A primeira coisa a fazer é excluir ou adaptar essa base para o projeto. Por exemplo: o Resend vem configurado para a rota de `forgot password` — configure-o ou remova a rota se não for usar email.

## Tecnologias Usadas

#### Web
- **Framework:** Next.js 16 (App Router)
- **Back:** Prisma ORM, MongoDB, Better Auth, Zod
- **Front:** Tailwind CSS 4, shadcn/ui, lucide-react, react-hot-toast, SWR

#### Mobile
- Expo 55, React Native, Expo Router, NativeWind, Better Auth client

#### Testes
- Vitest (integração), Playwright (e2e)

#### CI/CD
- GitHub Actions: lint, typecheck, testes de integração e e2e em PRs
- EAS: preview build em PRs, production build + OTA no push para main

---

## Claude Code — Agents, Skills e Comandos

Este template vem com agents e skills pré-configurados em `.claude/`. Abra o projeto com Claude Code e tudo estará disponível automaticamente.

### Agents especializados

Invocados com `/agent:nome` ou automaticamente quando Claude detecta o contexto.

| Agent | Como invocar | Especialização |
|---|---|---|
| **frontend** | `/agent:frontend` | Next.js 16 App Router, Server/Client Components, shadcn/ui, SWR, import order, estrutura de `_components/` |
| **backend** | `/agent:backend` | Padrão controller/service/schema, Better Auth, Prisma, Zod, utilitários (`blockForbiddenRequests`, `toErrorMessage`), testes de integração |
| **security** | `/agent:security` | Auditoria de auth/authorization, OWASP Top 10 em contexto Next.js, validação de input, leakage de secrets, revisão de rotas |

### Skills — Comandos de scaffolding

| Comando | Argumento | O que faz |
|---|---|---|
| `/setup` | `[nome-do-projeto]` | Wizard de inicialização: define nome, descrição, escopo (web ou web + mobile) e integrações opcionais. Atualiza `CLAUDE.md`, `package.json`, `.env.example` e workflows de CI/CD |
| `/new-route` | `<recurso> [--methods GET,POST] [--public]` | Scaffolda rota API completa: `route.ts` + `services/` + `schema.ts` + stub de teste de integração |
| `/new-page` | `<nome> [--protected\|--public\|--auth\|--admin]` | Scaffolda página Next.js com `page.tsx`, `_components/index.ts` e `actions/` no route group correto |
| `/new-screen` | `<nome> [--protected\|--public]` | Scaffolda tela Expo com NativeWind, Expo Router e auth guard via `useAuth()` |
| `/check` | `[web\|mobile\|all]` | Roda `lint` + `tsc --noEmit` em web e/ou mobile e reporta erros antes do push |

### Skills — Caveman (eficiência de tokens)

Baseado em [juliusbrussee/caveman](https://github.com/juliusbrussee/caveman). Reduz o output do Claude em ~75% mantendo precisão técnica.

| Comando | O que faz |
|---|---|
| `/caveman` | Ativa modo caveman: resposta comprimida, sem artigos e filler, técnicamente preciso. Desative com "stop caveman" ou "modo normal" |
| `/caveman-commit` | Gera mensagem de commit no formato Conventional Commits, ≤72 chars, sem ruído |
| `/caveman-compress` `<arquivo>` | Comprime arquivo de memória/notas (`.md`, `.txt`) em caveman-speak, cria backup `.original.md` |
| `/caveman-review` | Review de diff ultra-comprimido: uma linha por finding no formato `arquivo:Llinha: problema. fix.` |
| `/cavecrew` | Spawna subagents comprimidos especializados: `investigator` (localiza código), `builder` (edições cirúrgicas), `reviewer` (audit de diff) |

### Skills — Model-invoked (ativam automaticamente)

Estas skills não precisam ser chamadas explicitamente — Claude as ativa sozinho quando o contexto bate.

| Skill | Ativa quando... |
|---|---|
| `backend-patterns` | Criando rotas, services ou schemas em `(backend)/` |
| `frontend-patterns` | Criando páginas ou componentes em `(frontend)/` |
| `security-patterns` | Tocando auth, variáveis de ambiente ou validação de input |

---

## Specs e Padrões de Projeto

Existem especificações que regem os nossos projetos e é **extremamente importante mantê-las**, principalmente para evitar redundâncias e código duplicado. Documentação completa em `/web/docs`.

Exemplos de especificações:
- Ícones do `lucide-react` e fontes do `next/font`
- Alertas com `toast.success` / `toast.error` (react-hot-toast)
- Funções utilitárias: `blockForbiddenRequests`, `toErrorMessage`, `getUserFromRequest`, `returnInvalidDataErrors`
- Rotas sempre no plural: `/api/users`, `/api/lessons`
- Componentes < 200 linhas; SOLID principles
- Nunca usar `@auth/prisma-adapter` — o repo usa `better-auth/adapters/prisma`

## Atualizando o monorepo
Se você é liderança técnica, coord ou só busca ajudar a atualizar o monorepo, parabéns!!! Existem alguns passos que devem ser seguidos e alguns pensamentos de arquitetura que devemos ter em mente antes de damros merge nesse repo ou de fazer seu PR **(sim, não é pra commitar na main!!!!!!)**. 

**ANTES DISSO PORÉM, É IMPORTANTE LEMBRAR: quando atualizamos o Next.js e consequentemente a versão do React (a não ser que seja um patch release, ou seja, 15.5.1 -> 15.5.3) é IMPORTANTE VERIFICAR SE O EXPO TAMBÉM ESTÁ ATUALIZANDO PRA MESMA VERSÃO DO REACT (ou alguma com mesma patch version, como react 19.1.x e 19.1.y). é possível haver erros em versões mais antigas do pnpm ou problemas com o pnpm-lock e os node_modules já instalados, então se for necessário deixar diferentes versões do react, dê uma boa testada tanto no expo quanto o next**

Considerações e dicas:
- Essa nova lib vai mudar os padrões de código atual? Como podemos contornar isso (docs, workshop, etc.)?
- Isso vai facilitar ou atrapalhar quem for começar um projeto novo? Qual o tamanho desse impacto?
- O quão flexível é essa lib/solução?
- O quão escalável é essa lib/solução?
- Essa novidade é fácil de entender?
- Por quanto tempo essa lib será mantida? Ela tem um time de suporte ativo?
- Quanto código duplicado isso gera?

Lembre-se de fazer bons nomes e descrições no PR, além de bons commits.
