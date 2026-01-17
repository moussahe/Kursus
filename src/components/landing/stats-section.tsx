"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, Users, GraduationCap, ThumbsUp } from "lucide-react";

const stats = [
  {
    value: "1,200+",
    label: "Cours d'exception",
    icon: BookOpen,
    description: "Créés par des experts",
    color: "orange",
  },
  {
    value: "300+",
    label: "Enseignants passionnés",
    icon: Users,
    description: "Vérifiés et certifiés",
    color: "lime",
  },
  {
    value: "15,000+",
    label: "Élèves accompagnés",
    icon: GraduationCap,
    description: "Dans toute la France",
    color: "purple",
  },
  {
    value: "98%",
    label: "Satisfaction",
    icon: ThumbsUp,
    description: "Recommandent Kursus",
    color: "orange",
  },
];

const colorClasses = {
  orange: {
    bg: "bg-[#ff6d38]/10",
    icon: "text-[#ff6d38]",
    border: "border-[#ff6d38]/20",
  },
  lime: {
    bg: "bg-[#c7ff69]/10",
    icon: "text-[#c7ff69]",
    border: "border-[#c7ff69]/20",
  },
  purple: {
    bg: "bg-[#7a78ff]/10",
    icon: "text-[#7a78ff]",
    border: "border-[#7a78ff]/20",
  },
};

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="w-full bg-[#0a0a0a] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c7ff69]/20 bg-[#c7ff69]/10 px-4 py-2 text-sm font-medium text-[#c7ff69]">
            Notre Impact
          </span>
          <h2
            className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl"
            style={{ letterSpacing: "-0.04em" }}
          >
            Des chiffres qui parlent
            <br />
            <span className="text-gradient">d&apos;eux-mêmes.</span>
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {stats.map((stat, index) => {
            const colors =
              colorClasses[stat.color as keyof typeof colorClasses];
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl border ${colors.border} bg-white/[0.02] p-8 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05] hover:border-white/10`}
              >
                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at center, ${stat.color === "orange" ? "rgba(255,109,56,0.1)" : stat.color === "lime" ? "rgba(199,255,105,0.1)" : "rgba(122,120,255,0.1)"} 0%, transparent 70%)`,
                  }}
                />

                {/* Icon */}
                <div
                  className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-xl ${colors.bg} transition-transform duration-300 group-hover:scale-110`}
                >
                  <stat.icon className={`h-8 w-8 ${colors.icon}`} />
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
                  className="relative text-4xl font-black text-white sm:text-5xl"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  {stat.value}
                </motion.span>

                {/* Label */}
                <span className="relative mt-3 text-lg font-semibold leading-relaxed text-white">
                  {stat.label}
                </span>

                {/* Description */}
                <span className="relative mt-2 text-base leading-relaxed text-gray-500">
                  {stat.description}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-white/5 pt-12"
        >
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="h-2 w-2 rounded-full bg-[#c7ff69]" />
            Paiements sécurisés
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="h-2 w-2 rounded-full bg-[#c7ff69]" />
            Données protégées RGPD
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="h-2 w-2 rounded-full bg-[#c7ff69]" />
            Support 7j/7
          </div>
        </motion.div>
      </div>
    </section>
  );
}
