"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookText,
  BrainCircuit,
  Calculator,
  FlaskConical,
  Globe,
  Landmark,
  Languages,
  Leaf,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

interface Subject {
  name: string;
  slug: string;
  Icon: LucideIcon;
  courseCount: number;
  color: string;
  bgGradient: string;
  size: "small" | "medium" | "large";
}

const subjects: Subject[] = [
  {
    name: "Mathematiques",
    slug: "mathematiques",
    Icon: Calculator,
    courseCount: 42,
    color: "#3B82F6",
    bgGradient: "from-blue-500/20 to-blue-600/10",
    size: "large",
  },
  {
    name: "Français",
    slug: "francais",
    Icon: BookText,
    courseCount: 35,
    color: "#EF4444",
    bgGradient: "from-red-500/20 to-red-600/10",
    size: "medium",
  },
  {
    name: "Anglais",
    slug: "anglais",
    Icon: Globe,
    courseCount: 28,
    color: "#22C55E",
    bgGradient: "from-emerald-500/20 to-emerald-600/10",
    size: "small",
  },
  {
    name: "Histoire-Geo",
    slug: "histoire-geographie",
    Icon: Landmark,
    courseCount: 22,
    color: "#A16207",
    bgGradient: "from-amber-500/20 to-amber-600/10",
    size: "small",
  },
  {
    name: "SVT",
    slug: "svt",
    Icon: Leaf,
    courseCount: 18,
    color: "#14B8A6",
    bgGradient: "from-teal-500/20 to-teal-600/10",
    size: "medium",
  },
  {
    name: "Physique-Chimie",
    slug: "physique-chimie",
    Icon: FlaskConical,
    courseCount: 25,
    color: "#8B5CF6",
    bgGradient: "from-violet-500/20 to-violet-600/10",
    size: "small",
  },
  {
    name: "Philosophie",
    slug: "philosophie",
    Icon: BrainCircuit,
    courseCount: 15,
    color: "#6366F1",
    bgGradient: "from-indigo-500/20 to-indigo-600/10",
    size: "small",
  },
  {
    name: "Langues",
    slug: "langues",
    Icon: Languages,
    courseCount: 31,
    color: "#F97316",
    bgGradient: "from-orange-500/20 to-orange-600/10",
    size: "medium",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

function SubjectCard({ subject, index }: { subject: Subject; index: number }) {
  const { name, Icon, courseCount, color, bgGradient, slug, size } = subject;

  // Bento grid sizing
  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-1 row-span-1 lg:col-span-1 lg:row-span-2",
    large: "col-span-1 row-span-1 lg:col-span-2 lg:row-span-2",
  };

  const isLarge = size === "large";
  const isMedium = size === "medium";

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -6,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      className={`group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md ${sizeClasses[size]}`}
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-30 transition-opacity duration-300 group-hover:opacity-50`}
      />

      {/* Animated Glow Effect */}
      <motion.div
        className="absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: `${color}20` }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "mirror",
          delay: index * 0.2,
        }}
      />

      <Link
        href={`/courses?category=${slug}`}
        className={`relative flex h-full flex-col justify-between ${isLarge ? "p-8" : isMedium ? "p-6" : "p-5"}`}
      >
        {/* Icon Container */}
        <div className="mb-auto">
          <motion.div
            className={`inline-flex items-center justify-center rounded-xl ${isLarge ? "h-16 w-16" : "h-12 w-12"}`}
            style={{ backgroundColor: `${color}15` }}
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <Icon
              className={isLarge ? "h-8 w-8" : "h-6 w-6"}
              style={{ color }}
            />
          </motion.div>
        </div>

        {/* Content */}
        <div className={isLarge ? "mt-8" : "mt-4"}>
          <h3
            className={`font-bold text-gray-900 transition-colors ${isLarge ? "text-2xl" : "text-lg"}`}
          >
            {name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`font-semibold ${isLarge ? "text-lg" : "text-sm"}`}
              style={{ color }}
            >
              {courseCount} cours
            </span>
            {isLarge && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                Populaire
              </span>
            )}
          </div>

          {/* Arrow indicator */}
          <div className="mt-3 flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors group-hover:text-emerald-600">
            <span>Explorer</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Decorative Elements for Large Cards */}
        {isLarge && (
          <>
            <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
              <Sparkles className="h-3 w-3 text-amber-500" />
              IA disponible
            </div>
          </>
        )}
      </Link>
    </motion.div>
  );
}

export function Categories() {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-24 sm:px-6 lg:px-8">
      {/* Background Decorations */}
      <div className="absolute left-0 top-0 h-full w-full">
        <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-600">
            <Sparkles className="h-4 w-4" />
            Explorez par Matière
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Toutes les matières, un seul objectif
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Des mathematiques a la philosophie, nos professeurs experts
            accompagnent votre enfant vers la réussite.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid auto-rows-[140px] grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[160px] lg:grid-cols-4"
        >
          {subjects.map((subject, index) => (
            <SubjectCard key={subject.slug} subject={subject} index={index} />
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Link
            href="/courses"
            className="group inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md"
          >
            Voir tous les cours
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
