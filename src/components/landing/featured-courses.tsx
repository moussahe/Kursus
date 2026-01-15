"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

type CourseLevel = "Primaire" | "College" | "Lycee";

interface Course {
  id: number;
  title: string;
  teacher: {
    name: string;
    avatarInitial: string;
  };
  rating: number;
  reviews: number;
  price: number | "Gratuit";
  level: CourseLevel;
  subject: string;
  subjectColor: string;
  thumbnailGradient: string;
}

const sampleCourses: Course[] = [
  {
    id: 1,
    title: "Mathematiques - Terminale S",
    teacher: { name: "Marie Dupont", avatarInitial: "M" },
    rating: 4.9,
    reviews: 124,
    price: 49,
    level: "Lycee",
    subject: "Maths",
    subjectColor: "bg-blue-100 text-blue-800",
    thumbnailGradient: "from-blue-400 to-indigo-500",
  },
  {
    id: 2,
    title: "Français - Brevet des Colleges",
    teacher: { name: "Jean Martin", avatarInitial: "J" },
    rating: 4.8,
    reviews: 98,
    price: 39,
    level: "College",
    subject: "Français",
    subjectColor: "bg-red-100 text-red-800",
    thumbnailGradient: "from-red-400 to-orange-500",
  },
  {
    id: 3,
    title: "Anglais Conversationnel",
    teacher: { name: "Sophie Bernard", avatarInitial: "S" },
    rating: 4.7,
    reviews: 215,
    price: "Gratuit",
    level: "Lycee",
    subject: "Anglais",
    subjectColor: "bg-green-100 text-green-800",
    thumbnailGradient: "from-green-400 to-teal-500",
  },
  {
    id: 4,
    title: "SVT - Classe de Seconde",
    teacher: { name: "Pierre Leroy", avatarInitial: "P" },
    rating: 4.9,
    reviews: 76,
    price: 35,
    level: "Lycee",
    subject: "SVT",
    subjectColor: "bg-purple-100 text-purple-800",
    thumbnailGradient: "from-purple-400 to-pink-500",
  },
];

function LevelBadge({ level }: { level: CourseLevel }) {
  const levelStyles: Record<CourseLevel, string> = {
    Primaire: "bg-yellow-100 text-yellow-800",
    College: "bg-orange-100 text-orange-800",
    Lycee: "bg-rose-100 text-rose-800",
  };
  return (
    <span
      className={`absolute left-3 top-3 rounded-full px-2 py-1 text-xs font-semibold ${levelStyles[level]}`}
    >
      {level}
    </span>
  );
}

function SubjectBadge({ subject, color }: { subject: string; color: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>
      {subject}
    </span>
  );
}

function TeacherAvatar({ initial }: { initial: string }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-600">
      {initial}
    </div>
  );
}

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500">
        {rating.toFixed(1)} ({reviews} avis)
      </span>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-40">
        <div
          className={`h-full w-full bg-gradient-to-br ${course.thumbnailGradient}`}
        />
        <LevelBadge level={course.level} />
      </div>
      <div className="flex flex-grow flex-col p-5">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="pr-2 text-lg font-bold leading-tight text-gray-900">
            {course.title}
          </h3>
          <SubjectBadge subject={course.subject} color={course.subjectColor} />
        </div>

        <div className="my-2 flex items-center gap-2">
          <TeacherAvatar initial={course.teacher.avatarInitial} />
          <span className="text-sm font-medium text-gray-600">
            {course.teacher.name}
          </span>
        </div>

        <div className="mt-auto pt-3">
          <StarRating rating={course.rating} reviews={course.reviews} />
          <div className="mt-3 text-right">
            <span className="text-2xl font-bold text-gray-900">
              {typeof course.price === "number"
                ? `${course.price} €`
                : course.price}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturedCourses() {
  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Cours Populaires
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Découvrez les cours les mieux notes et les plus apprecies par notre
            communaute d&apos;élèves.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sampleCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link
            href="/courses"
            className="inline-block rounded-xl bg-emerald-500 px-8 py-3.5 font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-emerald-600"
          >
            Voir tous les cours
          </Link>
        </div>
      </div>
    </section>
  );
}
