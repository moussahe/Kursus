"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, Users, GraduationCap, ThumbsUp } from "lucide-react";

const stats = [
  {
    value: "1,200+",
    label: "Cours d'exception",
    icon: BookOpen,
    description: "Crees par des experts",
    color: "emerald",
  },
  {
    value: "300+",
    label: "Enseignants passionnes",
    icon: Users,
    description: "Verifies et certifies",
    color: "blue",
  },
  {
    value: "15,000+",
    label: "Élèves accompagnes",
    icon: GraduationCap,
    description: "Dans toute la France",
    color: "purple",
  },
  {
    value: "98%",
    label: "Satisfaction",
    icon: ThumbsUp,
    description: "Recommandent Schoolaris",
    color: "orange",
  },
];

const colorClasses = {
  emerald: {
    bg: "bg-emerald-50",
    icon: "text-emerald-500",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-500",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-500",
  },
  orange: {
    bg: "bg-orange-50",
    icon: "text-orange-500",
  },
};

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="w-full bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Notre Impact
          </h2>
          <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Des chiffres qui parlent d&apos;eux-memes
          </p>
        </motion.div>

        {/* Stats Grid - Full Width */}
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {stats.map((stat, index) => {
            const colors =
              colorClasses[stat.color as keyof typeof colorClasses];
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md border border-gray-100"
              >
                {/* Icon */}
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${colors.bg} transition-colors`}
                >
                  <stat.icon className={`h-7 w-7 ${colors.icon}`} />
                </div>

                {/* Value */}
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{
                    type: "spring" as const,
                    stiffness: 100,
                    delay: index * 0.1 + 0.2,
                  }}
                  className="text-3xl font-bold text-gray-900 sm:text-4xl"
                >
                  {stat.value}
                </motion.span>

                {/* Label */}
                <span className="mt-2 text-base font-semibold text-gray-900">
                  {stat.label}
                </span>

                {/* Description */}
                <span className="mt-1 text-sm text-gray-500">
                  {stat.description}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 border-t border-gray-100 pt-8"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            Paiements sécurisés
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            Donnees protegees RGPD
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            Support 7j/7
          </div>
        </motion.div>
      </div>
    </section>
  );
}
