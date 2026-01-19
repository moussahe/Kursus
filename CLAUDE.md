# KURSUS - Development Guidelines

## Mission

Plateforme EdTech premium avec AI tutoring, gamification, et marketplace de cours.
Objectif Y1: 10K utilisateurs, 500K EUR CA.

## Stack Technique

- **Frontend**: Next.js 16, TypeScript strict, TailwindCSS, shadcn/ui
- **State**: Zustand (client), React Query (server)
- **Backend**: Next.js API Routes + Server Actions
- **DB**: PostgreSQL via Prisma + Supabase
- **Auth**: NextAuth.js v5
- **Paiements**: Stripe
- **IA**: Claude API (Anthropic)
- **Tests**: Vitest + Playwright
- **CI/CD**: GitHub Actions + Vercel

---

## Design System

### Direction

- **Style** : Premium, futuristic, refined
- **Inspiration** : nvg8.io, linear.app, vercel.com, raycast.com
- **Mode par défaut** : Light
- **Toggle** : Bouton dark/light mode dans le header

### Couleurs

```css
/* Dark Mode (défaut) */
--kursus-bg: #0a0a0a;
--kursus-bg-elevated: #141414;
--kursus-border: #2a2a2a;
--kursus-text: #ffffff;
--kursus-text-muted: #a1a1a1;

/* Light Mode */
--kursus-bg: #fafafa;
--kursus-bg-elevated: #ffffff;
--kursus-border: #e5e5e5;
--kursus-text: #0a0a0a;
--kursus-text-muted: #6b7280;

/* Brand (identiques dans les 2 modes) */
--kursus-orange: #ff6d38;
--kursus-lime: #c7ff69;
--kursus-purple: #7a78ff;
```

### Theme Toggle

- Utiliser next-themes
- Bouton dans le header (icône sun/moon)
- Persister en localStorage
- Respecter prefers-color-scheme au premier load
- Transition fluide (300ms)

### Typography

- Headlines : font-black (900), letter-spacing: -0.04em
- Body : font-normal (400)
- Fonts : Geist ou Satoshi (PAS Inter/Arial/Roboto)

### Composants

- Cards : bg-elevated, border subtle, glow on hover (dark), shadow (light)
- Buttons : rounded-full, gradient bg, hover effects
- Inputs : theme-aware bg, bright border on focus

### Animations

- Easing : cubic-bezier(0.22, 1, 0.36, 1)
- Page load : stagger reveals
- Hover : scale, glow, border-radius morph
- Scroll : fade-in avec Intersection Observer

### Textures

- Gradients : orange→lime, purple→blue
- Glass : backdrop-blur + transparence
- Patterns : grid, dots, noise (subtils)

### Anti-patterns (JAMAIS)

- Inter/Arial/Roboto
- Cards plates sans effets
- Couleurs timides
- Templates génériques
- Thème qui flash au load

---

## Structure Projet

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Routes authentification
│   ├── (dashboard)/       # Routes dashboard
│   ├── (marketing)/       # Landing, pricing
│   ├── api/               # API Routes
│   └── layout.tsx
├── components/
│   ├── ui/                # shadcn components
│   └── [feature]/         # Feature components
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── prisma.ts          # Prisma client
│   ├── stripe.ts          # Stripe config
│   └── utils.ts           # Helpers
├── hooks/                 # Custom React hooks
├── stores/                # Zustand stores
└── types/                 # TypeScript types
```

---

## Validation

### REGLE D'OR - Avant chaque commit

```bash
pnpm lint && pnpm type-check && pnpm build
```

### Après chaque push

- Attendre déploiement
- Tester dark ET light mode
- Tester sur mobile

### Métriques de Succès

- Lighthouse score > 90
- Build time < 2min
- Zero erreurs TypeScript
- Zero vulnérabilités npm audit

---

## Conventions

### Commits

- feat: nouvelle fonctionnalité
- fix: correction de bug
- style: changement design/CSS
- refactor: refactoring code

### Structure

- src/app/ → Pages
- src/components/ → Composants
- src/lib/ → Utilitaires
- src/hooks/ → Custom hooks

---

## Rappels

- Light mode par défaut, dark disponible
- Mobile responsive obligatoire
- Tester les 2 thèmes avant merge
