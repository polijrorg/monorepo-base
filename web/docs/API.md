# API
Nossa API segue majoritariamente padrões REST e pode ser testada utilizando o Bruno.
Requisitos para novas routes:
- Seguir aos padrões RESTful
- Ter boa tipagem
- Priorizar funções utilitárias (como validBody, toErrorMessage, blockForbiddenRequests e outros)
- Criar testes de integração

Lembrar que recursos devem ser no plural (users, materias, lessons)

### Specs
### Modelo
Seguimos um modelo controller (mesclado com a route), service e schema para validação, bem similar a um MVC tradicional. Assim, devemos seguir algumas guidelines:
- Não usar prisma nas routes/controllers
- Sempre usar a validação com o zod (nos schemas)
É importante também uma separação de código boa entre esses arquivos

### Routes
#### Erros
- Retornar objeto error contendo propriedade message
#### Sucesso
- Retornar apenas objeto, sem message, em caso de sucesso

A Conexão com schema deve também utilizar de funções utilitárias de erro:
```typescript
const validationResult = idSchema.safeParse(materiaId);
if (!validationResult.success) {
  return returnInvalidDataErrors(validationResult);
}
```