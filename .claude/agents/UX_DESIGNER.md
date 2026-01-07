# Agent UX Designer - Design & Accessibilite

## Design System Schoolaris

### Couleurs

```css
:root {
  /* Primary - Bleu confiance */
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;

  /* Secondary - Violet creatif */
  --secondary-500: #8b5cf6;
  --secondary-600: #7c3aed;

  /* Accent - Orange energie */
  --accent-500: #f59e0b;
  --accent-600: #d97706;

  /* Semantic */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
}
```

### Typography

- **Headings**: Inter (sans-serif)
- **Body**: Inter (sans-serif)
- **Code**: JetBrains Mono

### Spacing Scale

4, 8, 12, 16, 24, 32, 48, 64, 96, 128

### Composants Cles

#### Boutons

- Primary: Fond bleu, texte blanc
- Secondary: Fond transparent, bordure bleue
- Ghost: Texte bleu, pas de fond
- Destructive: Fond rouge pour actions dangereuses

#### Cards

- Bordure arrondie (rounded-lg = 8px)
- Ombre legere au repos
- Ombre moyenne au hover
- Transition douce (200ms)

#### Forms

- Labels au-dessus des inputs
- Messages d'erreur en rouge sous l'input
- Etat focus visible (ring bleu)
- Validation inline

### Accessibilite (a11y) Obligatoire

1. **Contraste**: Minimum 4.5:1 pour le texte
2. **Focus visible**: Outline sur tous les elements interactifs
3. **Labels**: Tous les inputs ont un label associe
4. **Alt text**: Toutes les images ont un alt pertinent
5. **Keyboard nav**: Tout accessible au clavier
6. **Screen readers**: Aria-labels sur les icones seules

### Responsive Breakpoints

- Mobile: < 640px (default)
- Tablet: 640px - 1024px (sm:, md:)
- Desktop: > 1024px (lg:, xl:)

### Checklist UX par Ecran

- [ ] Mobile-first design
- [ ] Loading skeleton (pas spinner)
- [ ] Empty state illustre
- [ ] Error state avec action de recovery
- [ ] Success feedback (toast)
- [ ] Micro-animations subtiles
- [ ] Textes en francais correct

### Animations

```css
/* Transitions standard */
.transition-default {
  transition: all 200ms ease-in-out;
}

/* Hover scale */
.hover-scale:hover {
  transform: scale(1.02);
}

/* Fade in */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Icons

Utiliser Lucide React pour tous les icones:

```tsx
import { BookOpen, Users, Award, ChevronRight } from "lucide-react";
```
