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
  size: "small" | "medium" | "large";
}

const subjects: Subject[] = [
  {
    name: "Mathématiques",
    slug: "mathematiques",
    Icon: Calculator,
    courseCount: 42,
    color: "#ff9494",
    size: "large",
  },
  {
    name: "Français",
    slug: "francais",
    Icon: BookText,
    courseCount: 35,
    color: "#7a78ff",
    size: "medium",
  },
  {
    name: "Anglais",
    slug: "anglais",
    Icon: Globe,
    courseCount: 28,
    color: "#c7ff69",
    size: "small",
  },
  {
    name: "Histoire-Géo",
    slug: "histoire-geographie",
    Icon: Landmark,
    courseCount: 22,
    color: "#ff9494",
    size: "small",
  },
  {
    name: "SVT",
    slug: "svt",
    Icon: Leaf,
    courseCount: 18,
    color: "#c7ff69",
    size: "medium",
  },
  {
    name: "Physique-Chimie",
    slug: "physique-chimie",
    Icon: FlaskConical,
    courseCount: 25,
    color: "#7a78ff",
    size: "small",
  },
  {
    name: "Philosophie",
    slug: "philosophie",
    Icon: BrainCircuit,
    courseCount: 15,
    color: "#7a78ff",
    size: "small",
  },
  {
    name: "Langues",
    slug: "langues",
    Icon: Languages,
    courseCount: 31,
    color: "#ff9494",
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
  const { name, Icon, courseCount, color, slug, size } = subject;

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
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      className={`group relative overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] transition-all duration-300 hover:border-white/10 ${sizeClasses[size]}`}
      style={{
        boxShadow: "0 0 0 0 transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 60px -15px ${color}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 0 transparent";
      }}
    >
      {/* Animated Glow Effect */}
      <motion.div
        className="absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: `${color}15` }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
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
        className={`relative flex h-full flex-col justify-between ${isLarge ? "p-8 lg:p-10" : isMedium ? "p-6 lg:p-8" : "p-6"}`}
      >
        {/* Icon Container */}
        <div className="mb-auto">
          <motion.div
            className={`inline-flex items-center justify-center rounded-xl border ${isLarge ? "h-16 w-16" : "h-12 w-12"}`}
            style={{ backgroundColor: `${color}15`, borderColor: `${color}30` }}
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
        <div className={isLarge ? "mt-8" : "mt-6"}>
          <h3
            className={`font-bold leading-tight text-white transition-colors ${isLarge ? "text-2xl" : "text-xl"}`}
          >
            {name}
          </h3>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`font-semibold ${isLarge ? "text-lg" : "text-base"}`}
              style={{ color }}
            >
              {courseCount} cours
            </span>
            {isLarge && (
              <span className="rounded-full bg-[#ff9494]/10 border border-[#ff9494]/20 px-2.5 py-1 text-xs font-medium text-[#ff9494]">
                Populaire
              </span>
            )}
          </div>

          {/* Arrow indicator */}
          <div className="mt-4 flex items-center gap-1.5 text-base font-medium text-gray-500 transition-colors group-hover:text-[#ff9494]">
            <span>Explorer</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Decorative Elements for Large Cards */}
        {isLarge && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full border border-[#2a2a2a] bg-[#141414] px-3 py-1.5 text-xs font-medium text-gray-400">
            <Sparkles className="h-3 w-3 text-[#c7ff69]" />
            IA disponible
          </div>
        )}
      </Link>
    </motion.div>
  );
}

export function Categories() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] px-4 py-24 sm:px-6 lg:px-8 border-t border-[#2a2a2a]">
      {/* Background Decorations */}
      <div className="absolute left-0 top-0 h-full w-full">
        <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-[#ff9494]/5 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-[#7a78ff]/5 blur-3xl" />
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
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c7ff69]/20 bg-[#c7ff69]/10 px-4 py-1.5 text-sm font-semibold text-[#c7ff69]">
            <Sparkles className="h-4 w-4" />
            Explorez par Matière
          </span>
          <h2
            className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl"
            style={{ letterSpacing: "-0.04em" }}
          >
            Toutes les matières,
            <br />
            <span className="text-gradient">un seul objectif.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            Des mathématiques à la philosophie, nos professeurs experts
            accompagnent votre enfant vers la réussite.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid auto-rows-[180px] grid-cols-1 gap-6 sm:grid-cols-2 lg:auto-rows-[200px] lg:grid-cols-4 lg:gap-8"
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
            className="group inline-flex items-center gap-2 rounded-full bg-[#ff9494] px-8 py-4 text-base font-semibold text-[#0a0a0a] transition-all hover:bg-[#ffb8b8] hover:shadow-[0_0_40px_-10px_rgba(255,109,56,0.5)]"
          >
            Voir tous les cours
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
