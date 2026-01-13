"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createReplySchema } from "@/lib/validations/forum";

const formSchema = createReplySchema.pick({ content: true });
type FormData = z.infer<typeof formSchema>;

interface ReplyFormProps {
  topicId: string;
  parentReplyId?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function ReplyForm({
  topicId,
  parentReplyId,
  onCancel,
  onSuccess,
}: ReplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/forums/${topicId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          parentReplyId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'envoi");
      }

      toast.success("Reponse publiee", {
        description: "Votre reponse a ete envoyee avec succes.",
      });
      reset();
      onSuccess?.();
      router.refresh();
    } catch (error) {
      toast.error("Erreur", {
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="relative">
        <Textarea
          placeholder={
            parentReplyId
              ? "Ecrivez votre reponse..."
              : "Participez a la discussion..."
          }
          rows={4}
          {...register("content")}
          className="resize-none"
        />
        {errors.content && (
          <p className="text-sm text-destructive mt-1">
            {errors.content.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Repondre
        </Button>
      </div>
    </form>
  );
}
