"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Play,
  Star,
  Users,
  BookOpen,
  Sparkles,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 20,
    },
  },
};

export function Hero() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-[#0a0a0a] py-20 pt-32 md:py-32 md:pt-44"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff9494] opacity-[0.08] blur-[120px]" />
        <div className="absolute right-1/4 top-1/2 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-[#c7ff69] opacity-[0.06] blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-[#7a78ff] opacity-[0.05] blur-[100px]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Main Content */}
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-5xl text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ff9494]/20 bg-[#ff9494]/10 px-4 py-2 text-sm font-medium text-[#ff9494]">
              <Sparkles className="h-4 w-4" />
              +15 000 élèves nous font confiance
            </span>
          </motion.div>

          {/* Headline - Bold nvg8.io style */}
          <motion.h1
            variants={itemVariants}
            className="mt-8 text-5xl font-black tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
            style={{ letterSpacing: "-0.04em" }}
          >
            Des cours créés par
            <br />
            <span className="text-gradient">de vrais profs.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-8 max-w-2xl text-lg text-gray-400 md:text-xl"
          >
            Achetez uniquement les cours dont votre enfant a besoin.{" "}
            <span className="text-white">Un paiement, un accès à vie.</span> Du
            CP à la Terminale.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/courses"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#ff9494] px-8 py-4 text-base font-semibold text-[#0a0a0a] transition-all duration-300 hover:bg-[#ffb8b8] hover:shadow-[0_0_40px_-10px_rgba(255,109,56,0.5)]"
            >
              Découvrir les cours
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/demo"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-base font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10"
            >
              <Play className="h-5 w-5 text-[#c7ff69]" />
              Voir la démo
            </Link>
          </motion.div>

          {/* Price point */}
          <motion.p
            variants={itemVariants}
            className="mt-8 text-sm text-gray-500"
          >
            À partir de{" "}
            <span className="font-semibold text-[#c7ff69]">2,99€</span> le cours
            {" • "}
            <span className="text-gray-400">70% reversés au professeur</span>
          </motion.p>

          {/* Social proof */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12"
          >
            {/* Students */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  "bg-[#ff9494]",
                  "bg-[#7a78ff]",
                  "bg-[#c7ff69]",
                  "bg-[#ff9494]",
                ].map((color, i) => (
                  <div
                    key={i}
                    className={`h-10 w-10 rounded-full ${color} border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-bold text-[#0a0a0a]`}
                  >
                    {["E", "L", "M", "S"][i]}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-white">15 000+</p>
                <p className="text-xs text-gray-500">Élèves actifs</p>
              </div>
            </div>

            <div className="h-10 w-px bg-white/10 hidden sm:block" />

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-[#ff9494] text-[#ff9494]"
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-white">4.9/5</p>
                <p className="text-xs text-gray-500">Note moyenne</p>
              </div>
            </div>

            <div className="h-10 w-px bg-white/10 hidden sm:block" />

            {/* Teachers */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c7ff69]/10">
                <Users className="h-5 w-5 text-[#c7ff69]" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-white">300+</p>
                <p className="text-xs text-gray-500">Profs vérifiés</p>
              </div>
            </div>

            <div className="h-10 w-px bg-white/10 hidden sm:block" />

            {/* Courses */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7a78ff]/10">
                <BookOpen className="h-5 w-5 text-[#7a78ff]" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-white">1 200+</p>
                <p className="text-xs text-gray-500">Cours</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </section>
  );
}
