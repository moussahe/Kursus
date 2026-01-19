"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  CheckCircle,
  Loader2,
  Shield,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const KURSUS = {
  coral: "#ff9494",
  coralDark: "#ff7070",
};

const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      // Always show success to prevent email enumeration
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        // Still show success message for security
        setIsSubmitted(true);
      }
    } catch {
      // Show success anyway to prevent enumeration
      setIsSubmitted(true);
    }
  };

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
              Pas de <span style={{ color: KURSUS.coral }}>panique</span> !
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Nous allons vous aider à récupérer l&apos;accès à votre compte en
              quelques minutes.
            </p>

            {/* Features */}
            <div className="mt-12 space-y-4 text-left">
              {[
                {
                  icon: Mail,
                  text: "Recevez un lien sécurisé par email",
                  color: KURSUS.coral,
                },
                {
                  icon: Clock,
                  text: "Lien valide pendant 1 heure",
                  color: KURSUS.coralDark,
                },
                {
                  icon: Shield,
                  text: "Processus 100% sécurisé",
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
            <Link href="/">
              <span
                className="text-2xl font-black"
                style={{ color: KURSUS.coral }}
              >
                Kursus.
              </span>
            </Link>
          </div>

          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--kursus-text)]">
                  Mot de passe oublié ?
                </h1>
                <p className="mt-2 text-sm text-[var(--kursus-text-muted)]">
                  Entrez votre adresse email et nous vous enverrons un lien pour
                  réinitialiser votre mot de passe.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-[var(--kursus-text-muted)]"
                  >
                    Adresse email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    className="h-12 rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] placeholder:text-[var(--kursus-text-muted)]"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Envoyer le lien
                    </span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: "var(--kursus-purple-bg)",
                  border: "1px solid var(--kursus-purple-border)",
                }}
              >
                <CheckCircle
                  className="h-8 w-8"
                  style={{ color: "var(--kursus-purple-text)" }}
                />
              </div>
              <h2 className="text-xl font-bold text-[var(--kursus-text)]">
                Email envoyé !
              </h2>
              <p className="mt-3 text-[var(--kursus-text-muted)]">
                Si un compte existe avec cette adresse email, vous recevrez un
                lien pour réinitialiser votre mot de passe.
              </p>
              <p className="mt-4 text-sm text-[var(--kursus-text-muted)]">
                N&apos;oubliez pas de vérifier vos spams.
              </p>
            </motion.div>
          )}

          {/* Back to login */}
          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: KURSUS.coral }}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
