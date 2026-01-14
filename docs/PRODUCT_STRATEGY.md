# Schoolaris - Product Strategy & Market Research

> Document de référence pour le développement produit

---

## Executive Summary

**Mission**: Devenir la plateforme EdTech #1 en France pour les scolaires (CP → Terminale)

**Objectif Y1**: 10K utilisateurs, 500K€ CA

**Positionnement Unique**:

> "La seule plateforme qui combine l'expertise de vrais profs, la puissance de l'IA, et l'implication des parents."

---

## 1. Analyse Concurrentielle

### Paysage Concurrentiel France

| Concurrent     | Modèle      | Prix/mois | ✅ Forces            | ❌ Faiblesses           |
| -------------- | ----------- | --------- | -------------------- | ----------------------- |
| Kartable       | Abo         | 7-10€     | Contenu exhaustif    | Générique, pas perso    |
| SchoolMouv     | Abo         | 10€       | Vidéos qualité       | Passif, peu interaction |
| Maxicours      | Abo         | 15-20€    | Large catalogue      | UI datée                |
| Les Bons Profs | Abo         | 10€       | Profs charismatiques | Que vidéo               |
| Lumni          | Gratuit     | 0€        | Gratuit              | Basique                 |
| Superprof      | Marketplace | 20-50€/h  | Personnalisé         | Très cher               |

### Gaps Marché (Nos Opportunités)

| Gap                   | Description                             | Notre Solution                |
| --------------------- | --------------------------------------- | ----------------------------- |
| **Pas d'IA**          | Aucun n'utilise l'IA pour personnaliser | AI Tutor + Parcours adaptatif |
| **Parents ignorés**   | Pas de suivi pour les payeurs           | Dashboard Parent intelligent  |
| **Contenu générique** | Même contenu pour tous                  | Marketplace de vrais profs    |
| **Pas engageant**     | Élèves décrochent vite                  | Gamification sérieuse         |
| **Profs mal payés**   | 30-50% de commission max                | 70% pour les profs            |

---

## 2. Personas

### Marie - Parent CSP+ (Cible Principale)

```yaml
Âge: 42 ans
Profession: Cadre
Enfants: 2 (CM2 + 4ème)
Budget: 15-30€/mois

Frustrations:
  - "Pas le temps d'aider aux devoirs"
  - "Profs particuliers trop chers"
  - "Je ne sais pas si mon enfant progresse"

Besoins:
  - Suivi de progression clair
  - Solution autonome pour l'enfant
  - Qualité garantie
  - Bon rapport qualité/prix

Déclencheur d'achat:
  - Mauvaises notes
  - Approche examen (brevet, bac)
  - Recommandation autre parent
```

### Lucas - Élève de 3ème

```yaml
Âge: 14 ans
Niveau: Moyen (12-13/20)

Frustrations:
  - "Les cours en ligne c'est chiant"
  - "J'ai honte de poser des questions"
  - "Je comprends pas les maths"

Besoins:
  - Apprendre à son rythme
  - Pas se sentir jugé
  - Quelque chose de fun

Motivations:
  - Récompenses visibles
  - Progression gamifiée
  - Débloquer du contenu
```

### Sophie - Professeure de Maths

```yaml
Âge: 35 ans
Expérience: 10 ans

Frustrations:
  - "Salaire insuffisant"
  - "Je crée du contenu gratuitement"
  - "Plateformes prennent trop"

Besoins:
  - Revenus complémentaires (500-2000€/mois)
  - Liberté de création
  - Reconnaissance expertise

Attentes:
  - Commission juste (70%+)
  - Outils de création simples
  - Analytics sur ses élèves
```

---

## 3. Proposition de Valeur

### Pour les Parents

- ✅ Cours créés par de VRAIS profs certifiés
- ✅ Dashboard avec alertes et rapports de progression
- ✅ Paiement unique par cours (pas d'abo qui s'accumule)
- ✅ Assistant IA 24/7 pour aider aux devoirs

### Pour les Élèves

- ✅ IA qui s'adapte à TON niveau et TON rythme
- ✅ Système de badges, niveaux, récompenses
- ✅ Plusieurs façons d'apprendre (vidéo, texte, exercices)
- ✅ Chat IA pour poser des questions sans honte

### Pour les Professeurs

- ✅ 70% des revenus (vs 30-50% ailleurs)
- ✅ Outils de création assistés par IA
- ✅ Analytics détaillés sur vos élèves
- ✅ Liberté totale sur contenu et prix

---

## 4. Roadmap Fonctionnalités

### Phase 1: MVP (M1-M3) 🔴 CRITIQUE

| Feature             | Impact          | Status  |
| ------------------- | --------------- | ------- |
| Auth + Rôles        | Base            | ✅ Done |
| Marketplace Cours   | Core            | ✅ Done |
| Dashboard Parent    | Conversion      | ✅ Done |
| Paiement Stripe     | Revenue         | ✅ Done |
| **AI Tutor**        | Différenciateur | ✅ Done |
| **Quiz Adaptatifs** | Engagement      | ✅ Done |

### Phase 2: Engagement (M4-M6) 🟡 IMPORTANT

| Feature                   | Impact            | Status  |
| ------------------------- | ----------------- | ------- |
| Gamification (XP, badges) | Retention         | ✅ Done |
| Parcours IA personnalisé  | Efficacité        | ✅ Done |
| Rapports hebdo parents    | Satisfaction      | ✅ Done |
| Exercices génératifs IA   | Pratique infinie  | ✅ Done |
| Classement (Leaderboard)  | Compétition       | ✅ Done |
| Objectifs d'étude         | Engagement +35%   | ✅ Done |
| **Analyse Predictive IA** | Anticipation +40% | ✅ Done |
| **Défis du Jour**         | DAU +35-50%       | ✅ Done |

