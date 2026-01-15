"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Play,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  Trophy,
  Sparkles,
  Send,
  ChevronRight,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
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
      stiffness: 100,
      damping: 15,
    },
  },
};

// Mockup de l'interface de cours
function CourseMockup() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      {/* Header du cours */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Les fractions - Niveau 6ème
            </p>
            <p className="text-xs text-gray-500">Chapitre 3 : Additions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
            75% complété
          </span>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid md:grid-cols-3">
        {/* Sidebar navigation */}
        <div className="border-r border-gray-100 bg-gray-50/50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Sommaire
          </p>
          <div className="space-y-2">
            {[
              { title: "Introduction aux fractions", done: true },
              { title: "Fractions équivalentes", done: true },
              { title: "Additions de fractions", done: false, current: true },
              { title: "Soustractions", done: false },
              { title: "Quiz final", done: false },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  item.current
                    ? "bg-emerald-100 text-emerald-700 font-medium"
                    : item.done
                      ? "text-gray-500"
                      : "text-gray-400"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : item.current ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                )}
                <span className="truncate">{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zone vidéo/contenu */}
        <div className="col-span-2 p-6">
          {/* Fausse vidéo */}
          <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110">
                <Play className="h-8 w-8 text-white" fill="white" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 text-white/80">
                <span className="text-sm">2:34 / 8:45</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                  <div className="h-full w-[30%] rounded-full bg-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Explications textuelles */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">
              Additionner deux fractions
            </h3>
            <p className="text-sm text-gray-600">
              Pour additionner deux fractions, il faut d&apos;abord
              qu&apos;elles aient le <strong>même dénominateur</strong>. Une
              fois les fractions réduites au même dénominateur...
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>
                Astuce : Utilise les tables de multiplication pour trouver le
                dénominateur commun !
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar en bas */}
      <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-emerald-600">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">+50 XP</span>
            </div>
            <span className="text-gray-500">3 leçons terminées sur 5</span>
          </div>
          <button className="flex items-center gap-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600">
            Continuer
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Mockup de l'assistant IA
function AIMockup() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-white">Assistant IA</p>
          <p className="text-xs text-white/80">
            Aide aux devoirs personnalisée
          </p>
        </div>
      </div>

      {/* Chat */}
      <div className="h-[320px] space-y-4 overflow-y-auto p-4">
        {/* Message utilisateur */}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-emerald-500 px-4 py-2 text-sm text-white">
            Je ne comprends pas comment additionner 1/3 + 1/4
          </div>
        </div>

        {/* Réponse IA */}
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div className="space-y-2">
            <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-sm text-gray-700">
              <p className="mb-2">
                Super question ! Pour additionner <strong>1/3 + 1/4</strong>, il
                faut trouver un dénominateur commun.
              </p>
              <p className="mb-2">
                Le plus petit multiple commun de 3 et 4 est <strong>12</strong>.
              </p>
              <div className="my-3 rounded-lg bg-white p-3 font-mono text-center">
                <p>1/3 = 4/12</p>
                <p>1/4 = 3/12</p>
                <p className="mt-2 border-t pt-2 text-emerald-600">
                  4/12 + 3/12 = <strong>7/12</strong>
                </p>
              </div>
              <p>
                La réponse est donc <strong>7/12</strong> !
              </p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50">
                Explique autrement
              </button>
              <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50">
                Un autre exemple
              </button>
            </div>
          </div>
        </div>

        {/* Message utilisateur */}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-emerald-500 px-4 py-2 text-sm text-white">
            Merci ! Et pour 2/5 + 1/3 ?
          </div>
        </div>

        {/* Typing indicator */}
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3">
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2">
          <MessageSquare className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pose ta question..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            disabled
          />
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white transition-colors hover:bg-emerald-600">
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">
          L&apos;IA guide sans donner les réponses directement
        </p>
      </div>
    </div>
  );
}

export function ProductPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-white py-20">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-600">
              <Play className="h-4 w-4" />
              Découvrez l&apos;expérience Schoolaris
            </span>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Voyez ce que votre enfant va utiliser
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Des cours interactifs et un assistant IA pour accompagner chaque
              élève dans sa progression.
            </p>
          </motion.div>

          {/* Previews */}
          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {/* Course Preview */}
            <motion.div variants={itemVariants}>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Interface de cours
                  </h3>
                  <p className="text-sm text-gray-500">
                    Vidéos, exercices et suivi de progression
                  </p>
                </div>
              </div>
              <CourseMockup />
            </motion.div>

            {/* AI Preview */}
            <motion.div variants={itemVariants}>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Assistant IA intégré
                  </h3>
                  <p className="text-sm text-gray-500">
                    Aide personnalisée 24h/24
                  </p>
                </div>
              </div>
              <AIMockup />
            </motion.div>
          </div>

          {/* Features */}
          <motion.div
            variants={itemVariants}
            className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                icon: Play,
                title: "Vidéos HD",
                description: "Cours filmés par des profs certifiés",
              },
              {
                icon: MessageSquare,
                title: "IA pédagogique",
                description: "Guide sans donner les réponses",
              },
              {
                icon: Trophy,
                title: "Gamification",
                description: "XP, badges et classements",
              },
              {
                icon: CheckCircle2,
                title: "Suivi détaillé",
                description: "Progression visible par les parents",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <feature.icon className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
