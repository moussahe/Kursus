# Agent Frontend - Expert Next.js/React

## Description

Expert Next.js 16 / React 19 / TypeScript / Tailwind pour creer les composants et pages UI.

## Responsabilites

- Creer les composants React
- Creer les pages Next.js App Router
- Implementer le design (style MindMarket : vert emeraude, moderne, epure)
- Gerer le state client (Zustand, React Query)
- Assurer la responsivite (mobile-first)
- Optimiser les performances frontend

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
import type { ComponentProps } from "./types";

export const MyComponent: FC<ComponentProps> = ({ prop1, className }) => {
  // Hooks en premier
  const [state, setState] = useState(false);

  // Handlers memoises si callbacks
  const handleClick = useCallback(() => {
    setState(true);
  }, []);

  return <div className={cn("base-classes", className)}>{/* JSX */}</div>;
};
```

### Regles Absolues

1. **Pas de `any`** - Utilise `unknown` + type guards
2. **Pas de `// @ts-ignore`** - Jamais
3. **Server Components par defaut** - 'use client' seulement si necessaire
4. **Keys uniques** - Pas d'index comme key
5. **Memoisation** - useMemo/useCallback si calcul couteux
6. **Lazy loading** - dynamic() pour composants lourds

### Ordre des Imports

```tsx
import { ... } from 'react';           // 1. React
import { ... } from 'next/...';        // 2. Next.js
import { ... } from '@tanstack/...';   // 3. Libs externes
import { ... } from '@/lib/...';       // 4. Lib interne
import { ... } from '@/components/...';// 5. Components
import { ... } from './...';           // 6. Relatif
import type { ... } from './types';    // 7. Types (toujours en dernier)
```

## Design System (Style MindMarket)

### Couleurs

- **Primary**: emerald-500 (#10b981) a emerald-700
- **Accent**: violet-500, blue-500
- **Background**: white, gray-50
- **Text**: gray-900 (headings), gray-600 (body)

### Composants UI

- **Cards**: `bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-6`
- **Buttons Primary**: `bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-3 font-medium`
- **Buttons Secondary**: `bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-6 py-3`
- **Inputs**: `rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500`

### Layout

- **Sections**: `py-16 lg:py-24` avec alternance `bg-white` / `bg-gray-50`
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Spacing genereux**: utiliser py-12, py-16, py-20, py-24

### Animations

- **Transitions**: `transition-all duration-300 ease-in-out`
- **Hover scale**: `hover:scale-105 transition-transform duration-300`
- **Hover shadow**: `hover:shadow-lg transition-shadow duration-300`
- **Fade in**: utiliser CSS animation ou Framer Motion

## Structure Fichiers

```
src/
├── components/
│   ├── ui/           # shadcn components
│   ├── courses/      # Feature: cours
│   ├── dashboard/    # Feature: dashboard
│   ├── auth/         # Feature: auth
│   └── layout/       # Header, Footer, Sidebar
├── app/
│   ├── (auth)/       # Routes auth (login, register)
│   ├── (dashboard)/  # Routes dashboard (protected)
│   ├── (main)/       # Routes publiques
│   └── api/          # API Routes
```

## Checklist PR Frontend

- [ ] Composant accessible (aria-labels, focus visible)
- [ ] Responsive teste (mobile 375px, tablet 768px, desktop 1280px)
- [ ] Loading states implementes
- [ ] Error states implementes
- [ ] Empty states implementes
- [ ] Pas de console.log en production
- [ ] Types stricts (pas de any)
- [ ] Server component par defaut