### Phase 3: Scale (M7-M12) 🟢 NICE TO HAVE

| Feature           | Impact        | Status  |
| ----------------- | ------------- | ------- |
| Mode Examen       | Valeur perçue | ✅ Done |
| Certificats       | Valorisation  | ✅ Done |
| Live Sessions     | Premium       | ✅ Done |
| Forums communauté | Retention     | ✅ Done |

### Phase 4: Admin & Moderation 🔴 CRITIQUE

| Feature                | Impact                 | Status  |
| ---------------------- | ---------------------- | ------- |
| Admin Dashboard        | Operations             | ✅ Done |
| Gestion Utilisateurs   | Support                | ✅ Done |
| Gestion Cours          | Qualite                | ✅ Done |
| **Moderation Contenu** | Securite Mineurs +100% | ✅ Done |
| **Signalements**       | RGPD Conformite        | ✅ Done |
| Parametres Plateforme  | Configuration          | ✅ Done |
| Analytics Admin        | KPIs                   | ✅ Done |

---

## 5. Modèle Économique

### Pricing Recommandé: Hybride

```
MARKETPLACE (Principal)
├── Cours à l'unité: 15-50€
├── Commission Schoolaris: 30%
└── Revenus prof: 70%

PREMIUM (Optionnel)
├── Pass Famille: 19.99€/mois
├── Inclut: Tous les cours + IA illimitée
└── Jusqu'à 3 enfants
```

### Projections Y1

| Mois | Cours | Ventes/mois | CA Mensuel |
| ---- | ----- | ----------- | ---------- |
| M3   | 50    | 100         | 750€       |
| M6   | 100   | 500         | 3,750€     |
| M9   | 200   | 1,500       | 11,250€    |
| M12  | 300   | 3,000       | 22,500€    |

**CA Y1 estimé**: ~100K€ (conservateur)

Pour atteindre 500K€:

- Besoin du Pass Famille avec ~2,500 abonnés à M12
- OU partenariats B2B (écoles)

---

## 6. Go-to-Market

### Phase 1: Seed (M1-M3)

- 10 profs ambassadeurs
- 50 cours de qualité
- Beta privée 100 familles
- Itération rapide sur feedback

### Phase 2: Launch (M4-M6)

- PR: Articles éducation, podcasts parents
- SEO: Blog "révisions brevet", "aide devoirs"
- Partenariats: Associations parents d'élèves

### Phase 3: Scale (M7-M12)

- Ads Facebook/Google ciblés parents
- Affiliation influenceurs éducation
- Parrainage parents
- Approche écoles privées (B2B)

---

## 7. KPIs

### North Star Metric

> **Élèves actifs ayant complété ≥1 leçon cette semaine**

### Tableau de Bord

| KPI             | M3   | M6    | M12   |
| --------------- | ---- | ----- | ----- |
| MAU             | 200  | 1,000 | 5,000 |
| Cours publiés   | 50   | 100   | 300   |
| Profs actifs    | 10   | 30    | 100   |
| Taux completion | 30%  | 40%   | 50%   |
| NPS Parents     | >40  | >50   | >60   |
| MRR             | 500€ | 3K€   | 20K€  |

---

## 8. Risques & Mitigations

| Risque             | Mitigation                              |
| ------------------ | --------------------------------------- |
| Pas assez de profs | Onboarding simplifié + 70% rev          |
| Contenu médiocre   | Process de review + ratings             |
| Churn élèves       | Gamification + rappels IA               |
| RGPD mineurs       | Audit juridique + consentement parental |

---

## 9. Actions Immédiates

### Cette Semaine

- [x] Développer AI Tutor (chat contextuel)
- [x] Améliorer dashboard parent (alertes)
- [x] Créer 3 cours de démo complets

### Ce Mois

- [x] Quiz adaptatifs
- [x] Gamification basique (XP, streaks)
- [x] Rapports hebdomadaires parents
- [x] Exercices generatifs IA
- [x] Mode Revision Examen (Brevet/Bac)
- [x] Tracking des points faibles (weak areas) avec IA
- [x] Systeme email transactionnel (Resend)
- [x] Reset mot de passe avec email
- [x] Emails de confirmation d'achat
- [x] Envoi automatique rapports hebdomadaires
- [x] Rate limiting Redis (Upstash) pour production
- [x] Recommandations de cours IA pour parents (upsell basé sur points faibles)
- [x] Onboarding flow pour nouveaux parents (4 etapes personnalisees)
- [x] Telechargement factures PDF (conformite legale francaise)
- [x] PWA avec push notifications (engagement mobile +40-60% DAU)
- [x] Programme de parrainage (referral) - acquisition virale +25-35%
- [x] Teacher Onboarding Flow avec AI Course Builder - conversion profs +50%
- [ ] Beta privée 50 familles
- [ ] Onboarder 10 profs

---

## Conclusion

Schoolaris peut devenir le leader en combinant trois éléments qu'aucun concurrent n'a ensemble:

```
┌─────────────────────────────────────────┐
│                                         │
│   🤖 IA Personnalisée                   │
│   (Tutor, parcours adaptatif)           │
│              +                          │
│   👨‍🏫 Marketplace Qualité               │
│   (Vrais profs, 70% revenus)            │
│              +                          │
│   👪 Parents Impliqués                   │
│   (Dashboard, alertes, rapports)        │
│              =                          │
│   🏆 AVANTAGE COMPÉTITIF DURABLE        │
│                                         │
└─────────────────────────────────────────┘
```
