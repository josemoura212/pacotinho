# Database

## Estrutura

- Schema: `src/lib/db/schema.ts` (arquivo único)
- Conexão: `src/lib/db/index.ts` (pool max 10)
- Seed: `src/lib/db/seed.ts`
- Migrations: `./drizzle/migrations/`

## Convenções

| Item | Convenção |
|------|-----------|
| Primary Key | `uuid("id").defaultRandom().primaryKey()` |
| Timestamps | `timestamp("...", { withTimezone: true }).defaultNow().notNull()` |
| Colunas SQL | `snake_case` |
| Propriedades TS | `camelCase` (mapeamento automático Drizzle) |
| Nomes de tabela | `snake_case` plural |
| Enums | `pgEnum` com valores `SCREAMING_SNAKE_CASE` |
| Índices | `tabela_coluna_idx` |

## Padrões de Query

```typescript
// Select com filtro
db.select().from(tabela).where(eq(tabela.coluna, valor));

// Select com múltiplos filtros
db.select().from(tabela).where(and(eq(...), eq(...)));

// Insert com retorno
db.insert(tabela).values({ ... }).returning();

// Update
db.update(tabela).set({ ... }).where(eq(tabela.id, id));

// Busca textual
ilike(tabela.nome, `%${search}%`)

// Limitar resultados
.limit(1), .limit(50)
```

## Foreign Keys

```typescript
userId: uuid("user_id")
  .references(() => users.id, { onDelete: "cascade" })
  .notNull(),
```

## Índices Compostos

Para queries frequentes com múltiplos filtros:

```typescript
index("tabela_col1_col2_idx").on(table.col1, table.col2)
```
