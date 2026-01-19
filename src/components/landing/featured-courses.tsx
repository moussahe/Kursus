"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";

type CourseLevel = "Primaire" | "Collège" | "Lycée";

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
  gradientFrom: string;
  gradientTo: string;
}

const sampleCourses: Course[] = [
  {
    id: 1,
    title: "Mathématiques - Terminale S",
    teacher: { name: "Marie Dupont", avatarInitial: "M" },
    rating: 4.9,
    reviews: 124,
    price: 49,
    level: "Lycée",
    subject: "Maths",
    subjectColor: "#ff9494",
    gradientFrom: "#ff9494",
    gradientTo: "#ffb8b8",
  },
  {
    id: 2,
    title: "Français - Brevet des Collèges",
    teacher: { name: "Jean Martin", avatarInitial: "J" },
    rating: 4.8,
    reviews: 98,
    price: 39,
    level: "Collège",
    subject: "Français",
    subjectColor: "#7a78ff",
    gradientFrom: "#7a78ff",
    gradientTo: "#9997ff",
  },
  {
    id: 3,
    title: "Anglais Conversationnel",
    teacher: { name: "Sophie Bernard", avatarInitial: "S" },
    rating: 4.7,
    reviews: 215,
    price: "Gratuit",
    level: "Lycée",
    subject: "Anglais",
    subjectColor: "#c7ff69",
    gradientFrom: "#c7ff69",
    gradientTo: "#a8e550",
  },
  {
    id: 4,
    title: "SVT - Classe de Seconde",
    teacher: { name: "Pierre Leroy", avatarInitial: "P" },
    rating: 4.9,
    reviews: 76,
    price: 35,
    level: "Lycée",
    subject: "SVT",
    subjectColor: "#ff9494",
    gradientFrom: "#ff9494",
    gradientTo: "#ffb8b8",
  },
];

function LevelBadge({ level }: { level: CourseLevel }) {
  const levelStyles: Record<
    CourseLevel,
    { bg: string; text: string; border: string }
  > = {
    Primaire: {
      bg: "bg-[#c7ff69]/10",
      text: "text-[#c7ff69]",
      border: "border-[#c7ff69]/20",
    },
    Collège: {
      bg: "bg-[#ff9494]/10",
      text: "text-[#ff9494]",
      border: "border-[#ff9494]/20",
    },
    Lycée: {
      bg: "bg-[#7a78ff]/10",
      text: "text-[#7a78ff]",
      border: "border-[#7a78ff]/20",
    },
  };
  const style = levelStyles[level];
  return (
    <span
      className={`absolute left-3 top-3 rounded-full border px-2 py-1 text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
    >
      {level}
    </span>
  );
}

function SubjectBadge({ subject, color }: { subject: string; color: string }) {
  return (
    <span
      className="rounded-full px-2.5 py-1 text-xs font-semibold border"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`,
      }}
    >
      {subject}
    </span>
  );
}

function TeacherAvatar({ initial, color }: { initial: string; color: string }) {
  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
      style={{ backgroundColor: `${color}20`, color: color }}
    >
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
                ? "fill-[#ff9494] text-[#ff9494]"
                : "text-[#2a2a2a]"
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
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] transition-all duration-300 hover:border-white/10"
      style={{
        boxShadow: "0 0 0 0 transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 40px -10px ${course.subjectColor}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 0 transparent";
      }}
    >
      <div className="relative h-40">
        <div
          className="h-full w-full"
          style={{
            background: `linear-gradient(135deg, ${course.gradientFrom}, ${course.gradientTo})`,
          }}
        />
        <LevelBadge level={course.level} />
      </div>
      <div className="flex flex-grow flex-col p-5">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="pr-2 text-lg font-bold leading-tight text-white">
            {course.title}
          </h3>
          <SubjectBadge subject={course.subject} color={course.subjectColor} />
        </div>

        <div className="my-2 flex items-center gap-2">
          <TeacherAvatar
            initial={course.teacher.avatarInitial}
            color={course.subjectColor}
          />
          <span className="text-sm font-medium text-gray-400">
            {course.teacher.name}
          </span>
        </div>

        <div className="mt-auto pt-3">
          <StarRating rating={course.rating} reviews={course.reviews} />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xl font-bold text-white">
              {typeof course.price === "number" ? (
                `${course.price}€`
              ) : (
                <span className="text-[#c7ff69]">{course.price}</span>
              )}
            </span>
            <span className="text-xs text-gray-500">Accès à vie</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturedCourses() {
  return (
    <section className="bg-[#0a0a0a] py-24 border-t border-[#2a2a2a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#ff9494]/20 bg-[#ff9494]/10 px-4 py-2 text-sm font-medium text-[#ff9494]">
            <Star className="h-4 w-4 fill-[#ff9494]" />
            Les mieux notés
          </span>
          <h2
            className="mt-6 text-3xl font-black text-white sm:text-4xl md:text-5xl"
            style={{ letterSpacing: "-0.04em" }}
          >
            Cours populaires
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            Découvrez les cours les mieux notés et les plus appréciés par notre
            communauté d&apos;élèves.
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
            className="group inline-flex items-center gap-2 rounded-full bg-[#ff9494] px-8 py-4 font-semibold text-[#0a0a0a] transition-all duration-300 hover:bg-[#ffb8b8] hover:shadow-[0_0_40px_-10px_rgba(255,109,56,0.5)]"
          >
            Voir tous les cours
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
