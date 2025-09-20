# Template base de Front (web/mobile) e Back

## Sumário
1. [Introdução](#introdução)
2. [Setup e Início de Projeto](#setup-e-início-de-projeto)
3. [Tecnologias Usadas](#tecnologias-usadas)
4. [Specs e Padrões de Projeto](#specs-e-padrões-de-projeto)
5. [Atualizando o monorepo](#atualizando-o-monorepo)

## Introdução
Esse é o repositório principal do NTec e engloba todo nosso escopo de dev/delivery. Nele temos algumas pastas que correspondem a uma funcionalidade no geral:
- /.github -> relacionada ao readme, workflows e mais em relação ao Github e o Github Actions
- /husky -> usado pra validações/scripts com o Git, por exemplo os lints antes de dar Push
- /bruno -> é nosso documentador de APIs, usado pra mandar requests, documentar o back e facilitar a vida do front!
- /mobile -> contém nosso front mobile que usa expo e nativewind atualmente
- /web -> contém o next, prisma e nossas tecnologias de Front web e Back!
- /.vscode -> configs do seu editor, sinta-se à vontade pra customizar

## Setup e Início de Projeto
Para começar um projeto novo a ser executado, clique em usar template e marque o owner como polijr (se não for um projeto de treinamento).
Após criado, clique em code > pegue o link do git > entre na pasta desejada no seu terminal e digite:
```bash
git clone <link>
```
Depois disso, entre na pasta criada e instale as dependências
```bash
pnpm install
```
#### Início de projeto
O monorepo já vem com alguns modelos, telas, libs e componentes instalados por padrão. A primeira coisa a fazer é excluir ou modificar essa base pra atender às necessidades do seu projeto. Por exemplo, temos o Resend para enviar emails e ele está sendo usado *por padrão* para rota de 'forgot password'. Então é necessário configurar o resend ou apagar essa rota e seus derivados.

Antes de rodar, também é necessário criar o arquivo *.env* com as variáveis relacionadas ao seu projeto, como o URL do Mongodb Atlas e alguns outros encontrados no .env.example (arquivo que não deve ser modificado pois é realmente só de exemplo).

## Tecnologias Usadas
#### Web
Geral: Next.js
- Back: Prisma (ORM para lidar com o banco de dados), Zod (validação de tipos/api), MongoDB (db no-sql)
- Front: Tailwindcss, shadcn/ui (lib de componentes), lucide-react (lib de icons), react-hot-toast (alertas personalizados)
#### Mobile
Expo (React Native), @better-auth/expo, NativeWind (mesma brisa do tailwind) 
#### Tests
Vitest (integração), Playwright (e2e)

## Specs e Padrões de Projeto
Existem especificações ou diretrizes que regem os nosso projetos aqui e são determinadas pelas tecnologias que usamos e os padrões de mercado impostos. É **extremamente importante mantermos esses padrões**, principalmente se você for analista ou mais novo aqui no núcleo, mas também pra evitar redundâncias e código duplicado. É possível entender por meio do template base esses padrões, porém também criamos arquivos markdown para facilitar isso, podendo ser encontrados nas pastas **/web/docs** ou **/mobile/docs**, sobre better-auth e specs de api por exemplo.

Exemplos de especificações:
- uso de ícones do lucide-react e fontes do next/font
- uso de alertas com toast.success/toast.error
- uso de funções utilitárias como blockForbiddenRequests, toErrorMessage, getUserFromRequest
- params sendo do tipo Promise
E outras boas práticas de clean code no geral

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
#### Sobre PRs
Lembre-se de fazer bons nomes e descrições no PR, além de bons commits. Sinta-se à vontade pra juntar essas mudanças de um mesmo tema, fazer seus commits e mandar um PR?
