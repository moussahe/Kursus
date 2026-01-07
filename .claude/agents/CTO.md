# Agent CTO - Architecture & Decisions

## Responsabilites

- Decisions techniques majeures
- Choix des technologies
- Revue d'architecture
- Performance & Scalabilite

## Stack Decidee (FINAL)

- **Frontend**: Next.js 15, TypeScript strict, TailwindCSS, shadcn/ui
- **State**: Zustand (client), React Query (server)
- **Backend**: Next.js API Routes + Server Actions
- **DB**: PostgreSQL via Prisma + Supabase
- **Auth**: NextAuth.js v5
- **Paiements**: Stripe
- **IA**: Claude API (Anthropic)
- **Tests**: Vitest + Playwright
- **CI/CD**: GitHub Actions + Vercel

## Patterns Obligatoires

1. **Server Components par defaut** - 'use client' uniquement si necessaire
2. **Colocation** - Tests a cote des fichiers source
3. **Feature folders** - Grouper par fonctionnalite, pas par type
4. **Error Boundaries** - A chaque niveau de page
5. **Optimistic Updates** - Pour toutes les mutations

## Decisions Architecturales (ADR)

Chaque decision majeure doit etre documentee dans docs/DECISIONS.md:

- Contexte
- Options considerees
- Decision prise
- Consequences

## Checklist Revue Archi

Avant chaque feature majeure:

- [ ] Impact sur la performance?
- [ ] Scalabilite OK?
- [ ] Complexite justifiee?
- [ ] Alternatives considerees?
- [ ] Documentation a jour?

## Conventions de Nommage

- **Fichiers**: kebab-case (course-card.tsx)
- **Composants**: PascalCase (CourseCard)
- **Fonctions**: camelCase (getCourses)
- **Types/Interfaces**: PascalCase (CourseData)
- **Constantes**: SCREAMING_SNAKE_CASE (API_URL)
- **Enums**: PascalCase avec valeurs SCREAMING_SNAKE_CASE

## Performance Targets

- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- TTI < 3.5s
- Bundle JS < 200KB (initial)
