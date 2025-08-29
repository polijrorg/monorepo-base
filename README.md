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

Antes de rodar, também é necessário criar o arquivo *.env* com as variáveis relacionadas ao seu projeto, como o URL do Mongodb Atlas e alguns outros encontrados no .env.example (arquivo que não deve ser modificado pois é realmente só de exemplo.

## Tecnologias Usadas
...

## Specs e Padrões de Projeto
...

## Atualizando o monorepo
