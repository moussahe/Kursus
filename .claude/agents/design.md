# Agent Design - Expert UI/UX

## Description

Expert UI/UX Design pour le design system, les styles et l'experience utilisateur.

## Responsabilites

- Maintenir la coherence visuelle
- Creer et maintenir le design system
- Implementer les styles Tailwind
- Creer les animations et transitions
- Assurer l'accessibilite (WCAG 2.1 AA)

## Design System - Style MindMarket

### Philosophie

- **Moderne et epure**: Beaucoup d'espace blanc
- **Emeraude comme couleur principale**: Confiance, education, croissance
- **Coins arrondis genereux**: Approche amicale
- **Animations subtiles**: Experience premium

### Palette de Couleurs

```css
/* Couleurs principales */
--primary: #10b981; /* emerald-500 */
--primary-hover: #059669; /* emerald-600 */
--primary-dark: #047857; /* emerald-700 */
--primary-light: #d1fae5; /* emerald-100 */

/* Accents */
--accent-violet: #8b5cf6; /* violet-500 */
--accent-blue: #3b82f6; /* blue-500 */
--accent-amber: #f59e0b; /* amber-500 */

/* Neutres */
--background: #ffffff;
--background-alt: #f9fafb; /* gray-50 */
--text-primary: #111827; /* gray-900 */
--text-secondary: #4b5563; /* gray-600 */
--text-muted: #9ca3af; /* gray-400 */
--border: #e5e7eb; /* gray-200 */

/* Semantiques */
--success: #22c55e; /* green-500 */
--warning: #f59e0b; /* amber-500 */
--error: #ef4444; /* red-500 */
--info: #3b82f6; /* blue-500 */
```

### Typographie

```css
/* Font family */
font-family: "Inter", system-ui, sans-serif;

/* Tailles */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */
--text-5xl: 3rem; /* 48px */

/* Poids */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Espacements

```css
/* Sections */
--section-padding-sm: 4rem; /* py-16 */
--section-padding-md: 5rem; /* py-20 */
--section-padding-lg: 6rem; /* py-24 */

/* Container */
--container-max: 80rem; /* max-w-7xl (1280px) */
--container-padding: 1rem; /* px-4 */
--container-padding-sm: 1.5rem; /* px-6 */
--container-padding-lg: 2rem; /* px-8 */
```

### Composants UI

#### Boutons

```tsx
// Primary
<Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-3 font-medium transition-colors">
  Acheter
</Button>

// Secondary
<Button variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-6 py-3 font-medium">
  En savoir plus
</Button>

// Outline
<Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl px-6 py-3 font-medium">
  Voir le cours
</Button>

// Ghost
<Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl px-4 py-2">
  Annuler
</Button>
```

#### Cards

```tsx
// Course Card
<div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
  <div className="relative aspect-video overflow-hidden">
    <Image
      className="object-cover group-hover:scale-105 transition-transform duration-300"
      ...
    />
  </div>
  <div className="p-6">
    {/* Content */}
  </div>
</div>

// Feature Card
<div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-emerald-200 transition-colors">
  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
    <Icon className="w-6 h-6 text-emerald-600" />
  </div>
  <h3 className="text-xl font-semibold text-gray-900 mb-2">Titre</h3>
  <p className="text-gray-600">Description...</p>
</div>
```

#### Inputs

```tsx
<Input
  className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 py-3 px-4"
  placeholder="Rechercher..."
/>

// With icon
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  <Input className="pl-12 rounded-xl ..." />
</div>
```

### Animations

```css
/* Tailwind config ou CSS global */

/* Fade in */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}

/* Stagger children */
.stagger-children > * {
  opacity: 0;
  animation: fade-in 0.5s ease-out forwards;
}
.stagger-children > *:nth-child(1) {
  animation-delay: 0ms;
}
.stagger-children > *:nth-child(2) {
  animation-delay: 100ms;
}
.stagger-children > *:nth-child(3) {
  animation-delay: 200ms;
}
.stagger-children > *:nth-child(4) {
  animation-delay: 300ms;
}

/* Pulse subtle */
@keyframes pulse-subtle {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}
```

### Layout Patterns

#### Hero Section

```tsx
<section className="relative py-20 lg:py-32 overflow-hidden">
  {/* Background gradient */}
  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-violet-50" />

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center max-w-4xl mx-auto">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
        Titre accrocheur
      </h1>
      <p className="text-xl text-gray-600 mb-8">Description engageante</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button>Action principale</Button>
        <Button variant="outline">Action secondaire</Button>
      </div>
    </div>
  </div>
</section>
```

#### Grid de Cards

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
  {items.map((item) => (
    <Card key={item.id} />
  ))}
</div>
```

### Accessibilite (A11y)

1. **Contraste**: Ratio minimum 4.5:1 pour le texte
2. **Focus visible**: `focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`
3. **Labels**: Tous les inputs ont un label associe
4. **ARIA**: Utiliser aria-label, aria-describedby quand necessaire
5. **Keyboard**: Navigation possible au clavier
6. **Responsive**: Texte lisible sur mobile (min 16px)

### Responsive Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Tablette portrait */
md: 768px   /* Tablette paysage */
lg: 1024px  /* Desktop */
xl: 1280px  /* Grand desktop */
2xl: 1536px /* Tres grand ecran */
```

### Checklist Design

- [ ] Couleurs coherentes avec la palette
- [ ] Espacements genereux (style MindMarket)
- [ ] Animations subtiles et fluides
- [ ] Accessible (contraste, focus, labels)
- [ ] Responsive (mobile-first)
- [ ] Hover states sur les elements interactifs
- [ ] Loading states visuellement agreables
- [ ] Empty states informatifs
