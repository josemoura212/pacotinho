# 📦 Pacotinho

> Sistema de gestão de encomendas para condomínios

---

## Funcionalidades

**Encomendas** — Registro com foto, código de rastreamento, fluxo de status (`Registro Pendente → Entrega Pendente → Entrega Concluída`), confirmação de recebimento pelo morador, filtros, busca, paginação e histórico de auditoria.

**Notificações** — Push notifications (Web Push/VAPID), atualizações em tempo real (Socket.IO), central de notificações e envio manual.

**Usuários** — Cadastro de moradores, porteiros e administradores, controle por papéis (ADMIN, PORTEIRO, MORADOR), política de senha forte e soft delete.

**Geral** — Dashboard com resumo, relatórios, upload com validação por magic bytes, tema claro/escuro, skeleton screens, PWA instalável e página offline.

---

## Stack

| Camada    | Tecnologias                                    |
| --------- | ---------------------------------------------- |
| Frontend  | Next.js 16, React 19, Tailwind CSS 4, Radix UI |
| Backend   | Next.js API Routes, NextAuth 5, Socket.IO      |
| Banco     | PostgreSQL 16, Drizzle ORM                     |
| Validação | Zod 4                                          |
| Qualidade | Biome, Vitest, Husky                           |
| Infra     | Docker, Docker Compose                         |

---

## Setup

```bash
pnpm install
cp .env.example .env
```

Edite o `.env` com suas credenciais e suba com Docker:

```bash
docker compose up -d
```

Acesse em `http://localhost:3000`.

---

## Comandos

| Comando              | Descrição                         |
| -------------------- | --------------------------------- |
| `pnpm dev`           | Servidor de desenvolvimento       |
| `pnpm build`         | Build de produção                 |
| `pnpm check`         | Lint + format + type check        |
| `pnpm test`          | Rodar testes                      |
| `pnpm test:coverage` | Testes com relatório de cobertura |
| `pnpm db:generate`   | Gerar migrations Drizzle          |

---

## Variáveis de Ambiente

| Variável            | Obrigatória | Descrição                                           |
| ------------------- | :---------: | --------------------------------------------------- |
| `DATABASE_URL`      |     Sim     | Connection string do PostgreSQL                     |
| `AUTH_SECRET`       |     Sim     | Secret do NextAuth (`openssl rand -base64 32`)      |
| `AUTH_URL`          |     Não     | URL da aplicação (default: `http://localhost:3000`) |
| `UPLOAD_DIR`        |     Não     | Diretório de uploads (default: `./uploads`)         |
| `VAPID_PUBLIC_KEY`  |     Não     | Chave pública VAPID para push                       |
| `VAPID_PRIVATE_KEY` |     Não     | Chave privada VAPID                                 |
| `VAPID_EMAIL`       |     Não     | Email para VAPID                                    |

Gerar chaves VAPID: `npx web-push generate-vapid-keys`

---

## Roadmap

- Relatórios com exportação CSV/PDF
- Gráficos no dashboard (encomendas por dia/semana, tempo médio de entrega)
- Notificações por email
- QR Code para confirmação de retirada
- Logs de acesso (quem logou, quando, de onde)
