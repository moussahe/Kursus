"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  DollarSign,
  Users,
  BookOpen,
  Rocket,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WelcomeStepProps {
  onNext: () => void;
  userName: string;
}

const VALUE_PROPS = [
  {
    icon: DollarSign,
    title: "70% des revenus",
    description:
      "La commission la plus genereuse du marche. Vous gardez 70% de chaque vente.",
    highlight: "70%",
  },
  {
    icon: Sparkles,
    title: "IA Assistant",
    description:
      "Notre IA vous aide a creer des cours de qualite en quelques minutes.",
    highlight: "10 min",
  },
  {
    icon: Users,
    title: "Audience captive",
    description:
      "Des milliers de parents cherchent du contenu de qualite pour leurs enfants.",
    highlight: "10K+",
  },
  {
    icon: BookOpen,
    title: "Liberte totale",
    description:
      "Vous fixez vos prix, votre planning, et gardez les droits sur vos contenus.",
    highlight: "100%",
  },
];

const TESTIMONIALS = [
  {
    name: "Sophie M.",
    role: "Prof de Maths",
    content:
      "J'ai cree mon premier cours en 15 minutes grace a l'IA. Deja 50 ventes ce mois-ci!",
    revenue: "1,200",
  },
  {
    name: "Pierre D.",
    role: "Prof d'Histoire",
    content:
      "Enfin une plateforme qui respecte notre travail. Le 70% change tout.",
    revenue: "800",
  },
];

export function WelcomeStep({ onNext, userName }: WelcomeStepProps) {
  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Hero Section */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7a78ff] to-[#6366f1]"
        >
          <Rocket className="h-8 w-8 text-white" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-gray-900 sm:text-3xl"
        >
          Bienvenue {userName.split(" ")[0]} !
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-gray-600"
        >
          Vous etes a quelques minutes de publier votre premier cours et
          commencer a gagner de l&apos;argent.
        </motion.p>
      </div>

      {/* Value Props Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {VALUE_PROPS.map((prop) => (
          <Card
            key={prop.title}
            className="group overflow-hidden rounded-2xl border-0 bg-gray-50 transition-all hover:bg-[#7a78ff]/10 hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm group-hover:bg-[#7a78ff]/20">
                  <prop.icon className="h-6 w-6 text-[#7a78ff]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {prop.title}
                    </h3>
                    <span className="rounded-full bg-[#7a78ff]/10 px-2 py-0.5 text-xs font-bold text-[#7a78ff]">
                      {prop.highlight}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {prop.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-amber-100 bg-amber-50 p-4"
      >
        <h3 className="mb-3 text-sm font-semibold text-amber-900">
          Ce que disent nos professeurs
        </h3>
        <div className="space-y-3">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-xl bg-white p-3 shadow-sm"
            >
              <p className="text-sm text-gray-700">
                &quot;{testimonial.content}&quot;
              </p>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#7a78ff]">
                    +{testimonial.revenue} EUR
                  </p>
                  <p className="text-xs text-gray-500">ce mois</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* What we'll do */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-gray-50 p-4"
      >
        <h3 className="mb-3 font-semibold text-gray-900">
          En 3 etapes simples :
        </h3>
        <div className="space-y-2">
          {[
            "Completez votre profil professeur",
            "Creez votre premier cours avec l'IA",
            "Publiez et commencez a vendre",
          ].map((step, idx) => (
            <div key={step} className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7a78ff] text-xs font-bold text-white">
                {idx + 1}
              </div>
              <span className="text-sm text-gray-700">{step}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1 text-xs text-gray-500">
          <CheckCircle2 className="h-3 w-3 text-[#7a78ff]" />
          Temps estime : 10 minutes
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          onClick={onNext}
          size="lg"
          className="w-full rounded-xl bg-[#7a78ff] py-6 text-lg font-semibold hover:bg-[#6966ff]"
        >
          Commencer maintenant
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <p className="mt-3 text-center text-xs text-gray-500">
          Gratuit et sans engagement. Vous pouvez publier votre premier cours
          aujourd&apos;hui.
        </p>
      </motion.div>
    </div>
  );
}
