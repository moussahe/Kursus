"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Star,
  ArrowRight,
  CheckCircle2,
  Play,
  BookOpen,
  Calculator,
  Globe,
  Microscope,
  Brain,
  Shield,
  Clock,
  TrendingUp,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const subjects = [
  { name: "Mathematiques", icon: Calculator, count: 156, color: "bg-blue-500" },
  { name: "Francais", icon: BookOpen, count: 124, color: "bg-purple-500" },
  { name: "Anglais", icon: Globe, count: 98, color: "bg-pink-500" },
  { name: "Sciences", icon: Microscope, count: 87, color: "bg-emerald-500" },
  { name: "Histoire-Geo", icon: Globe, count: 76, color: "bg-orange-500" },
  { name: "Physique-Chimie", icon: Sparkles, count: 65, color: "bg-cyan-500" },
];

const features = [
  {
    icon: Brain,
    title: "Tuteur IA 24/7",
    description:
      "Un assistant intelligent qui guide sans donner les reponses. Disponible jour et nuit.",
  },
  {
    icon: TrendingUp,
    title: "85% pour les profs",
    description:
      "Les enseignants gardent 85% de chaque vente. Parce qu'ils le meritent.",
  },
  {
    icon: Clock,
    title: "Un achat, a vie",
    description:
      "Pas d'abonnement. Un seul paiement pour un acces illimite. Pour toujours.",
  },
  {
    icon: Shield,
    title: "Qualite garantie",
    description:
      "Tous les cours sont crees par des professeurs certifies de l'Education Nationale.",
  },
];

const testimonials = [
  {
    content:
      "Mon fils a gagne 4 points de moyenne en maths grace a Schoolaris. Le tuteur IA est incroyable!",
    author: "Sophie L.",
    role: "Maman de Lucas, 3eme",
    avatar: "S",
  },
  {
    content:
      "Enfin une plateforme qui respecte le travail des enseignants. 85% c'est juste et motivant.",
    author: "Marie D.",
    role: "Professeure de francais",
    avatar: "M",
  },
  {
    content:
      "L'IA m'aide a comprendre sans me donner les reponses. J'apprends vraiment!",
    author: "Emma P.",
    role: "Eleve de 3eme",
    avatar: "E",
  },
];

