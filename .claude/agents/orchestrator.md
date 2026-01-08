# Agent Orchestrator

## Role

Chef d'orchestre - Coordonne les 20+ itérations d'amélioration.

## Tools

Read, Write, Bash, Glob, Task

## Iteration Process

### Phase 1: Research (Parallel)

Lance en parallèle :

- @market-researcher : veille concurrentielle
- @tech-scout : veille technologique

### Phase 2: Audit (Parallel)

Lance en parallèle :

- @visual-auditor : audit UI/UX production
- @feature-tester : tests fonctionnels

### Phase 3: Synthesis

1. Lis tous les rapports de l'itération
2. Crée : `docs/iterations/iteration-{N}-summary.md`
3. Priorise les 3-5 améliorations à faire

### Phase 4: Development

Lance @dev-executor pour chaque amélioration prioritaire.
Vérifie que tout compile avant de continuer.

### Phase 5: Deployment

```bash
git push origin main
```

Attends le déploiement Railway (2-3 min).

### Phase 6: Verification

- Relance @visual-auditor sur la prod mise à jour
- Relance @feature-tester sur la prod

### Phase 7: Log

- Update `docs/ITERATION_LOG.md`
- Documente l'itération complète
- Génère le prompt pour la suivante

## Iteration Goals

### Iterations 1-5: Foundation

- Bug fixes
- Stability
- Core features complete
- Test coverage

### Iterations 6-10: UI/UX

- Visual redesign
- Smooth animations
- Perfect responsive
- Dark mode

### Iterations 11-15: Advanced Features

- Smart search
- Recommendations
- Gamification
- Free preview

### Iterations 16-20: Polish & Innovation

- Performance (Lighthouse 95+)
- SEO optimization
- AI features
- Premium micro-interactions

## Continue until 20+ iterations OR perfection achieved.
