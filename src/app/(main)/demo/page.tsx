"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  GraduationCap,
  Languages,
  Sparkles,
  CheckCircle,
  Users,
  Clock,
  Shield,
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { AIChat } from "@/components/ai/ai-chat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEMO_SUBJECTS = [
  {
    id: "maths",
    name: "Mathematiques",
    icon: Calculator,
    level: "3eme",
    subject: "MATHEMATIQUES",
    description: "Equations, geometrie, fonctions...",
  },
  {
    id: "francais",
    name: "Francais",
    icon: BookOpen,
    level: "3eme",
    subject: "FRANCAIS",
    description: "Grammaire, conjugaison, redaction...",
  },
  {
    id: "anglais",
    name: "Anglais",
    icon: Languages,
    level: "3eme",
    subject: "ANGLAIS",
    description: "Vocabulaire, grammaire, expression...",
  },
];

const DEMO_LEVELS = [
  { id: "cm2", name: "CM2", description: "10-11 ans" },
  { id: "6eme", name: "6eme", description: "11-12 ans" },
  { id: "3eme", name: "3eme", description: "14-15 ans" },
  { id: "terminale", name: "Terminale", description: "17-18 ans" },
];

const VALUE_PROPOSITIONS = [
  {
    icon: Sparkles,
    title: "IA Pedagogique",
    description:
      "L'assistant vous guide sans donner les réponses. Methode socratique pour vraiment comprendre.",
  },
  {
    icon: Clock,
    title: "Disponible 24/7",
    description:
      "Aide aux devoirs a toute heure, meme le dimanche soir avant le controle.",
  },
  {
    icon: Shield,
    title: "Sans Inscription",
    description:
      "Testez gratuitement sans creer de compte. Vos donnees ne sont pas conservees.",
  },
];

