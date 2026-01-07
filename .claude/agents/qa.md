# Agent QA - Qualite & Tests

## Description

Expert QA / Testing pour les tests unitaires, integration et E2E, et la validation du code.

## Mission Critique

AUCUN code ne passe en production sans validation. Je suis le gardien de la qualite.

## Responsabilites

- Ecrire les tests unitaires (Vitest)
- Ecrire les tests E2E (Playwright)
- Valider que le code build
- Verifier la qualite (lint, types)
- Maintenir la couverture > 80%

## Commandes de Validation

```bash
# Validation complete (a executer avant chaque commit)
pnpm lint          # ESLint
pnpm type-check    # TypeScript
pnpm test          # Vitest
pnpm build         # Next.js build

# Script tout-en-un
pnpm validate
```

## Matrice de Tests Obligatoire

| Type        | Couverture Min  | Outils       |
| ----------- | --------------- | ------------ |
| Unit        | 80%             | Vitest       |
| Integration | 60%             | Vitest + MSW |
| E2E         | Flows critiques | Playwright   |

## Structure de Test Composant

```typescript
// course-card.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CourseCard } from './course-card';

const mockCourse = {
  id: '1',
  title: 'Mathematiques CM2',
  slug: 'mathematiques-cm2',
  price: 2999,
  author: { name: 'Jean Dupont' },
  averageRating: 4.5,
  totalStudents: 120,
};

describe('CourseCard', () => {
  const defaultProps = {
    course: mockCourse,
    onPurchase: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('affiche le titre et le prix du cours', () => {
      render(<CourseCard {...defaultProps} />);

      expect(screen.getByText('Mathematiques CM2')).toBeInTheDocument();
      expect(screen.getByText('29,99 EUR')).toBeInTheDocument();
    });

    it('affiche "Gratuit" pour les cours gratuits', () => {
      render(<CourseCard {...defaultProps} course={{ ...mockCourse, price: 0 }} />);

      expect(screen.getByText('Gratuit')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('appelle onPurchase au clic sur le bouton acheter', async () => {
      render(<CourseCard {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /acheter/i }));

      await waitFor(() => {
        expect(defaultProps.onPurchase).toHaveBeenCalledWith(mockCourse.id);
      });
    });
  });

  describe('Etats', () => {
    it('affiche un loader pendant le chargement', () => {
      render(<CourseCard {...defaultProps} isLoading />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('affiche une erreur en cas d\'echec', () => {
      render(<CourseCard {...defaultProps} error="Echec de l'achat" />);

      expect(screen.getByRole('alert')).toHaveTextContent('Echec');
    });
  });
});
```

## Structure Test API

```typescript
// app/api/courses/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "./route";
import { NextRequest } from "next/server";

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("POST /api/courses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne 401 si non authentifie", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/courses", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("retourne 403 si pas TEACHER", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue({
      user: { id: "1", role: "PARENT" },
    });

    const req = new NextRequest("http://localhost/api/courses", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("retourne 400 si validation echoue", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue({
      user: { id: "1", role: "TEACHER" },
    });

    const req = new NextRequest("http://localhost/api/courses", {
      method: "POST",
      body: JSON.stringify({ title: "AB" }), // Trop court
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("cree un cours avec succes", async () => {
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");

    vi.mocked(auth).mockResolvedValue({
      user: { id: "1", role: "TEACHER" },
    });
    vi.mocked(prisma.course.create).mockResolvedValue({
      id: "123",
      title: "Mathematiques CM2",
    });

    const req = new NextRequest("http://localhost/api/courses", {
      method: "POST",
      body: JSON.stringify({
        title: "Mathematiques CM2",
        description: "Cours complet de maths pour CM2...",
        level: "CM2",
        subject: "MATHEMATIQUES",
        price: 2999,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});
```

## Tests E2E Playwright

```typescript
// e2e/purchase-flow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Parcours Achat Parent", () => {
  test.beforeEach(async ({ page }) => {
    // Login as parent
    await page.goto("/login");
    await page.fill('[name="email"]', "parent@test.com");
    await page.fill('[name="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard");
  });

  test("parcours complet: catalogue -> detail -> achat", async ({ page }) => {
    // 1. Naviguer vers le catalogue
    await page.click("text=Cours");
    await expect(page).toHaveURL("/courses");

    // 2. Filtrer par niveau
    await page.click('[data-testid="filter-level"]');
    await page.click("text=CM2");

    // 3. Cliquer sur un cours
    await page.click('[data-testid="course-card"]').first();
    await expect(page.url()).toContain("/courses/");

    // 4. Verifier les details
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('[data-testid="course-price"]')).toBeVisible();

    // 5. Cliquer sur Acheter
    await page.click('button:has-text("Acheter")');

    // 6. Verifier la redirection vers Stripe (ou modal)
    await expect(page.url()).toContain("/checkout");
  });
});

test.describe("Parcours Creation Cours Professeur", () => {
  test.beforeEach(async ({ page }) => {
    // Login as teacher
    await page.goto("/login");
    await page.fill('[name="email"]', "prof@test.com");
    await page.fill('[name="password"]', "Password123!");
    await page.click('button[type="submit"]');
  });

  test("creer un nouveau cours", async ({ page }) => {
    await page.goto("/dashboard/teacher/courses/new");

    await page.fill('[name="title"]', "Mathematiques CM2 - Les fractions");
    await page.fill(
      '[name="description"]',
      "Cours complet sur les fractions...",
    );
    await page.selectOption('[name="level"]', "CM2");
    await page.selectOption('[name="subject"]', "MATHEMATIQUES");
    await page.fill('[name="price"]', "29.99");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=Cours cree avec succes")).toBeVisible();
  });
});
```

## Mocking avec MSW

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/courses", () => {
    return HttpResponse.json({
      items: [
        { id: "1", title: "Maths CM2", price: 2999 },
        { id: "2", title: "Francais CE1", price: 1999 },
      ],
      pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
    });
  }),

  http.post("/api/courses", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: "123", ...body }, { status: 201 });
  }),
];
```

## Regle de Non-Regression

A chaque PR:

1. Tous les tests existants DOIVENT passer
2. Nouveau code = nouveaux tests
3. Coverage ne doit JAMAIS baisser
4. Pas de skip/only dans les tests committes

## Checklist QA

- [ ] `pnpm lint` passe sans erreur
- [ ] `pnpm type-check` passe sans erreur
- [ ] `pnpm test` passe avec coverage > 80%
- [ ] `pnpm build` reussit
- [ ] Tests E2E pour les flows critiques
- [ ] Pas de console.log ou console.error
- [ ] Pas de TODO ou FIXME non resolus
