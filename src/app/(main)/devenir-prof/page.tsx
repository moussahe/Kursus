"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  DollarSign,
  Users,
  ArrowRight,
  Calculator,
  Zap,
  Shield,
  Clock,
  ChevronDown,
  Star,
  TrendingUp,
} from "lucide-react";

// ============================================================================
// CONSTANTS
// ============================================================================
const KURSUS = {
  orange: "#ff6d38",
  purple: "#7a78ff",
};

const COMMISSION_RATE = 0.7; // 70% pour les profs

const BENEFITS = [
  {
    icon: DollarSign,
    title: "70% de commission",
    description: "La meilleure rémunération du marché. Pas de frais cachés.",
    color: KURSUS.purple,
  },
  {
    icon: Zap,
    title: "IA pour créer vos cours",
    description: "Notre IA génère un plan de cours à partir d'un simple titre.",
    color: KURSUS.purple,
  },
  {
    icon: Users,
    title: "+15 000 élèves",
    description: "Une communauté d'élèves prêts à apprendre avec vous.",
    color: KURSUS.orange,
  },
  {
    icon: Shield,
    title: "Paiements sécurisés",
    description: "Paiements via Stripe, versements chaque semaine.",
    color: KURSUS.purple,
  },
  {
    icon: Clock,
    title: "Revenus passifs",
    description:
      "Créez une fois, vendez à l'infini. Travaillez quand vous voulez.",
    color: KURSUS.purple,
  },
  {
    icon: TrendingUp,
    title: "Analytics détaillées",
    description: "Suivez vos ventes, élèves et revenus en temps réel.",
    color: KURSUS.orange,
  },
];

const FAQ_ITEMS = [
  {
    question: "Qui peut devenir enseignant sur Kursus ?",
    answer:
      "Tout professionnel de l'éducation peut postuler : professeurs de l'Éducation nationale, professeurs particuliers, étudiants en master MEEF, ou experts dans leur domaine. Nous vérifions chaque profil avant publication.",
  },
  {
    question: "Comment fonctionne la rémunération ?",
    answer:
      "Vous fixez librement le prix de vos cours. À chaque vente, vous recevez 70% du prix. Les paiements sont effectués chaque semaine via Stripe directement sur votre compte bancaire.",
  },
  {
    question: "Combien coûte la publication d'un cours ?",
    answer:
      "Rien ! La publication est 100% gratuite. Nous ne prenons une commission que lorsque vous vendez. Pas de vente = pas de frais.",
  },
  {
    question: "Comment créer mon premier cours ?",
    answer:
      "Notre assistant IA vous guide étape par étape. Entrez simplement le titre de votre cours, et l'IA génère automatiquement un plan structuré que vous pouvez personnaliser. Ensuite, ajoutez vos vidéos, documents et quiz.",
  },
  {
    question: "Les élèves peuvent-ils poser des questions ?",
    answer:
      "Oui, chaque cours dispose d'un espace commentaires. Vous pouvez aussi proposer des sessions live payantes pour un accompagnement personnalisé.",
  },
  {
    question: "Puis-je retirer mes cours à tout moment ?",
    answer:
      "Oui, vous gardez le contrôle total. Vous pouvez dépublier ou supprimer vos cours quand vous le souhaitez. Les élèves ayant déjà acheté gardent leur accès.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Je gagne 1 500€/mois en plus de mon salaire de prof. Kursus a changé ma vie.",
    author: "Marie D.",
    role: "Professeure de Mathématiques",
    revenue: "18 000€/an",
  },
  {
    quote:
      "L'IA m'a fait gagner des heures de préparation. Mon cours était prêt en 2h.",
    author: "Thomas L.",
    role: "Professeur de Français",
    revenue: "8 400€/an",
  },
  {
    quote:
      "150 élèves ont acheté mon cours en 3 mois. Je ne m'y attendais pas !",
    author: "Sophie M.",
    role: "Professeure de Physique",
    revenue: "12 600€/an",
  },
];

