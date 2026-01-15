"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function NotificationSettingsForm() {
  const [isLoading, setIsLoading] = useState(false);

  // Default notification settings
  const [settings, setSettings] = useState({
    // Email notifications
    welcomeEmail: true,
    purchaseConfirmation: true,
    weeklyReportEmail: true,
    lowQuizScoreAlert: true,
    inactivityReminder: true,
    newCourseAlert: true,

    // Admin notifications
    adminNewReport: true,
    adminNewModeration: true,
    adminDailyDigest: true,

    // Teacher notifications
    teacherNewEnrollment: true,
    teacherNewReview: true,
    teacherWeeklyStats: true,
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Notifications configurees");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Parent/Student Notifications */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Notifications parents/élèves
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="welcomeEmail" className="text-sm">
                Email bienvenue
              </Label>
              <Switch
                id="welcomeEmail"
                checked={settings.welcomeEmail}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, welcomeEmail: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="purchaseConfirmation" className="text-sm">
                Confirmation achat
              </Label>
              <Switch
                id="purchaseConfirmation"
                checked={settings.purchaseConfirmation}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, purchaseConfirmation: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="weeklyReportEmail" className="text-sm">
                Rapport hebdomadaire
              </Label>
              <Switch
                id="weeklyReportEmail"
                checked={settings.weeklyReportEmail}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, weeklyReportEmail: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lowQuizScoreAlert" className="text-sm">
                Alerte score bas
              </Label>
              <Switch
                id="lowQuizScoreAlert"
                checked={settings.lowQuizScoreAlert}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, lowQuizScoreAlert: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="inactivityReminder" className="text-sm">
                Rappel inactivité
              </Label>
              <Switch
                id="inactivityReminder"
                checked={settings.inactivityReminder}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, inactivityReminder: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Admin Notifications */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Notifications administrateurs
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="adminNewReport" className="text-sm">
                Nouveau signalement
              </Label>
              <Switch
                id="adminNewReport"
                checked={settings.adminNewReport}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, adminNewReport: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="adminNewModeration" className="text-sm">
                Cours a moderer
              </Label>
              <Switch
                id="adminNewModeration"
                checked={settings.adminNewModeration}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, adminNewModeration: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="adminDailyDigest" className="text-sm">
                Resume quotidien
              </Label>
              <Switch
                id="adminDailyDigest"
                checked={settings.adminDailyDigest}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, adminDailyDigest: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Teacher Notifications */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Notifications enseignants
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="teacherNewEnrollment" className="text-sm">
                Nouvelle inscription
              </Label>
              <Switch
                id="teacherNewEnrollment"
                checked={settings.teacherNewEnrollment}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, teacherNewEnrollment: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="teacherNewReview" className="text-sm">
                Nouvel avis
              </Label>
              <Switch
                id="teacherNewReview"
                checked={settings.teacherNewReview}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, teacherNewReview: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="teacherWeeklyStats" className="text-sm">
                Stats hebdomadaires
              </Label>
              <Switch
                id="teacherWeeklyStats"
                checked={settings.teacherWeeklyStats}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, teacherWeeklyStats: checked })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enregistrer les notifications
      </Button>
    </div>
  );
}
