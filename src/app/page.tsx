"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Play,
  Star,
  Check,
  Sparkles,
  BookOpen,
  GraduationCap,
  Trophy,
  Zap,
  Shield,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";

// ============================================================================
// KURSUS LANDING PAGE - Premium Dark/Light Mode
// Inspired by: nvg8.io, linear.app, vercel.com
// ============================================================================

// Brand Colors
const KURSUS = {
  orange: "#ff9494",
  lime: "#ff9494",
  purple: "#ff9494",
};

// ============================================================================
// THEME TOGGLE
// ============================================================================
function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Use layout effect to avoid hydration mismatch
  useEffect(() => {
    // Defer mounted state to next tick to avoid set-state-in-effect warning
    const timeout = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] transition-all hover:border-[#ff9494]/50"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[var(--kursus-text-muted)]" />
      ) : (
        <Moon className="h-4 w-4 text-[var(--kursus-text-muted)]" />
      )}
    </button>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--kursus-border)] bg-[var(--kursus-bg)]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${KURSUS.orange}, #ffb8b8)`,
            }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-[var(--kursus-text)]">
            Kursus
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {["Cours", "Tarifs"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-sm text-[var(--kursus-text-muted)] transition-colors hover:text-[var(--kursus-text)]"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/devenir-prof"
            className="hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all md:flex"
            style={{
              borderColor: `${KURSUS.lime}40`,
              background: `${KURSUS.lime}15`,
              color: KURSUS.lime,
            }}
          >
            <GraduationCap className="h-4 w-4" />
            Devenir Prof
          </Link>
          <Link
            href="/login"
            className="text-sm text-[var(--kursus-text-muted)] transition-colors hover:text-[var(--kursus-text)]"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="rounded-full px-4 py-2 text-sm font-medium transition-all"
            style={{ background: KURSUS.orange, color: "#0a0a0a" }}
          >
            Commencer
          </Link>
        </div>
      </nav>
    </header>
  );
}