const stats = [
  { value: "10K+", label: "Familles" },
  { value: "500+", label: "Cours" },
  { value: "200+", label: "Professeurs" },
  { value: "4.9/5", label: "Note moyenne" },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Schoolaris
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/courses"
                className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Cours
              </Link>
              <Link
                href="/teachers"
                className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Professeurs
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Tarifs
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Connexion</Link>
              </Button>
              <Button
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                asChild
              >
                <Link href="/register">Commencer</Link>
              </Button>
            </div>

            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
            <Link
              href="/courses"
              className="block py-2 text-gray-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cours
            </Link>
            <Link
              href="/teachers"
              className="block py-2 text-gray-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Professeurs
            </Link>
            <Link
              href="/pricing"
              className="block py-2 text-gray-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tarifs
            </Link>
            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Connexion</Link>
              </Button>
              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                asChild
              >
                <Link href="/register">Commencer</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4" />
                  Nouveau: Tuteur IA integre
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  La reussite scolaire,{" "}
                  <span className="text-emerald-500">simplifiee.</span>
                </h1>

                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Des cours de qualite du CP a la Terminale, crees par des
                  enseignants certifies. Propulses par l&apos;IA pour un
                  apprentissage personnalise.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                    asChild
                  >
                    <Link href="/courses">
                      Decouvrir les cours
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="px-8" asChild>
                    <Link href="/register/teacher">
                      <Play className="mr-2 h-5 w-5" />
                      Devenir professeur
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    Profs certifies
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    Acces a vie
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    IA 24/7
                  </div>
                </div>
              </div>

              {/* Hero Visual */}
              <div className="relative hidden lg:block">
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center">
                      <Calculator className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Les fractions - CM2
                      </p>
                      <p className="text-sm text-gray-500">Par Marie Dupont</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-medium text-gray-900">4.9</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Progression</span>
                      <span className="text-emerald-600 font-medium">67%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: "67%" }}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                        <Brain className="h-4 w-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tuteur IA</p>
                        <p className="text-sm text-gray-700">
                          Qu&apos;est-ce que tu obtiens quand tu divises 3/4 par
                          2?
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xl font-bold text-gray-900">24</p>
                      <p className="text-xs text-gray-500">Lecons</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xl font-bold text-gray-900">12</p>
                      <p className="text-xs text-gray-500">Quiz</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xl font-bold text-gray-900">4h</p>
                      <p className="text-xs text-gray-500">Contenu</p>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -left-4 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-100">
                  <span className="font-bold text-gray-900">+250 XP</span>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-emerald-500 rounded-full px-4 py-2 shadow-lg">
                  <span className="font-bold text-white">85%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl lg:text-4xl font-bold text-emerald-500">
                    {stat.value}
                  </p>
                  <p className="text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Pourquoi choisir Schoolaris?
              </h2>
              <p className="text-lg text-gray-600">
                Une plateforme pensee pour les eleves et respectueuse des
                enseignants.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <Card
                  key={i}
                  className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Parcourir par matiere
                </h2>
                <p className="text-lg text-gray-600">
                  Trouvez le cours parfait dans votre matiere.
                </p>
              </div>
              <Link
                href="/courses"
                className="hidden md:inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mt-4 md:mt-0"
              >
                Voir tous les cours
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Link
                  key={subject.name}
                  href={`/courses?subject=${subject.name.toLowerCase()}`}
                >
                  <Card className="border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${subject.color} flex items-center justify-center`}
                      >
                        <subject.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {subject.count} cours
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-emerald-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ils nous font confiance
              </h2>
              <p className="text-emerald-100 text-lg">
                Des milliers de familles utilisent Schoolaris.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <Card
                  key={i}
                  className="bg-white/10 backdrop-blur border-white/20"
                >
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <Star
                          key={j}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-white mb-6">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-medium text-white">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-emerald-200">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA for Teachers */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium mb-6">
                  Pour les enseignants
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Gardez <span className="text-emerald-400">85%</span> de vos
                  ventes
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  Creez vos cours, fixez vos prix, touchez 85% de chaque vente.
                  Nous nous occupons de la technique.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Publication gratuite et illimitee",
                    "Outils de creation puissants",
                    "Analytics detailles",
                    "Paiements instantanes via Stripe",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-gray-300"
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  asChild
                >
                  <Link href="/register/teacher">
                    Devenir createur
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="hidden md:block">
                <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Revenus ce mois</p>
                  <p className="text-4xl font-bold text-white mb-4">
                    2 450 <span className="text-lg text-gray-400">EUR</span>
                  </p>
                  <div className="flex items-center gap-2 text-emerald-400 text-sm mb-6">
                    <TrendingUp className="h-4 w-4" />
                    +23% vs mois dernier
                  </div>
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Ventes</span>
                      <span className="text-white font-medium">47</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Eleves actifs</span>
                      <span className="text-white font-medium">234</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Note moyenne</span>
                      <span className="text-white font-medium flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        4.9
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Pret a commencer?
            </h2>
            <p className="text-lg text-gray-600 mb-10">
              Rejoignez des milliers de familles qui font confiance a Schoolaris
              pour accompagner la reussite scolaire de leurs enfants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                asChild
              >
                <Link href="/register">
                  Creer mon compte gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8" asChild>
                <Link href="/courses">Explorer les cours</Link>
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Pas de carte bancaire requise.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Schoolaris</span>
              </Link>
              <p className="text-sm">
                La marketplace de cours scolaires. Crees par des profs,
                propulses par l&apos;IA.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Cours</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/courses" className="hover:text-white">
                    Tous les cours
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses?level=primaire"
                    className="hover:text-white"
                  >
                    Primaire
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses?level=college"
                    className="hover:text-white"
                  >
                    College
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses?level=lycee"
                    className="hover:text-white"
                  >
                    Lycee
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Enseignants</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/register/teacher" className="hover:text-white">
                    Devenir createur
                  </Link>
                </li>
                <li>
                  <Link href="/teacher/guide" className="hover:text-white">
                    Guide
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Tarification
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/legal/cgu" className="hover:text-white">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/confidentialite"
                    className="hover:text-white"
                  >
                    Confidentialite
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>
              &copy; {new Date().getFullYear()} Schoolaris. Tous droits
              reserves.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
