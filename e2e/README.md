# Mealify — Testes e2e

Testes ponta a ponta do Mealify com Playwright. Eles usam o front de verdade no Chromium, conectado a uma API e a um banco de verdade, e cobrem os fluxos principais de itens, refeições e da tela inicial.

## Como rodar

Pré-requisitos: Node 24, o Postgres do projeto rodando (`npm run docker:start` na raiz) e o `api/.env.test` criado (copie de `api/.env.test.example`).

```bash
npm install
npx playwright install chromium   # só na primeira vez
npm test                          # roda a suíte
```

| Comando                                   | O que faz                                  |
| ----------------------------------------- | ------------------------------------------ |
| `npm test`                                | Roda todos os testes sem abrir o navegador |
| `npm run test:headed`                     | Roda com o navegador visível               |
| `npm run report`                          | Abre o relatório HTML da última execução   |
| `npm run typecheck`                       | Checa os tipos                             |
| `npx playwright test tests/meals.spec.ts` | Roda um arquivo só                         |

## Ambiente isolado

O Playwright sobe os próprios servidores e os desliga no fim:

| Serviço | Porta  | Detalhe                                                                      |
| ------- | ------ | ---------------------------------------------------------------------------- |
| API     | `3100` | Usa o banco `mealify_test`, migrado e populado com `npm run db:test:prepare` |
| Front   | `5174` | Vite com `VITE_API_URL=http://localhost:3100`                                |

Por isso a suíte **não mexe** nos servidores de desenvolvimento (`3000` e `5173`) nem no banco `mealify`, e pode rodar com eles ligados. Se a `3100` ou a `5174` já estiverem ocupadas, a execução falha de propósito (`reuseExistingServer: false`).

Os testes rodam em sequência (`workers: 1`), com o navegador no locale `pt-BR`.

## Estrutura

```
env.ts                  URLs da API e do front de teste
playwright.config.ts    servidores, navegador e relatórios
tests/
  fixtures.ts           cada teste cadastra um usuário e abre o navegador logado; fixture `data` cria itens e refeições pela API e limpa tudo no fim
  auth.spec.ts          criação de conta, logout, login, rotas protegidas e sessão encerrada no meio do uso
  home.spec.ts          resumo do dia e itens mais usados
  items.spec.ts         cadastro, edição, busca, ordenação, paginação e exclusão de itens
  meals.spec.ts         cadastro, edição, exclusão, busca e paginação de refeições; isolamento entre usuários
```

## Escrevendo um teste

- Cada teste já começa logado com um usuário novo. Para testar como visitante, use `test.use({ loggedIn: false })`.
- Use a fixture `data` de `tests/fixtures.ts` para preparar os dados pela API, em vez de montar tudo pela tela.
- Coloque `data.suffix` em todo nome criado no teste. A limpeza apaga tudo o que tem esse sufixo, mesmo quando o teste falha no meio.
- Localize os elementos pelo que o usuário vê: papéis, rótulos e textos em português. O código e o título do teste ficam em inglês.

## Quando um teste falha

O Playwright guarda o screenshot, o trace e o `error-context.md` (snapshot da página) em `test-results/<teste>/`. Para rever a execução passo a passo:

```bash
npx playwright show-trace test-results/<teste>/trace.zip
```
