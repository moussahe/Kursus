"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Target,
  MessageCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AIInsight, AIInsightsResponse } from "@/lib/ai";

interface InsightsData {
  childId: string;
  childName: string;
  generatedAt: string;
  insights: AIInsightsResponse;
}

interface AIInsightsProps {
  childId: string;
}

const insightConfig: Record<
  AIInsight["type"],
  {
    icon: typeof TrendingUp;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  strength: {
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  concern: {
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  suggestion: {
    icon: Lightbulb,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
};

export function AIInsights({ childId }: AIInsightsProps) {
  const { data, isLoading, error, refetch, isFetching } =
    useQuery<InsightsData>({
      queryKey: ["insights", childId],
      queryFn: async () => {
        const res = await fetch(`/api/parent/insights?childId=${childId}`);
        if (!res.ok) throw new Error("Erreur de chargement");
        return res.json();
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
            <Sparkles className="h-6 w-6 animate-pulse text-violet-600" />
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Analyse en cours avec l&apos;IA...
          </p>
          <Loader2 className="mt-2 h-5 w-5 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Impossible de generer les insights
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => refetch()}
          >
            Reessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { insights } = data;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Insights IA pour {data.childName}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
          </Button>
        </div>
        <p className="mt-2 text-sm text-gray-600">{insights.summary}</p>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-3">
          {insights.insights.map((insight, index) => {
            const config = insightConfig[insight.type];
            const Icon = config.icon;

            return (
              <div
                key={index}
                className={cn(
                  "rounded-lg border p-4",
                  config.borderColor,
                  config.bgColor,
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                      config.bgColor,
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900">
                      {insight.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      {insight.description}
                    </p>
                    <div className="mt-2 flex items-start gap-2 rounded bg-white/60 p-2">
                      <Lightbulb className="h-4 w-4 flex-shrink-0 text-amber-500 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        {insight.actionable}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Goal */}
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            <h4 className="font-medium text-emerald-900">
              Objectif de la semaine
            </h4>
          </div>
          <p className="mt-1 text-sm text-emerald-700">{insights.weeklyGoal}</p>
        </div>

        {/* Encouragement for child */}
        <div className="mt-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-amber-600" />
            <h4 className="font-medium text-amber-900">
              Message pour {data.childName}
            </h4>
          </div>
          <p className="mt-1 text-sm text-amber-800 italic">
            &ldquo;{insights.encouragement}&rdquo;
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Genere le{" "}
          {new Date(data.generatedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </CardContent>
    </Card>
  );
}
