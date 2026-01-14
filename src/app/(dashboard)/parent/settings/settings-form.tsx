"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Bell,
  Shield,
  CreditCard,
  LogOut,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  updateProfile,
  changePassword,
  updateNotificationPreferences,
  deleteAccount,
} from "./actions";

interface SettingsFormProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: Date;
  };
  notificationPrefs: {
    weeklyReportReady: boolean;
    inactivityReminder: boolean;
    quizCompleted: boolean;
    milestoneReached: boolean;
    lowQuizScore: boolean;
  };
}

export function SettingsForm({ user, notificationPrefs }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [name, setName] = useState(user.name ?? "");
  const [prefs, setPrefs] = useState(notificationPrefs);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const passwordFormRef = useRef<HTMLFormElement>(null);

  const handleSaveProfile = () => {
    const formData = new FormData();
    formData.append("name", name);

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success("Profil mis a jour avec succes");
      } else {
        toast.error(result.error ?? "Erreur lors de la mise a jour");
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startPasswordTransition(async () => {
      const result = await changePassword(formData);
      if (result.success) {
        toast.success("Mot de passe change avec succes");
        passwordFormRef.current?.reset();
      } else {
        toast.error(
          result.error ?? "Erreur lors du changement de mot de passe",
        );
      }
    });
  };

  const handleTogglePref = async (key: keyof typeof prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);

    const result = await updateNotificationPreferences(newPrefs);
    if (result.success) {
      toast.success("Preference mise a jour");
    } else {
      setPrefs(prefs);
      toast.error(result.error ?? "Erreur lors de la mise a jour");
    }
  };

  const handleDeleteAccount = () => {
    const formData = new FormData();
    formData.append("confirmation", deleteConfirmation);

    startDeleteTransition(async () => {
      const result = await deleteAccount(formData);
      if (result.success) {
        toast.success("Compte supprime avec succes");
        router.push("/");
      } else {
        toast.error(result.error ?? "Erreur lors de la suppression");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Parametres</h1>
        <p className="mt-1 text-gray-500">
          Gerez votre compte et vos preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-500" />
                Informations personnelles
              </CardTitle>
              <CardDescription>
                Mettez a jour vos informations de profil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user.email ?? ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={isPending}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-500" />
                Securite
              </CardTitle>
              <CardDescription>Gerez votre mot de passe.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                ref={passwordFormRef}
                onSubmit={handleChangePassword}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Min. 8 caracteres, 1 majuscule, 1 chiffre, 1 special
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isPasswordPending}
                >
                  {isPasswordPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changement...
                    </>
                  ) : (
                    "Changer le mot de passe"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-emerald-500" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configurez vos preferences de notification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Rapports hebdomadaires</p>
                  <p className="text-sm text-gray-500">
                    Recevez un resume de la progression de vos enfants.
                  </p>
                </div>
                <Switch
                  checked={prefs.weeklyReportReady}
                  onCheckedChange={() => handleTogglePref("weeklyReportReady")}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertes d&apos;inactivite</p>
                  <p className="text-sm text-gray-500">
                    Notification si un enfant n&apos;etudie pas depuis 3 jours.
                  </p>
                </div>
                <Switch
                  checked={prefs.inactivityReminder}
                  onCheckedChange={() => handleTogglePref("inactivityReminder")}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Quiz termines</p>
                  <p className="text-sm text-gray-500">
                    Notification quand un enfant termine un quiz.
                  </p>
                </div>
                <Switch
                  checked={prefs.quizCompleted}
                  onCheckedChange={() => handleTogglePref("quizCompleted")}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Type de compte</span>
                <span className="font-medium">Parent</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Membre depuis</span>
                <span className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-500" />
                Paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Aucun moyen de paiement enregistre.
              </p>
              <Button variant="outline" className="w-full">
                Ajouter une carte
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <LogOut className="h-5 w-5" />
                Zone de danger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                Supprimer mon compte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
