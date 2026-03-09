# Pacotinho

Sistema de gestão de encomendas para condomínios.

**Site oficial:** https://pacotinho.mangatrix.net

## Funcionalidades

- Registro e rastreamento de encomendas
- Notificações push (PWA) para moradores
- Central de notificações para ADMIN e PORTEIRO
- Controle de acesso por papéis (ADMIN, PORTEIRO, MORADOR)
- Foto da encomenda com validação de tipo
- Histórico de auditoria completo
- Relatórios de encomendas
- Tema claro/escuro

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, Radix UI
- **Backend:** Next.js API Routes, NextAuth 5
- **Banco:** PostgreSQL 16, Drizzle ORM
- **Validação:** Zod 4
- **Infraestrutura:** Docker, Docker Compose

## Setup

```bash
# Instalar dependências
pnpm install

# Copiar variáveis de ambiente
cp .env.example .env

# Subir com Docker
docker compose up -d
```

A aplicação estará disponível em `http://localhost:3000`.

## Desenvolvimento

```bash
pnpm dev       # Servidor de desenvolvimento
pnpm check     # Lint + format + type check
pnpm build     # Build de produção
```

## Variáveis de Ambiente

Veja `.env.example` para a lista completa de variáveis necessárias.