export default function DemoPage() {
  const [selectedSubject, setSelectedSubject] = useState(DEMO_SUBJECTS[0]);
  const [selectedLevel, setSelectedLevel] = useState(DEMO_LEVELS[2]); // Default: 3eme
  const [chatKey, setChatKey] = useState(0);

  const handleSubjectChange = (subject: (typeof DEMO_SUBJECTS)[0]) => {
    setSelectedSubject(subject);
    setChatKey((prev) => prev + 1); // Reset chat when subject changes
  };

  const handleLevelChange = (level: (typeof DEMO_LEVELS)[0]) => {
    setSelectedLevel(level);
    setChatKey((prev) => prev + 1); // Reset chat when level changes
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <Header />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-[#E8A336]/10 px-4 py-2 text-sm font-medium text-[#E8A336]">
              <Sparkles className="h-4 w-4" />
              Essai Gratuit - Sans Inscription
            </div>

            <h1 className="font-serif text-4xl font-bold tracking-tight text-[#0B2A4C] md:text-5xl">
              Testez l&apos;assistant IA maintenant
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#1A1A1A]/70">
              Decouvrez comment notre IA pedagogique aide les élèves a
              comprendre leurs cours. Posez une question dans la matiere de
              votre choix.
            </p>
          </motion.div>
        </section>

        {/* Demo Interface */}
        <section className="container mx-auto px-4 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
              {/* Left: Chat */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="order-2 lg:order-1"
              >
                <AIChat
                  key={chatKey}
                  context={{
                    level: selectedLevel.name,
                    subject: selectedSubject.subject,
                    courseTitle: `Cours de ${selectedSubject.name}`,
                    lessonTitle: "Demo - Essai Gratuit",
                  }}
                  className="h-[550px] border-2 border-[#E8A336]/20 shadow-xl"
                />

                {/* Call to Action below chat */}
                <div className="mt-6 rounded-xl bg-gradient-to-r from-[#0B2A4C] to-[#1a4a7c] p-6 text-center text-white shadow-lg">
                  <h3 className="text-lg font-bold">
                    Vous aimez ? Creez un compte gratuit !
                  </h3>
                  <p className="mt-2 text-sm text-white/80">
                    Sauvegardez vos conversations, suivez la progression et
                    accedez a tous les cours.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <Link href="/register">
                      <Button className="bg-[#E8A336] text-[#0B2A4C] hover:bg-[#D4922E]">
                        S&apos;inscrire gratuitement
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/courses">
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        Explorer les cours
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Right: Controls */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="order-1 space-y-6 lg:order-2"
              >
                {/* Level Selection */}
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 font-semibold text-[#0B2A4C]">
                    <GraduationCap className="h-5 w-5 text-[#E8A336]" />
                    Choisissez un niveau
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {DEMO_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => handleLevelChange(level)}
                        className={cn(
                          "rounded-lg border-2 p-3 text-left transition-all",
                          selectedLevel.id === level.id
                            ? "border-[#E8A336] bg-[#E8A336]/5"
                            : "border-gray-100 hover:border-[#E8A336]/50",
                        )}
                      >
                        <p className="font-semibold text-[#0B2A4C]">
                          {level.name}
                        </p>
                        <p className="text-xs text-[#1A1A1A]/60">
                          {level.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Selection */}
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 font-semibold text-[#0B2A4C]">
                    <BookOpen className="h-5 w-5 text-[#E8A336]" />
                    Choisissez une matiere
                  </h3>
                  <div className="mt-4 space-y-2">
                    {DEMO_SUBJECTS.map((subject) => {
                      const Icon = subject.icon;
                      return (
                        <button
                          key={subject.id}
                          onClick={() => handleSubjectChange(subject)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-all",
                            selectedSubject.id === subject.id
                              ? "border-[#E8A336] bg-[#E8A336]/5"
                              : "border-gray-100 hover:border-[#E8A336]/50",
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-full p-2",
                              selectedSubject.id === subject.id
                                ? "bg-[#E8A336]/20"
                                : "bg-gray-100",
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-5 w-5",
                                selectedSubject.id === subject.id
                                  ? "text-[#E8A336]"
                                  : "text-[#1A1A1A]/60",
                              )}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-[#0B2A4C]">
                              {subject.name}
                            </p>
                            <p className="text-xs text-[#1A1A1A]/60">
                              {subject.description}
                            </p>
                          </div>
                          {selectedSubject.id === subject.id && (
                            <CheckCircle className="ml-auto h-5 w-5 text-[#E8A336]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tips Card */}
                <div className="rounded-xl border border-[#E8A336]/20 bg-[#E8A336]/5 p-5">
                  <h4 className="font-semibold text-[#0B2A4C]">
                    Idees de questions :
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm text-[#1A1A1A]/70">
                    {selectedSubject.id === "maths" && (
                      <>
                        <li>
                          &quot;Comment resoudre une equation du second
                          degre?&quot;
                        </li>
                        <li>
                          &quot;Explique-moi le theoreme de Pythagore&quot;
                        </li>
                        <li>
                          &quot;C&apos;est quoi les fonctions affines?&quot;
                        </li>
                      </>
                    )}
                    {selectedSubject.id === "francais" && (
                      <>
                        <li>
                          &quot;Quelle est la difference entre COD et COI?&quot;
                        </li>
                        <li>
                          &quot;Comment structurer une dissertation?&quot;
                        </li>
                        <li>&quot;Explique-moi les temps du passe&quot;</li>
                      </>
                    )}
                    {selectedSubject.id === "anglais" && (
                      <>
                        <li>&quot;When do I use present perfect?&quot;</li>
                        <li>
                          &quot;Difference between &apos;make&apos; and
                          &apos;do&apos;?&quot;
                        </li>
                        <li>&quot;How to write a formal email?&quot;</li>
                      </>
                    )}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="border-t bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-center font-serif text-3xl font-bold text-[#0B2A4C]">
              Pourquoi choisir Kursus ?
            </h2>

            <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
              {VALUE_PROPOSITIONS.map((prop, index) => {
                const Icon = prop.icon;
                return (
                  <motion.div
                    key={prop.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8A336]/10">
                      <Icon className="h-7 w-7 text-[#E8A336]" />
                    </div>
                    <h3 className="mt-4 font-semibold text-[#0B2A4C]">
                      {prop.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#1A1A1A]/70">
                      {prop.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Social Proof */}
            <div className="mx-auto mt-16 max-w-2xl rounded-2xl border bg-[#FDFDFD] p-8 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-[#E8A336]" />
                <p className="font-semibold text-[#0B2A4C]">
                  Rejoignez 15,000+ élèves et parents
                </p>
              </div>
              <p className="mt-2 text-sm text-[#1A1A1A]/70">
                qui font confiance a Kursus pour reussir
              </p>

              <Link href="/register" className="mt-6 inline-block">
                <Button
                  size="lg"
                  className="bg-[#E8A336] text-[#0B2A4C] hover:bg-[#D4922E]"
                >
                  Creer mon compte gratuit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
