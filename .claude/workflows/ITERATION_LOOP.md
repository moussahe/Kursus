# Boucle d'Iteration Continue

## Principe

Chaque feature passe par ce cycle jusqu'a la perfection.

## Le Cycle (OBLIGATOIRE)

```
+-----------------------------------------------------------+
|                    ITERATION LOOP                          |
+-----------------------------------------------------------+
|                                                            |
|   1. PLAN                                                  |
|      - Definir les specs de la feature                     |
|                                                            |
|   2. CODE                                                  |
|      - Implementer (suivre agents Lead)                    |
|                                                            |
|   3. TEST                                                  |
|      - Ecrire tests (unit + integration)                   |
|                                                            |
|   4. VALIDATE                                              |
|      - Executer: pnpm validate                             |
|      - Si FAIL -> retour a CODE                            |
|                                                            |
|   5. REVIEW                                                |
|      - Auto-review avec checklist agents                   |
|      - Si issues -> retour a CODE                          |
|                                                            |
|   6. COMMIT                                                |
|      - Message conventionnel                               |
|      - feat(scope): description                            |
|                                                            |
|   7. IMPROVE                                               |
|      - Identifier ameliorations possibles                  |
|      - Si ameliorations -> nouvelle iteration              |
|                                                            |
|   8. NEXT                                                  |
|      - Passer a la feature suivante                        |
|                                                            |
+-----------------------------------------------------------+
```

## Commande d'Iteration

Apres chaque bloc de code, execute:

```bash
# Script d'iteration
pnpm lint:fix
pnpm type-check
pnpm test --run
pnpm build

# Si tout passe:
git add -A
git commit -m "feat(scope): description"

# Sinon: corrige et recommence
```

## Metriques de Qualite a Chaque Iteration

| Metrique      | Seuil   | Action si echec |
| ------------- | ------- | --------------- |
| Lint errors   | 0       | Fix immediat    |
| Type errors   | 0       | Fix immediat    |
| Test failures | 0       | Fix immediat    |
| Coverage      | > 80%   | Ajouter tests   |
| Build         | Success | Debug           |
| Bundle size   | < +10%  | Optimiser       |

## Amelioration Continue

Apres chaque feature completee, demande-toi:

1. Le code est-il DRY?
2. Les types sont-ils precis?
3. Les tests couvrent-ils les edge cases?
4. La perf est-elle optimale?
5. L'UX est-elle fluide?
6. Le code est-il documente?

Si NON a une question -> nouvelle iteration d'amelioration.

## Commit Message Convention

```
<type>(<scope>): <description>

Types:
- feat: Nouvelle fonctionnalite
- fix: Correction de bug
- docs: Documentation
- style: Formatage
- refactor: Refactoring
- test: Tests
- chore: Maintenance

Exemples:
feat(auth): add password reset flow
fix(courses): correct enrollment count
docs(readme): update installation steps
```
