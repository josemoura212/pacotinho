# Services

## Estrutura

- Um arquivo por domínio em `src/lib/services/`
- Funções exportadas (sem classes)
- Imports: `db`, `schema`, tipos

## Serviços Existentes

| Arquivo | Responsabilidade |
|---------|-----------------|
| `package-service.ts` | CRUD de encomendas, mudanças de status |
| `user-service.ts` | CRUD de usuários, senhas, soft delete |
| `notification-service.ts` | Notificações in-app (CRUD, contagem) |
| `push-service.ts` | Web push via VAPID |
| `audit-service.ts` | Logs de auditoria de encomendas |
| `upload-service.ts` | Upload de fotos com validação |

## Padrão de Transação

```typescript
await db.transaction(async (tx) => {
  // 1. Validar dados
  // 2. Executar operações
  // 3. Criar audit log
});
// 4. Push notification (fire-and-forget, fora da transação)
```

## Notificação Fire-and-Forget

```typescript
sendPushToUser(userId, payload).catch(() => {});
```

Nunca bloquear a resposta esperando push. Usar `.catch()` para ignorar falhas.

## Soft Delete

Usuários usam `active: false` em vez de deletar registro.

## userColumns

Nunca expor `passwordHash` nas queries. Selecionar colunas explicitamente ou omitir o hash.
