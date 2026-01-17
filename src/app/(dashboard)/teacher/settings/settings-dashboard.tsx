"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import { User, CreditCard, Bell, Trash2, Save, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StripeConnectStatus } from "@/components/teacher/stripe-connect-status";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  stripeConnected: boolean;
  stripeOnboarded: boolean;
}

interface NotificationPreferences {
  emailSales: boolean;
  emailReviews: boolean;
  emailStudentQuestions: boolean;
  emailMarketing: boolean;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Card className="rounded-2xl border-0 bg-white shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingsDashboard() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Notification preferences (stored locally for now)
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailSales: true,
    emailReviews: true,
    emailStudentQuestions: true,
    emailMarketing: false,
  });

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/teacher/profile");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement du profil");
      }
      const data = await response.json();
      setProfile(data);
      setName(data.name ?? "");
      setHeadline(data.headline ?? "");
      setBio(data.bio ?? "");
      setAvatarUrl(data.avatarUrl ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/teacher/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          headline: headline || null,
          bio: bio || null,
          avatarUrl: avatarUrl || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setSuccessMessage("Profil mis a jour avec succes");

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/teacher/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      // Sign out and redirect
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Parametres
        </h1>
        <p className="mt-1 text-gray-500">
          Gerez votre profil et vos preferences
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
      )}
      {successMessage && (
        <div className="rounded-lg bg-emerald-50 p-4 text-emerald-600">
          {successMessage}
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white border rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg gap-2">
            <CreditCard className="h-4 w-4" />
            Paiements
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="rounded-2xl border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Informations du profil</CardTitle>
              <CardDescription>
                Ces informations seront visibles sur votre page professeur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  className="max-w-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email ?? ""}
                  disabled
                  className="max-w-md bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  L&apos;email ne peut pas etre modifie
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline">Titre / Specialite</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Ex: Professeur de Mathematiques - 15 ans d'experience"
                  className="max-w-lg"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500">
                  {headline.length}/200 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Parlez de votre experience, vos qualifications et votre approche pedagogique..."
                  className="min-h-32"
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500">
                  {bio.length}/2000 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">URL de l&apos;avatar</Label>
                <Input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://exemple.com/mon-avatar.jpg"
                  className="max-w-lg"
                  type="url"
                />
                <p className="text-xs text-gray-500">
                  URL d&apos;une image de profil (format recommande: 256x256px)
                </p>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="rounded-2xl border-red-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600">Zone de danger</CardTitle>
              <CardDescription>
                Actions irreversibles sur votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer mon compte
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Supprimer votre compte ?</DialogTitle>
                    <DialogDescription>
                      Cette action est irreversible. Toutes vos donnees seront
                      definitivement supprimees, y compris vos cours, vos
                      statistiques et votre historique de ventes.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Suppression...
                        </>
                      ) : (
                        "Confirmer la suppression"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <StripeConnectStatus />

          <Card className="rounded-2xl border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Informations sur les paiements</CardTitle>
              <CardDescription>
                Comment fonctionnent les paiements sur Kursus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="font-medium text-gray-900">
                  Commission de la plateforme
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Kursus preleve une commission de 30% sur chaque vente pour
                  couvrir les frais de plateforme, de paiement et de marketing.
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="font-medium text-gray-900">
                  Versements automatiques
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Vos gains (70% de chaque vente) sont automatiquement verses
                  sur votre compte Stripe selon votre calendrier de versement
                  configure.
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="font-medium text-gray-900">
                  Devises et pays supportes
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Les paiements sont traites en EUR. Stripe supporte les comptes
                  bancaires dans plus de 40 pays.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="rounded-2xl border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Preferences de notifications</CardTitle>
              <CardDescription>
                Choisissez les notifications que vous souhaitez recevoir par
                email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="emailSales"
                    checked={notifications.emailSales}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        emailSales: checked === true,
                      }))
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="emailSales"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Nouvelles ventes
                    </Label>
                    <p className="text-sm text-gray-500">
                      Recevez un email a chaque nouvelle vente de vos cours
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="emailReviews"
                    checked={notifications.emailReviews}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        emailReviews: checked === true,
                      }))
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="emailReviews"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Nouveaux avis
                    </Label>
                    <p className="text-sm text-gray-500">
                      Soyez notifie quand un étudiant laisse un avis sur vos
                      cours
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="emailStudentQuestions"
                    checked={notifications.emailStudentQuestions}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        emailStudentQuestions: checked === true,
                      }))
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="emailStudentQuestions"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Questions des étudiants
                    </Label>
                    <p className="text-sm text-gray-500">
                      Recevez un email quand un étudiant pose une question sur
                      vos cours
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="emailMarketing"
                    checked={notifications.emailMarketing}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        emailMarketing: checked === true,
                      }))
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="emailMarketing"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Actualites et conseils
                    </Label>
                    <p className="text-sm text-gray-500">
                      Recevez des conseils pour ameliorer vos cours et des
                      actualites de la plateforme
                    </p>
                  </div>
                </div>
              </div>

              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder les preferences
              </Button>

              <p className="text-xs text-gray-500">
                Note: Les preferences de notifications seront implementees dans
                une prochaine mise a jour.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
