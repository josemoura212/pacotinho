# API Routes

## Estrutura

```
src/app/api/
├── [recurso]/
│   ├── route.ts           # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts       # GET (detail), PUT (update), DELETE
│       └── [ação]/route.ts # POST para ações específicas
```

## Envelope de Resposta

Toda resposta usa `ApiResponse<T>` de `src/lib/types/api.ts`:

```typescript
{ success: true, data: T }
{ success: false, error: "mensagem" }
```

## Ordem no Handler

1. `auth()` — verificar autenticação
2. `hasPermission()` — verificar permissão
3. Parse body/params
4. Validação Zod (`.safeParse()`)
5. Chamada ao service
6. Retorno com `NextResponse.json<ApiResponse<T>>()`

## Status Codes

| Código | Uso |
|--------|-----|
| 200 | Sucesso (GET, PUT) |
| 201 | Criado (POST) |
| 400 | Validação falhou |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |

## Params Dinâmicos

Next.js 16 usa params como Promise:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
}
```

## Erros

```typescript
const parsed = schema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json<ApiResponse<null>>(
    { success: false, error: parsed.error.issues[0].message },
    { status: 400 },
  );
}
```
