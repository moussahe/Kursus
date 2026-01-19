"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote, GraduationCap, Users, BookOpen } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  type: "parent" | "teacher" | "student";
  color: string;
  stats?: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Mon fils a gagné 4 points en maths grâce à Kursus. Les cours sont clairs et il peut avancer à son rythme.",
    name: "Sophie Martin",
    role: "Maman de Lucas, 3ème",
    type: "parent",
    color: "#ff9494",
    stats: "+4 points en maths",
  },
  {
    quote:
      "Je garde 70% de mes ventes, bien plus que les autres plateformes. Et je peux créer des cours de qualité.",
    name: "Marie Dupont",
    role: "Professeure de Mathématiques",
    type: "teacher",
    color: "#ff9494",
    stats: "150+ élèves",
  },
  {
    quote:
      "Les cours sont super clairs et l'assistant IA m'aide quand je bloque sur un exercice. J'adore !",
    name: "Emma Petit",
    role: "Élève en Terminale",
    type: "student",
    color: "#ff9494",
    stats: "Mention TB au Bac",
  },
  {
    quote:
      "Enfin une solution sans abonnement ! On achète les cours dont on a besoin, c'est parfait.",
    name: "Thomas Bernard",
    role: "Papa d'Élodie et Maxime",
    type: "parent",
    color: "#ff9494",
    stats: "2 enfants inscrits",
  },
  {
    quote:
      "J'ai pu créer mon propre parcours de révision et mes élèves progressent vraiment.",
    name: "Laurent Moreau",
    role: "Professeur de Français",
    type: "teacher",
    color: "#ff9494",
    stats: "4.9/5 de moyenne",
  },
  {
    quote:
      "Les quiz et les badges me motivent à continuer. J'ai même dépassé mon meilleur ami au classement !",
    name: "Hugo Lefebvre",
    role: "Élève en 6ème",
    type: "student",
    color: "#ff9494",
    stats: "Top 10 du classement",
  },
];

const AVATAR_ICONS = {
  parent: Users,
  teacher: BookOpen,
  student: GraduationCap,
} as const;

function getTypeLabel(type: Testimonial["type"]) {
  switch (type) {
    case "parent":
      return "Parent";
    case "teacher":
      return "Professeur";
    case "student":
      return "Élève";
  }
}

function TestimonialCard({
  quote,
  name,
  role,
  type,
  color,
  stats,
}: Testimonial) {
  const Icon = AVATAR_ICONS[type];
  const typeLabel = getTypeLabel(type);

  return (
    <motion.div
      variants={itemVariants}
      className="group relative flex min-h-[320px] flex-col rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 transition-all duration-300 hover:border-white/10"
      style={{
        boxShadow: "0 0 0 0 transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 40px -10px ${color}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 0 transparent";
      }}
    >
      {/* Type badge */}
      <span
        className="absolute -top-3 left-6 rounded-full border px-4 py-1.5 text-sm font-semibold"
        style={{
          backgroundColor: `${color}15`,
          borderColor: `${color}30`,
          color: color,
        }}
      >
        {typeLabel}
      </span>

      {/* Quote Icon */}
      <div className="absolute right-6 top-6 text-[#2a2a2a]">
        <Quote className="h-10 w-10" />
      </div>

      {/* Star Rating */}
      <div className="mb-5 mt-3 flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-[#ff9494] text-[#ff9494]" />
        ))}
      </div>

      {/* Quote */}
      <p className="mb-6 flex-1 text-lg leading-relaxed text-gray-300">
        &ldquo;{quote}&rdquo;
      </p>

      {/* Stats badge */}
      {stats && (
        <div className="mb-5">
          <span
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-base font-medium"
            style={{
              backgroundColor: `${color}10`,
              borderColor: `${color}20`,
              color: color,
            }}
          >
            <Star className="h-4 w-4" style={{ fill: color }} />
            {stats}
          </span>
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-4 border-t border-[#2a2a2a] pt-5">
        {/* Avatar avec gradient et icône */}
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-7 w-7" style={{ color }} />
        </div>
        <div>
          <p className="text-lg font-semibold text-white">{name}</p>
          <p className="text-base text-gray-500">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-[#0a0a0a] py-24 border-t border-[#2a2a2a]">
      <div className="container mx-auto max-w-7xl px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ff9494]/20 bg-[#ff9494]/10 px-4 py-2 text-sm font-medium text-[#ff9494]">
              <Star className="h-4 w-4 fill-[#ff9494]" />
              4.9/5 basé sur 2000+ avis
            </span>

            <h2
              className="mt-6 text-3xl font-black tracking-tight text-white md:text-4xl lg:text-5xl"
              style={{ letterSpacing: "-0.04em" }}
            >
              Ils nous font
              <br />
              <span className="text-gradient">confiance.</span>
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
              Parents, professeurs et élèves partagent leur expérience avec
              Kursus.
            </p>
          </motion.div>

          {/* Testimonial Cards - Grid responsive */}
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </div>

          {/* Trust Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-20 flex flex-wrap items-center justify-center gap-10 lg:gap-16"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#ff9494]/20 bg-[#ff9494]/10">
                <Users className="h-7 w-7 text-[#ff9494]" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">15 000+</p>
                <p className="text-base text-gray-500">Familles inscrites</p>
              </div>
            </div>

            <div className="h-14 w-px bg-[#2a2a2a] hidden sm:block" />

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#ff9494]/20 bg-[#ff9494]/10">
                <BookOpen className="h-7 w-7 text-[#ff9494]" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">300+</p>
                <p className="text-base text-gray-500">Professeurs vérifiés</p>
              </div>
            </div>

            <div className="h-14 w-px bg-[#2a2a2a] hidden sm:block" />

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#ff9494]/20 bg-[#ff9494]/10">
                <GraduationCap className="h-7 w-7 text-[#ff9494]" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">95%</p>
                <p className="text-base text-gray-500">Recommandent Kursus</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
