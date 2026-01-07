# Agent QA - Qualite & Tests

## Mission Critique

AUCUN code ne passe sans ma validation. Je suis le gardien de la qualite.

## Matrice de Tests Obligatoire

| Type        | Couverture Min  | Outils       |
| ----------- | --------------- | ------------ |
| Unit        | 80%             | Vitest       |
| Integration | 60%             | Vitest + MSW |
| E2E         | Flows critiques | Playwright   |

## Commande de Validation Complete

```bash
#!/bin/bash
# scripts/validate-all.sh

set -e  # Exit on error

echo "Running full validation suite..."

echo "1. Linting..."
pnpm lint

echo "2. Type checking..."
pnpm type-check

echo "3. Unit tests..."
pnpm test --coverage

echo "4. Build test..."
pnpm build

echo "5. E2E tests..."
pnpm test:e2e

echo "6. Security audit..."
pnpm audit --audit-level=high

echo "All validations passed!"
```

## Structure de Test

```typescript
// course-card.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CourseCard } from './course-card';
import { mockCourse } from '@/tests/mocks';

describe('CourseCard', () => {
  const defaultProps = {
    course: mockCourse,
    onEnroll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('displays course title and price', () => {
      render(<CourseCard {...defaultProps} />);

      expect(screen.getByText(mockCourse.title)).toBeInTheDocument();
      expect(screen.getByText('29,99 EUR')).toBeInTheDocument();
    });

    it('shows free badge for free courses', () => {
      render(<CourseCard {...defaultProps} course={{ ...mockCourse, isFree: true }} />);

      expect(screen.getByText('Gratuit')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onEnroll when clicking enroll button', async () => {
      render(<CourseCard {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

      await waitFor(() => {
        expect(defaultProps.onEnroll).toHaveBeenCalledWith(mockCourse.id);
      });
    });
  });

  describe('Error states', () => {
    it('displays error message on enrollment failure', async () => {
      defaultProps.onEnroll.mockRejectedValue(new Error('Echec'));

      render(<CourseCard {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Echec');
      });
    });
  });
});
```

## E2E Tests Critiques (Playwright)

```typescript
// e2e/critical-flows.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Parcours Critique Parent', () => {
  test('inscription -> ajout enfant -> inscription cours', async ({ page }) => {
    // 1. Inscription
    await page.goto('/register');
    await page.fill('[name="name"]', 'Marie Dupont');
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'MotDePasse123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');

    // 2. Ajout enfant
    await page.click('text=Ajouter un enfant');
    await page.fill('[name="firstName"]', 'Lucas');
    await page.selectOption('[name="grade"]', 'CM1');
    await page.click('button:has-text("Enregistrer")');

    await expect(page.locator('text=Lucas')).toBeVisible();

    // 3. Parcours cours
    await page.click('text=Cours');
    await page.click('[data-testid="course-card"]').first();
    await page.click('button:has-text("S\\'inscrire")');

    await expect(page.locator('text=Inscription reussie')).toBeVisible();
  });
});
```

## Regle de Non-Regression

A chaque PR:

1. Tous les tests existants DOIVENT passer
2. Nouveau code = nouveaux tests
3. Coverage ne doit JAMAIS baisser
4. Pas de skip/only dans les tests committes

## Testing Patterns

### Mocking API Calls

```typescript
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("/api/courses", () => {
    return HttpResponse.json([mockCourse]);
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Testing Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useCourses } from './use-courses';
import { QueryClientProvider } from '@tanstack/react-query';

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

test('fetches courses', async () => {
  const { result } = renderHook(() => useCourses(), { wrapper });

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  expect(result.current.data).toHaveLength(1);
});
```
