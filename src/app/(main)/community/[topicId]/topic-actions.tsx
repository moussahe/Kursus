"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Pin, Lock, Trash2, PinOff, Unlock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

interface TopicActionsProps {
  topicId: string;
  isAuthor: boolean;
  isModerator: boolean;
  isPinned: boolean;
  isLocked: boolean;
}

export function TopicActions({
  topicId,
  isAuthor,
  isModerator,
  isPinned,
  isLocked,
}: TopicActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleTogglePin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/forums/${topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !isPinned }),
      });

      if (!response.ok) throw new Error("Failed to update");

      toast.success(isPinned ? "Sujet desepingle" : "Sujet epingle", {
        description: isPinned
          ? "Le sujet n'est plus epingle."
          : "Le sujet est maintenant epingle en haut.",
      });
      router.refresh();
    } catch {
      toast.error("Erreur", {
        description: "Impossible de mettre a jour le sujet",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLock = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/forums/${topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: !isLocked }),
      });

      if (!response.ok) throw new Error("Failed to update");

      toast.success(isLocked ? "Sujet deverrouille" : "Sujet verrouille", {
        description: isLocked
          ? "Les réponses sont de nouveau autorisees."
          : "Les nouvelles réponses sont desactivees.",
      });
      router.refresh();
    } catch {
      toast.error("Erreur", {
        description: "Impossible de mettre a jour le sujet",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/forums/${topicId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Sujet supprime", {
        description: "Le sujet a ete supprime avec succes.",
      });
      router.push("/community");
      router.refresh();
    } catch {
      toast.error("Erreur", {
        description: "Impossible de supprimer le sujet",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isLoading}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isModerator && (
            <>
              <DropdownMenuItem onClick={handleTogglePin}>
                {isPinned ? (
                  <>
                    <PinOff className="h-4 w-4 mr-2" />
                    Desepingler
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4 mr-2" />
                    Epingler
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleLock}>
                {isLocked ? (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Deverrouiller
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Verrouiller
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {(isAuthor || isModerator) && (
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce sujet?</DialogTitle>
            <DialogDescription>
              Cette action est irreversible. Le sujet et toutes ses réponses
              seront definitivement supprimes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
