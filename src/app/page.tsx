import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  ShoppingBag,
  Star,
  ArrowRight,
  CheckCircle2,
  Play,
  BookOpen,
  Calculator,
  Globe,
  Microscope,
  Palette,
  Code,
} from "lucide-react";

const subjects = [
  {
    name: "Mathematiques",
    icon: Calculator,
    count: 156,
    color: "bg-blue-50 text-blue-600",
  },
  {
    name: "Francais",
    icon: BookOpen,
    count: 124,
    color: "bg-purple-50 text-purple-600",
  },
  {
    name: "Anglais",
    icon: Globe,
    count: 98,
    color: "bg-pink-50 text-pink-600",
  },
  {
    name: "Sciences",
    icon: Microscope,
    count: 87,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    name: "Histoire-Geo",
    icon: Globe,
    count: 76,
    color: "bg-orange-50 text-orange-600",
  },
  {
    name: "Informatique",
    icon: Code,
    count: 45,
    color: "bg-slate-50 text-slate-600",
  },
];

const steps = [
  {
    step: "01",
    title: "Trouvez le cours ideal",
    description:
      "Parcourez notre catalogue de cours crees par de vrais professeurs certifies.",
  },
  {
    step: "02",
    title: "Achetez une fois",
    description:
      "Payez une seule fois et gardez l'acces au cours a vie. Pas d'abonnement.",
  },
  {
    step: "03",
    title: "Apprenez a votre rythme",
    description:
      "Votre enfant progresse a son propre rythme avec un suivi personnalise.",
  },
];

const featuredCourses = [
  {
    id: 1,
    title: "Mathematiques 3eme - Preparation au Brevet",
    teacher: "Marie Dupont",
    teacherTitle: "Professeure certifiee",
    price: 2990,
    rating: 4.9,
    students: 1234,
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
    level: "3eme",
  },
  {
    id: 2,
    title: "Francais Terminale - Methodologie du commentaire",
    teacher: "Jean Martin",
    teacherTitle: "Agrege de Lettres",
    price: 3490,
    rating: 4.8,
    students: 892,
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop",
    level: "Terminale",
  },
  {
    id: 3,
    title: "Anglais College - De A1 a B1",
    teacher: "Sarah Johnson",
    teacherTitle: "Native speaker",
    price: 2490,
    rating: 4.9,
    students: 2156,
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
    level: "College",
  },
];

