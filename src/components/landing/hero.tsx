"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Play, Star, Users, BookOpen } from "lucide-react";

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

export function Hero() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white py-20 pt-32 md:py-28 md:pt-40"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Main Content */}
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              +15 000 élèves nous font confiance
            </span>
          </motion.div>

          {/* Headline - UN titre fort */}
          <motion.h1
            variants={itemVariants}
            className="mt-8 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
          >
            Des cours créés par des profs,
            <br />
            <span className="text-emerald-600">pas par des algorithmes.</span>
          </motion.h1>

          {/* Subheadline - 2 lignes max */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 md:text-xl"
          >
            Achetez uniquement les cours dont votre enfant a besoin. Un
            paiement, un accès à vie. Du CP à la Terminale.
          </motion.p>

          {/* UN CTA principal */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              Découvrir les cours
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-4 text-base font-medium text-gray-700 transition-all hover:bg-gray-50"
            >
              <Play className="h-5 w-5 text-emerald-500" />
              Voir la démo
            </Link>
          </motion.div>

          {/* Prix exemple */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-sm text-gray-500"
          >
            À partir de{" "}
            <span className="font-semibold text-emerald-600">2,99€</span> le
            cours
            {" • "}
            70% reversés au professeur
          </motion.p>

          {/* Social proof simplifié */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-wrap items-center justify-center gap-8"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[
                  "bg-blue-500",
                  "bg-purple-500",
                  "bg-orange-500",
                  "bg-pink-500",
                ].map((color, i) => (
                  <div
                    key={i}
                    className={`h-8 w-8 rounded-full ${color} border-2 border-white flex items-center justify-center text-xs font-bold text-white`}
                  >
                    {["E", "L", "M", "S"][i]}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">15 000+</p>
                <p className="text-xs text-gray-500">Élèves actifs</p>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">4.9/5</p>
                <p className="text-xs text-gray-500">Note moyenne</p>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-500" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">300+</p>
                <p className="text-xs text-gray-500">Profs vérifiés</p>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">1 200+</p>
                <p className="text-xs text-gray-500">Cours</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
