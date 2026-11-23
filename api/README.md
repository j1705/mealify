# Mealify — API

API HTTP do Mealify, feita com Node, TypeScript, Express 5 e PostgreSQL (pg-promise). Ela guarda os itens (alimentos com calorias e macronutrientes) e as refeições montadas com eles, e calcula os totais nutricionais.

## Como rodar

Pré-requisitos: Node 24 e Docker com Compose v2.

```bash
cp .env.example .env
npm install
npm run docker:start --prefix ..   # Postgres na porta 5432
npm run db:migrate                 # aplica as migrations (dbmate)
npm run db:seed                    # cadastra 35 alimentos reais; ignora nomes que já existem
npm run dev                        # http://localhost:3000, com reload automático
```

### Variáveis de ambiente

| Variável                                                  | Uso                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------------------ |
| `PORT`                                                    | Porta HTTP (padrão do exemplo: `3000`)                                   |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexão da aplicação com o Postgres                                      |
| `DATABASE_URL`                                            | Conexão usada pelo dbmate nas migrations                                 |
| `DBMATE_NO_DUMP_SCHEMA`                                   | Evita gerar `schema.sql` a cada migration                                |
| `CORS_ORIGIN`                                             | Origem do front liberada no CORS (padrão `http://localhost:5173`)        |
| `COOKIE_SECURE`                                           | `true` marca o cookie de sessão como `Secure` (só HTTPS); padrão `false` |

O `.env.test` (copie de `.env.test.example`) aponta para o banco `mealify_test` e a porta `3100`. Ele é usado pelos testes de integração e pelos testes e2e.

## Scripts

| Comando                                            | O que faz                                                            |
| -------------------------------------------------- | -------------------------------------------------------------------- |
| `npm run dev`                                      | Servidor com reload automático (`tsx watch`)                         |
| `npm run build` / `npm start`                      | Compila para `dist/` e roda a versão compilada                       |
| `npm test`                                         | Testes unitários e de integração                                     |
| `npm run test:unit`                                | Só os unitários (não precisam de banco)                              |
| `npm run test:integration`                         | Prepara o `mealify_test` e roda os testes que usam o Postgres        |
| `npm run test:coverage`                            | Cobertura em `coverage/`                                             |
| `npm run lint` / `npm run format`                  | ESLint e Prettier                                                    |
| `npm run check`                                    | Tipos, lint, formatação e testes; rode antes de concluir uma mudança |
| `npm run db:migrate` / `db:rollback` / `db:status` | Migrations com o dbmate                                              |
| `npm run db:new <nome>`                            | Cria uma migration nova em `db/migrations/`                          |
| `npm run db:seed`                                  | Popula o banco de desenvolvimento                                    |
| `npm run db:test:prepare`                          | Migra e popula o `mealify_test`                                      |

## Endpoints

### Autenticação

A sessão fica no banco (tabela `sessions`, que guarda só o hash SHA-256 do token). O token viaja no cookie `mealify_session` (`HttpOnly`, `SameSite=Lax`, `Path=/`, 30 dias). As senhas são guardadas com `scrypt`.

Todas as rotas de `/items` e `/meals` exigem sessão e respondem `401` sem ela. As refeições são de cada usuário: as de outro usuário respondem `404`, não aparecem nas listas e não entram nos totais. O catálogo de itens é compartilhado.

| Método e rota         | Descrição                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/register` | Cadastra `{ email, password }` e já abre a sessão (`201`, `{ userId, email }` + cookie). Senha de 8 a 72 caracteres |
| `POST /auth/login`    | Abre uma sessão nova (`{ userId, email }` + cookie); credenciais erradas respondem `401` com mensagem única         |
| `POST /auth/logout`   | Encerra a sessão do cookie e limpa o cookie (`204`, mesmo sem sessão)                                               |
| `GET /auth/me`        | Usuário da sessão (`{ userId, email }`); `401` sem sessão válida                                                    |

### Itens

| Método e rota           | Descrição                                                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /items`           | Cria um item (`201`)                                                                                                                                        |
| `GET /items`            | Lista paginada. Query: `page`, `limit` (padrão 20, máx. 100), `search` (ignora acentos), `sort` (`name`, `calories`, `createdAt`) e `order` (`asc`, `desc`) |
| `GET /items/most-used`  | Itens mais usados nas refeições do usuário. Query: `limit` (padrão 5, máx. 20)                                                                              |
| `GET /items/:itemId`    | Busca um item                                                                                                                                               |
| `PUT /items/:itemId`    | Atualiza um item                                                                                                                                            |
| `DELETE /items/:itemId` | Exclui um item; responde `409` se ele estiver em alguma refeição                                                                                            |