const testimonials = [
  {
    content:
      "Mon fils a gagne 4 points de moyenne en maths grace au cours de Mme Dupont. Le format video est parfait pour lui.",
    author: "Sophie L.",
    role: "Maman de Lucas, 3eme",
    avatar: "SL",
  },
  {
    content:
      "Enfin une plateforme ou on achete une fois pour toutes ! Mes 3 enfants peuvent utiliser les cours sans frais supplementaires.",
    author: "Marc D.",
    role: "Papa de 3 enfants",
    avatar: "MD",
  },
  {
    content:
      "La qualite des cours est exceptionnelle. On sent que ce sont de vrais profs qui les ont crees.",
    author: "Isabelle R.",
    role: "Maman de Lea, CM2",
    avatar: "IR",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Schoolaris</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/courses"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cours
            </Link>
            <Link
              href="/teachers"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Professeurs
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              A propos
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Commencer
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 to-white py-20 lg:py-32">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-grid-pattern" />
          <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
          <div className="absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-teal-100/50 blur-3xl" />

          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                <Star className="h-4 w-4 fill-current" />
                +500 cours par des profs certifies
              </div>

              <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Des cours de qualite,{" "}
                <span className="text-gradient">accessibles a vie</span>
              </h1>

              <p className="mb-10 text-lg text-gray-600 sm:text-xl">
                Achetez des cours crees par de vrais professeurs. Un paiement
                unique, un acces illimite pour votre enfant.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/courses">
                  <Button
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
                  >
                    Explorer les cours
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register?role=teacher">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Devenir professeur
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Profs certifies</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Acces a vie</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Satisfait ou rembourse</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                Comment ca marche ?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                Trois etapes simples pour accompagner la reussite scolaire de
                votre enfant.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-emerald-100">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-emerald-100 md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="mb-4 text-3xl font-bold text-gray-900">
                  Parcourir par matiere
                </h2>
                <p className="text-gray-600">
                  Trouvez le cours parfait dans la matiere de votre choix.
                </p>
              </div>
              <Link
                href="/courses"
                className="hidden text-emerald-600 hover:text-emerald-700 md:inline-flex items-center gap-1 font-medium"
              >
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <Link
                  key={subject.name}
                  href={`/courses?subject=${subject.name.toLowerCase()}`}
                >
                  <Card className="hover-lift cursor-pointer border-0 bg-white shadow-sm">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className={`rounded-xl p-3 ${subject.color}`}>
                        <subject.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {subject.count} cours
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="mb-4 text-3xl font-bold text-gray-900">
                  Cours populaires
                </h2>
                <p className="text-gray-600">
                  Les cours les plus apprecies par notre communaute.
                </p>
              </div>
              <Link
                href="/courses"
                className="hidden text-emerald-600 hover:text-emerald-700 md:inline-flex items-center gap-1 font-medium"
              >
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="hover-lift group cursor-pointer overflow-hidden border-0 shadow-sm">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                        <div className="rounded-full bg-white/90 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                          <Play className="h-6 w-6 text-emerald-600" />
                        </div>
                      </div>
                      <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-medium">
                        {course.level}
                      </span>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">
                        {course.title}
                      </h3>
                      <p className="mb-3 text-sm text-gray-500">
                        {course.teacher} - {course.teacherTitle}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">
                              {course.rating}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400">
                            ({course.students} eleves)
                          </span>
                        </div>
                        <span className="text-lg font-bold text-emerald-600">
                          {(course.price / 100).toFixed(2)} EUR
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-emerald-600 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Ils nous font confiance
              </h2>
              <p className="text-emerald-100">
                Des milliers de familles utilisent Schoolaris pour accompagner
                leurs enfants.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className="border-0 bg-white/10 backdrop-blur"
                >
                  <CardContent className="p-6">
                    <p className="mb-6 text-white">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-medium text-white">
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
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800">
              <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">
                <div>
                  <h2 className="mb-4 text-3xl font-bold text-white">
                    Vous etes professeur ?
                  </h2>
                  <p className="mb-6 text-gray-300">
                    Partagez votre savoir et generez des revenus
                    complementaires. Creez vos cours, fixez vos prix, nous nous
                    occupons du reste.
                  </p>
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-center gap-3 text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      Gardez 70% des ventes
                    </li>
                    <li className="flex items-center gap-3 text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      Outils de creation simples
                    </li>
                    <li className="flex items-center gap-3 text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      Paiements securises
                    </li>
                  </ul>
                  <Link href="/register?role=teacher">
                    <Button
                      size="lg"
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      Devenir professeur
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 blur-2xl opacity-30" />
                    <div className="relative rounded-2xl bg-white/5 p-6 backdrop-blur">
                      <div className="mb-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-500" />
                        <div>
                          <div className="h-4 w-32 rounded bg-white/20" />
                          <div className="mt-2 h-3 w-24 rounded bg-white/10" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 w-full rounded bg-white/10" />
                        <div className="h-4 w-3/4 rounded bg-white/10" />
                        <div className="h-4 w-5/6 rounded bg-white/10" />
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-amber-400" />
                          <span className="text-white">4.9</span>
                        </div>
                        <span className="text-lg font-bold text-emerald-400">
                          +2 450 EUR/mois
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-t bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-4xl font-bold text-emerald-600">500+</p>
                <p className="mt-2 text-gray-600">Cours disponibles</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-emerald-600">150+</p>
                <p className="mt-2 text-gray-600">Professeurs certifies</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-emerald-600">25 000+</p>
                <p className="mt-2 text-gray-600">Eleves inscrits</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-emerald-600">4.8/5</p>
                <p className="mt-2 text-gray-600">Note moyenne</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Schoolaris</span>
              </Link>
              <p className="text-sm text-gray-500">
                La marketplace de cours scolaires par de vrais professeurs.
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-gray-900">Cours</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link
                    href="/courses?level=primaire"
                    className="hover:text-emerald-600"
                  >
                    Primaire
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses?level=college"
                    className="hover:text-emerald-600"
                  >
                    College
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses?level=lycee"
                    className="hover:text-emerald-600"
                  >
                    Lycee
                  </Link>
                </li>
                <li>
                  <Link href="/teachers" className="hover:text-emerald-600">
                    Nos professeurs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-gray-900">Professeurs</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link
                    href="/register?role=teacher"
                    className="hover:text-emerald-600"
                  >
                    Devenir professeur
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help/teachers"
                    className="hover:text-emerald-600"
                  >
                    Guide du professeur
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-emerald-600">
                    Tarification
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-gray-900">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/legal/terms" className="hover:text-emerald-600">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/privacy"
                    className="hover:text-emerald-600"
                  >
                    Confidentialite
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/cookies"
                    className="hover:text-emerald-600"
                  >
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Schoolaris. Tous droits
              reserves.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
