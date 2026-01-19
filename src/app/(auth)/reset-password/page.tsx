"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Key,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  passwordSchema,
  PASSWORD_REQUIREMENTS,
} from "@/lib/validations/password";

const KURSUS = {
  orange: "#ff6d38",
  lime: "#c7ff69",
  purple: "#7a78ff",
};

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password", "");

  useEffect(() => {
    if (!token || !email) {
      setError(
        "Lien invalide. Veuillez demander un nouveau lien de réinitialisation.",
      );
    }
  }, [token, email]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token || !email) return;

    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Une erreur est survenue");
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  if (!token || !email) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: `rgba(239, 68, 68, 0.1)` }}
        >
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-[var(--kursus-text)]">
          Lien invalide
        </h2>
        <p className="mt-3 text-[var(--kursus-text-muted)]">
          Ce lien de réinitialisation est invalide ou a expiré.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: KURSUS.orange }}
        >
          Demander un nouveau lien
        </Link>
      </motion.div>
    );
  }

  return (
    <>
      {!isSuccess ? (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--kursus-text)]">
              Nouveau mot de passe
            </h1>
            <p className="mt-2 text-sm text-[var(--kursus-text-muted)]">
              Choisissez un nouveau mot de passe sécurisé pour votre compte.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-500/10 p-4 text-sm text-red-500">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[var(--kursus-text-muted)]"
              >
                Nouveau mot de passe
              </Label>
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

              {/* Password requirements */}
              <div className="mt-3 space-y-1">
                {PASSWORD_REQUIREMENTS.map((req, index) => {
                  const isValid = req.regex.test(password);
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs"
                      style={{
                        color: isValid
                          ? "var(--kursus-lime-text)"
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

            <Button
              type="submit"
              className="h-12 w-full rounded-xl text-base font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${KURSUS.orange}, ${KURSUS.orange}dd)`,
                boxShadow: `0 0 20px -5px ${KURSUS.orange}50`,
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Modification en cours...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Modifier le mot de passe
                </span>
              )}
            </Button>
          </form>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "var(--kursus-lime-bg)",
              border: "1px solid var(--kursus-lime-border)",
            }}
          >
            <CheckCircle
              className="h-8 w-8"
              style={{ color: "var(--kursus-lime-text)" }}
            />
          </div>
          <h2 className="text-xl font-bold text-[var(--kursus-text)]">
            Mot de passe modifié !
          </h2>
          <p className="mt-3 text-[var(--kursus-text-muted)]">
            Votre mot de passe a été réinitialisé avec succès. Vous allez être
            redirigé vers la page de connexion.
          </p>
        </motion.div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: KURSUS.orange }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen bg-[var(--kursus-bg)]">
      {/* Left Panel - Branding */}
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
          style={{ background: `${KURSUS.lime}20` }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full blur-[100px]"
          style={{ background: `${KURSUS.orange}15` }}
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
                  background: `linear-gradient(135deg, ${KURSUS.lime}, #22c55e)`,
                  boxShadow: `0 0 40px -10px ${KURSUS.lime}`,
                }}
              >
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>

            <h2 className="text-4xl font-black tracking-tight text-white">
              Sécurisez votre <span style={{ color: KURSUS.lime }}>compte</span>
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Un mot de passe fort est essentiel pour protéger votre compte et
              les données de vos enfants.
            </p>

            {/* Features */}
            <div className="mt-12 space-y-4 text-left">
              {[
                {
                  icon: Lock,
                  text: "Minimum 8 caractères requis",
                  color: KURSUS.orange,
                },
                {
                  icon: Key,
                  text: "Mélangez lettres, chiffres et symboles",
                  color: KURSUS.purple,
                },
                {
                  icon: Shield,
                  text: "Ne réutilisez pas d'anciens mots de passe",
                  color: KURSUS.lime,
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
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
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
                style={{ background: KURSUS.orange }}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--kursus-text)]">
                Kursus
              </span>
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2
                  className="h-8 w-8 animate-spin"
                  style={{ color: KURSUS.orange }}
                />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
