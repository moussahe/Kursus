"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReportStatus, ReportTargetType } from "@prisma/client";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  AlertTriangle,
  Loader2,
  ExternalLink,
  UserX,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ReportActionsProps {
  reportId: string;
  currentStatus: ReportStatus;
  targetType: ReportTargetType;
  targetId: string;
}

type ActionType = "review" | "resolve" | "dismiss" | "escalate";

export function ReportActions({
  reportId,
  currentStatus,
  targetType,
  targetId,
}: ReportActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [resolution, setResolution] = useState("");
  const [contentAction, setContentAction] = useState<string>("none");
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    if (!action) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          resolution: resolution.trim() || undefined,
          contentAction: contentAction !== "none" ? contentAction : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Une erreur est survenue");
      }

      toast.success(
        action === "review"
          ? "Signalement pris en charge"
          : action === "resolve"
            ? "Signalement resolu"
            : action === "dismiss"
              ? "Signalement rejete"
              : "Signalement escalade",
      );
      setIsOpen(false);
      setAction(null);
      setResolution("");
      setContentAction("none");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (selectedAction: ActionType) => {
    setAction(selectedAction);
    setIsOpen(true);
  };

  const getTargetUrl = () => {
    switch (targetType) {
      case "COURSE":
        return `/courses/${targetId}`;
      case "USER":
        return `/admin/users?search=${targetId}`;
      case "FORUM_TOPIC":
        return `/forums/${targetId}`;
      default:
        return null;
    }
  };

  const getDialogConfig = () => {
    switch (action) {
      case "review":
        return {
          title: "Prendre en charge",
          description:
            "Vous allez examiner ce signalement. Votre nom sera associe au traitement.",
          buttonLabel: "Prendre en charge",
          buttonClass: "bg-blue-600 hover:bg-blue-700",
          icon: Search,
          showResolution: false,
          showContentAction: false,
        };
      case "resolve":
        return {
          title: "Resoudre le signalement",
          description: "Indiquez les mesures prises pour resoudre ce problème.",
          buttonLabel: "Marquer comme resolu",
          buttonClass: "bg-emerald-600 hover:bg-emerald-700",
          icon: CheckCircle,
          showResolution: true,
          showContentAction: true,
        };
      case "dismiss":
        return {
          title: "Rejeter le signalement",
          description:
            "Si ce signalement n'est pas justifie, vous pouvez le rejeter. Expliquez pourquoi.",
          buttonLabel: "Rejeter",
          buttonClass: "bg-gray-600 hover:bg-gray-700",
          icon: XCircle,
          showResolution: true,
          showContentAction: false,
        };
      case "escalate":
        return {
          title: "Escalader le signalement",
          description:
            "Escaladez ce signalement pour un examen approfondi. Expliquez pourquoi l'escalade est necessaire.",
          buttonLabel: "Escalader",
          buttonClass: "bg-red-600 hover:bg-red-700",
          icon: AlertTriangle,
          showResolution: true,
          showContentAction: false,
        };
      default:
        return {
          title: "",
          description: "",
          buttonLabel: "",
          buttonClass: "",
          icon: CheckCircle,
          showResolution: false,
          showContentAction: false,
        };
    }
  };

  const config = getDialogConfig();
  const DialogIcon = config.icon;
  const targetUrl = getTargetUrl();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-lg p-2 hover:bg-muted transition-colors">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {targetUrl && (
            <>
              <DropdownMenuItem asChild>
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Voir le contenu
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {currentStatus === "PENDING" && (
            <DropdownMenuItem
              onClick={() => openDialog("review")}
              className="text-blue-600 focus:text-blue-600"
            >
              <Search className="h-4 w-4 mr-2" />
              Prendre en charge
            </DropdownMenuItem>
          )}
          {(currentStatus === "PENDING" ||
            currentStatus === "UNDER_REVIEW") && (
            <>
              <DropdownMenuItem
                onClick={() => openDialog("resolve")}
                className="text-emerald-600 focus:text-emerald-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resoudre
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDialog("dismiss")}
                className="text-gray-600 focus:text-gray-600"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDialog("escalate")}
                className="text-red-600 focus:text-red-600"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Escalader
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DialogIcon className="h-5 w-5" />
              {config.title}
            </DialogTitle>
            <DialogDescription>{config.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {config.showResolution && (
              <div className="space-y-2">
                <Label htmlFor="resolution">
                  {action === "resolve"
                    ? "Actions prises"
                    : action === "dismiss"
                      ? "Raison du rejet"
                      : "Raison de l'escalade"}
                </Label>
                <Textarea
                  id="resolution"
                  placeholder={
                    action === "resolve"
                      ? "Decrivez les mesures prises..."
                      : action === "dismiss"
                        ? "Expliquez pourquoi ce signalement est rejete..."
                        : "Expliquez pourquoi ce signalement doit etre escalade"
                  }
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {config.showContentAction && (
              <div className="space-y-2">
                <Label htmlFor="contentAction">Action sur le contenu</Label>
                <Select value={contentAction} onValueChange={setContentAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez une action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune action</SelectItem>
                    <SelectItem value="hide">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Masquer le contenu
                      </div>
                    </SelectItem>
                    <SelectItem value="delete">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4 text-red-600" />
                        Supprimer le contenu
                      </div>
                    </SelectItem>
                    {targetType === "USER" && (
                      <SelectItem value="suspend">
                        <div className="flex items-center gap-2">
                          <UserX className="h-4 w-4 text-red-600" />
                          Suspendre utilisateur
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAction}
              disabled={
                isLoading ||
                (config.showResolution &&
                  action !== "review" &&
                  !resolution.trim())
              }
              className={config.buttonClass}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {config.buttonLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
