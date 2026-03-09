# Componentes

## Organização

```
components/
├── ui/          # Genéricos reutilizáveis (Button, Input, Card, Dialog...)
├── layout/      # Estrutura do app (Sidebar, Header, NavItems)
├── packages/    # Domínio de encomendas
├── users/       # Domínio de usuários
├── notifications/ # Domínio de notificações
└── auth/        # Login, troca de senha
```

## Padrão UI

- Usar CVA (`class-variance-authority`) + `cn()` para variantes
- Atributo `data-slot` para identificação
- Props via `React.ComponentProps<"elemento">`
- Composição com Radix UI primitives

## Padrão de Domínio

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MinhaFeatureProps {
  // props tipadas
}

export function MinhaFeature({ ... }: MinhaFeatureProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    // fetch → toast → router.push/refresh
    setIsLoading(false);
  }

  return (/* JSX */);
}
```

## Padrão de Formulários

- Wrapper: `Card` com `CardHeader` + `CardContent`
- Layout: `space-y-4` para campos
- Campos: `Label` + `Input` (ou `Textarea`, `Select`)
- Botão submit: `w-full`, com loading state
- Feedback: `toast()` do Sonner (sucesso/erro)

## Padrão de Listas

- Array + empty state ("Nenhum item encontrado")
- Layout: `grid gap-3` ou `space-y-3`
- Items: `Card` ou `div` com `border rounded-md p-3`

## Ícones

- Biblioteca: `lucide-react`
- Tamanho padrão: `h-4 w-4`
- Em botões: `mr-2 h-4 w-4`
