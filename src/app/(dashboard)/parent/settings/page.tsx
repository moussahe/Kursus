import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export default async function ParentSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Fetch notification preferences (with defaults)
  const notificationPrefs = await prisma.notificationPreferences.findUnique({
    where: { userId: session.user.id },
    select: {
      weeklyReportReady: true,
      inactivityReminder: true,
      quizCompleted: true,
      milestoneReached: true,
      lowQuizScore: true,
    },
  });

  // Default preferences if none exist
  const defaultPrefs = {
    weeklyReportReady: true,
    inactivityReminder: true,
    quizCompleted: true,
    milestoneReached: true,
    lowQuizScore: true,
  };

  return (
    <SettingsForm
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      }}
      notificationPrefs={notificationPrefs ?? defaultPrefs}
    />
  );
}
