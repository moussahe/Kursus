"use client";

import { QuizPlayer } from "@/components/quiz";
import type {
  Quiz as QuizType,
  QuizQuestion as QuizQuestionType,
} from "@/types/quiz";

interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string | null;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  questions: QuizQuestion[];
}

interface LessonContentProps {
  lesson: {
    id: string;
    title: string;
    content: string | null;
    contentType: string;
    videoUrl: string | null;
    quizzes: Quiz[];
    resources: { id: string; title: string; type: string; url: string }[];
  };
  childId?: string;
  currentProgress: {
    isCompleted: boolean;
    quizScore: number | null;
  } | null;
}

export function LessonContent({
  lesson,
  childId,
  currentProgress,
}: LessonContentProps) {
  // Convert quiz to the new format
  const convertQuiz = (quiz: Quiz): QuizType => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    passingScore: quiz.passingScore,
    questions: quiz.questions.map(
      (q): QuizQuestionType => ({
        id: q.id,
        question: q.question,
        options: q.options,
        explanation: q.explanation,
        points: q.points,
      }),
    ),
  });

  return (
    <div className="space-y-6">
      {/* Video Content */}
      {lesson.contentType === "VIDEO" && lesson.videoUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          {lesson.videoUrl.includes("youtube.com") ||
          lesson.videoUrl.includes("youtu.be") ? (
            <iframe
              src={getYouTubeEmbedUrl(lesson.videoUrl)}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : lesson.videoUrl.includes("vimeo.com") ? (
            <iframe
              src={getVimeoEmbedUrl(lesson.videoUrl)}
              title={lesson.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <video src={lesson.videoUrl} controls className="h-full w-full">
              Votre navigateur ne supporte pas la lecture de videos.
            </video>
          )}
        </div>
      )}

      {/* Text Content */}
      {lesson.content && (
        <div
          className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-ul:text-gray-600 prose-ol:text-gray-600"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      )}

      {/* Quiz Content - Using the new enhanced QuizPlayer */}
      {lesson.contentType === "QUIZ" && lesson.quizzes.length > 0 && (
        <QuizPlayer
          quiz={convertQuiz(lesson.quizzes[0])}
          lessonId={lesson.id}
          childId={childId}
          showHints={true}
          adaptiveMode={false}
        />
      )}

      {/* Also show quizzes at the end of other content types */}
      {lesson.contentType !== "QUIZ" && lesson.quizzes.length > 0 && (
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Quiz de verification
          </h3>
          <QuizPlayer
            quiz={convertQuiz(lesson.quizzes[0])}
            lessonId={lesson.id}
            childId={childId}
            showHints={true}
            adaptiveMode={false}
          />
        </div>
      )}

      {/* Previous Quiz Score Display */}
      {currentProgress?.quizScore !== null &&
        currentProgress?.quizScore !== undefined && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">
              <span className="font-medium">Dernier score:</span>{" "}
              {currentProgress.quizScore}%
              {currentProgress.isCompleted && (
                <span className="ml-2 text-emerald-600">- Valide</span>
              )}
            </p>
          </div>
        )}
    </div>
  );
}

function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function getVimeoEmbedUrl(url: string): string {
  const regExp = /vimeo\.com\/(?:video\/)?(\d+)/;
  const match = url.match(regExp);
  const videoId = match ? match[1] : null;
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
}
