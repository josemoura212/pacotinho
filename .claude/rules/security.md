# Segurança

## Autenticação

- NextAuth 5 com strategy JWT (7 dias)
- Provider: Credentials (email + senha)
- Hash: bcryptjs custo 12
- Sessão inclui: id, name, email, role, apartment, block, mustChangePassword

## Autorização

- `hasPermission(role, resource)` em `src/lib/auth/permissions.ts`
- Resources mapeados por rota em `routePermissions`
- Verificar em toda API Route antes de processar

## Headers de Segurança

Configurados em `next.config.ts`:
- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy restritivo

## Rate Limiting

- `checkRateLimit(key)` em `src/lib/utils/rate-limit.ts`
- 5 tentativas por janela de 60 segundos
- Aplicar em endpoints sensíveis (login, upload)

## Upload Seguro

- Limite: 5MB
- Tipos: jpg, jpeg, png, webp
- Validação por magic bytes (não só extensão)
- Nomes: UUID gerado pelo servidor
- Diretório: `UPLOAD_DIR` (env var)
