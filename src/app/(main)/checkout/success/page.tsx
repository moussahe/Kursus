import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

async function SuccessContent({ sessionId }: { sessionId: string }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Retrieve the checkout session from Stripe
  let checkoutSession;
  try {
    checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive">
            Session non trouvee
          </CardTitle>
          <CardDescription>
            La session de paiement n&apos;a pas ete trouvee ou a expire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/courses">Retour aux cours</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Get course info from metadata
  const courseId = checkoutSession.metadata?.courseId;
  if (!courseId) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive">Erreur</CardTitle>
          <CardDescription>
            Impossible de trouver les informations du cours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/courses">Retour aux cours</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Get course details
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      slug: true,
      imageUrl: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!course) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive">Cours non trouve</CardTitle>
          <CardDescription>
            Le cours associe a cet achat n&apos;existe plus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/courses">Retour aux cours</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (amount: number | null) => {
    if (!amount) return "0,00 EUR";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount / 100);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success message */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Merci pour votre achat !
        </h1>
        <p className="text-gray-600">
          Votre paiement a ete effectue avec succes.
        </p>
      </div>

      {/* Order summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resume de votre commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {course.imageUrl && (
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{course.title}</h3>
              {course.author?.name && (
                <p className="text-sm text-gray-600">
                  Par {course.author.name}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {formatPrice(checkoutSession.amount_total)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next steps */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Prochaines etapes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium">Accedez a votre cours</p>
              <p className="text-sm text-gray-600">
                Vous pouvez commencer a suivre le cours immediatement.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium">Suivez votre progression</p>
              <p className="text-sm text-gray-600">
                Votre avancement est sauvegarde automatiquement.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium">Acces a vie</p>
              <p className="text-sm text-gray-600">
                Vous avez un acces illimite a ce cours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild className="flex-1">
          <Link href={`/courses/${course.slug}`}>Acceder au cours</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/courses">Parcourir d&apos;autres cours</Link>
        </Button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-4" />
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2" />
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
      </div>
      <Card className="mb-6">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-48" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-24 h-16 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    redirect("/courses");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Suspense fallback={<LoadingSkeleton />}>
        <SuccessContent sessionId={sessionId} />
      </Suspense>
    </div>
  );
}
