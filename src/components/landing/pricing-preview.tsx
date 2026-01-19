"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Check,
  ShoppingBag,
  ArrowRight,
  BookOpen,
  Users,
  Sparkles,
  GraduationCap,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

// Exemples de cours concrets
const coursExamples = [
  {
    title: "Les angles en 6ème",
    subject: "Maths",
    level: "6ème",
    price: "3,49€",
    color: "#ff9494",
  },
  {
    title: "Conjugaison passé simple",
    subject: "Français",
    level: "CM2",
    price: "2,99€",
    color: "#ff9494",
  },
  {
    title: "Équations 1er degré",
    subject: "Maths",
    level: "4ème",
    price: "4,99€",
    color: "#ff9494",
  },
  {
    title: "Révisions Brevet Français",
    subject: "Français",
    level: "3ème",
    price: "9,99€",
    color: "#ff9494",
  },
];

// Carnets de cours
const carnets = [
  {
    name: "Carnet 5",
    credits: "25€",
    price: "23€",
    discount: "-8%",
    popular: false,
  },
  {
    name: "Carnet 10",
    credits: "50€",
    price: "45€",
    discount: "-10%",
    popular: true,
  },
  {
    name: "Carnet 20",
    credits: "100€",
    price: "85€",
    discount: "-15%",
    popular: false,
  },
];

function CourseCard({
  title,
  subject,
  level,
  price,
  color,
}: {
  title: string;
  subject: string;
  level: string;
  price: string;
  color: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="group relative overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 transition-all duration-300 hover:border-white/10"
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
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border"
          style={{ backgroundColor: `${color}15`, borderColor: `${color}30` }}
        >
          <BookOpen className="h-6 w-6" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold leading-tight text-white">
            {title}
          </h4>
          <p className="mt-1 text-sm text-gray-500">
            {subject} • {level}
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[#2a2a2a] pt-4">
        <span className="text-2xl font-bold" style={{ color }}>
          {price}
        </span>
        <span className="text-sm text-gray-500">Accès à vie</span>
      </div>
    </motion.div>
  );
}

function CarnetCard({
  name,
  credits,
  price,
  discount,
  popular,
}: {
  name: string;
  credits: string;
  price: string;
  discount: string;
  popular: boolean;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={`relative min-h-[220px] rounded-2xl border p-8 text-center transition-all duration-300 ${
        popular
          ? "border-[#ff9494]/30 bg-[#ff9494]/5"
          : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-white/10"
      }`}
      style={{
        boxShadow: popular ? "0 0 60px -15px rgba(255,109,56,0.3)" : "none",
      }}
    >
      {popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#ff9494] px-4 py-1.5 text-sm font-bold text-[#0a0a0a]">
            <Sparkles className="h-4 w-4" />
            Meilleur choix
          </span>
        </div>
      )}
      <h4 className="text-xl font-bold text-white">{name}</h4>
      <p className="mt-2 text-base text-gray-500">
        Valeur <span className="line-through">{credits}</span>
      </p>
      <p className="mt-4 text-4xl font-bold text-[#ff9494]">{price}</p>
      <span className="mt-3 inline-block rounded-full border border-[#ff9494]/20 bg-[#ff9494]/10 px-3 py-1 text-sm font-semibold text-[#ff9494]">
        {discount}
      </span>
      <p className="mt-4 text-sm text-gray-500">Validité 2 ans</p>
    </motion.div>
  );
}

export function PricingPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-[#0a0a0a] py-24 border-t border-[#2a2a2a]">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#ff9494]/20 bg-[#ff9494]/10 px-4 py-2 text-sm font-medium text-[#ff9494]">
              <ShoppingBag className="h-4 w-4" />
              Achetez uniquement ce dont vous avez besoin
            </div>

            <h2
              className="text-3xl font-black tracking-tight text-white md:text-4xl lg:text-5xl"
              style={{ letterSpacing: "-0.04em" }}
            >
              Pas d&apos;abonnement
              <br />
              <span className="text-gradient">qui dort.</span>
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
              Des cours de qualité professionnelle à prix accessible. Un
              paiement, un accès à vie.
            </p>
          </motion.div>

          {/* Exemples de cours */}
          <motion.div variants={itemVariants} className="mt-16">
            <h3 className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-gray-500">
              Exemples de cours populaires
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {coursExamples.map((course) => (
                <CourseCard key={course.title} {...course} />
              ))}
            </div>
          </motion.div>

          {/* Avantages clés */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mt-14 flex flex-wrap items-center justify-center gap-8 text-base"
          >
            {[
              "Pas d'abonnement",
              "Accès illimité à vie",
              "70% reversés au professeur",
              "Satisfait ou remboursé 14j",
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-gray-400">
                <Check className="h-6 w-6 flex-shrink-0 text-[#ff9494]" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Carnets de cours */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mt-20 rounded-3xl border border-[#2a2a2a] bg-[#141414] p-8 lg:p-12"
          >
            <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ff9494]/20 bg-[#ff9494]/10">
                <GraduationCap className="h-7 w-7 text-[#ff9494]" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-white">
                  Carnet de Cours
                </h3>
                <p className="mt-1 text-base text-gray-500">
                  Économisez en achetant des crédits
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 lg:gap-8">
              {carnets.map((carnet) => (
                <CarnetCard key={carnet.name} {...carnet} />
              ))}
            </div>

            <p className="mt-8 text-center text-base leading-relaxed text-gray-500">
              Les crédits s&apos;adaptent au prix du cours. Utilisez-les quand
              vous voulez, pour n&apos;importe quel cours.
            </p>
          </motion.div>

          {/* Pack Fratrie teaser */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mt-10 flex max-w-2xl flex-col items-center justify-center gap-4 rounded-2xl border border-[#ff9494]/20 bg-[#ff9494]/5 p-6 sm:flex-row sm:gap-6"
          >
            <Users className="h-10 w-10 flex-shrink-0 text-[#ff9494]" />
            <div className="text-center sm:text-left">
              <p className="text-lg font-semibold text-white">
                Plusieurs enfants ?
              </p>
              <p className="mt-1 text-base leading-relaxed text-gray-400">
                Pack Fratrie : -20% pour le 2ème enfant, -30% pour le 3ème sur
                le même cours
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={itemVariants} className="mt-12 text-center">
            <Link
              href="/courses"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#ff9494] px-8 py-4 text-base font-semibold text-[#0a0a0a] transition-all hover:bg-[#ffb8b8] hover:shadow-[0_0_40px_-10px_rgba(255,109,56,0.5)]"
            >
              Découvrir les cours
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Plus de 1 200 cours disponibles • Du CP à la Terminale
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
