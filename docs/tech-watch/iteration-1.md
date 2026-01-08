# Veille Technologique - Iteration 1

**Date**: 8 Janvier 2026
**Projet**: Schoolaris - Plateforme EdTech francaise
**Stack**: Next.js 15, React, TailwindCSS, shadcn/ui

---

## Tableau des Innovations

| Innovation                         | Source                    | Pertinence (1-10) | Effort (1-10) | Impact (1-10) | Priorite |
| ---------------------------------- | ------------------------- | ----------------- | ------------- | ------------- | -------- |
| **Turbopack (stable)**             | Next.js 15.3-15.5         | 9                 | 2             | 8             | **36.0** |
| **Tailwind CSS v4 (Oxide Engine)** | TailwindCSS v4.0          | 10                | 4             | 9             | **22.5** |
| **shadcn/ui Calendar Blocks**      | shadcn/ui changelog       | 9                 | 3             | 8             | **24.0** |
| **Motion (Framer Motion v11)**     | Motion.dev                | 8                 | 5             | 9             | **14.4** |
| **React View Transitions API**     | Next.js 15.2 experimental | 7                 | 6             | 8             | **9.3**  |
| **AI Tutoring Personalization**    | EdTech Trends 2025        | 10                | 8             | 10            | **12.5** |
| **AI-powered Quiz Generation**     | EdTech Trends 2025        | 10                | 6             | 9             | **15.0** |
| **Stripe Connect Express**         | Stripe Sessions 2025      | 9                 | 5             | 8             | **14.4** |
| **Stripe Networked Onboarding**    | Stripe 2025               | 8                 | 3             | 7             | **18.7** |
| **Node.js Middleware (stable)**    | Next.js 15.5              | 8                 | 3             | 7             | **18.7** |
| **Typed Routes (stable)**          | Next.js 15.5              | 9                 | 2             | 7             | **31.5** |
| **assistant-ui (AI Chat)**         | shadcn ecosystem          | 9                 | 4             | 9             | **20.3** |
| **Container Queries**              | Tailwind v4               | 7                 | 3             | 6             | **14.0** |
| **Base UI Integration**            | shadcn/ui                 | 6                 | 5             | 5             | **6.0**  |

**Formule de Priorite**: (Pertinence x Impact) / Effort

---

## Top 3 Innovations a Implementer en Priorite

### 1. Turbopack (Priorite: 36.0)

**Justification**:

- Turbopack est maintenant stable dans Next.js 15.3+ pour le developpement et en beta pour la production
- Gains de performance immediats: 76.7% plus rapide au demarrage, 96.3% plus rapide pour Fast Refresh
- Effort minimal: simple flag `--turbo` a ajouter
- Impact direct sur la productivite des developpeurs

**Implementation**:

```json
// package.json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build --turbo" // beta
  }
}
```

**Sources**:

- [Next.js 15.3](https://nextjs.org/blog/next-15-3)
- [Next.js 15.5](https://nextjs.org/blog/next-15-5)

---

### 2. Typed Routes (Priorite: 31.5)

**Justification**:

- Les typed routes sont maintenant stables dans Next.js 15.5
- Type safety sur toutes les navigations = moins de bugs en production
- Compatible avec Turbopack
- Particulierement important pour Schoolaris avec ses nombreuses routes dynamiques (cours, eleves, etc.)

**Implementation**:

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
};

// Utilisation
import Link from 'next/link';

// TypeScript verifie que la route existe
<Link href="/dashboard/courses/[courseId]" />

// Erreur de type si route invalide
<Link href="/invalid-route" /> // Type error!
```

**Sources**:

- [Next.js 15.5 - Typed Routes](https://nextjs.org/blog/next-15-5)

---

### 3. shadcn/ui Calendar Blocks + assistant-ui (Priorite combinee: 24.0 + 20.3)

**Justification**:

- **Calendar Blocks**: 30+ blocs calendrier pre-construits, essentiels pour la planification des cours et le suivi de progression des eleves
- **assistant-ui**: Composants React pour chat IA, parfaitement alignes avec la Phase 5 (Assistant IA Claude) du projet
- Les deux s'integrent nativement avec shadcn/ui deja utilise dans Schoolaris

**Implementation Calendar**:

```bash
# Installation du nouveau calendrier
pnpm dlx shadcn@latest add calendar
```

```tsx
// components/schedule/course-calendar.tsx
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export function CourseCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  );
}
```

**Implementation assistant-ui**:

```bash
# Installation de assistant-ui
pnpm add @assistant-ui/react
```

```tsx
// components/ai/tutor-chat.tsx
import { Thread } from "@assistant-ui/react";

