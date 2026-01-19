"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Rocket,
  ArrowLeft,
  Loader2,
  BookOpen,
  Clock,
  Users,
  AlertCircle,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { TeacherOnboardingData } from "@/types/teacher-onboarding";

interface PreviewStepProps {
  data: TeacherOnboardingData;
  onPublish: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

const SUBJECT_LABELS: Record<string, string> = {
  MATHEMATIQUES: "Mathematiques",
  FRANCAIS: "Francais",
  HISTOIRE_GEO: "Histoire-Geo",
  SCIENCES: "Sciences",
  ANGLAIS: "Anglais",
  PHYSIQUE_CHIMIE: "Physique-Chimie",
  SVT: "SVT",
  PHILOSOPHIE: "Philosophie",
  ESPAGNOL: "Espagnol",
  ALLEMAND: "Allemand",
  SES: "SES",
  NSI: "NSI",
};

const GRADE_LABELS: Record<string, string> = {
  CP: "CP",
  CE1: "CE1",
  CE2: "CE2",
  CM1: "CM1",
  CM2: "CM2",
  SIXIEME: "6eme",
  CINQUIEME: "5eme",
  QUATRIEME: "4eme",
  TROISIEME: "3eme",
  SECONDE: "Seconde",
  PREMIERE: "Premiere",
  TERMINALE: "Terminale",
};

export function PreviewStep({
  data,
  onPublish,
  onBack,
  isLoading,
}: PreviewStepProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToContent, setAgreedToContent] = useState(false);

  const totalLessons = data.course.chapters.reduce(
    (sum, ch) => sum + ch.lessons.length,
    0,
  );
  const estimatedHours = Math.round((totalLessons * 15) / 60);
  const teacherRevenue = (data.course.price * 0.7) / 100;
  const platformFee = (data.course.price * 0.3) / 100;

  const canPublish = agreedToTerms && agreedToContent && !isLoading;

