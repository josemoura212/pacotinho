# Pacotinho

Sistema de gestão de encomendas para condomínios.

## Funcionalidades

### Encomendas
- Registro de encomendas com foto e código de rastreamento
- Fluxo de status: Registro Pendente → Entrega Pendente → Entrega Concluída
- Completar registro com dados do morador
- Entrega e confirmação de recebimento pelo morador
- Filtros por status (pendentes, concluídas)
- Histórico de auditoria por encomenda

### Notificações
- Push notifications via Web Push (VAPID/PWA)
- Atualizações em tempo real via Socket.IO
- Central de notificações para ADMIN e PORTEIRO
- Envio de notificações manuais

### Usuários
- Cadastro de moradores, porteiros e administradores
- Controle de acesso por papéis (ADMIN, PORTEIRO, MORADOR)
- Reset e alteração de senha com política de senha forte
- Soft delete (desativação de conta)

### Geral
- Dashboard com resumo de encomendas
- Relatórios
- Upload de fotos com validação por magic bytes
- Tema claro/escuro
- PWA instalável

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
