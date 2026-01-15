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
  avatarColors: string;
  stats?: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Mon fils a gagné 4 points en maths grâce à Schoolaris. Les cours sont clairs et il peut avancer à son rythme.",
    name: "Sophie Martin",
    role: "Maman de Lucas, 3ème",
    type: "parent",
    avatarColors: "from-pink-400 to-rose-500",
    stats: "+4 points en maths",
  },
  {
    quote:
      "Je garde 70% de mes ventes, bien plus que les autres plateformes. Et je peux créer des cours de qualité.",
    name: "Marie Dupont",
    role: "Professeure de Mathématiques",
    type: "teacher",
    avatarColors: "from-emerald-400 to-teal-500",
    stats: "150+ élèves",
  },
  {
    quote:
      "Les cours sont super clairs et l'assistant IA m'aide quand je bloque sur un exercice. J'adore !",
    name: "Emma Petit",
    role: "Élève en Terminale",
    type: "student",
    avatarColors: "from-violet-400 to-purple-500",
    stats: "Mention TB au Bac",
  },
  {
    quote:
      "Enfin une solution sans abonnement ! On achète les cours dont on a besoin, c'est parfait.",
    name: "Thomas Bernard",
    role: "Papa d'Élodie et Maxime",
    type: "parent",
    avatarColors: "from-blue-400 to-indigo-500",
    stats: "2 enfants inscrits",
  },
  {
    quote:
      "J'ai pu créer mon propre parcours de révision et mes élèves progressent vraiment.",
    name: "Laurent Moreau",
    role: "Professeur de Français",
    type: "teacher",
    avatarColors: "from-amber-400 to-orange-500",
    stats: "4.9/5 de moyenne",
  },
  {
    quote:
      "Les quiz et les badges me motivent à continuer. J'ai même dépassé mon meilleur ami au classement !",
    name: "Hugo Lefebvre",
    role: "Élève en 6ème",
    type: "student",
    avatarColors: "from-cyan-400 to-sky-500",
    stats: "Top 10 du classement",
  },
];

function getAvatarIcon(type: Testimonial["type"]) {
  switch (type) {
    case "parent":
      return Users;
    case "teacher":
      return BookOpen;
    case "student":
      return GraduationCap;
  }
}

function getTypeLabel(type: Testimonial["type"]) {
  switch (type) {
    case "parent":
      return { label: "Parent", color: "bg-pink-100 text-pink-700" };
    case "teacher":
      return { label: "Professeur", color: "bg-emerald-100 text-emerald-700" };
    case "student":
      return { label: "Élève", color: "bg-violet-100 text-violet-700" };
  }
}

function TestimonialCard({
  quote,
  name,
  role,
  type,
  avatarColors,
  stats,
}: Testimonial) {
  const Icon = getAvatarIcon(type);
  const typeInfo = getTypeLabel(type);

  return (
    <motion.div
      variants={itemVariants}
      className="relative flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Type badge */}
      <span
        className={`absolute -top-3 left-4 rounded-full px-3 py-1 text-xs font-semibold ${typeInfo.color}`}
      >
        {typeInfo.label}
      </span>

      {/* Quote Icon */}
      <div className="absolute right-4 top-4 text-gray-200">
        <Quote className="h-8 w-8" />
      </div>

      {/* Star Rating */}
      <div className="mb-4 mt-2 flex">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* Quote */}
      <p className="mb-6 flex-1 text-gray-700">&ldquo;{quote}&rdquo;</p>

      {/* Stats badge */}
      {stats && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700">
            <Star className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
            {stats}
          </span>
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
        {/* Avatar avec gradient et icône */}
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors} shadow-lg`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
              <Star className="h-4 w-4 fill-amber-500" />
              4.9/5 basé sur 2000+ avis
            </span>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Ils nous font confiance
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Parents, professeurs et élèves partagent leur expérience avec
              Schoolaris.
            </p>
          </motion.div>

          {/* Testimonial Cards - Grid responsive */}
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </div>

          {/* Trust Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-wrap items-center justify-center gap-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100">
                <Users className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">15 000+</p>
                <p className="text-sm text-gray-500">Familles inscrites</p>
              </div>
            </div>

            <div className="h-12 w-px bg-gray-200 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">300+</p>
                <p className="text-sm text-gray-500">Professeurs vérifiés</p>
              </div>
            </div>

            <div className="h-12 w-px bg-gray-200 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                <GraduationCap className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">95%</p>
                <p className="text-sm text-gray-500">Recommandent Schoolaris</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