export function TutorChat() {
  return (
    <Thread
      assistantMessage={{
        components: {
          Text: ({ text }) => <p className="text-foreground">{text}</p>,
        },
      }}
    />
  );
}
```

**Sources**:

- [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog)
- [assistant-ui](https://github.com/Yonom/assistant-ui)

---

## Innovations Secondaires a Planifier

### Tailwind CSS v4 Migration (Priorite: 22.5)

**Quand**: Apres la Phase 2 (Auth & Users) completee

**Points cles**:

- Performance 5x plus rapide (full builds) et 100x plus rapide (incremental)
- Configuration CSS-first simplifee
- Support natif des container queries et cascade layers
- Palette de couleurs modernisee (oklch/P3)

```css
/* Nouvelle syntaxe v4 */
@import "tailwindcss";

/* Configuration directement en CSS */
@theme {
  --color-primary: oklch(0.7 0.15 250);
  --font-display: "Cal Sans", sans-serif;
}
```

**Migration**:

```bash
# Outil de migration automatique
npx @tailwindcss/upgrade
```

**Sources**:

- [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4)

---

### Stripe Connect Express avec Networked Onboarding (Priorite: 18.7)

**Quand**: Phase 4 (Paiements)

**Points cles**:

- Onboarding en 3 clics pour les utilisateurs Stripe existants
- Radar AI pour detection de fraude
- Generation automatique des 1099 (conformite fiscale)
- Support de 135+ devises

```typescript
// lib/stripe.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Creation compte Express pour un professeur
export async function createTeacherAccount(teacherId: string, email: string) {
  const account = await stripe.accounts.create({
    type: "express",
    country: "FR",
    email: email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
    metadata: {
      teacherId: teacherId,
    },
  });

  return account;
}

// Lien d'onboarding
export async function createOnboardingLink(accountId: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXTAUTH_URL}/teacher/stripe/refresh`,
    return_url: `${process.env.NEXTAUTH_URL}/teacher/stripe/success`,
    type: "account_onboarding",
  });

  return accountLink.url;
}
```

**Sources**:

