"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Users,
  BookOpen,
  Check,
  X,
  Gift,
  TrendingUp,
  Shield,
  Zap,
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

const KURSUS = {
  coral: "#ff9494",
  coralDark: "#ff7070",
};

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
    <div className="flex min-h-screen bg-[var(--kursus-bg)]">
      {/* Left side - Branding */}
      <div className="relative hidden flex-1 overflow-hidden lg:block">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, #0a0a0a 0%, #141414 100%)`,
          }}
        />

        {/* Decorative elements */}
        <div
          className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-[120px]"
          style={{ background: `${KURSUS.coral}20` }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full blur-[100px]"
          style={{ background: `${KURSUS.coral}15` }}
        />

        {/* Content */}
        <div className="relative flex h-full flex-col items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md text-center"
          >
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${KURSUS.coral}, ${KURSUS.coral}dd)`,
                  boxShadow: `0 0 40px -10px ${KURSUS.coral}`,
                }}
              >
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>

            <h2 className="text-4xl font-black tracking-tight text-white">
              {selectedRole === "TEACHER" ? (
                <>
                  Partagez votre{" "}
                  <span style={{ color: KURSUS.coral }}>savoir</span>
                </>
              ) : (
                <>
                  Rejoignez <span style={{ color: KURSUS.coral }}>Kursus</span>
                </>
              )}
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              {selectedRole === "TEACHER"
                ? "Créez des cours de qualité et générez des revenus complémentaires."
                : "Des cours créés par de vrais professeurs. Paiement unique, accès à vie."}
            </p>

            {/* Features */}
            <div className="mt-12 space-y-4 text-left">
              {(selectedRole === "TEACHER"
                ? [
                    {
                      icon: TrendingUp,
                      text: "Gardez 70% de chaque vente",
                      color: KURSUS.coral,
                    },
                    {
                      icon: Zap,
                      text: "Outils de création intuitifs avec IA",
                      color: KURSUS.coral,
                    },
                    {
                      icon: Shield,
                      text: "Support dédié aux enseignants",
                      color: KURSUS.coral,
                    },
                  ]
                : [
                    {
                      icon: BookOpen,
                      text: "Cours de qualité par des enseignants certifiés",
                      color: KURSUS.coral,
                    },
                    {
                      icon: Users,
                      text: "Du CP à la Terminale, toutes les matières",
                      color: KURSUS.coral,
                    },
                    {
                      icon: Shield,
                      text: "Paiement sécurisé, satisfait ou remboursé",
                      color: KURSUS.coral,
                    },
                  ]
              ).map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ background: `${feature.color}20` }}
                  >
                    <feature.icon
                      className="h-5 w-5"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <span className="text-sm text-gray-300">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              {[
                { value: "15K+", label: "Élèves" },
                { value: "300+", label: "Profs" },
                { value: "98%", label: "Satisfaction" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-2xl font-black"
                    style={{ color: KURSUS.coral }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-sm lg:w-96"
        >
          {/* Logo mobile */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: KURSUS.coral }}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--kursus-text)]">
                Kursus
              </span>
            </Link>
            <h1 className="mt-8 text-2xl font-bold text-[var(--kursus-text)]">
              Créer votre compte
            </h1>
            <p className="mt-2 text-sm text-[var(--kursus-text-muted)]">
              Rejoignez Kursus gratuitement
            </p>
          </div>

          {/* Referral Banner */}
          {referralCode && referralDiscount && (
            <div
              className="mb-6 flex items-center gap-3 rounded-xl p-4"
              style={{
                background: `${KURSUS.coral}15`,
                border: `1px solid ${KURSUS.coral}30`,
              }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: `${KURSUS.coral}20` }}
              >
                <Gift
                  className="h-5 w-5"
                  style={{ color: "var(--kursus-purple-text)" }}
                />
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--kursus-purple-text)" }}
                >
                  {referralFrom
                    ? `${decodeURIComponent(referralFrom)} vous offre ${referralDiscount}€ !`
                    : `${referralDiscount}€ de réduction offerts !`}
                </p>
                <p className="text-xs text-[var(--kursus-text-muted)]">
                  Crédits utilisables sur votre premier achat
                </p>
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleRoleSelect("PARENT")}
              className="flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all"
              style={{
                borderColor:
                  selectedRole === "PARENT"
                    ? KURSUS.coral
                    : "var(--kursus-border)",
                background:
                  selectedRole === "PARENT"
                    ? `${KURSUS.coral}10`
                    : "transparent",
              }}
            >
              <Users
                className="h-6 w-6"
                style={{
                  color:
                    selectedRole === "PARENT"
                      ? KURSUS.coral
                      : "var(--kursus-text-muted)",
                }}
              />
              <span
                className="text-sm font-medium"
                style={{
                  color:
                    selectedRole === "PARENT"
                      ? KURSUS.coral
                      : "var(--kursus-text-muted)",
                }}
              >
                Parent
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect("TEACHER")}
              className="flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all"
              style={{
                borderColor:
                  selectedRole === "TEACHER"
                    ? KURSUS.coral
                    : "var(--kursus-border)",
                background:
                  selectedRole === "TEACHER"
                    ? "var(--kursus-purple-bg)"
                    : "transparent",
              }}
            >
              <BookOpen
                className="h-6 w-6"
                style={{
                  color:
                    selectedRole === "TEACHER"
                      ? "var(--kursus-purple-text)"
                      : "var(--kursus-text-muted)",
                }}
              />
              <span
                className="text-sm font-medium"
                style={{
                  color:
                    selectedRole === "TEACHER"
                      ? "var(--kursus-purple-text)"
                      : "var(--kursus-text-muted)",
                }}
              >
                Professeur
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-500">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[var(--kursus-text-muted)]">
                Nom complet
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Marie Dupont"
                className="h-12 rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] placeholder:text-[var(--kursus-text-muted)]"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[var(--kursus-text-muted)]"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                className="h-12 rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] placeholder:text-[var(--kursus-text-muted)]"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[var(--kursus-text-muted)]"
              >
                Mot de passe
              </Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                className="h-12 rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] placeholder:text-[var(--kursus-text-muted)]"
                {...register("password", {
                  onChange: (e) => setPasswordValue(e.target.value),
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
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
                      className="flex items-center gap-2 text-xs"
                      style={{
                        color: isValid
                          ? "var(--kursus-purple-text)"
                          : "var(--kursus-text-muted)",
                      }}
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
              <Label
                htmlFor="confirmPassword"
                className="text-[var(--kursus-text-muted)]"
              >
                Confirmer le mot de passe
              </Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                className="h-12 rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] placeholder:text-[var(--kursus-text-muted)]"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptCGU"
                className="mt-1 h-4 w-4 rounded border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)]"
                style={{ accentColor: KURSUS.coral }}
                {...register("acceptCGU")}
              />
              <Label
                htmlFor="acceptCGU"
                className="cursor-pointer text-sm font-normal text-[var(--kursus-text-muted)]"
              >
                J&apos;accepte les{" "}
                <Link
                  href="/conditions"
                  className="underline transition-colors hover:opacity-80"
                  style={{ color: KURSUS.coral }}
                  target="_blank"
                >
                  conditions d&apos;utilisation
                </Link>{" "}
                et la{" "}
                <Link
                  href="/confidentialite"
                  className="underline transition-colors hover:opacity-80"
                  style={{ color: KURSUS.coral }}
                  target="_blank"
                >
                  politique de confidentialité
                </Link>
              </Label>
            </div>
            {errors.acceptCGU && (
              <p className="text-sm text-red-500">{errors.acceptCGU.message}</p>
            )}

            <Button
              type="submit"
              className="h-12 w-full rounded-xl text-base font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${KURSUS.coral}, ${KURSUS.coral}dd)`,
                boxShadow: `0 0 20px -5px ${KURSUS.coral}50`,
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--kursus-border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[var(--kursus-bg)] px-4 text-[var(--kursus-text-muted)]">
                ou
              </span>
            </div>
          </div>

          <GoogleSignInButton
            callbackUrl="/onboarding"
            className="h-12 w-full rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] hover:bg-[var(--kursus-border)]"
            text="S'inscrire avec Google"
          />

          <p className="mt-6 text-center text-sm text-[var(--kursus-text-muted)]">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: KURSUS.coral }}
            >
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--kursus-bg)]">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={{ color: "#ff9494" }}
          />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
