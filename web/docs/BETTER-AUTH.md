## Better Auth
A lib de autenticação (back e front web/mobile) que usamos é o Better Auth. Atualmente a documentação deles não tá tão legal, então adicionei algumas rotas por padrão de usuário como POST, GET ALL, DELETE, GET BY ID e de resetar senhas.

De qualquer forma, vale a pena ler a documentação oficial: https://www.better-auth.com/docs/concepts/api

### Specs (back)
O mais importante é lembrar que a maioria das coisas envolvendo os usuários vão ser manejadas pelo better auth automaticamente e você ***deve!!!!!*** usar as funções utilitárias do better auth no back.
Em alguns casos podemos passar por isso como no caso do delete users em uma situação específica onde precisamos que o admin delete o user.

Entretanto, existe alguns requerimentos por padrão que não podemos violar (no geral - veja a aba de admin do better auth que tem coisas interessantes), como **mudar senhas e emails de outros usuários**.

Veja as novas de user criadas para um exemplo de como evitar o update de email/senha diretamente ao atualizar users e usar apenas funções dedicadas.

No caso de esquecer senha, está sendo também construída uma rota mas a ideia base é enviar um email e usar o token gerado naquele email para validar que é realmente o user querendo mudar a senha.