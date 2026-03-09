# Arquitetura

## Camadas

```
Pages/Layouts → API Routes → Services → Database (Drizzle)
Pages/Layouts → Components → Hooks → fetch(/api/...)
```

## Dependências (unidirecional)

| Camada | Pode importar de |
|--------|-----------------|
| Pages/Layouts | Components, Hooks, lib/auth |
| Components | Hooks, lib/utils, lib/types, ui/ |
| Hooks | lib/types |
| API Routes | lib/auth, lib/services, lib/validations, lib/types |
| Services | lib/db, lib/types |
| Validations | zod/v4 |

**NUNCA**: Components → Services, Hooks → DB, Pages → DB diretamente.

## Route Groups

- `(app)/` — Protegido por auth (middleware redireciona para /login)
- `(auth)/` — Público (login, alterar senha)
- `api/` — REST endpoints

## Server vs Client Components

- **Server Components** (padrão): Pages, Layouts. Podem acessar `auth()` diretamente.
- **Client Components** (`"use client"`): Formulários, interatividade, hooks. Usam `useSession()` do hook customizado.

## Fluxo de Dados

### Leitura (Server)
```
Page → auth() → fetch service direto → render
```

### Leitura (Client)
```
Component → useEffect/hook → fetch(/api/...) → setState
```

### Escrita
```
Form → fetch(/api/...) POST/PUT → API Route → Service → DB → Response
```
