# REBRAND PLAN: Schoolaris → Kursus

**Date**: 2026-01-17
**Objectif**: Transformer Schoolaris en Kursus avec un design premium inspire de nvg8.io

---

## 1. Resume Executif

### Changements Majeurs

| Aspect                 | Avant (Schoolaris)        | Apres (Kursus)       |
| ---------------------- | ------------------------- | -------------------- |
| **Nom**                | Schoolaris                | Kursus               |
| **Mode par defaut**    | Light mode                | Dark mode            |
| **Couleur primaire**   | Blue oklch(0.55 0.2 250)  | Orange #ff6d38       |
| **Couleur secondaire** | Green oklch(0.6 0.17 160) | Lime #c7ff69         |
| **Accent**             | Orange                    | Purple #7a78ff       |
| **Typo headlines**     | Inter Regular             | Bold/Black (800-900) |
| **Style**              | Educatif classique        | Premium/Tech startup |

### Scope

- **122 fichiers** contenant "Schoolaris" a renommer
- **1 fichier CSS** (globals.css) - refonte complete
- **28 composants UI** - adaptation dark mode
- **5 bugs P1** a corriger

---

## 2. Nouvelle Identite Visuelle

### 2.1 Palette de Couleurs (Inspiree nvg8.io)

```css
/* KURSUS DESIGN SYSTEM - Dark First */

/* Primary - Orange energique */
--kursus-orange: #ff6d38;
--kursus-orange-light: #ff8c5a;
--kursus-orange-dark: #e55a2b;

/* Secondary - Lime vibrante (succes/progression) */
--kursus-lime: #c7ff69;
--kursus-lime-light: #d4ff8a;
--kursus-lime-dark: #a8e050;

/* Accent - Purple premium */
--kursus-purple: #7a78ff;
--kursus-purple-light: #9896ff;
--kursus-purple-dark: #5c5ae0;

/* Accents supplementaires */
--kursus-blue: #478bff;
--kursus-green: #00a652;
--kursus-yellow: #ffc412;

/* Neutrals - Dark mode first */
--kursus-black: #0a0a0a;
--kursus-dark: #141414;
--kursus-dark-elevated: #1a1a1a;
--kursus-dark-border: #2a2a2a;
--kursus-gray: #6b7280;
--kursus-light: #fdf9f0;
--kursus-white: #ffffff;
```

### 2.2 Typographie

```css
/* Headlines - Bold/Black */
--font-display: 'Geist', 'Inter', system-ui;
--font-body: 'Geist', 'Inter', system-ui;

/* Weights */
h1: font-weight: 900; letter-spacing: -0.04em;
h2: font-weight: 800; letter-spacing: -0.03em;
h3: font-weight: 700; letter-spacing: -0.02em;
body: font-weight: 400;

/* Sizes (responsive) */
h1: clamp(2.5rem, 8vw, 5rem);
h2: clamp(2rem, 6vw, 3.5rem);
h3: clamp(1.5rem, 4vw, 2.5rem);
```

### 2.3 Animations (Premium feel)

```css
/* Easing functions nvg8.io style */
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--ease-in-out: cubic-bezier(0.84, 0, 0.16, 1);

/* Transitions */
--transition-fast: 150ms var(--ease-out);
--transition-medium: 300ms var(--ease-out);
--transition-slow: 500ms var(--ease-in-out);

/* Hover effects */
- Button: bg-color fill + border-radius morph
- Cards: subtle lift (-4px) + glow
- Links: underline animation left-to-right
```

### 2.4 Composants Cles

