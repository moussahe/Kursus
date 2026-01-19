"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, BookOpen, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

const KURSUS = {
  coral: "#ff9494",
  coralDark: "#ff7070",
};

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";
  const needsOnboarding = searchParams.get("onboarding") === "true";

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        if (needsOnboarding) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
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
          style={{ background: `${KURSUS.coralDark}15` }}
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
              <span
                className="text-3xl font-black"
                style={{ color: KURSUS.coral }}
              >
                Kursus.
              </span>
            </div>

            <h2 className="text-4xl font-black tracking-tight text-white">
              Bienvenue sur <span style={{ color: KURSUS.coral }}>Kursus</span>
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              La marketplace EdTech premium. Des cours créés par de vrais
              professeurs.
            </p>

            {/* Features */}
            <div className="mt-12 space-y-4 text-left">
              {[
                {
                  icon: BookOpen,
                  text: "Cours de qualité par des enseignants certifiés",
                  color: KURSUS.coral,
                },
                {
                  icon: Users,
                  text: "Du CP à la Terminale, toutes les matières",
                  color: KURSUS.coralDark,
                },
                {
                  icon: Trophy,
                  text: "Paiement unique, accès à vie",
                  color: KURSUS.coral,
                },
              ].map((feature, i) => (
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
            <Link href="/">
              <span
                className="text-2xl font-black"
                style={{ color: KURSUS.coral }}
              >
                Kursus.
              </span>
            </Link>
            <h1 className="mt-8 text-2xl font-bold text-[var(--kursus-text)]">
              Connexion
            </h1>
            <p className="mt-2 text-sm text-[var(--kursus-text-muted)]">
              Connectez-vous à votre compte Kursus
            </p>
          </div>

          {/* Success message */}
          {registered && (
            <div
              className="mb-6 flex items-center gap-3 rounded-xl p-4"
              style={{
                background: `${KURSUS.coral}15`,
                border: `1px solid ${KURSUS.coral}30`,
              }}
            >
              <CheckCircle
                className="h-5 w-5"
                style={{ color: KURSUS.coral }}
              />
              <span className="text-sm" style={{ color: KURSUS.coral }}>
                Compte créé avec succès ! Vous pouvez vous connecter.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-500">
                {error}
              </div>
            )}

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
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-[var(--kursus-text-muted)]"
                >
                  Mot de passe
                </Label>
                <Link
                  href={"/forgot-password" as Route}
                  className="text-xs transition-colors hover:opacity-80"
                  style={{ color: KURSUS.coral }}
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                className="h-12 rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] placeholder:text-[var(--kursus-text-muted)]"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl text-base font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${KURSUS.coral}, ${KURSUS.coralDark})`,
                boxShadow: `0 0 20px -5px ${KURSUS.coral}50`,
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
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
            callbackUrl={needsOnboarding ? "/onboarding" : "/dashboard"}
            className="h-12 w-full rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] hover:bg-[var(--kursus-border)]"
          />

          <p className="mt-6 text-center text-sm text-[var(--kursus-text-muted)]">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: KURSUS.coral }}
            >
              Créer un compte
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  );
}
