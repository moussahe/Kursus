# Architecture Decision Records (ADR)

> Documentation des decisions architecturales majeures pour Schoolaris

---

## Table des Matieres

1. [ADR-001: Choix du Framework Frontend](#adr-001-choix-du-framework-frontend)
2. [ADR-002: Strategie de State Management](#adr-002-strategie-de-state-management)
3. [ADR-003: Architecture de la Base de Donnees](#adr-003-architecture-de-la-base-de-donnees)
4. [ADR-004: Systeme d'Authentification](#adr-004-systeme-dauthentification)
5. [ADR-005: Integration IA](#adr-005-integration-ia)
6. [ADR-006: Systeme de Paiements](#adr-006-systeme-de-paiements)
7. [ADR-007: Rate Limiting et Securite](#adr-007-rate-limiting-et-securite)
8. [ADR-008: Architecture des Quiz Adaptatifs](#adr-008-architecture-des-quiz-adaptatifs)
9. [ADR-009: Notifications Push et PWA](#adr-009-notifications-push-et-pwa)
10. [ADR-010: Gamification et XP](#adr-010-gamification-et-xp)

---

## ADR-001: Choix du Framework Frontend

**Date:** Janvier 2025
**Statut:** Accepte

### Contexte

Besoin d'un framework moderne, performant et adapte a une plateforme EdTech avec SSR, ISR et excellent SEO.

### Options Considerees

| Option        | Avantages                           | Inconvenients                 |
| ------------- | ----------------------------------- | ----------------------------- |
| Next.js 15    | App Router, RSC, Vercel integration | Learning curve RSC            |
| Remix         | Excellent DX, forms natives         | Ecosysteme plus petit         |
| Nuxt 3        | Vue ecosystem                       | Moins de developpeurs         |
| Astro + React | Performance statique                | Complexite pour app dynamique |

### Decision

**Next.js 15** avec App Router et React Server Components

### Consequences

- Avantages: Performance optimale, SEO natif, streaming SSR, excellent DX
- Inconvenients: Complexite accrue avec les Server/Client Components
- Migration: N/A (nouveau projet)

---

## ADR-002: Strategie de State Management

**Date:** Janvier 2025
**Statut:** Accepte

### Contexte

Gestion d'etat complexe avec donnees serveur (cours, progression) et etat client (UI, formulaires).

### Options Considerees

| Option                | Avantages                | Inconvenients           |
| --------------------- | ------------------------ | ----------------------- |
| Redux Toolkit         | Mature, devtools         | Boilerplate, complexite |
| Zustand               | Simple, leger            | Moins structure         |
| Jotai                 | Atomique, flexible       | Moins adopte            |
| React Query + Zustand | Separation server/client | Deux libs a apprendre   |

### Decision

**Strategie hybride:**

- **React Query (TanStack Query):** Etat serveur (courses, users, progress)
- **Zustand:** Etat client UI (modals, sidebars, theme)
- **React Hook Form + Zod:** Etat formulaires
- **nuqs:** Etat URL (filtres, pagination)

### Consequences

- Separation claire des responsabilites
- Cache intelligent pour les donnees serveur
- Etat client minimal et performant

---

## ADR-003: Architecture de la Base de Donnees

**Date:** Janvier 2025
**Statut:** Accepte

### Contexte

Plateforme EdTech avec relations complexes (users, courses, progress, payments) et besoin de scalabilite.

### Options Considerees

| Option                | Avantages                | Inconvenients           |
| --------------------- | ------------------------ | ----------------------- |
| PostgreSQL + Prisma   | Type-safe, migrations    | ORM overhead            |
| MongoDB + Mongoose    | Flexible, JSON native    | Pas de relations fortes |
| Supabase (PostgreSQL) | Realtime, Storage inclus | Vendor lock-in          |
| PlanetScale (MySQL)   | Serverless, branching    | MySQL specifique        |

### Decision

**PostgreSQL via Prisma** heberge sur **Supabase**

### Schema Cle

```
User (1) --> (N) Child --> (N) Enrollment --> (1) Course
User (1) --> (N) Course (auteur)
Child --> Progress --> Quiz/Lesson
User --> Achievement, Badge, XP
```

### Consequences

- Type safety avec Prisma Client genere
- Migrations versionnees
- Supabase Storage pour les fichiers
- Supabase Auth non utilise (NextAuth choisi)

---

## ADR-004: Systeme d'Authentification

**Date:** Janvier 2025
**Statut:** Accepte

### Contexte

Multi-roles (Student, Parent, Teacher, Admin), OAuth social, protection des donnees de mineurs (RGPD).

### Options Considerees

| Option         | Avantages                     | Inconvenients          |
| -------------- | ----------------------------- | ---------------------- |
| NextAuth.js v5 | Integration Next.js, flexible | Configuration complexe |
| Clerk          | UI prete, webhooks            | Cout, vendor lock-in   |
| Supabase Auth  | Integre a la DB               | Moins flexible         |
| Auth0          | Enterprise, MFA               | Cout eleve             |

### Decision

**NextAuth.js v5** avec:

- Prisma Adapter
- Credentials Provider (email/password)
- Google OAuth Provider
- JWT Strategy (sessions)

### Configuration Securite

```typescript
session: { strategy: "jwt" }
cookies: {
  httpOnly: true,
  secure: true,
  sameSite: "strict"
}
```

### Consequences

- Controle total sur le flow d'auth
- Roles stockes en DB et dans le JWT
- Session courte (15min access, 7j refresh)

---

## ADR-005: Integration IA

**Date:** Janvier 2025
**Statut:** Accepte

### Contexte

Tuteur IA contextuel, generation de quiz adaptatifs, feedback personnalise.

### Options Considerees

| Option           | Avantages                | Inconvenients           |
| ---------------- | ------------------------ | ----------------------- |
| OpenAI GPT-4     | Populaire, documentation | Cout eleve, rate limits |
| Anthropic Claude | Qualite, context window  | API plus recente        |
| Mistral          | Francais natif, Europe   | Moins performant        |
| Self-hosted LLM  | Pas de cout API          | Infrastructure lourde   |

### Decision

**Anthropic Claude** (claude-sonnet-4-20250514)

### Implementation

```typescript
// Prompts specialises par contexte
SYSTEM_PROMPTS = {
  tutor: "Approche socratique, adapte au niveau...",
  quizGenerator: "Questions claires, 4 options...",
  exerciseGenerator: "Exercices varies...",
};
```

### Rate Limiting IA

- 20 questions/heure par utilisateur
- Cache des reponses similaires
- Fallback gracieux si quota atteint

### Consequences

- Qualite pedagogique superieure
- Context window large (200K tokens)
- Streaming pour UX reactive

---

## ADR-006: Systeme de Paiements

**Date:** Janvier 2025
**Statut:** Accepte

### Contexte

Marketplace de cours avec commission plateforme (30%), paiement des professeurs (70%).

### Options Considerees

| Option             | Avantages             | Inconvenients         |
| ------------------ | --------------------- | --------------------- |
| Stripe Connect     | Marketplace native    | Complexite onboarding |
| PayPal Commerce    | Connu des users       | Frais eleves          |
| Mangopay           | Europeen, marketplace | Integration complexe  |
| Custom (virements) | Controle total        | Charge operationnelle |

### Decision

**Stripe Connect (Standard accounts)**

### Flow Implementé

```
1. Teacher s'inscrit -> Stripe Connect onboarding
2. Parent achete cours -> PaymentIntent avec transfer_data
3. Webhook payment_intent.succeeded
4. Auto-transfer: 70% prof, 30% plateforme
```

### Consequences

- Onboarding Stripe gere par Stripe
- Paiements automatiques aux profs
- Conformite fiscale automatique
- Webhooks pour synchronisation

---

## ADR-007: Rate Limiting et Securite

**Date:** Janvier 2025
**Statut:** Accepte

### Contexte

Protection contre les abus, DDoS, et respect des quotas API externes.

### Options Considerees

| Option             | Avantages              | Inconvenients          |
| ------------------ | ---------------------- | ---------------------- |
| Upstash Redis      | Serverless, edge-ready | Cout a l'echelle       |
| Vercel Edge Config | Integre                | Limites fonctionnelles |
| In-memory Map      | Simple, gratuit        | Pas multi-instance     |
| Cloudflare WAF     | Puissant               | Cout, complexite       |

### Decision

**Strategie hybride:**

- **Production:** Upstash Redis (sliding window)
- **Developpement:** In-memory Map avec cleanup

### Limites Implementees

| Endpoint        | Limite            |
| --------------- | ----------------- |
| `/api/*`        | 100 req/min/IP    |
| `/api/auth/*`   | 5 req/min/IP      |
| `/api/ai/*`     | 20 req/heure/user |
| `/api/stripe/*` | 10 req/min/user   |

### Headers Securite

- Strict-Transport-Security
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Content-Security-Policy (configure)

---

## ADR-008: Architecture des Quiz Adaptatifs

**Date:** Janvier 2025
**Statut:** Accepte

### Contexte

Quiz qui s'adaptent au niveau de l'eleve, trackent les points faibles, et ameliorent l'apprentissage.

### Options Considerees

| Option                   | Avantages         | Inconvenients          |
| ------------------------ | ----------------- | ---------------------- |
| Questions statiques      | Simple            | Pas personnalise       |
| Banque de questions fixe | Controle qualite  | Limite                 |
| Generation IA dynamique  | Infini, adaptatif | Cout, qualite variable |
| Hybride                  | Meilleur des deux | Complexite             |

### Decision

**Approche hybride:**

- Questions de base creees par les profs
- Generation IA pour quiz adaptatifs
- Analyse des reponses pour identifier les weak areas

### Modele Adaptatif

```typescript
interface AdaptiveLearningState {
  childId: string;
  subjectId: string;
  currentDifficulty: "easy" | "medium" | "hard";
  masteryScore: number;
  weakAreas: WeakArea[];
}
```

### Algorithme

1. Score < 50% -> Reduire difficulte
2. Score 50-80% -> Maintenir
3. Score > 80% -> Augmenter difficulte
4. Tracker les topics avec erreurs repetees

### Consequences

- Apprentissage personnalise
- Weak areas identifiees et retravaillees
- Parents informes des difficultes

---

## ADR-009: Notifications Push et PWA

**Date:** Janvier 2025
**Statut:** Accepte

### Contexte

Engagement mobile sans app native, notifications pour parents et eleves.

### Options Considerees

| Option         | Avantages         | Inconvenients      |
| -------------- | ----------------- | ------------------ |
| PWA + Web Push | Pas d'app store   | Support iOS limite |
| React Native   | Experience native | Double codebase    |
| Expo           | Cross-platform    | Taille bundle      |
| Capacitor      | Web + Native      | Complexite         |

### Decision

**PWA avec Web Push API**

### Implementation

```typescript
// Service Worker pour offline
// VAPID keys pour push
// next-pwa pour integration Next.js
```

### Types de Notifications

| Event                   | Destinataire |
| ----------------------- | ------------ |
| Enfant inactif 3+ jours | Parent       |
| Quiz score < 50%        | Parent       |
| Quiz score > 90%        | Parent       |
| Nouveau badge debloque  | Eleve        |
| Rappel objectif d'etude | Eleve        |

### Consequences

- Installation "Add to Home Screen"
- Notifications meme app fermee
- Offline mode basique (cache)

---

## ADR-010: Gamification et XP

**Date:** Janvier 2025
**Statut:** Accepte

### Contexte

Motivation des eleves via systeme de progression, badges, et classements.

### Options Considerees

| Option          | Avantages          | Inconvenients      |
| --------------- | ------------------ | ------------------ |
| Points simples  | Facile             | Peu engageant      |
| XP + Niveaux    | Progression claire | Design necessaire  |
| Badges seuls    | Collectible        | Pas de progression |
| Systeme complet | Tres engageant     | Complexite         |

### Decision

**Systeme complet:**

- XP accumules par activite
- Niveaux (1-100) avec paliers
- Badges pour achievements specifiques
- Streaks pour regularite
- Leaderboard par niveau scolaire

### Attribution XP

| Action                 | XP  |
| ---------------------- | --- |
| Lecon completee        | +10 |
| Quiz reussi (> 70%)    | +15 |
| Quiz parfait (100%)    | +30 |
| Streak jour            | +5  |
| Premier cours complete | +50 |
| Badge debloque         | +20 |

### Consequences

- Engagement mesurable (+50% d'apres recherches)
- Parents voient les progres via XP
- Competition saine via leaderboard
- Anti-gaming: limites quotidiennes

---

## Decisions Futures a Documenter

- [ ] ADR-011: Strategie de tests E2E
- [ ] ADR-012: Internationalisation (i18n)
- [ ] ADR-013: CDN Video (Cloudflare Stream vs Mux)
- [ ] ADR-014: Analytics et Tracking
- [ ] ADR-015: Migration vers Redis en production

---

## Template pour Nouvelle Decision

```markdown
## ADR-XXX: [Titre]

**Date:** [Date]
**Statut:** Propose | Accepte | Deprecie | Remplace par ADR-YYY

### Contexte

[Pourquoi cette decision est necessaire]

### Options Considerees

| Option | Avantages | Inconvenients |
| ------ | --------- | ------------- |
| A      | ...       | ...           |
| B      | ...       | ...           |

### Decision

[Choix fait et raison principale]

### Consequences

- Avantages: ...
- Inconvenients: ...
- Migration: ...
```

---

_Document maintenu par l'equipe technique Schoolaris_
_Derniere mise a jour: Janvier 2026_