// ============================================================================
// REVENUE CALCULATOR
// ============================================================================
function RevenueCalculator() {
  const [numberOfCourses, setNumberOfCourses] = useState(3);
  const [avgCoursePrice, setAvgCoursePrice] = useState(5);
  const [totalSalesPerMonth, setTotalSalesPerMonth] = useState(100);

  const revenuePerSale = avgCoursePrice * COMMISSION_RATE;
  const monthlyRevenue = revenuePerSale * totalSalesPerMonth;
  const yearlyRevenue = monthlyRevenue * 12;

  return (
    <div className="rounded-3xl border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] p-8">
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: `${KURSUS.purple}15` }}
        >
          <Calculator className="h-6 w-6" style={{ color: KURSUS.purple }} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--kursus-text)]">
            Simulateur de revenus
          </h3>
          <p className="text-sm text-[var(--kursus-text-muted)]">
            Combien pouvez-vous gagner ?
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Number of Courses Slider */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[var(--kursus-text)]">
                Nombre de cours publiés
              </label>
              <p className="text-xs text-[var(--kursus-text-muted)]">
                Combien de cours vous proposez
              </p>
            </div>
            <span
              className="rounded-lg px-3 py-1 text-xl font-black"
              style={{ background: `${KURSUS.purple}20`, color: KURSUS.purple }}
            >
              {numberOfCourses}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={numberOfCourses}
            onChange={(e) => setNumberOfCourses(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--kursus-border)]"
            style={{
              accentColor: KURSUS.purple,
            }}
          />
          <div className="mt-1 flex justify-between text-xs text-[var(--kursus-text-muted)]">
            <span>1 cours</span>
            <span>10 cours</span>
          </div>
        </div>

        {/* Average Price Slider */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[var(--kursus-text)]">
                Prix moyen de vos cours
              </label>
              <p className="text-xs text-[var(--kursus-text-muted)]">
                Entre 2€ et 30€ par cours
              </p>
            </div>
            <span
              className="rounded-lg px-3 py-1 text-xl font-black"
              style={{ background: `${KURSUS.orange}20`, color: KURSUS.orange }}
            >
              {avgCoursePrice}€
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            value={avgCoursePrice}
            onChange={(e) => setAvgCoursePrice(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--kursus-border)]"
            style={{
              accentColor: KURSUS.orange,
            }}
          />
          <div className="mt-1 flex justify-between text-xs text-[var(--kursus-text-muted)]">
            <span>2€</span>
            <span>30€</span>
          </div>
        </div>

        {/* Total Sales Slider */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-[var(--kursus-text)]">
                Ventes totales par mois
              </label>
              <p className="text-xs text-[var(--kursus-text-muted)]">
                Sur l&apos;ensemble de vos {numberOfCourses} cours
              </p>
            </div>
            <span
              className="rounded-lg px-3 py-1 text-xl font-black"
              style={{
                background: `${KURSUS.purple}20`,
                color: "var(--kursus-purple-text)",
              }}
            >
              {totalSalesPerMonth}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={totalSalesPerMonth}
            onChange={(e) => setTotalSalesPerMonth(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--kursus-border)]"
            style={{
              accentColor: KURSUS.purple,
            }}
          />
          <div className="mt-1 flex justify-between text-xs text-[var(--kursus-text-muted)]">
            <span>10 ventes</span>
            <span>500 ventes</span>
          </div>
        </div>

        {/* Calculation breakdown */}
        <div
          className="rounded-xl p-4"
          style={{
            background: `${KURSUS.purple}10`,
            border: `1px solid ${KURSUS.purple}30`,
          }}
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--kursus-text-muted)]">
                Vous gagnez par vente :
              </span>
              <span
                className="font-bold"
                style={{ color: "var(--kursus-purple-text)" }}
              >
                {avgCoursePrice}€ × 70% = {revenuePerSale.toFixed(1)}€
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--kursus-text-muted)]">
                Soit ~{Math.round(totalSalesPerMonth / numberOfCourses)}{" "}
                ventes/mois par cours
              </span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-[var(--kursus-border)] bg-[var(--kursus-bg)] p-6">
          <p className="mb-4 text-center text-sm font-medium text-[var(--kursus-text)]">
            Vos revenus estimés
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-[var(--kursus-bg-elevated)] p-4 text-center">
              <p
                className="text-3xl font-black"
                style={{ color: "var(--kursus-purple-text)" }}
              >
                {Math.round(monthlyRevenue).toLocaleString("fr-FR")}€
              </p>
              <p className="text-sm text-[var(--kursus-text-muted)]">
                par mois
              </p>
            </div>
            <div className="rounded-xl bg-[var(--kursus-bg-elevated)] p-4 text-center">
              <p
                className="text-3xl font-black"
                style={{ color: KURSUS.orange }}
              >
                {Math.round(yearlyRevenue).toLocaleString("fr-FR")}€
              </p>
              <p className="text-sm text-[var(--kursus-text-muted)]">par an</p>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-[var(--kursus-text-muted)]">
            {revenuePerSale.toFixed(1)}€ × {totalSalesPerMonth} ventes ={" "}
            {Math.round(monthlyRevenue)}€/mois
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FAQ ACCORDION
// ============================================================================
function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[var(--kursus-border)]">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-lg font-medium text-[var(--kursus-text)]">
          {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-[var(--kursus-text-muted)] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-[var(--kursus-text-muted)]">{answer}</p>
      </motion.div>
    </div>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="rounded-3xl border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] p-8">
      {FAQ_ITEMS.map((item, index) => (
        <FAQItem
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function DevenirProfPage() {
  return (
    <div className="min-h-screen bg-[var(--kursus-bg)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-20 pt-32">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/4 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[128px]"
            style={{ background: `${KURSUS.purple}15` }}
          />
          <div
            className="absolute right-1/4 top-1/2 h-[400px] w-[400px] rounded-full blur-[128px]"
            style={{ background: `${KURSUS.purple}10` }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
                style={{
                  borderColor: `${KURSUS.purple}30`,
                  background: `${KURSUS.purple}10`,
                  color: "var(--kursus-purple-text)",
                }}
              >
                <GraduationCap className="h-4 w-4" />
                Espace Enseignant
              </span>

              <h1 className="mt-6 text-4xl leading-[1.1] text-[var(--kursus-text)] sm:text-5xl md:text-6xl">
                Gardez <span className="text-gradient-purple">70%</span> de vos
                ventes
              </h1>

              <p className="mt-6 text-xl text-[var(--kursus-text-muted)]">
                Créez vos cours une fois, vendez-les à des milliers
                d&apos;élèves. Notre plateforme gère les paiements, vous gardez{" "}
                <strong className="text-[var(--kursus-text)]">
                  70% de chaque vente
                </strong>
                .
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/register/teacher"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold transition-all hover:shadow-lg"
                  style={{
                    background: KURSUS.orange,
                    color: "#0a0a0a",
                    boxShadow: `0 0 40px -10px ${KURSUS.orange}50`,
                  }}
                >
                  Devenir enseignant
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="#calculator"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] px-8 py-4 text-lg font-medium text-[var(--kursus-text)] transition-all hover:border-[var(--kursus-text-muted)]"
                >
                  <Calculator className="h-5 w-5" />
                  Calculer mes revenus
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-[var(--kursus-border)] pt-8">
                {[
                  { value: "300+", label: "Profs" },
                  { value: "70%", label: "Commission" },
                  { value: "7j", label: "Versements" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div
                      className="text-2xl font-black"
                      style={{ color: KURSUS.orange }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm text-[var(--kursus-text-muted)]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Calculator Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              id="calculator"
            >
              <RevenueCalculator />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t border-[var(--kursus-border)] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl text-[var(--kursus-text)] sm:text-4xl">
              Pourquoi enseigner sur{" "}
              <span style={{ color: KURSUS.orange }}>Kursus</span> ?
            </h2>
            <p className="mt-4 text-[var(--kursus-text-muted)]">
              La plateforme conçue pour les enseignants, par des enseignants.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] p-6 transition-all hover:border-[var(--kursus-text-muted)]/30"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${benefit.color}15` }}
                >
                  <benefit.icon
                    className="h-6 w-6"
                    style={{ color: benefit.color }}
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--kursus-text)]">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-[var(--kursus-text-muted)]">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-[var(--kursus-border)] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl text-[var(--kursus-text)] sm:text-4xl">
              Comment ça marche ?
            </h2>
            <p className="mt-4 text-[var(--kursus-text-muted)]">
              Publiez votre premier cours en moins de 2 heures.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Créez votre compte",
                description:
                  "Inscrivez-vous gratuitement et complétez votre profil enseignant.",
                color: KURSUS.orange,
              },
              {
                step: "02",
                title: "L'IA génère votre cours",
                description:
                  "Entrez un titre, notre IA crée le plan. Ajoutez vos contenus.",
                color: KURSUS.purple,
              },
              {
                step: "03",
                title: "Recevez vos revenus",
                description:
                  "Publiez, vendez et recevez 70% de chaque vente chaque semaine.",
                color: KURSUS.purple,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-black"
                  style={{
                    background: `${item.color}15`,
                    color: item.color,
                  }}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-[var(--kursus-text)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[var(--kursus-text-muted)]">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-[var(--kursus-border)] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl text-[var(--kursus-text)] sm:text-4xl">
              Ils enseignent sur Kursus
            </h2>
            <p className="mt-4 text-[var(--kursus-text-muted)]">
              Découvrez les témoignages de nos professeurs.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
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
                <div className="mt-6 flex items-center justify-between border-t border-[var(--kursus-border)] pt-4">
                  <div>
                    <div className="font-medium text-[var(--kursus-text)]">
                      {t.author}
                    </div>
                    <div className="text-sm text-[var(--kursus-text-muted)]">
                      {t.role}
                    </div>
                  </div>
                  <div
                    className="rounded-lg px-3 py-1 text-sm font-bold"
                    style={{
                      background: `${KURSUS.purple}15`,
                      color: "var(--kursus-purple-text)",
                    }}
                  >
                    {t.revenue}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[var(--kursus-border)] py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl text-[var(--kursus-text)] sm:text-4xl">
              Questions fréquentes
            </h2>
            <p className="mt-4 text-[var(--kursus-text-muted)]">
              Tout ce que vous devez savoir avant de commencer.
            </p>
          </div>

          <FAQ />
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-[var(--kursus-border)] py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div
            className="rounded-3xl border p-12 text-center"
            style={{
              borderColor: `${KURSUS.purple}30`,
              background: `linear-gradient(135deg, ${KURSUS.purple}10, ${KURSUS.purple}05)`,
              boxShadow: `0 0 80px -20px ${KURSUS.purple}30`,
            }}
          >
            <h2 className="text-3xl text-[var(--kursus-text)] sm:text-4xl">
              Prêt à partager votre savoir ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[var(--kursus-text-muted)]">
              Rejoignez 300+ enseignants qui gagnent déjà de l&apos;argent en
              vendant leurs cours sur Kursus.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register/teacher"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold transition-all hover:shadow-lg"
                style={{
                  background: KURSUS.orange,
                  color: "#0a0a0a",
                  boxShadow: `0 0 40px -10px ${KURSUS.orange}50`,
                }}
              >
                Commencer gratuitement
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-[var(--kursus-text-muted)]">
              Inscription gratuite - Aucune carte bancaire requise
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
