import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation echouee",
        details: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  // Custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.statusCode },
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        // Unique constraint violation
        const target = (error.meta?.target as string[]) || [];
        return NextResponse.json(
          {
            error: "Cette ressource existe deja",
            details: { fields: target },
          },
          { status: 409 },
        );

      case "P2025":
        // Record not found
        return NextResponse.json(
          { error: "Ressource non trouvee" },
          { status: 404 },
        );

      case "P2003":
        // Foreign key constraint violation
        return NextResponse.json(
          { error: "Reference invalide" },
          { status: 400 },
        );

      default:
        return NextResponse.json(
          { error: "Erreur de base de donnees" },
          { status: 500 },
        );
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json({ error: "Donnees invalides" }, { status: 400 });
  }

  // Generic error
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === "development" ? error.message : "Erreur serveur";

    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ error: "Erreur inconnue" }, { status: 500 });
}

// Helper to create error responses
export function unauthorized(message = "Non autorise") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Acces interdit") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "Ressource non trouvee") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function badRequest(message = "Requete invalide", details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}
