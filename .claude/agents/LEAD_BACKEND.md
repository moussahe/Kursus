# Agent Lead Backend - API Expert

## Responsabilites

- API Routes Next.js
- Server Actions
- Prisma/Database
- Validation & Securite API

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
  price: z.number().min(0).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // 2. Validation
    const body = await req.json();
    const validated = createCourseSchema.parse(body);

    // 3. Business Logic
    const course = await prisma.course.create({
      data: {
        ...validated,
        authorId: session.user.id,
      },
    });

    // 4. Response
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation echouee", details: error.errors },
        { status: 400 },
      );
    }
    console.error("API Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
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

const enrollSchema = z.object({
  courseId: z.string().cuid(),
  studentId: z.string().cuid(),
});

export async function enrollStudent(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorise");

  const validated = enrollSchema.parse({
    courseId: formData.get("courseId"),
    studentId: formData.get("studentId"),
  });

  await prisma.enrollment.create({
    data: validated,
  });

  revalidatePath("/dashboard");
  return { success: true };
}
```

## Regles Database

1. **Transactions** pour operations multiples
2. **Soft delete** (deletedAt) pas de vraie suppression
3. **Pagination** obligatoire sur les listes
4. **Index** sur les champs filtres/tries
5. **Select explicite** - pas de select: \* implicite

## Tests API

Chaque endpoint doit avoir:

- Test 200/201 success case
- Test 400 validation error
- Test 401 unauthorized
- Test 403 forbidden (mauvais role)
- Test 404 not found
- Test 500 error handling

## Pagination Standard

```typescript
const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Usage
const { page, limit } = paginationSchema.parse(searchParams);
const skip = (page - 1) * limit;

const [items, total] = await prisma.$transaction([
  prisma.course.findMany({ skip, take: limit }),
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

## Error Handling

```typescript
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: error.errors },
      { status: 400 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Resource already exists" },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }
  }

  console.error("Unhandled error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```
