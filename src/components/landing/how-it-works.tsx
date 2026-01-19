"use client";

import { useRef } from "react";
import { BookOpenCheck, GraduationCap, Users } from "lucide-react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    icon: BookOpenCheck,
    title: "Choisissez votre cours",
    description:
      "Parcourez notre catalogue et trouvez le cours parfait pour vos besoins.",
    color: "#ff9494",
  },
  {
    icon: Users,
    title: "Apprenez à votre rythme",
    description:
      "Progressez selon votre emploi du temps avec nos tuteurs experts.",
    color: "#ff9494",
  },
  {
    icon: GraduationCap,
    title: "Réussissez vos examens",
    description:
      "Atteignez vos objectifs académiques et excellez dans vos examens.",
    color: "#ff9494",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="bg-[#0a0a0a] py-24 sm:py-32 border-t border-[#2a2a2a]"
    >
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ff9494]/20 bg-[#ff9494]/10 px-4 py-2 text-sm font-medium text-[#ff9494]">
              Simple et efficace
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-3xl font-black text-white sm:text-4xl md:text-5xl"
            style={{ letterSpacing: "-0.04em" }}
          >
            Comment ça marche ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg text-gray-400"
          >
            Trois étapes simples pour transformer votre avenir académique.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line */}
          <div
            className="absolute left-1/2 top-1/2 hidden h-px w-2/3 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent lg:block"
            aria-hidden="true"
          />

          <motion.div
            className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                className="relative z-10 flex flex-col items-center text-center"
                variants={itemVariants}
              >
                {/* Icon Circle */}
                <div className="relative mb-8">
                  <div
                    className="flex h-28 w-28 items-center justify-center rounded-2xl border bg-[#1a1a1a] transition-all duration-300 hover:scale-105"
                    style={{
                      borderColor: `${step.color}30`,
                      boxShadow: `0 0 40px -10px ${step.color}30`,
                    }}
                  >
                    <step.icon
                      className="h-14 w-14"
                      style={{ color: step.color }}
                      strokeWidth={1.5}
                    />
                  </div>
                  {/* Number Badge */}
                  <span
                    className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-[#0a0a0a]"
                    style={{ backgroundColor: step.color }}
                  >
                    0{index + 1}
                  </span>
                </div>

                {/* Text */}
                <h3 className="mb-4 text-xl font-bold leading-tight text-white">
                  {step.title}
                </h3>
                <p className="max-w-sm text-base leading-relaxed text-gray-400">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