// ============================================================================
// HERO
// ============================================================================
function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[var(--kursus-bg)] pt-32">
      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/4 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[128px]"
          style={{ background: `${KURSUS.orange}20` }}
        />
        <div
          className="absolute right-1/4 top-1/2 h-[400px] w-[400px] rounded-full blur-[128px]"
          style={{ background: `${KURSUS.purple}15` }}
        />
      </div>

      {/* Grid pattern - dark mode only */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 dark:opacity-20 light:opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(128,128,128,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(128,128,128,0.03) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 pb-32 pt-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
            style={{
              borderColor: `${KURSUS.orange}30`,
              background: `${KURSUS.orange}10`,
              color: KURSUS.orange,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: KURSUS.orange }}
            />
            +15 000 élèves nous font confiance
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-8 max-w-4xl text-5xl leading-[1.1] text-[var(--kursus-text)] sm:text-6xl md:text-7xl"
        >
          Des cours créés par{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${KURSUS.orange}, #fbbf24)`,
            }}
          >
            de vrais profs
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-[var(--kursus-text-muted)]"
        >
          Achetez uniquement ce dont vous avez besoin. Un paiement, un accès à
          vie. Du CP à la Terminale.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/courses"
            className="group flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all hover:shadow-lg"
            style={{
              background: KURSUS.orange,
              color: "#0a0a0a",
              boxShadow: `0 0 40px -10px ${KURSUS.orange}50`,
            }}
          >
            Découvrir les cours
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/demo"
            className="flex items-center gap-2 rounded-full border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] px-6 py-3 text-sm font-medium text-[var(--kursus-text)] transition-all hover:border-[var(--kursus-text-muted)]"
          >
            <Play className="h-4 w-4" />
            Voir la démo
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 grid grid-cols-2 gap-8 border-t border-[var(--kursus-border)] pt-12 sm:grid-cols-4"
        >
          {[
            { value: "15K+", label: "Élèves" },
            { value: "1200+", label: "Cours" },
            { value: "300+", label: "Profs" },
            { value: "4.9/5", label: "Note" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-[var(--kursus-text)]">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-[var(--kursus-text-muted)]">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURES
// ============================================================================
function Features() {
  const features = [
    {
      icon: BookOpen,
      title: "Cours de qualité",
      description:
        "Créés par des enseignants certifiés de l'Éducation nationale.",
      color: KURSUS.orange,
    },
    {
      icon: Zap,
      title: "Assistant IA",
      description: "Une aide personnalisée 24h/24 pour débloquer vos enfants.",
      color: KURSUS.purple,
    },
    {
      icon: Trophy,
      title: "Gamification",
      description: "XP, badges et classements pour motiver les élèves.",
      color: KURSUS.lime,
    },
    {
      icon: Shield,
      title: "Sans abonnement",
      description:
        "Payez une fois, gardez l'accès à vie. Pas de mauvaise surprise.",
      color: KURSUS.orange,
    },
  ];

  return (
    <section className="border-t border-[var(--kursus-border)] bg-[var(--kursus-bg)] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl text-[var(--kursus-text)] sm:text-4xl">
            Tout ce qu&apos;il faut pour réussir
          </h2>
          <p className="mt-4 text-[var(--kursus-text-muted)]">
            Une plateforme complète pour accompagner chaque élève.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-2xl border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] p-6 transition-all hover:border-[var(--kursus-text-muted)]/30"
              style={{
                boxShadow: "0 0 0 0 transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 40px -10px ${feature.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 0 0 transparent";
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${feature.color}15` }}
              >
                <feature.icon
                  className="h-5 w-5"
                  style={{ color: feature.color }}
                />
              </div>
              <h3 className="mt-4 font-semibold text-[var(--kursus-text)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--kursus-text-muted)]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// COURSES PREVIEW
// ============================================================================
function CoursesPreview() {
  const courses = [
    {
      title: "Maths Terminale",
      teacher: "M. Dupont",
      price: 29,
      color: KURSUS.orange,
    },
    {
      title: "Français Brevet",
      teacher: "Mme Martin",
      price: 24,
      color: KURSUS.purple,
    },
    {
      title: "Anglais Lycée",
      teacher: "M. Smith",
      price: 19,
      color: KURSUS.lime,
    },
    {
      title: "Physique-Chimie",
      teacher: "Mme Curie",
      price: 34,
      color: KURSUS.orange,
    },
  ];

  return (
    <section className="border-t border-[var(--kursus-border)] bg-[var(--kursus-bg)] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl text-[var(--kursus-text)] sm:text-4xl">
              Cours populaires
            </h2>
            <p className="mt-4 text-[var(--kursus-text-muted)]">
              Les cours les mieux notés par notre communauté.
            </p>
          </div>
          <Link
            href="/courses"
            className="hidden items-center gap-1 text-sm text-[var(--kursus-text-muted)] transition-colors hover:text-[var(--kursus-text)] sm:flex"
          >
            Voir tout
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course, i) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] transition-all hover:border-[var(--kursus-text-muted)]/30"
            >
              <div
                className="h-32"
                style={{
                  background: `linear-gradient(135deg, ${course.color}, ${course.color}80)`,
                }}
              />
              <div className="p-5">
                <h3 className="font-semibold text-[var(--kursus-text)]">
                  {course.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--kursus-text-muted)]">
                  {course.teacher}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-[var(--kursus-text)]">
                    {course.price}€
                  </span>
                  <div className="flex items-center gap-1">
                    <Star
                      className="h-4 w-4"
                      style={{ fill: KURSUS.orange, color: KURSUS.orange }}
                    />
                    <span className="text-sm text-[var(--kursus-text-muted)]">
                      4.9
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRICING
// ============================================================================
function Pricing() {
  return (
    <section className="border-t border-[var(--kursus-border)] bg-[var(--kursus-bg)] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-[var(--kursus-lime-text)]"
            style={{
              borderColor: `${KURSUS.lime}30`,
              background: `${KURSUS.lime}10`,
            }}
          >
            Pas d&apos;abonnement
          </span>
          <h2 className="mt-6 text-3xl text-[var(--kursus-text)] sm:text-4xl">
            Payez uniquement ce que vous utilisez
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--kursus-text-muted)]">
            Chaque cours est vendu à l&apos;unité. Un achat = un accès à vie.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {/* Course à l'unité */}
          <div className="rounded-2xl border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] p-8">
            <h3 className="text-lg font-semibold text-[var(--kursus-text)]">
              À l&apos;unité
            </h3>
            <p className="mt-2 text-sm text-[var(--kursus-text-muted)]">
              Achetez cours par cours selon vos besoins.
            </p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-[var(--kursus-text)]">
                2,99€
              </span>
              <span className="text-[var(--kursus-text-muted)]"> à 49€</span>
            </div>
            <ul className="mt-8 space-y-3">
              {[
                "Accès à vie",
                "Mises à jour incluses",
                "Assistant IA inclus",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-[var(--kursus-text)]"
                >
                  <Check className="h-4 w-4 text-[var(--kursus-lime-text)]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/courses"
              className="mt-8 block rounded-full border border-[var(--kursus-border)] bg-[var(--kursus-bg)] py-3 text-center text-sm font-medium text-[var(--kursus-text)] transition-colors hover:bg-[var(--kursus-bg-elevated)]"
            >
              Parcourir les cours
            </Link>
          </div>

          {/* Carnet populaire */}
          <div
            className="relative rounded-2xl border p-8"
            style={{
              borderColor: `${KURSUS.orange}40`,
              background: `${KURSUS.orange}08`,
            }}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span
                className="rounded-full px-4 py-1 text-xs font-semibold"
                style={{ background: KURSUS.orange, color: "#0a0a0a" }}
              >
                Populaire
              </span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--kursus-text)]">
              Carnet 50€
            </h3>
            <p className="mt-2 text-sm text-[var(--kursus-text-muted)]">
              Économisez 10% sur vos achats.
            </p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-[var(--kursus-text)]">
                45€
              </span>
              <span className="ml-2 text-[var(--kursus-text-muted)] line-through">
                50€
              </span>
            </div>
            <ul className="mt-8 space-y-3">
              {[
                "50€ de crédits",
                "Économie de 10%",
                "Valable 2 ans",
                "Transférable",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-[var(--kursus-text)]"
                >
                  <Check className="h-4 w-4" style={{ color: KURSUS.orange }} />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/checkout/carnet-50"
              className="mt-8 block rounded-full py-3 text-center text-sm font-medium transition-all hover:shadow-lg"
              style={{
                background: KURSUS.orange,
                color: "#0a0a0a",
                boxShadow: `0 0 30px -10px ${KURSUS.orange}50`,
              }}
            >
              Acheter le carnet
            </Link>
          </div>

          {/* Carnet max */}
          <div className="rounded-2xl border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] p-8">
            <h3 className="text-lg font-semibold text-[var(--kursus-text)]">
              Carnet 100€
            </h3>
            <p className="mt-2 text-sm text-[var(--kursus-text-muted)]">
              Le meilleur rapport qualité-prix.
            </p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-[var(--kursus-text)]">
                85€
              </span>
              <span className="ml-2 text-[var(--kursus-text-muted)] line-through">
                100€
              </span>
            </div>
            <ul className="mt-8 space-y-3">
              {[
                "100€ de crédits",
                "Économie de 15%",
                "Valable 2 ans",
                "Support prioritaire",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-[var(--kursus-text)]"
                >
                  <Check className="h-4 w-4 text-[var(--kursus-lime-text)]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/checkout/carnet-100"
              className="mt-8 block rounded-full border border-[var(--kursus-border)] bg-[var(--kursus-bg)] py-3 text-center text-sm font-medium text-[var(--kursus-text)] transition-colors hover:bg-[var(--kursus-bg-elevated)]"
            >
              Acheter le carnet
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TESTIMONIALS
// ============================================================================
function Testimonials() {
  const testimonials = [
    {
      quote: "Mon fils a gagné 4 points en maths grâce à Kursus.",
      author: "Sophie M.",
      role: "Maman de Lucas, 3ème",
    },
    {
      quote: "Enfin une plateforme sans abonnement qui dort !",
      author: "Thomas B.",
      role: "Papa de 2 enfants",
    },
    {
      quote: "L'assistant IA m'aide quand je bloque. J'adore !",
      author: "Emma P.",
      role: "Élève en Terminale",
    },
  ];

  return (
    <section className="border-t border-[var(--kursus-border)] bg-[var(--kursus-bg)] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl text-[var(--kursus-text)] sm:text-4xl">
            Ils nous font confiance
          </h2>
          <p className="mt-4 text-[var(--kursus-text-muted)]">
            Rejoignez 15 000+ familles satisfaites.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] p-6"
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className="h-4 w-4"
                    style={{ fill: KURSUS.orange, color: KURSUS.orange }}
                  />
                ))}
              </div>
              <p className="mt-4 text-[var(--kursus-text)]">
                &quot;{t.quote}&quot;
              </p>
              <div className="mt-6 border-t border-[var(--kursus-border)] pt-4">
                <div className="font-medium text-[var(--kursus-text)]">
                  {t.author}
                </div>
                <div className="text-sm text-[var(--kursus-text-muted)]">
                  {t.role}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TEACHER CTA
// ============================================================================
function TeacherCTA() {
  return (
    <section className="border-t border-[var(--kursus-border)] bg-[var(--kursus-bg)] py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div
          className="overflow-hidden rounded-3xl border p-12 text-center"
          style={{
            borderColor: `${KURSUS.purple}30`,
            background: `linear-gradient(135deg, ${KURSUS.purple}10, ${KURSUS.purple}05)`,
            boxShadow: `0 0 80px -20px ${KURSUS.purple}30`,
          }}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-[var(--kursus-lime-text)]"
            style={{
              borderColor: `${KURSUS.lime}30`,
              background: `${KURSUS.lime}10`,
            }}
          >
            <GraduationCap className="h-4 w-4" />
            Enseignants
          </span>
          <h2 className="mt-6 text-3xl text-[var(--kursus-text)] sm:text-4xl">
            Gardez <span className="text-gradient-lime">70%</span> de vos ventes
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--kursus-text-muted)]">
            Créez vos cours une fois, vendez-les à des milliers d&apos;élèves.
            Nous gérons les paiements, vous gardez 70%.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register/teacher"
              className="rounded-full px-6 py-3 text-sm font-medium transition-all hover:shadow-lg"
              style={{
                background: KURSUS.orange,
                color: "#0a0a0a",
                boxShadow: `0 0 30px -10px ${KURSUS.orange}50`,
              }}
            >
              Devenir enseignant
            </Link>
            <Link
              href="/teachers"
              className="text-sm text-[var(--kursus-text-muted)] transition-colors hover:text-[var(--kursus-text)]"
            >
              En savoir plus →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================
function Footer() {
  return (
    <footer className="border-t border-[var(--kursus-border)] bg-[var(--kursus-bg)] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${KURSUS.orange}, #ffb8b8)`,
              }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-[var(--kursus-text)]">
              Kursus
            </span>
          </div>
          <div className="flex gap-8 text-sm text-[var(--kursus-text-muted)]">
            <Link
              href="/conditions"
              className="hover:text-[var(--kursus-text)]"
            >
              CGU
            </Link>
            <Link
              href="/confidentialite"
              className="hover:text-[var(--kursus-text)]"
            >
              Confidentialité
            </Link>
            <Link href="/contact" className="hover:text-[var(--kursus-text)]">
              Contact
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--kursus-border)] pt-8 text-center text-sm text-[var(--kursus-text-muted)]">
          © {new Date().getFullYear()} Kursus. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function LandingPage() {
  return (
    <div className="min-h-screen antialiased">
      <Header />
      <main>
        <Hero />
        <Features />
        <CoursesPreview />
        <Pricing />
        <Testimonials />
        <TeacherCTA />
      </main>
      <Footer />
    </div>
  );
}