Corpo de criação e edição:

```json
{
  "name": "Arroz branco cozido",
  "unit": "g",
  "calories": 128,
  "protein": 2.5,
  "carbohydrate": 28.1,
  "fat": 0.2
}
```

`unit` aceita `g`, `ml` ou `unit`. Os valores nutricionais são por 100 g, por 100 ml ou por unidade.

### Refeições

| Método e rota                       | Descrição                                                                |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `POST /meals`                       | Cria uma refeição (`201`)                                                |
| `GET /meals`                        | Lista paginada. Query: `page`, `limit`, `search` e `date` (`AAAA-MM-DD`) |
| `GET /meals/totals?date=AAAA-MM-DD` | Totais de calorias e macronutrientes do dia                              |
| `GET /meals/:mealId`                | Busca uma refeição com seus itens                                        |
| `PUT /meals/:mealId`                | Atualiza uma refeição                                                    |
| `DELETE /meals/:mealId`             | Exclui uma refeição                                                      |

Corpo de criação e edição:

```json
{
  "name": "Almoço",
  "description": "Prato do dia",
  "date": "2026-11-22",
  "items": [{ "itemId": 1, "quantity": 150 }]
}
```

### Erros

Os erros respondem `{ "message": "..." }`, em inglês. O front traduz essas mensagens para o usuário em `front/src/services/apiErrorMessages.ts`.

| Status | Quando                                                                          |
| ------ | ------------------------------------------------------------------------------- |
| `400`  | Parâmetro ou corpo malformado (id, paginação, ordenação, data, JSON)            |
| `401`  | Sem sessão válida ou credenciais erradas                                        |
| `404`  | Item, refeição ou rota não encontrados                                          |
| `409`  | Conflito: nome de item ou e-mail repetido, ou item em uso                       |
| `422`  | Regra de domínio violada (nome curto, quantidade inválida, refeição sem itens…) |
| `500`  | Erro inesperado                                                                 |

## Arquitetura

O código segue uma arquitetura em camadas, e as dependências apontam sempre para dentro (`infra` → `application` → `domain`):

```
src/
  domain/        regras de negócio puras
    entity/      Item, Meal, MealItem, User, Session
    vo/          value objects que se validam (Name, Quantity, Calories, Unit, MealDate, Email, Password…)
    service/     cálculo de nutrientes
    error/       erros de domínio (NotFound, Conflict, Validation, Unauthorized)
  application/   casos de uso e as portas que eles usam
    usecase/     um caso de uso por arquivo (CreateItem, GetMeals, GetDailyTotals…)
    repository/  interfaces dos repositórios
    auth/        portas de hash de senha e de tokens de sessão
    service/     serviços compartilhados entre casos de uso (abrir sessão, montar itens da refeição)
    clock/       interface do relógio, para controlar o tempo nos testes
    query/       tipos de paginação, busca e ordenação
    mapper/      conversão das entidades para a saída da API
  infra/         detalhes técnicos
    http/        adaptador do Express, CORS, cookies, leitura e validação da query, mapeamento de erros para status
    auth/        hash de senha com scrypt e tokens de sessão com node:crypto
    controller/  ligação entre as rotas e os casos de uso
    repositoryDatabase/  implementação dos repositórios com Postgres
    database/    conexão (pg-promise) e configuração
  app.ts         monta as dependências
  server.ts      sobe o servidor
  main.ts        ponto de entrada
db/
  migrations/    SQL do dbmate
  seeds/         alimentos reais, com a fonte de cada valor no campo `source`
```

## Testes

```
test/
  unit/          domínio, casos de uso e camada HTTP, com dublês em memória
  integration/   repositórios e API de ponta a ponta no banco mealify_test
  contract/      contratos que os repositórios em memória e os de banco precisam cumprir
  doubles/       repositórios em memória, relógio fixo, hasher e tokens falsos
```

Os mesmos testes de contrato rodam contra o repositório em memória e o de Postgres. Assim, o dublê usado nos testes unitários se comporta igual ao repositório real.
