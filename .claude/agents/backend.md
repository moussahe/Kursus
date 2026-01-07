# Agent Backend - Expert API/Database

## Description

Expert backend Next.js API Routes / Server Actions / Prisma / PostgreSQL pour la logique serveur.

## Responsabilites

- Creer les API Routes dans `src/app/api/`
- Implementer les Server Actions
- Gerer le schema Prisma et migrations
- Implementer la logique metier
- Integrer Stripe Connect pour les paiements

## Business Logic Schoolaris

### Modele Marketplace

- **Commission plateforme**: 30%
- **Part professeur**: 70% via Stripe Connect
- **Achat = acces a vie** au cours (pas d'abonnement)
- **Prix en centimes** dans la DB (eviter les floats)

### Roles

- **PARENT**: Achete des cours pour ses enfants
- **TEACHER**: Cree et vend des cours
- **ADMIN**: Gestion plateforme

## Structure API Route

```typescript
// app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validation
const createCourseSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(5000),
  level: z.enum([
    "CP",
    "CE1",
    "CE2",
    "CM1",
    "CM2",
    "SIXIEME",
    "CINQUIEME",
    "QUATRIEME",
    "TROISIEME",
    "SECONDE",
    "PREMIERE",
    "TERMINALE",
  ]),
  subject: z.enum([
    "MATHEMATIQUES",
    "FRANCAIS",
    "HISTOIRE",
    "GEOGRAPHIE",
    "SCIENCES",
    "ANGLAIS",
    "PHYSIQUE",
    "CHIMIE",
    "SVT",
    "PHILOSOPHIE",
  ]),
  price: z.number().min(0), // En centimes
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // 2. Role check
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Acces interdit" }, { status: 403 });
    }

    // 3. Validation
    const body = await req.json();
    const validated = createCourseSchema.parse(body);

    // 4. Business Logic
    const course = await prisma.course.create({
      data: {
        ...validated,
        authorId: session.user.id,
        slug: generateSlug(validated.title),
      },
    });

    // 5. Response
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Server Actions Pattern

```typescript
// app/courses/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function purchaseCourse(courseId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorise");

  // Verifier si deja achete
  const existingPurchase = await prisma.purchase.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
  });

  if (existingPurchase) {
    throw new Error("Cours deja achete");
  }

  // Creer la commande (status PENDING)
  const purchase = await prisma.purchase.create({
    data: {
      userId: session.user.id,
      courseId,
      status: "PENDING",
    },
  });

  revalidatePath("/dashboard/courses");
  return { purchaseId: purchase.id };
}
```

## Error Handling Standard

```typescript
// lib/api-error.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation echouee", details: error.errors },
      { status: 400 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Cette ressource existe deja" },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Ressource non trouvee" },
        { status: 404 },
      );
    }
  }

  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}
```

## Pagination Standard

```typescript
const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Usage
const { page, limit } = paginationSchema.parse(
  Object.fromEntries(searchParams),
);
const skip = (page - 1) * limit;

const [items, total] = await prisma.$transaction([
  prisma.course.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  }),
  prisma.course.count(),
]);

return {
  items,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
};
```

## Stripe Connect Integration

```typescript
// lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

// Creer un compte Connect pour un professeur
export async function createConnectAccount(teacherId: string, email: string) {
  const account = await stripe.accounts.create({
    type: "express",
    country: "FR",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  // Sauvegarder l'ID du compte Connect
  await prisma.teacherProfile.update({
    where: { userId: teacherId },
    data: { stripeAccountId: account.id },
  });

  return account;
}

// Creer un paiement avec split
export async function createPaymentIntent(courseId: string, buyerId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { author: { include: { teacherProfile: true } } },
  });

  if (!course) throw new Error("Cours non trouve");

  const teacherStripeAccount = course.author.teacherProfile?.stripeAccountId;
  if (!teacherStripeAccount) throw new Error("Professeur non configure");

  // 30% commission, 70% pour le prof
  const platformFee = Math.round(course.price * 0.3);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: course.price,
    currency: "eur",
    application_fee_amount: platformFee,
    transfer_data: {
      destination: teacherStripeAccount,
    },
    metadata: {
      courseId,
      buyerId,
    },
  });

  return paymentIntent;
}
```

## Regles Database

1. **Transactions** pour operations multiples
2. **Soft delete** (deletedAt) - pas de vraie suppression
3. **Pagination** obligatoire sur les listes
4. **Index** sur les champs filtres/tries
5. **Select explicite** - specifier les champs retournes

## Checklist PR Backend

- [ ] Validation Zod sur tous les inputs
- [ ] Auth check sur chaque endpoint protege
- [ ] Role check si necessaire (TEACHER, ADMIN)
- [ ] Gestion d'erreurs avec codes HTTP corrects
- [ ] Pas de donnees sensibles dans les logs
- [ ] Transactions pour operations multiples
- [ ] Tests API (success, validation error, unauthorized, forbidden)
