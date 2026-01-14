"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Smartphone, Moon, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { toast } from "sonner";

interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  quizCompleted: boolean;
  lessonCompleted: boolean;
  courseCompleted: boolean;
  milestoneReached: boolean;
  streakAchieved: boolean;
  inactivityReminder: boolean;
  weeklyReportReady: boolean;
  newBadgeEarned: boolean;
  revisionDue: boolean;
  goalCompleted: boolean;
  goalReminder: boolean;
  lowQuizScore: boolean;
  highQuizScore: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  emailEnabled: true,
  quizCompleted: true,
  lessonCompleted: false,
  courseCompleted: true,
  milestoneReached: true,
  streakAchieved: true,
  inactivityReminder: true,
  weeklyReportReady: true,
  newBadgeEarned: true,
  revisionDue: true,
  goalCompleted: true,
  goalReminder: true,
  lowQuizScore: true,
  highQuizScore: true,
  quietHoursEnabled: true,
  quietHoursStart: "21:00",
  quietHoursEnd: "08:00",
  timezone: "Europe/Paris",
};

const NOTIFICATION_TYPES = [
  {
    key: "quizCompleted" as const,
    label: "Quiz termine",
    description: "Quand votre enfant complete un quiz",
  },
  {
    key: "lessonCompleted" as const,
    label: "Lecon terminee",
    description: "Quand votre enfant complete une lecon",
  },
  {
    key: "courseCompleted" as const,
    label: "Cours termine",
    description: "Quand votre enfant complete un cours entier",
  },
  {
    key: "milestoneReached" as const,
    label: "Jalon atteint",
    description: "Quand votre enfant atteint un jalon XP",
  },
  {
    key: "streakAchieved" as const,
    label: "Serie maintenue",
    description: "Quand votre enfant maintient sa serie d'etude",
  },
  {
    key: "inactivityReminder" as const,
    label: "Rappel d'inactivite",
    description: "Si votre enfant n'a pas etudie depuis 3 jours",
  },
  {
    key: "weeklyReportReady" as const,
    label: "Rapport hebdomadaire",
    description: "Quand le rapport de la semaine est disponible",
  },
  {
    key: "newBadgeEarned" as const,
    label: "Nouveau badge",
    description: "Quand votre enfant obtient un badge",
  },
  {
    key: "revisionDue" as const,
    label: "Revision a faire",
    description: "Quand des cartes de revision sont dues",
  },
  {
    key: "goalCompleted" as const,
    label: "Objectif atteint",
    description: "Quand un objectif d'etude est complete",
  },
  {
    key: "goalReminder" as const,
    label: "Rappel d'objectif",
    description: "Avant l'expiration d'un objectif",
  },
  {
    key: "lowQuizScore" as const,
    label: "Score faible",
    description: "Si votre enfant a un score inferieur a 50%",
  },
  {
    key: "highQuizScore" as const,
    label: "Excellent score",
    description: "Quand votre enfant obtient 90% ou plus",
  },
];

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: `${hour}:00`, label: `${hour}:00` };
});

export function NotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    isLoading: pushLoading,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const [preferences, setPreferences] =
    useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch preferences on mount
  useEffect(() => {
    async function fetchPreferences() {
      try {
        const response = await fetch("/api/push/preferences");
        if (response.ok) {
          const data = await response.json();
          if (data.preferences) {
            setPreferences({ ...DEFAULT_PREFERENCES, ...data.preferences });
          }
        }
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPreferences();
  }, []);

  const updatePreference = async (
    key: keyof NotificationPreferences,
    value: boolean | string,
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    setIsSaving(true);
    try {
      const response = await fetch("/api/push/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      toast.success("Preferences mises a jour");
    } catch {
      // Revert on error
      setPreferences(preferences);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnablePush = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) {
        toast.success("Notifications desactivees");
      } else {
        toast.error("Erreur lors de la desactivation");
      }
    } else {
      const success = await subscribe();
      if (success) {
        toast.success("Notifications activees");
      } else if (permission === "denied") {
        toast.error(
          "Les notifications sont bloquees. Verifiez les parametres de votre navigateur.",
        );
      } else {
        toast.error("Erreur lors de l'activation");
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            Chargement...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Push Notification Enable Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Notifications Push
          </CardTitle>
          <CardDescription>
            Recevez des notifications en temps reel sur votre appareil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSupported ? (
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <BellOff className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Non supporte</p>
                <p className="text-sm text-muted-foreground">
                  Votre navigateur ne supporte pas les notifications push
                </p>
              </div>
            </div>
          ) : permission === "denied" ? (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
              <BellOff className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">
                  Notifications bloquees
                </p>
                <p className="text-sm text-muted-foreground">
                  Verifiez les parametres de votre navigateur pour autoriser les
                  notifications
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">
                  {isSubscribed
                    ? "Notifications activees"
                    : "Activer les notifications"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isSubscribed
                    ? "Vous recevez des notifications push"
                    : "Cliquez pour activer les notifications"}
                </p>
              </div>
              <Button
                onClick={handleEnablePush}
                disabled={pushLoading}
                variant={isSubscribed ? "outline" : "default"}
              >
                {pushLoading ? (
                  "..."
                ) : isSubscribed ? (
                  <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Desactiver
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Activer
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notifications Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Recevoir des emails</Label>
              <p className="text-sm text-muted-foreground">
                Alertes et rapports par email
              </p>
            </div>
            <Switch
              checked={preferences.emailEnabled}
              onCheckedChange={(checked) =>
                updatePreference("emailEnabled", checked)
              }
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Heures silencieuses
          </CardTitle>
          <CardDescription>
            Pas de notifications pendant ces heures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Activer les heures silencieuses</Label>
            </div>
            <Switch
              checked={preferences.quietHoursEnabled}
              onCheckedChange={(checked) =>
                updatePreference("quietHoursEnabled", checked)
              }
              disabled={isSaving}
            />
          </div>

          {preferences.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label>Debut</Label>
                <Select
                  value={preferences.quietHoursStart}
                  onValueChange={(value) =>
                    updatePreference("quietHoursStart", value)
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((hour) => (
                      <SelectItem key={hour.value} value={hour.value}>
                        {hour.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fin</Label>
                <Select
                  value={preferences.quietHoursEnd}
                  onValueChange={(value) =>
                    updatePreference("quietHoursEnd", value)
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((hour) => (
                      <SelectItem key={hour.value} value={hour.value}>
                        {hour.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Types de notifications</CardTitle>
          <CardDescription>
            Choisissez les notifications que vous souhaitez recevoir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {NOTIFICATION_TYPES.map((type) => (
              <div
                key={type.key}
                className="flex items-center justify-between py-2"
              >
                <div className="space-y-1">
                  <Label>{type.label}</Label>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </div>
                <Switch
                  checked={preferences[type.key] as boolean}
                  onCheckedChange={(checked) =>
                    updatePreference(type.key, checked)
                  }
                  disabled={
                    isSaving ||
                    (!preferences.pushEnabled && !preferences.emailEnabled)
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