- [Stripe Connect Documentation](https://docs.stripe.com/connect)
- [Stripe Sessions 2025](https://stripe.com/blog/top-product-updates-sessions-2025)

---

### Motion (Framer Motion v11) (Priorite: 14.4)

**Quand**: Phase 6 (Polish)

**Points cles**:

- Animations fluides et performantes (hardware accelerated)
- Layout animations ameliorees pour React 19
- Orchestration d'animations complexes
- 10M+ telechargements npm/mois

```tsx
// components/ui/animated-card.tsx
"use client";

import { motion } from "framer-motion";
import type { FC, ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
}

export const AnimatedCard: FC<AnimatedCardProps> = ({
  children,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ scale: 1.02 }}
      className="rounded-lg border bg-card p-6 shadow-sm"
    >
      {children}
    </motion.div>
  );
};
```

**Sources**:

- [Motion.dev](https://www.framer.com/motion/)
- [Advanced Framer Motion Techniques 2025](https://www.luxisdesign.io/blog/advanced-framer-motion-animation-techniques-for-2025)

---

### AI Tutoring Features (Priorite: 12.5-15.0)

**Quand**: Phase 5 (IA)

**Tendances EdTech 2025 a implementer**:

1. **Tuteur IA Personnalise**
   - Analyse des forces/faiblesses de l'eleve
   - Adaptation du rythme d'apprentissage
   - Feedback en temps reel

2. **Generation automatique de quiz**
   - Quiz adaptatifs bases sur la progression
   - Questions generees par Claude API
   - Correction et explication automatiques

3. **Assistant de devoirs**
   - Aide contextuelle sans donner les reponses
   - Methode socratique (guider par questions)
   - Support multimodal (texte, images)

```typescript
// lib/ai/tutor.ts
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function generateAdaptiveQuiz(
  subject: string,
  level: string,
  studentWeaknesses: string[],
) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Tu es un professeur francais expert. Genere 5 questions de ${subject}
        pour un eleve de ${level}. Cible particulierement ces points faibles:
        ${studentWeaknesses.join(", ")}.

        Format: JSON avec question, options (4), correctAnswer, explanation.`,
      },
    ],
  });

  return JSON.parse(message.content[0].text);
}
```

**Sources**:

- [AI Trends in EdTech 2025](https://edtechmagazine.com/k12/article/2025/01/ai-trends-ed-tech-watch-2025)
- [Education Technology Trends 2025](https://www.digitallearninginstitute.com/blog/education-technology-trends-to-watch-in-2025)

---

## Plan d'Action Recommande

| Phase         | Innovation                  | Timeline       |
| ------------- | --------------------------- | -------------- |
| **Immediate** | Turbopack (`--turbo`)       | Cette semaine  |
| **Immediate** | Typed Routes (experimental) | Cette semaine  |
| **Phase 2**   | shadcn Calendar upgrade     | Avec dashboard |
| **Phase 4**   | Stripe Connect Express      | Avec paiements |
| **Phase 5**   | assistant-ui + AI Tutoring  | Avec IA        |
| **Phase 6**   | Tailwind v4 migration       | Post-MVP       |
| **Phase 6**   | Motion animations           | Polish final   |

---

## Metriques de Suivi

| Metrique            | Actuel   | Cible avec innovations       |
| ------------------- | -------- | ---------------------------- |
| Dev server startup  | ~3s      | <1s (Turbopack)              |
| Hot reload          | ~500ms   | <50ms (Turbopack)            |
| Build time          | ~45s     | <20s (Turbopack prod)        |
| Type errors runtime | Possible | 0 (Typed Routes)             |
| LCP                 | N/A      | <2.5s (Motion + Tailwind v4) |

---

## Ressources et Documentation

### Next.js 15

- [Blog officiel Next.js](https://nextjs.org/blog)
- [Next.js 15 Features Guide](https://dev.to/hamidrazadev/whats-new-in-nextjs-15-2025-release-guide-mo6)

### shadcn/ui

- [Documentation officielle](https://ui.shadcn.com/)
- [Changelog](https://ui.shadcn.com/docs/changelog)
- [Ecosystem Guide 2025](https://www.devkit.best/blog/mdx/shadcn-ui-ecosystem-complete-guide-2025)

### Tailwind CSS v4

- [Annonce v4.0](https://tailwindcss.com/blog/tailwindcss-v4)
- [Guide de migration](https://tailwindcss.com/docs/upgrade-guide)

### Motion (Framer Motion)

- [Documentation](https://www.framer.com/motion/)
- [Techniques avancees 2025](https://www.luxisdesign.io/blog/mastering-framer-motion-advanced-animation-techniques-for-2025)

### EdTech & IA

- [AI Trends EdTech 2025](https://edtechmagazine.com/k12/article/2025/01/ai-trends-ed-tech-watch-2025)
- [EdTech Predictions 2025](https://www.eschoolnews.com/digital-learning/2025/12/30/25-predictions-about-ai-and-edtech/)

### Stripe Connect

- [Documentation Connect](https://docs.stripe.com/connect)
- [Guide Marketplace](https://docs.stripe.com/connect/end-to-end-marketplace)
- [Sessions 2025 Updates](https://stripe.com/blog/top-product-updates-sessions-2025)

---

_Rapport genere le 8 Janvier 2026 - Prochaine iteration prevue: Post-Phase 2_
