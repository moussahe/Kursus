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
    color: "bg-blue-500",
  },
  {
    title: "Conjugaison passé simple",
    subject: "Français",
    level: "CM2",
    price: "2,99€",
    color: "bg-purple-500",
  },
  {
    title: "Équations 1er degré",
    subject: "Maths",
    level: "4ème",
    price: "4,99€",
    color: "bg-emerald-500",
  },
  {
    title: "Révisions Brevet Français",
    subject: "Français",
    level: "3ème",
    price: "9,99€",
    color: "bg-orange-500",
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
      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${color} text-white`}
        >
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{title}</h4>
          <p className="text-xs text-gray-500">
            {subject} • {level}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xl font-bold text-emerald-600">{price}</span>
        <span className="text-xs text-gray-400">Accès à vie</span>
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
      className={`relative rounded-2xl border p-5 text-center transition-all ${
        popular
          ? "border-emerald-200 bg-emerald-50 shadow-md"
          : "border-gray-100 bg-white shadow-sm hover:shadow-md"
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
            <Sparkles className="h-3 w-3" />
            Meilleur choix
          </span>
        </div>
      )}
      <h4 className="text-lg font-bold text-gray-900">{name}</h4>
      <p className="mt-1 text-sm text-gray-500">
        Valeur <span className="line-through">{credits}</span>
      </p>
      <p className="mt-2 text-3xl font-bold text-emerald-600">{price}</p>
      <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
        {discount}
      </span>
      <p className="mt-3 text-xs text-gray-500">Validité 2 ans</p>
    </motion.div>
  );
}

export function PricingPreview() {
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
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600">
              <ShoppingBag className="h-4 w-4" />
              Achetez uniquement ce dont vous avez besoin
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Pas d&apos;abonnement qui dort.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Des cours de qualité professionnelle à prix accessible. Un
              paiement, un accès à vie.
            </p>
          </motion.div>

          {/* Exemples de cours */}
          <motion.div variants={itemVariants} className="mt-12">
            <h3 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-gray-500">
              Exemples de cours populaires
            </h3>
            <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {coursExamples.map((course) => (
                <CourseCard key={course.title} {...course} />
              ))}
            </div>
          </motion.div>

          {/* Avantages clés */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-6 text-sm"
          >
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="h-5 w-5 text-emerald-500" />
              <span>Pas d&apos;abonnement</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="h-5 w-5 text-emerald-500" />
              <span>Accès illimité à vie</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="h-5 w-5 text-emerald-500" />
              <span>70% reversés au professeur</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="h-5 w-5 text-emerald-500" />
              <span>Satisfait ou remboursé 14j</span>
            </div>
          </motion.div>

          {/* Carnets de cours */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mt-16 max-w-3xl rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm"
          >
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                <GraduationCap className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Carnet de Cours
                </h3>
                <p className="text-sm text-gray-500">
                  Économisez en achetant des crédits
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {carnets.map((carnet) => (
                <CarnetCard key={carnet.name} {...carnet} />
              ))}
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Les crédits s&apos;adaptent au prix du cours. Utilisez-les quand
              vous voulez, pour n&apos;importe quel cours.
            </p>
          </motion.div>

          {/* Pack Fratrie teaser */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4"
          >
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-semibold text-gray-900">Plusieurs enfants ?</p>
              <p className="text-sm text-gray-600">
                Pack Fratrie : -20% pour le 2ème enfant, -30% pour le 3ème sur
                le même cours
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={itemVariants} className="mt-12 text-center">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-emerald-600"
            >
              Découvrir les cours
              <ArrowRight className="h-5 w-5" />
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
