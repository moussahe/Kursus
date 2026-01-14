import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import slugify from "slugify";
import { Subject, GradeLevel, ContentType } from "@prisma/client";

// Valid subjects enum values
const VALID_SUBJECTS = [
  "MATHEMATIQUES",
  "FRANCAIS",
  "HISTOIRE_GEO",
  "SCIENCES",
  "ANGLAIS",
  "PHYSIQUE_CHIMIE",
  "SVT",
  "PHILOSOPHIE",
  "ESPAGNOL",
  "ALLEMAND",
  "SES",
  "NSI",
] as const;

// Valid grade levels
const VALID_GRADE_LEVELS = [
  "CP",
  "CE1",
  "CE2",
  "CM1",
  "CM2",
  "SIXIEME",
  "CINQUIEME",
  "QUATRIEME",
  "TROISIEME",
  "SECONDE",
  "PREMIERE",
  "TERMINALE",
] as const;

// Schema for teacher onboarding completion
const onboardingSchema = z.object({
  profile: z.object({
    headline: z.string().min(10).max(100),
    bio: z.string().min(50).max(500),
    specialties: z.array(z.enum(VALID_SUBJECTS)).min(1).max(5),
    yearsExperience: z.number().min(1).max(50),
  }),
  course: z.object({
    title: z.string().min(5).max(100),
    description: z.string().min(20).max(500),
    subject: z.enum(VALID_SUBJECTS),
    gradeLevel: z.enum(VALID_GRADE_LEVELS),
    price: z.number().min(0),
    chapters: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        lessons: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            duration: z.number(),
            type: z.enum(["video", "text", "quiz", "exercise"]),
          }),
        ),
      }),
    ),
  }),
});

// Map lesson type to ContentType enum
function mapLessonTypeToContentType(type: string): ContentType {
  const mapping: Record<string, ContentType> = {
    video: ContentType.VIDEO,
    text: ContentType.TEXT,
    quiz: ContentType.QUIZ,
    exercise: ContentType.EXERCISE,
  };
  return mapping[type.toLowerCase()] || ContentType.TEXT;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Validate request body
    const body = await req.json();
    const validated = onboardingSchema.parse(body);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update user role to TEACHER if not already
      await tx.user.update({
        where: { id: session.user.id },
        data: { role: "TEACHER" },
      });

      // 2. Create or update teacher profile
      const slug = slugify(
        `${session.user.name || "prof"}-${Date.now().toString(36)}`,
        { lower: true, strict: true },
      );

      const teacherProfile = await tx.teacherProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          slug,
          headline: validated.profile.headline,
          bio: validated.profile.bio,
          specialties: validated.profile.specialties as Subject[],
          yearsExperience: validated.profile.yearsExperience,
        },
        update: {
          headline: validated.profile.headline,
          bio: validated.profile.bio,
          specialties: validated.profile.specialties as Subject[],
          yearsExperience: validated.profile.yearsExperience,
        },
      });

      // 3. Create the course
      const courseSlug = slugify(
        `${validated.course.title}-${Date.now().toString(36)}`,
        { lower: true, strict: true },
      );

      const course = await tx.course.create({
        data: {
          title: validated.course.title,
          slug: courseSlug,
          description: validated.course.description,
          subject: validated.course.subject as Subject,
          gradeLevel: validated.course.gradeLevel as GradeLevel,
          price: validated.course.price,
          authorId: session.user.id,
          isPublished: true,
          publishedAt: new Date(),
        },
      });

      // 4. Create chapters and lessons
      for (let i = 0; i < validated.course.chapters.length; i++) {
        const chapter = validated.course.chapters[i];

        const createdChapter = await tx.chapter.create({
          data: {
            title: chapter.title,
            description: chapter.description,
            position: i,
            courseId: course.id,
            isPublished: true,
          },
        });

        // Create lessons for this chapter
        for (let j = 0; j < chapter.lessons.length; j++) {
          const lesson = chapter.lessons[j];

          await tx.lesson.create({
            data: {
              title: lesson.title,
              description: lesson.description,
              duration: lesson.duration,
              contentType: mapLessonTypeToContentType(lesson.type),
              position: j,
              chapterId: createdChapter.id,
              content: `# ${lesson.title}\n\nContenu a completer...`,
              isPublished: true,
            },
          });
        }
      }

      // 5. Update teacher profile stats
      await tx.teacherProfile.update({
        where: { id: teacherProfile.id },
        data: {
          totalCourses: { increment: 1 },
        },
      });

      return { courseId: course.id, courseTitle: course.title };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Donnees invalides", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Teacher onboarding error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'onboarding" },
      { status: 500 },
    );
  }
}
