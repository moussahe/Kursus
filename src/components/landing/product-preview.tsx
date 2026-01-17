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

// Mockup de l'interface de cours - Dark Mode
function CourseMockup() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] shadow-2xl">
      {/* Header du cours */}
      <div className="flex items-center justify-between border-b border-[#2a2a2a] bg-[#141414] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6d38] text-white">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Les fractions - Niveau 6ème
            </p>
            <p className="text-xs text-gray-500">Chapitre 3 : Additions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#c7ff69]/10 border border-[#c7ff69]/20 px-2 py-1 text-xs font-medium text-[#c7ff69]">
            75% complété
          </span>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid md:grid-cols-3">
        {/* Sidebar navigation */}
        <div className="border-r border-[#2a2a2a] bg-[#141414]/50 p-4">
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
                    ? "bg-[#ff6d38]/10 border border-[#ff6d38]/20 text-[#ff6d38] font-medium"
                    : item.done
                      ? "text-gray-500"
                      : "text-gray-600"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-[#c7ff69]" />
                ) : item.current ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-[#2a2a2a]" />
                )}
                <span className="truncate">{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zone vidéo/contenu */}
        <div className="col-span-2 p-6">
          {/* Fausse vidéo */}
          <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-[#ff6d38] to-[#ff8c5a]">
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
            <h3 className="font-semibold text-white">
              Additionner deux fractions
            </h3>
            <p className="text-sm text-gray-400">
              Pour additionner deux fractions, il faut d&apos;abord
              qu&apos;elles aient le{" "}
              <strong className="text-white">même dénominateur</strong>. Une
              fois les fractions réduites au même dénominateur...
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-[#ff6d38]/20 bg-[#ff6d38]/10 p-3 text-sm text-[#ff6d38]">
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
      <div className="border-t border-[#2a2a2a] bg-[#141414] px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[#c7ff69]">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">+50 XP</span>
            </div>
            <span className="text-gray-500">3 leçons terminées sur 5</span>
          </div>
          <button className="flex items-center gap-1 rounded-full bg-[#ff6d38] px-4 py-2 text-sm font-medium text-[#0a0a0a] transition-all hover:bg-[#ff8c5a] hover:shadow-[0_0_20px_-5px_rgba(255,109,56,0.5)]">
            Continuer
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Mockup de l'assistant IA - Dark Mode
function AIMockup() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#2a2a2a] bg-gradient-to-r from-[#7a78ff] to-[#9997ff] px-4 py-3">
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
          <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#ff6d38] px-4 py-2 text-sm text-white">
            Je ne comprends pas comment additionner 1/3 + 1/4
          </div>
        </div>

        {/* Réponse IA */}
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7a78ff]/20">
            <Sparkles className="h-4 w-4 text-[#7a78ff]" />
          </div>
          <div className="space-y-2">
            <div className="rounded-2xl rounded-tl-sm border border-[#2a2a2a] bg-[#141414] px-4 py-3 text-sm text-gray-300">
              <p className="mb-2">
                Super question ! Pour additionner{" "}
                <strong className="text-white">1/3 + 1/4</strong>, il faut
                trouver un dénominateur commun.
              </p>
              <p className="mb-2">
                Le plus petit multiple commun de 3 et 4 est{" "}
                <strong className="text-white">12</strong>.
              </p>
              <div className="my-3 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] p-3 font-mono text-center">
                <p className="text-gray-400">1/3 = 4/12</p>
                <p className="text-gray-400">1/4 = 3/12</p>
                <p className="mt-2 border-t border-[#2a2a2a] pt-2 text-[#c7ff69]">
                  4/12 + 3/12 = <strong>7/12</strong>
                </p>
              </div>
              <p>
                La réponse est donc{" "}
                <strong className="text-[#c7ff69]">7/12</strong> !
              </p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-[#2a2a2a] hover:text-white">
                Explique autrement
              </button>
              <button className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-[#2a2a2a] hover:text-white">
                Un autre exemple
              </button>
            </div>
          </div>
        </div>

        {/* Message utilisateur */}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#ff6d38] px-4 py-2 text-sm text-white">
            Merci ! Et pour 2/5 + 1/3 ?
          </div>
        </div>

        {/* Typing indicator */}
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7a78ff]/20">
            <Sparkles className="h-4 w-4 text-[#7a78ff]" />
          </div>
          <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-[#2a2a2a] bg-[#141414] px-4 py-3">
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[#2a2a2a] p-4">
        <div className="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-2">
          <MessageSquare className="h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Pose ta question..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            disabled
          />
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6d38] text-[#0a0a0a] transition-all hover:bg-[#ff8c5a]">
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-500">
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
    <section ref={ref} className="bg-[#0a0a0a] py-24 border-t border-[#2a2a2a]">
      <div className="container mx-auto max-w-7xl px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#7a78ff]/20 bg-[#7a78ff]/10 px-4 py-2 text-sm font-medium text-[#7a78ff]">
              <Play className="h-4 w-4" />
              Découvrez l&apos;expérience Kursus
            </span>

            <h2
              className="mt-6 text-3xl font-black tracking-tight text-white md:text-4xl lg:text-5xl"
              style={{ letterSpacing: "-0.04em" }}
            >
              Voyez ce que votre enfant
              <br />
              <span className="text-gradient">va utiliser.</span>
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
              Des cours interactifs et un assistant IA pour accompagner chaque
              élève dans sa progression.
            </p>
          </motion.div>

          {/* Previews */}
          <div className="mt-20 grid gap-10 lg:grid-cols-2 lg:gap-12">
            {/* Course Preview */}
            <motion.div variants={itemVariants}>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff6d38]/10 border border-[#ff6d38]/20">
                  <BookOpen className="h-6 w-6 text-[#ff6d38]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Interface de cours
                  </h3>
                  <p className="text-base text-gray-500">
                    Vidéos, exercices et suivi de progression
                  </p>
                </div>
              </div>
              <CourseMockup />
            </motion.div>

            {/* AI Preview */}
            <motion.div variants={itemVariants}>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7a78ff]/10 border border-[#7a78ff]/20">
                  <Sparkles className="h-6 w-6 text-[#7a78ff]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Assistant IA intégré
                  </h3>
                  <p className="text-base text-gray-500">
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
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                icon: Play,
                title: "Vidéos HD",
                description: "Cours filmés par des profs certifiés",
                color: "#ff6d38",
              },
              {
                icon: MessageSquare,
                title: "IA pédagogique",
                description: "Guide sans donner les réponses",
                color: "#7a78ff",
              },
              {
                icon: Trophy,
                title: "Gamification",
                description: "XP, badges et classements",
                color: "#c7ff69",
              },
              {
                icon: CheckCircle2,
                title: "Suivi détaillé",
                description: "Progression visible par les parents",
                color: "#ff6d38",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group flex items-start gap-4 rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 transition-all duration-300 hover:border-white/10 hover:bg-[#1a1a1a]/80"
                style={{
                  boxShadow: "0 0 0 0 transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 40px -10px ${feature.color}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 0 transparent";
                }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${feature.color}15`,
                    borderColor: `${feature.color}30`,
                    borderWidth: 1,
                  }}
                >
                  <feature.icon
                    className="h-6 w-6"
                    style={{ color: feature.color }}
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h4>
                  <p className="mt-1 text-base leading-relaxed text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
