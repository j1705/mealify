# Mealify — Front

Interface web do Mealify, feita com React 19, TypeScript, Vite e React Router. O usuário cadastra os alimentos (itens), monta as refeições com eles e acompanha as calorias e os macronutrientes do dia.

## Telas

| Rota                                | Tela                                                            |
| ----------------------------------- | --------------------------------------------------------------- |
| `/`                                 | Início: resumo do dia (calorias e macros) e itens mais usados   |
| `/items`                            | Lista de itens, com busca, ordenação e paginação                |
| `/items/new`, `/items/:itemId/edit` | Cadastro e edição de item                                       |
| `/meals`                            | Lista de refeições                                              |
| `/meals/new`, `/meals/:mealId/edit` | Cadastro e edição de refeição                                   |
| `/meals/:mealId`                    | Detalhes da refeição                                            |
| `/login`, `/register`               | Login e criação de conta (aceitam `?next=` com a rota de volta) |

## Como rodar

Pré-requisitos: Node 24 e a API do Mealify rodando (veja `../api`). Por padrão, o front chama a API em `http://localhost:3000`.

```bash
npm install
npm run dev        # http://localhost:5173
```

Para usar a API em outro endereço, defina `VITE_API_URL`:

```bash
VITE_API_URL=http://localhost:3100 npm run dev
```

## Scripts

| Comando                                   | O que faz                                                            |
| ----------------------------------------- | -------------------------------------------------------------------- |
| `npm run dev`                             | Servidor de desenvolvimento com HMR                                  |
| `npm run build`                           | Checagem de tipos e build de produção em `dist/`                     |
| `npm run preview`                         | Serve o build de produção                                            |
| `npm test` / `npm run test:watch`         | Testes com Vitest e Testing Library                                  |
| `npm run lint`                            | ESLint                                                               |
| `npm run format` / `npm run format:check` | Prettier                                                             |
| `npm run check`                           | Tipos, lint, formatação e testes; rode antes de concluir uma mudança |

## Estrutura

```
src/
  pages/        telas, uma por rota (auth/, items/, meals/, HomePage)
  components/   componentes por domínio (auth/, items/, meals/), layout/ e ui/ (base reutilizável)
  hooks/        estado e carregamento de dados (useAsync, usePagedSearch, useSaveAction, useAuthRedirect…)
  services/     acesso à API (http.ts, authService, itemService, mealService) e tradução das mensagens de erro
  utils/        funções puras: datas, números decimais, nutrição, validação
  types/        tipos do domínio (Item, Meal, Nutrition, Pagination, User)
  styles/       estilos globais; os componentes usam CSS Modules
test/           espelha src/ (components, hooks, pages, services, utils)
```

Os testes ponta a ponta ficam em `../e2e` (Playwright) e sobem uma API e um front próprios, sem mexer nos servidores de desenvolvimento.
