# Pacotinho

Sistema de gestão de encomendas para condomínios.

## Funcionalidades

- Registro e rastreamento de encomendas com foto
- Notificações push em tempo real (PWA + Socket.IO)
- Controle de acesso por papéis (ADMIN, PORTEIRO, MORADOR)
- Histórico de auditoria completo
- Relatórios de encomendas
- Tema claro/escuro

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, Radix UI
- **Backend:** Next.js API Routes, NextAuth 5, Socket.IO
- **Banco:** PostgreSQL 16, Drizzle ORM
- **Validação:** Zod 4
- **Infraestrutura:** Docker, Docker Compose

## Setup

```bash
pnpm install
cp .env.example .env
```

Edite o `.env` com suas credenciais e depois suba com Docker:

```bash
docker compose up -d
```

A aplicação estará disponível em `http://localhost:3000`.

## Comandos

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm check` | Lint + format + type check |
| `pnpm test` | Rodar testes |
| `pnpm db:generate` | Gerar migrations Drizzle |

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `DATABASE_URL` | Sim | Connection string do PostgreSQL |
| `AUTH_SECRET` | Sim | Secret do NextAuth (`openssl rand -base64 32`) |
| `AUTH_URL` | Não | URL da aplicação (default: `http://localhost:3000`) |
| `UPLOAD_DIR` | Não | Diretório de uploads (default: `./uploads`) |
| `VAPID_PUBLIC_KEY` | Não | Chave pública VAPID para push notifications |
| `VAPID_PRIVATE_KEY` | Não | Chave privada VAPID |
| `VAPID_EMAIL` | Não | Email para VAPID |

Para gerar as chaves VAPID:

```bash
npx web-push generate-vapid-keys
```
