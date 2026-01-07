# SCHOOLARIS - Vision & Orchestration

## Mission

Plateforme EdTech francaise #1 pour les scolaires (CP -> Terminale).
Objectif Y1: 10K utilisateurs, 500K EUR CA.

## BOUCLE PRINCIPALE (EXECUTE EN CONTINU)

A chaque iteration:

1. Consulte @.claude/agents/CTO.md pour les decisions archi
2. Delegue le dev a @.claude/agents/LEAD_FRONTEND.md et @.claude/agents/LEAD_BACKEND.md
3. Fais valider par @.claude/agents/QA_ENGINEER.md
4. Verifie la secu avec @.claude/agents/SECURITY.md
5. Deploie via @.claude/agents/DEVOPS.md
6. Itere avec @.claude/workflows/ITERATION_LOOP.md

## REGLE D'OR

JAMAIS de commit sans:

- pnpm lint ✓
- pnpm type-check ✓
- pnpm test ✓
- pnpm build ✓

## Metriques de Succes

- Coverage tests > 80%
- Lighthouse score > 90
- Build time < 2min
- Zero erreurs TypeScript
- Zero vulnerabilites npm audit

## Stack Technique

- **Frontend**: Next.js 15, TypeScript strict, TailwindCSS, shadcn/ui
- **State**: Zustand (client), React Query (server)
- **Backend**: Next.js API Routes + Server Actions
- **DB**: PostgreSQL via Prisma + Supabase
- **Auth**: NextAuth.js v5
- **Paiements**: Stripe
- **IA**: Claude API (Anthropic)
- **Tests**: Vitest + Playwright
- **CI/CD**: GitHub Actions + Vercel

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

## Phases de Developpement

### Phase 1: Foundation

- [x] Setup projet Next.js 15
- [x] Configuration TypeScript strict
- [x] Setup Prisma + schema DB
- [x] Configuration shadcn/ui
- [ ] Setup tests (Vitest + Playwright)

### Phase 2: Auth & Users

- [ ] NextAuth.js v5 setup
- [ ] Register/Login pages
- [ ] Roles (STUDENT, PARENT, TEACHER, ADMIN)
- [ ] Gestion enfants (parent)

### Phase 3: Cours & Contenu

- [ ] CRUD Cours
- [ ] Chapitres & Lecons
- [ ] Quiz & Exercices
- [ ] Progression tracking

### Phase 4: Paiements

- [ ] Integration Stripe
- [ ] Plans d'abonnement
- [ ] Checkout flow
- [ ] Webhooks

### Phase 5: IA

- [ ] Assistant IA Claude
- [ ] Aide aux devoirs
- [ ] Generation exercices

### Phase 6: Polish

- [ ] Performance optimization
- [ ] SEO
- [ ] Analytics
- [ ] Documentation