| Composant    | Style Kursus                                              |
| ------------ | --------------------------------------------------------- |
| **Buttons**  | Rounded (border-radius: 2rem), gradient bg, glow on hover |
| **Cards**    | Dark bg (#1a1a1a), subtle border, lime/orange accents     |
| **Inputs**   | Dark bg, bright border on focus, lime caret               |
| **Badges**   | Pill shape, gradient fills, bold text                     |
| **Progress** | Gradient bar (orange→lime), animated shimmer              |
| **Avatars**  | Border glow on hover                                      |

---

## 3. Fichiers a Modifier

### 3.1 Configuration Core (11 fichiers)

| Fichier                | Changements                            |
| ---------------------- | -------------------------------------- |
| `package.json`         | name: "kursus"                         |
| `public/manifest.json` | name, short_name, theme_color, icons   |
| `src/app/layout.tsx`   | metadata title, description, openGraph |
| `src/app/globals.css`  | **REFONTE COMPLETE** design system     |
| `src/lib/seo.ts`       | siteConfig name, url, descriptions     |
| `prisma/schema.prisma` | Commentaire header                     |
| `prisma/seed.ts`       | Emails @kursus.fr                      |
| `.env.example`         | URLs kursus                            |
| `docker-compose.yml`   | Container name                         |
| `CLAUDE.md`            | Nom projet                             |
| `.claude/agents/*.md`  | References                             |

### 3.2 Composants Landing/Marketing (12 fichiers)

| Fichier                                      | Changements     |
| -------------------------------------------- | --------------- |
| `src/components/landing/header.tsx`          | Logo, nom       |
| `src/components/landing/footer.tsx`          | Branding, liens |
| `src/components/landing/testimonials.tsx`    | Textes          |
| `src/components/landing/stats-section.tsx`   | Textes          |
| `src/components/landing/product-preview.tsx` | Textes          |
| `src/app/page.tsx`                           | Hero, CTA       |
| `src/app/(main)/demo/page.tsx`               | Branding        |
| `src/app/(main)/courses/page.tsx`            | Header          |
| `src/app/(main)/community/page.tsx`          | Branding        |
| `src/app/(legal)/conditions/page.tsx`        | Nom legal       |
| `src/app/(legal)/confidentialite/page.tsx`   | Nom legal       |
| `src/app/(legal)/layout.tsx`                 | Header          |

### 3.3 Auth Pages (8 fichiers)

| Fichier                                         | Changements                      |
| ----------------------------------------------- | -------------------------------- |
| `src/app/(auth)/login/page.tsx`                 | Logo, textes                     |
| `src/app/(auth)/register/page.tsx`              | + Confirm password, CGU checkbox |
| `src/app/(auth)/register/teacher/page.tsx`      | Branding                         |
| `src/app/(auth)/forgot-password/page.tsx`       | Branding                         |
| `src/app/(auth)/reset-password/page.tsx`        | Branding                         |
| `src/app/(auth)/onboarding/page.tsx`            | Branding                         |
| `src/app/(auth)/teacher-onboarding/page.tsx`    | Branding                         |
| `src/components/auth/google-sign-in-button.tsx` | Texte                            |

### 3.4 Dashboards (25 fichiers)

| Section | Fichiers | Changements                 |
| ------- | -------- | --------------------------- |
| Parent  | 10       | Sidebars, headers, branding |
| Teacher | 8        | Sidebars, headers, branding |
| Student | 5        | Sidebars, headers, branding |
| Admin   | 7        | Sidebars, headers, branding |

### 3.5 Emails (6 fichiers)

| Fichier                                            | Changements            |
| -------------------------------------------------- | ---------------------- |
| `src/lib/email/templates/base.ts`                  | Logo, couleurs, footer |
| `src/lib/email/templates/alerts.ts`                | Nom                    |
| `src/lib/email/templates/password-reset.ts`        | Nom                    |
| `src/lib/email/templates/purchase-confirmation.ts` | Nom                    |
| `src/lib/email/templates/weekly-report.ts`         | Nom                    |
| `src/lib/email/templates/course-moderation.ts`     | Nom                    |

### 3.6 AI/Prompts (12 fichiers)

| Fichier                     | Changements    |
| --------------------------- | -------------- |
| `src/lib/ai.ts`             | System prompts |
| `src/lib/ai-quiz.ts`        | Prompts        |
| `src/lib/ai-exercises.ts`   | Prompts        |
| `src/lib/ai-predictions.ts` | Prompts        |
| `src/lib/ai-exam-mode.ts`   | Prompts        |
| `src/lib/anthropic.ts`      | Config         |
| `src/app/api/ai/*/route.ts` | 6 fichiers     |

### 3.7 Autres (48 fichiers)

- API routes avec mentions Schoolaris
- Composants UI avec branding
- Documentation (docs/)
- Tests
- Public assets

---

## 4. Bug Fixes a Integrer

### 4.1 P1 - Pagination Catalogue

**Fichier**: `src/app/(main)/courses/page.tsx`

```typescript
// Ajouter pagination avec take/skip
const ITEMS_PER_PAGE = 12;

const courses = await prisma.course.findMany({
  where: { isPublished: true, ...filters },
  take: ITEMS_PER_PAGE,
  skip: (page - 1) * ITEMS_PER_PAGE,
  orderBy: { createdAt: "desc" },
});

const total = await prisma.course.count({
  where: { isPublished: true, ...filters },
});

// Ajouter composant Pagination UI
```

### 4.2 P1 - N+1 Queries Dashboard Parent

**Fichier**: `src/app/(dashboard)/parent/page.tsx`

```typescript
// Remplacer les boucles par Promise.all
const [children, alerts, purchases, progress] = await Promise.all([
  prisma.child.findMany({ where: { parentId } }),
  prisma.alert.findMany({ where: { parentId, isRead: false } }),
  prisma.purchase.findMany({ where: { userId: parentId } }),
  prisma.progress.groupBy({
    by: ["childId"],
    where: { child: { parentId } },
    _count: { isCompleted: true },
  }),
]);
```

### 4.3 P1 - Migration Prisma Baseline

```bash
# Creer migration baseline
npx prisma migrate dev --name init_baseline

# Ou pour DB existante
npx prisma migrate resolve --applied init_baseline
```

### 4.4 P2 - Confirmation Mot de Passe

**Fichier**: `src/app/(auth)/register/page.tsx`

```typescript
// Ajouter au schema Zod
confirmPassword: z.string().min(1, "Confirmez le mot de passe"),

// Ajouter validation
.refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

// Ajouter champ UI
<PasswordInput name="confirmPassword" label="Confirmer le mot de passe" />
```

### 4.5 P2 - Checkbox CGU

**Fichier**: `src/app/(auth)/register/page.tsx`

```typescript
// Ajouter au schema
acceptTerms: z.boolean().refine(val => val === true, {
  message: "Vous devez accepter les conditions",
})

// Ajouter UI
<Checkbox
  name="acceptTerms"
  label={<>J'accepte les <Link href="/conditions">CGU</Link></>}
/>
```

---

## 5. Plan d'Execution

### Phase 1: Preparation (1h)

- [ ] Creer branche `feature/rebrand-kursus`
- [ ] Backup des assets actuels
- [ ] Installer font Geist (optionnel)

### Phase 2: Design System (2-3h)

- [ ] Refonte `globals.css` (nouvelle palette, dark mode first)
- [ ] Mettre a jour composants UI shadcn pour dark mode
- [ ] Creer nouveaux gradients/animations

### Phase 3: Core Branding (1-2h)

- [ ] `package.json` - rename
- [ ] `manifest.json` - PWA branding
- [ ] `layout.tsx` - metadata
- [ ] `seo.ts` - configuration
- [ ] Email templates - branding

### Phase 4: Pages Publiques (2h)

- [ ] Landing page (hero, stats, footer)
- [ ] Header/Footer components
- [ ] Pages legales

### Phase 5: Auth (1h)

- [ ] Login/Register pages
- [ ] Bug fix: confirm password
- [ ] Bug fix: CGU checkbox
- [ ] Onboarding pages

### Phase 6: Dashboards (2h)

- [ ] Sidebars (parent, teacher, student, admin)
- [ ] Headers
- [ ] Mobile navs

### Phase 7: Bug Fixes P1 (2h)

- [ ] Pagination catalogue
- [ ] N+1 queries parent
- [ ] Migration Prisma

### Phase 8: AI Prompts (1h)

- [ ] Mettre a jour tous les prompts avec "Kursus"

### Phase 9: Tests & QA (1h)

- [ ] Verifier tous les textes
- [ ] Tester dark mode
- [ ] Tester responsive
- [ ] Run `pnpm validate`

### Phase 10: Assets (30min)

- [ ] Nouveau logo (ou placeholder)
- [ ] Favicons
- [ ] OG images

---

## 6. Commandes Search & Replace

### Remplacement Texte

```bash
# Cas principal
Schoolaris → Kursus

# Lowercase
schoolaris → kursus

# Domaines
schoolaris.fr → kursus.fr

# Emails
@schoolaris.fr → @kursus.fr
```

### Fichiers a exclure du replace

- `AUDIT_REPORT.md` (historique)
- `docs/*.md` (documentation historique)
- `node_modules/`
- `.git/`
- `*.lock`

---

## 7. Checklist Pre-Commit

- [ ] `pnpm lint` - 0 errors
- [ ] `pnpm type-check` - 0 errors
- [ ] `pnpm test:run` - All pass
- [ ] `pnpm build` - Success
- [ ] Dark mode teste sur toutes les pages
- [ ] Mobile responsive verifie
- [ ] Tous les textes "Schoolaris" remplaces
- [ ] Emails envoyes avec bon branding

---

## 8. Estimation Temps Total

| Phase            | Temps       |
| ---------------- | ----------- |
| Preparation      | 1h          |
| Design System    | 3h          |
| Core Branding    | 2h          |
| Pages Publiques  | 2h          |
| Auth + Bug fixes | 2h          |
| Dashboards       | 2h          |
| Bug fixes P1     | 2h          |
| AI Prompts       | 1h          |
| Tests & QA       | 1h          |
| Assets           | 30min       |
| **TOTAL**        | **~16-18h** |

---

## 9. Risques et Mitigations

| Risque                              | Impact | Mitigation                     |
| ----------------------------------- | ------ | ------------------------------ |
| Oubli de texte Schoolaris           | Medium | Grep final avant merge         |
| Dark mode casse certains composants | High   | Tester chaque composant        |
| SEO impact (changement URL)         | High   | Redirects 301 + Search Console |
| Cache navigateur                    | Low    | Cache-bust des assets          |

---

## 10. Next Steps

1. **Valider ce plan** avec le stakeholder
2. **Decider** si font custom (Geist) ou rester Inter
3. **Creer logo** Kursus ou utiliser placeholder
4. **Commencer Phase 1**

---

_Plan genere le 2026-01-17 par Claude Code_
