# Mealify

[![CI](https://github.com/j1705/mealify/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/j1705/mealify/actions/workflows/ci.yml)

Aplicação web para registrar refeições e acompanhar calorias e macronutrientes. O usuário cadastra os alimentos (itens), monta as refeições com eles e vê o resumo do dia.

## Partes do projeto

| Pasta                       | O que é                                     | Tecnologias                                           |
| --------------------------- | ------------------------------------------- | ----------------------------------------------------- |
| [`api/`](api/README.md)     | API HTTP com as regras de negócio e o banco | Node, TypeScript, Express 5, PostgreSQL, dbmate, Jest |
| [`front/`](front/README.md) | Interface web                               | React 19, TypeScript, Vite, React Router, Vitest      |
| [`e2e/`](e2e/README.md)     | Testes ponta a ponta                        | Playwright                                            |

## Subindo tudo

Pré-requisitos: Node 24 e Docker com Compose v2.

```bash
npm run docker:start                 # Postgres na porta 5432

cd api
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed                      # 35 alimentos reais
npm run dev                          # API em http://localhost:3000

cd ../front                          # em outro terminal
npm install
npm run dev                          # app em http://localhost:5173
```

| Serviço  | Porta  |
| -------- | ------ |
| Postgres | `5432` |
| API      | `3000` |
| Front    | `5173` |

Para os testes e2e, veja [`e2e/README.md`](e2e/README.md). Eles sobem servidores e um banco próprios (`3100`, `5174` e `mealify_test`), separados dos de desenvolvimento.

## Scripts da raiz

| Comando                | O que faz                                      |
| ---------------------- | ---------------------------------------------- |
| `npm run docker:start` | Sobe o Postgres                                |
| `npm run docker:stop`  | Derruba o container (os dados ficam no volume) |
| `npm run docker:ps`    | Mostra o estado do container                   |
| `npm run docker:log`   | Acompanha os logs do Postgres                  |

## Verificação antes de concluir uma mudança

```bash
(cd api && npm run check)            # tipos, lint, formatação, testes unitários e de integração
(cd front && npm run check)          # tipos, lint, formatação e testes
(cd e2e && npm test)                 # fluxos no navegador
```
