# FRONTEND
No Front são bem relevantes os princípios SOLID, focando em manter componentes pequenos e reutilizáveis com < 200 linhas idealmente.

Além disso, alguns padrões devem ser favorecidos: 
- Componentes reutilizáveis devem ser colocados dentro de algum lugar na pasta /components. 
- Componentes relevantes à uma página/layout específica deve estar na pasta {domain}/_components, para evitar ambiguaçõs com subpastas. Idealmente também crie um index.ts dentro dessa pasta.
Dessa mesma forma, utilidades ou actions específicas devem também conter um _ na frente, como {domain}/_utils

* domain seria o modelo, como users, pedidos, restaurantes, etc

#### Fetching/Actions
A pasta que chama rotas do back deve se chamar actions para evitar redundâncias com services. No geral é melhor criar essas actions tanto no useSWR quanto em POSTs normais para melhor replicabilidade e manutenção

#### Ordem de importação
- hooks -> funções auxiliares -> types
- ícones/css -> componentes gerais -> componentes específicos (daquele domínio)