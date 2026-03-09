# Validação e Tipos

## Tipos

- Localização: `src/lib/types/`
- Inferidos do schema Drizzle quando possível
- Tipos existentes: `ApiResponse<T>`, `User`, `UserWithoutPassword`, `UserRole`, `Package`, `PackageStatus`, `AuditAction`

## Validações

- Localização: `src/lib/validations/`
- Usar Zod 4: `import { z } from "zod/v4"`
- Um arquivo por domínio

## Padrões Zod

```typescript
// Strings com trim
z.string().min(1).max(100).transform(v => v.trim())

// UUID
z.uuid()

// Opcional
z.string().optional()

// Refinamento para regras de negócio
.refine(data => condição, { message: "erro" })
```

## Composição

- `create*Schema` — campos obrigatórios para criação
- `update*Schema` — campos opcionais para atualização

## Tipos Inferidos

```typescript
export type CreateUserInput = z.infer<typeof createUserSchema>;
```
