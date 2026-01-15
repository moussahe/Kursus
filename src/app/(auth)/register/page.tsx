"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GraduationCap,
  Loader2,
  Users,
  BookOpen,
  Check,
  X,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  passwordSchema,
  PASSWORD_REQUIREMENTS,
} from "@/lib/validations/password";

const registerSchema = z
  .object({
    name: z.string().min(2, "Minimum 2 caracteres"),
    email: z.string().email("Email invalide"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirmez votre mot de passe"),
    role: z.enum(["PARENT", "TEACHER"]),
    acceptCGU: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole =
    searchParams.get("role") === "teacher" ? "TEACHER" : "PARENT";

  // Referral params
  const referralCode = searchParams.get("ref");
  const referralDiscount = searchParams.get("discount");
  const referralFrom = searchParams.get("from");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"PARENT" | "TEACHER">(
    initialRole,
  );
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: initialRole,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          role: selectedRole,
          referralCode: referralCode || undefined,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || "Une erreur est survenue");
        return;
      }

      const result = await response.json();

      // Redirect based on role
      if (result.needsOnboarding) {
        router.push("/login?registered=true&onboarding=true");
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: "PARENT" | "TEACHER") => {
    setSelectedRole(role);
    setValue("role", role);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Schoolaris</span>
            </Link>
            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              Creer votre compte
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Rejoignez Schoolaris gratuitement
            </p>
          </div>

          {/* Referral Banner */}
          {referralCode && referralDiscount && (
            <div className="mb-6 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-rose-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                  <Gift className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {referralFrom
                      ? `${decodeURIComponent(referralFrom)} vous offre ${referralDiscount}€ !`
                      : `${referralDiscount}€ de reduction offerts !`}
                  </p>
                  <p className="text-xs text-gray-600">
                    Credits utilisables sur votre premier achat
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleRoleSelect("PARENT")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                selectedRole === "PARENT"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Users
                className={`h-6 w-6 ${selectedRole === "PARENT" ? "text-emerald-600" : "text-gray-400"}`}
              />
              <span
                className={`text-sm font-medium ${selectedRole === "PARENT" ? "text-emerald-700" : "text-gray-600"}`}
              >
                Parent
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect("TEACHER")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                selectedRole === "TEACHER"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <BookOpen
                className={`h-6 w-6 ${selectedRole === "TEACHER" ? "text-emerald-600" : "text-gray-400"}`}
              />
              <span
                className={`text-sm font-medium ${selectedRole === "TEACHER" ? "text-emerald-700" : "text-gray-600"}`}
              >
                Professeur
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                type="text"
                placeholder="Marie Dupont"
                className="h-11"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                className="h-11"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                className="h-11"
                {...register("password", {
                  onChange: (e) => setPasswordValue(e.target.value),
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
              {/* Password requirements checklist */}
              <div className="mt-2 space-y-1">
                {PASSWORD_REQUIREMENTS.map((req, index) => {
                  const isValid = req.regex.test(passwordValue);
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 text-xs ${
                        isValid ? "text-emerald-600" : "text-gray-400"
                      }`}
                    >
                      {isValid ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      <span>{req.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                className="h-11"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptCGU"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                {...register("acceptCGU")}
              />
              <Label
                htmlFor="acceptCGU"
                className="text-sm text-gray-600 font-normal cursor-pointer"
              >
                J&apos;accepte les{" "}
                <Link
                  href="/conditions"
                  className="text-emerald-600 hover:text-emerald-500 underline"
                  target="_blank"
                >
                  conditions d&apos;utilisation
                </Link>{" "}
                et la{" "}
                <Link
                  href="/confidentialite"
                  className="text-emerald-600 hover:text-emerald-500 underline"
                  target="_blank"
                >
                  politique de confidentialite
                </Link>
              </Label>
            </div>
            {errors.acceptCGU && (
              <p className="text-sm text-red-600">{errors.acceptCGU.message}</p>
            )}

            <Button
              type="submit"
              className="h-11 w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creation...
                </>
              ) : (
                "Creer mon compte"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">ou</span>
            </div>
          </div>

          <GoogleSignInButton
            callbackUrl="/onboarding"
            className="h-11 w-full"
            text="S'inscrire avec Google"
          />

          <p className="mt-6 text-center text-sm text-gray-600">
            Deja un compte ?{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image/Gradient with Social Proof */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        </div>
        <div className="relative flex h-full flex-col items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h3 className="text-3xl font-bold">
              {selectedRole === "TEACHER"
                ? "Partagez votre savoir"
                : "Accompagnez la reussite de vos enfants"}
            </h3>
            <p className="mt-4 text-lg text-emerald-100">
              {selectedRole === "TEACHER"
                ? "Creez des cours de qualite et generez des revenus complementaires. Gardez 70% de chaque vente."
                : "Achetez des cours crees par de vrais professeurs. Un paiement unique, un acces a vie."}
            </p>

            {/* Social proof stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">15K+</p>
                <p className="text-xs text-emerald-100">Eleves</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">300+</p>
                <p className="text-xs text-emerald-100">Professeurs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">98%</p>
                <p className="text-xs text-emerald-100">Satisfaction</p>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-8 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm italic text-emerald-50">
                &quot;
                {selectedRole === "TEACHER"
                  ? "J'ai pu partager mes cours avec des centaines d'eleves. La plateforme est intuitive et le support excellent."
                  : "Mon fils a fait des progres incroyables en maths grace aux cours sur Schoolaris. Je recommande !"}
                &quot;
              </p>
              <p className="mt-2 text-xs text-emerald-200">
                {selectedRole === "TEACHER"
                  ? "- Marie D., Professeur de Mathematiques"
                  : "- Sophie L., Maman de Lucas (CM2)"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