  return (
    <div className="space-y-6 p-6 sm:p-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#7a78ff]/10"
        >
          <Eye className="h-6 w-6 text-[#7a78ff]" />
        </motion.div>
        <h2 className="text-xl font-bold text-gray-900">
          Apercu avant publication
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Verifiez les informations avant de publier votre cours
        </p>
      </div>

      {/* Course Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="overflow-hidden rounded-2xl border-0 shadow-lg">
          {/* Course Header with gradient */}
          <div className="bg-gradient-to-br from-[#7a78ff] to-[#6366f1] p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex gap-2">
                  <Badge className="bg-white/20 text-white hover:bg-white/30">
                    {SUBJECT_LABELS[data.course.subject] || data.course.subject}
                  </Badge>
                  <Badge className="bg-white/20 text-white hover:bg-white/30">
                    {GRADE_LABELS[data.course.gradeLevel] ||
                      data.course.gradeLevel}
                  </Badge>
                </div>
                <h3 className="mt-3 text-xl font-bold">{data.course.title}</h3>
                <p className="mt-2 text-sm text-white/90">
                  {data.course.description}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {data.course.chapters.length} chapitres
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />~{estimatedHours}h de contenu
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {totalLessons} lecons
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Teacher Profile Preview */}
            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7a78ff]/10 text-xl font-bold text-[#7a78ff]">
                {data.profile.headline.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {data.profile.headline}
                </p>
                <p className="text-sm text-gray-500">
                  {data.profile.yearsExperience}+ ans d&apos;experience
                </p>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="mt-4 rounded-xl border border-[#7a78ff]/20 bg-[#7a78ff]/10 p-4">
              <h4 className="font-semibold text-gray-900">
                Repartition des revenus
              </h4>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Prix de vente</span>
                  <span className="font-medium text-gray-900">
                    {(data.course.price / 100).toFixed(2)} EUR
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#7a78ff]">
                    Votre part (70%)
                  </span>
                  <span className="font-bold text-[#7a78ff]">
                    +{teacherRevenue.toFixed(2)} EUR
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-sm">Commission plateforme (30%)</span>
                  <span className="text-sm">{platformFee.toFixed(2)} EUR</span>
                </div>
              </div>
            </div>

            {/* Chapter List */}
            <div className="mt-4">
              <h4 className="mb-2 font-semibold text-gray-900">
                Contenu du cours
              </h4>
              <div className="space-y-2">
                {data.course.chapters.map((chapter, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7a78ff]/10 text-xs font-medium text-[#7a78ff]">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {chapter.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {chapter.lessons.length} lecons
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Important Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-amber-200 bg-amber-50 p-4"
      >
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <h4 className="font-medium text-amber-900">Avant de publier</h4>
            <p className="mt-1 text-sm text-amber-700">
              Votre cours sera immediatement visible par les parents et eleves.
              Vous pourrez modifier le contenu a tout moment depuis votre
              tableau de bord.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Terms Agreement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3 rounded-xl bg-gray-50 p-4"
      >
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
          />
          <Label
            htmlFor="terms"
            className="text-sm leading-relaxed text-gray-700"
          >
            J&apos;accepte les{" "}
            <a href="/terms" className="text-[#7a78ff] underline">
              conditions d&apos;utilisation
            </a>{" "}
            et la{" "}
            <a href="/privacy" className="text-[#7a78ff] underline">
              politique de confidentialite
            </a>
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="content"
            checked={agreedToContent}
            onCheckedChange={(checked) => setAgreedToContent(checked === true)}
          />
          <Label
            htmlFor="content"
            className="text-sm leading-relaxed text-gray-700"
          >
            Je certifie que le contenu de ce cours est original et ne viole
            aucun droit d&apos;auteur
          </Label>
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 rounded-xl"
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Modifier
        </Button>
        <Button
          onClick={onPublish}
          disabled={!canPublish}
          className="flex-1 rounded-xl bg-gradient-to-r from-[#7a78ff] to-[#6366f1] py-6 text-lg font-semibold hover:from-[#6966ff] hover:to-[#5558e8]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Publication en cours...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-5 w-5" />
              Publier mon cours
            </>
          )}
        </Button>
      </div>

      {!canPublish && !isLoading && (
        <p className="text-center text-xs text-gray-500">
          Acceptez les conditions pour publier votre cours
        </p>
      )}
    </div>
  );
}

// Complete Step Component (shown after successful publication)
export function CompleteStep({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  return (
    <div className="space-y-6 p-6 sm:p-8 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#7a78ff] to-[#6366f1]"
      >
        <PartyPopper className="h-10 w-10 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-gray-900">Felicitations !</h2>
        <p className="mt-2 text-gray-600">
          Votre cours &quot;{courseTitle}&quot; est maintenant en ligne !
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-gradient-to-br from-[#7a78ff]/5 to-[#6366f1]/5 p-6"
      >
        <h3 className="font-semibold text-gray-900">Prochaines etapes</h3>
        <div className="mt-4 space-y-3 text-left">
          {[
            "Ajoutez du contenu detaille a vos lecons",
            "Partagez votre cours sur les reseaux sociaux",
            "Repondez aux questions de vos eleves",
            "Analysez vos statistiques de vente",
          ].map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7a78ff] text-xs font-bold text-white">
                {index + 1}
              </div>
              <span className="text-sm text-gray-700">{step}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Button
          asChild
          className="flex-1 rounded-xl bg-[#7a78ff] hover:bg-[#6966ff]"
        >
          <a href={`/teacher/courses/${courseId}`}>Modifier mon cours</a>
        </Button>
        <Button asChild variant="outline" className="flex-1 rounded-xl">
          <a href="/teacher">Mon tableau de bord</a>
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-sm text-gray-500"
      >
        Besoin d&apos;aide ? Consultez notre{" "}
        <a href="/help/teachers" className="text-[#7a78ff] underline">
          guide du professeur
        </a>
      </motion.p>
    </div>
  );
}
