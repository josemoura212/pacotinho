# Pacotinho

Sistema de gestão de encomendas para condomínios.

**Site:** https://pacotinho.mangatrix.net

## Stack

- Next.js 16 (App Router), React 19, TypeScript (strict)
- PostgreSQL + Drizzle ORM
- NextAuth 5 (JWT, Credentials)
- Tailwind CSS 4, Radix UI, CVA
- Zod 4 (`zod/v4`), React Hook Form
- Biome (lint + format), Husky
- Web Push (VAPID), PWA

## Estrutura `src/`

```
src/
├── app/
│   ├── (auth)/          # Páginas públicas (login, alterar senha)
│   ├── (app)/           # Páginas protegidas (dashboard, encomendas, usuários)
│   └── api/             # API Routes REST
├── components/
│   ├── ui/              # Componentes genéricos (Button, Input, Card...)
│   ├── layout/          # Sidebar, Header, NavItems, NotificationBell
│   ├── packages/        # Componentes de encomendas
│   ├── users/           # Componentes de usuários
│   ├── notifications/   # Componentes de notificações
│   └── auth/            # Login, troca de senha
├── hooks/               # Custom hooks (useSession, usePackages, useUsers)
└── lib/
    ├── auth/            # NextAuth config, permissões
    ├── db/              # Schema Drizzle, conexão, seed
    ├── services/        # Lógica de negócio (package, user, notification, push, audit, upload)
    ├── types/           # Tipos TypeScript (inferidos do Drizzle)
    ├── validations/     # Schemas Zod
    └── utils/           # Rate limit, status labels, cn()
```

## Alias

`@/*` → `./src/*`

## Comandos

- `pnpm dev` — servidor de desenvolvimento
- `pnpm build` — build de produção
- `pnpm check` — lint + format + type check
- `pnpm db:generate` — gerar migrations Drizzle

## Convenções

- Arquivos: `kebab-case`
- Componentes: `PascalCase`
- Funções/variáveis: `camelCase`
- Tabelas SQL: `snake_case` plural
- Enums: `SCREAMING_SNAKE_CASE`

## Papéis

| Papel | Descrição |
|-------|-----------|
| ADMIN | Acesso total: usuários, relatórios, encomendas |
| PORTEIRO | Encomendas (CRUD), moradores, notificações |
| MORADOR | Visualiza e confirma recebimento das próprias encomendas |

## Fluxo de Encomendas

```
REGISTRO_PENDENTE → ENTREGA_PENDENTE → ENTREGA_CONCLUIDA
```

## PROIBIDO

- Deploy ou comandos de produção
- Migrations remotas (`db:migrate`, `drizzle-kit push`)

## Regras Detalhadas

- [Arquitetura](.claude/rules/architecture.md)
- [Componentes](.claude/rules/components.md)
- [API](.claude/rules/api.md)
- [Database](.claude/rules/database.md)
- [Services](.claude/rules/services.md)
- [Validação e Tipos](.claude/rules/validation-and-types.md)
- [Segurança](.claude/rules/security.md)
