"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export function PlatformSettingsForm() {
  const [isLoading, setIsLoading] = useState(false);

  // Default settings (would normally come from database)
  const [settings, setSettings] = useState({
    platformName: "Kursus",
    supportEmail: "support@kursus.fr",
    teacherCommission: 70,
    platformCommission: 30,
    maintenanceMode: false,
    registrationEnabled: true,
    teacherSignupEnabled: true,
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Parametres enregistres");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* General */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="platformName">Nom de la plateforme</Label>
          <Input
            id="platformName"
            value={settings.platformName}
            onChange={(e) =>
              setSettings({ ...settings, platformName: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supportEmail">Email de support</Label>
          <Input
            id="supportEmail"
            type="email"
            value={settings.supportEmail}
            onChange={(e) =>
              setSettings({ ...settings, supportEmail: e.target.value })
            }
          />
        </div>
      </div>

      <Separator />

      {/* Commission */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Commissions</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="teacherCommission">Part enseignant (%)</Label>
            <Input
              id="teacherCommission"
              type="number"
              min={0}
              max={100}
              value={settings.teacherCommission}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  teacherCommission: parseInt(e.target.value) || 0,
                  platformCommission: 100 - (parseInt(e.target.value) || 0),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platformCommission">Part plateforme (%)</Label>
            <Input
              id="platformCommission"
              type="number"
              value={settings.platformCommission}
              disabled
              className="bg-muted"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Toggles */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Acces</h4>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="maintenanceMode">Mode maintenance</Label>
            <p className="text-xs text-muted-foreground">
              Desactive l acces a la plateforme
            </p>
          </div>
          <Switch
            id="maintenanceMode"
            checked={settings.maintenanceMode}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, maintenanceMode: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="registrationEnabled">Inscriptions</Label>
            <p className="text-xs text-muted-foreground">
              Autoriser les nouvelles inscriptions
            </p>
          </div>
          <Switch
            id="registrationEnabled"
            checked={settings.registrationEnabled}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, registrationEnabled: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="teacherSignupEnabled">
              Inscription enseignants
            </Label>
            <p className="text-xs text-muted-foreground">
              Autoriser les inscriptions enseignants
            </p>
          </div>
          <Switch
            id="teacherSignupEnabled"
            checked={settings.teacherSignupEnabled}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, teacherSignupEnabled: checked })
            }
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enregistrer
      </Button>
    </div>
  );
}
