"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  Star,
  ArrowRight,
  CheckCircle2,
  Play,
  BookOpen,
  Calculator,
  Globe,
  Microscope,
  Sparkles,
  Flame,
  Trophy,
  Brain,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Animated counter component
function AnimatedCounter({
  end,
  duration = 2,
  suffix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min(
          (timestamp - startTime) / (duration * 1000),
          1,
        );
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Floating badge component
function FloatingBadge({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 200 }}
      className={className}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

const subjects = [
  {
    name: "Mathematiques",
    icon: Calculator,
    count: 156,
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Francais",
    icon: BookOpen,
    count: 124,
    color: "from-purple-500 to-purple-600",
  },
  {
    name: "Anglais",
    icon: Globe,
    count: 98,
    color: "from-pink-500 to-pink-600",
  },
  {
    name: "Sciences",
    icon: Microscope,
    count: 87,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    name: "Histoire-Geo",
    icon: Globe,
    count: 76,
    color: "from-orange-500 to-orange-600",
  },
  {
    name: "Physique-Chimie",
    icon: Sparkles,
    count: 65,
    color: "from-cyan-500 to-cyan-600",
  },
];

const features = [
  {
    icon: Brain,
    title: "Tuteur IA 24/7",
    description:
      "Un assistant intelligent qui guide sans donner les reponses. Disponible jour et nuit.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: TrendingUp,
    title: "85% pour les profs",
    description:
      "Les enseignants gardent 85% de chaque vente. Parce qu'ils le meritent.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Clock,
    title: "Un achat, a vie",
    description:
      "Pas d'abonnement. Un seul paiement pour un acces illimite. Pour toujours.",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description:
      "XP, badges, streaks... Apprendre devient un jeu qui rend plus fort.",
    color: "from-pink-500 to-rose-600",
  },
];

const testimonials = [
  {
    content:
      "Mon fils a gagne 4 points de moyenne en maths grace a Schoolaris. Le tuteur IA est incroyable!",
    author: "Sophie L.",
    role: "Maman de Lucas, 3eme",
    rating: 5,
  },
  {
    content:
      "Enfin une plateforme qui respecte le travail des enseignants. 85% c'est juste et motive.",
    author: "Marie D.",
    role: "Professeure de francais",
    rating: 5,
  },
  {
    content:
      "L'IA m'aide a comprendre sans me donner les reponses. J'apprends vraiment!",
    author: "Emma L.",
    role: "Eleve de 3eme",
    rating: 5,
  },
];

const steps = [
  {
    number: "01",
    title: "Trouvez le cours ideal",
    description:
      "Parcourez notre catalogue de cours crees par de vrais professeurs certifies.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Achetez une fois",
    description:
      "Payez une seule fois et gardez l'acces au cours a vie. Pas d'abonnement.",
    icon: Shield,
  },
  {
    number: "03",
    title: "Progressez avec l'IA",
    description:
      "L'IA vous accompagne 24/7 pour vous aider a comprendre et progresser.",
    icon: Brain,
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30"
            >
              <GraduationCap className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Schoolaris
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {["Cours", "Professeurs", "Tarifs", "A propos"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(" ", "-")}`}
                className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="font-medium">
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 font-medium">
                  Commencer gratuitement
                </Button>
              </motion.div>
            </Link>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-white"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {["Cours", "Professeurs", "Tarifs", "A propos"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm font-medium text-gray-600 hover:text-emerald-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Connexion
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </motion.header>

      <main id="main-content">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-white to-white pt-12 pb-24 lg:pt-20 lg:pb-32"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-200/40 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-teal-200/40 to-cyan-200/40 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-emerald-100/30 to-teal-100/30 blur-3xl" />
          </div>

          <div className="container relative mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left content */}
              <motion.div
                initial="initial"
                animate={heroInView ? "animate" : "initial"}
                variants={staggerContainer}
              >
                {/* Badge */}
                <motion.div variants={fadeInUp} className="mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
                    <Sparkles className="h-4 w-4" />
                    Nouveau: Tuteur IA propulse par Claude
                  </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  variants={fadeInUp}
                  className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
                >
                  La reussite scolaire,{" "}
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    simplifiee.
                  </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                  variants={fadeInUp}
                  className="mb-8 text-lg text-gray-600 sm:text-xl max-w-lg"
                >
                  Des cours de qualite du CP a la Terminale. Crees par des
                  enseignants. Propulses par l&apos;IA. Un achat, un acces a
                  vie.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-4 mb-10"
                >
                  <Link href="/courses">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        size="lg"
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-500/30 text-base px-8 h-12"
                      >
                        Decouvrir les cours
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/register/teacher">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto border-2 text-base px-8 h-12"
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Devenir createur
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                  variants={fadeInUp}
                  className="flex flex-wrap items-center gap-6 text-sm text-gray-600"
                >
                  {[
                    { icon: CheckCircle2, text: "Profs certifies" },
                    { icon: Shield, text: "Acces a vie" },
                    { icon: Brain, text: "IA 24/7" },
                  ].map((badge, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <badge.icon className="h-5 w-5 text-emerald-500" />
                      <span>{badge.text}</span>
                    </div>
                  ))}
                </motion.div>

                {/* Social proof */}
                <motion.div
                  variants={fadeInUp}
                  className="mt-10 flex items-center gap-4"
                >
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-gray-200 to-gray-300 shadow-sm"
                      />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      Rejoint par{" "}
                      <strong className="text-gray-900">10,000+</strong>{" "}
                      familles
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right visual */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                {/* Main card */}
                <div className="relative rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <Calculator className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          Les fractions - CM2
                        </p>
                        <p className="text-sm text-gray-400">
                          Par Marie Dupont
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-medium">4.9</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progression</span>
                      <span className="text-emerald-400 font-medium">67%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "67%" }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                      />
                    </div>
                  </div>

                  {/* AI Chat preview */}
                  <div className="bg-gray-800/50 rounded-2xl p-4 mb-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                        <Brain className="h-4 w-4 text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">Tuteur IA</p>
                        <p className="text-sm text-gray-200">
                          Qu&apos;est-ce que tu obtiens quand tu divises 3/4 par
                          2?
                        </p>
                      </div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="flex items-center gap-2 text-gray-400 text-sm"
                    >
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                            className="h-2 w-2 bg-emerald-400 rounded-full"
                          />
                        ))}
                      </div>
                      <span>En train de reflechir...</span>
                    </motion.div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-800/50 rounded-xl p-3">
                      <p className="text-2xl font-bold text-emerald-400">24</p>
                      <p className="text-xs text-gray-400">Lecons</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-3">
                      <p className="text-2xl font-bold text-amber-400">12</p>
                      <p className="text-xs text-gray-400">Quiz</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-3">
                      <p className="text-2xl font-bold text-violet-400">4h</p>
                      <p className="text-xs text-gray-400">Contenu</p>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <FloatingBadge delay={0.5} className="absolute -top-4 -left-4">
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-xl shadow-amber-500/20">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="font-bold text-gray-900">12 jours</span>
                  </div>
                </FloatingBadge>

                <FloatingBadge
                  delay={0.7}
                  className="absolute -bottom-4 -right-4"
                >
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-xl shadow-emerald-500/20">
                    <Sparkles className="h-5 w-5 text-emerald-500" />
                    <span className="font-bold text-gray-900">+250 XP</span>
                  </div>
                </FloatingBadge>

                <FloatingBadge
                  delay={0.9}
                  className="absolute top-1/2 -right-8"
                >
                  <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 shadow-xl shadow-violet-500/30">
                    <Trophy className="h-5 w-5 text-white" />
                    <span className="font-bold text-white">Niveau 5</span>
                  </div>
                </FloatingBadge>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: 10000, suffix: "+", label: "Familles" },
                { value: 500, suffix: "+", label: "Cours" },
                { value: 200, suffix: "+", label: "Professeurs" },
                { value: 85, suffix: "%", label: "Pour les profs" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-2 text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Pourquoi choisir Schoolaris?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Une plateforme pensee pour les eleves, respectueuse des
                enseignants, et propulsee par l&apos;intelligence artificielle.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="h-full"
                  >
                    <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                        >
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Comment ca marche?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Trois etapes simples pour accompagner la reussite scolaire de
                votre enfant.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative"
                >
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-emerald-200 to-teal-200" />
                  )}

                  <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                    {/* Number badge */}
                    <div className="absolute -top-4 left-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                      {step.number}
                    </div>

                    <div className="pt-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-6">
                        <step.icon className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
            >
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Parcourir par matiere
                </h2>
                <p className="text-lg text-gray-600">
                  Trouvez le cours parfait dans la matiere de votre choix.
                </p>
              </div>
              <Link
                href="/courses"
                className="hidden md:inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mt-4 md:mt-0"
              >
                Voir tous les cours
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject, i) => (
                <motion.div
                  key={subject.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/courses?subject=${subject.name.toLowerCase()}`}>
                    <motion.div
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="group"
                    >
                      <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <CardContent className="p-6 flex items-center gap-4">
                          <div
                            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                          >
                            <subject.icon className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                              {subject.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {subject.count} cours disponibles
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-grid-pattern" />
          </div>

          <div className="container relative mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ils nous font confiance
              </h2>
              <p className="text-lg text-emerald-100">
                Des milliers de familles utilisent Schoolaris chaque jour.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <motion.div whileHover={{ scale: 1.03 }} className="h-full">
                    <Card className="h-full bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex gap-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, j) => (
                            <Star
                              key={j}
                              className="h-4 w-4 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <p className="text-white mb-6">
                          &ldquo;{testimonial.content}&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-medium text-white">
                            {testimonial.author
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {testimonial.author}
                            </p>
                            <p className="text-sm text-emerald-200">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA for Teachers */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto"
            >
              <div className="relative rounded-3xl overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />

                {/* Content */}
                <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12 lg:p-16">
                  <div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                    >
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1 text-sm font-medium text-emerald-400 mb-6">
                        <Zap className="h-4 w-4" />
                        Pour les enseignants
                      </div>

                      <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Gardez{" "}
                        <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                          85%
                        </span>{" "}
                        de vos ventes
                      </h2>

                      <p className="text-gray-300 mb-8 text-lg">
                        Creez vos cours, fixez vos prix, touchez 85% de chaque
                        vente. Nous nous occupons de la technique, vous vous
                        concentrez sur l&apos;enseignement.
                      </p>

                      <ul className="space-y-4 mb-8">
                        {[
                          "Publication gratuite et illimitee",
                          "Outils de creation puissants",
                          "Analytics detailles",
                          "Paiements instantanes via Stripe",
                        ].map((item, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3 text-gray-300"
                          >
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                            {item}
                          </motion.li>
                        ))}
                      </ul>

                      <Link href="/register/teacher">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-500/30 text-base"
                          >
                            Devenir createur
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </motion.div>
                      </Link>
                    </motion.div>
                  </div>

                  {/* Visual */}
                  <div className="hidden md:flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="relative"
                    >
                      {/* Earnings card */}
                      <div className="bg-white/10 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/10">
                        <p className="text-gray-400 text-sm mb-2">
                          Revenus ce mois
                        </p>
                        <p className="text-4xl font-bold text-white mb-4">
                          2 450{" "}
                          <span className="text-lg text-gray-400">EUR</span>
                        </p>
                        <div className="flex items-center gap-2 text-emerald-400 text-sm">
                          <TrendingUp className="h-4 w-4" />
                          +23% vs mois dernier
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-gray-400">Ventes</span>
                            <span className="text-white font-medium">47</span>
                          </div>
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-gray-400">Eleves actifs</span>
                            <span className="text-white font-medium">234</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Note moyenne</span>
                            <span className="text-white font-medium flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              4.9
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Floating percentage */}
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -top-6 -right-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full px-6 py-3 shadow-xl shadow-emerald-500/30"
                      >
                        <span className="text-2xl font-bold text-white">
                          85%
                        </span>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Pret a commencer?
              </h2>
              <p className="text-lg text-gray-600 mb-10">
                Rejoignez des milliers de familles qui font confiance a
                Schoolaris pour accompagner la reussite scolaire de leurs
                enfants.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-500/30 text-base px-8 h-12"
                    >
                      Creer mon compte gratuit
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/courses">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto border-2 text-base px-8 h-12"
                    >
                      Explorer les cours
                    </Button>
                  </motion.div>
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                Pas de carte bancaire requise. Annulation a tout moment.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Schoolaris</span>
              </Link>
              <p className="text-sm text-gray-400">
                La marketplace de cours scolaires. Crees par des profs,
                propulses par l&apos;IA.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Cours</h4>
              <ul className="space-y-3 text-sm">
                {["Primaire", "College", "Lycee", "Tous les cours"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href="/courses"
                        className="hover:text-emerald-400 transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Enseignants</h4>
              <ul className="space-y-3 text-sm">
                {["Devenir createur", "Guide", "Tarification", "Support"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href="/register/teacher"
                        className="hover:text-emerald-400 transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                {["CGU", "Confidentialite", "Cookies", "Contact"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href={`/legal/${item.toLowerCase()}`}
                        className="hover:text-emerald-400 transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Schoolaris. Tous droits
              reserves.
            </p>
            <div className="flex gap-4">
              {["Twitter", "LinkedIn", "Instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  <Users className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
