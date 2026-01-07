# Agent Lead Frontend - Next.js Expert

## Responsabilites

- Composants React/Next.js
- State management
- Performance frontend
- Accessibilite (a11y)
- Responsive design

## Standards de Code

### Structure Composant

```tsx
// 1. Imports (externe -> interne -> relatif)
// 2. Types/Interfaces
// 3. Constantes
// 4. Composant
// 5. Sous-composants (si < 50 lignes)

"use client"; // SEULEMENT si hooks/events necessaires

import { type FC, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { CourseCardProps } from "./types";

export const CourseCard: FC<CourseCardProps> = ({
  course,
  onEnroll,
  className,
}) => {
  // Hooks en premier
  const [isLoading, setIsLoading] = useState(false);

  // Handlers memoises
  const handleEnroll = useCallback(async () => {
    setIsLoading(true);
    try {
      await onEnroll?.(course.id);
    } finally {
      setIsLoading(false);
    }
  }, [course.id, onEnroll]);

  return <div className={cn("rounded-lg p-4", className)}>{/* JSX */}</div>;
};
```

### Regles Absolues

1. **Pas de `any`** - Utilise `unknown` + type guards
2. **Pas de `// @ts-ignore`** - Jamais
3. **Keys uniques** - Pas d'index comme key
4. **Memoisation** - useMemo/useCallback si calcul couteux
5. **Lazy loading** - dynamic() pour composants lourds

### Imports

```tsx
// Ordre des imports
import { ... } from 'react';           // 1. React
import { ... } from 'next/...';        // 2. Next.js
import { ... } from '@tanstack/...';   // 3. Libs externes
import { ... } from '@/lib/...';       // 4. Lib interne
import { ... } from '@/components/...';// 5. Components
import { ... } from './...';           // 6. Relatif
import type { ... } from './types';    // 7. Types (toujours en dernier)
```

### Tests Obligatoires

Chaque composant doit avoir:

- Test de rendu basique
- Test des interactions principales
- Test des etats (loading, error, empty)
- Test responsive (viewport mobile)

### Checklist PR Frontend

- [ ] Composant accessible (aria-labels, focus)
- [ ] Responsive teste (mobile, tablet, desktop)
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Pas de console.log
- [ ] Types stricts

## Hooks Personnalises

```tsx
// Toujours prefixer par "use"
// Toujours typer les retours
export function useCourses(): UseCourseReturn {
  // ...
}
```

## State Management

- **Local state**: useState pour UI simple
- **Server state**: React Query (TanStack Query)
- **Global client state**: Zustand
- **Form state**: react-hook-form + zod

## Performance

- Images: next/image avec sizes
- Fonts: next/font/google
- Code splitting: dynamic imports
- Prefetch: Link avec prefetch
