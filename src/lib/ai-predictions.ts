import { getAnthropicClient } from "./ai";

// System prompt for predictive analytics
export function getPredictiveAnalyticsSystemPrompt(): string {
  return `Tu es un analyste de donnees educatives expert pour Schoolaris, une plateforme educative francaise.

TON ROLE:
- Analyser les tendances historiques d'apprentissage d'un enfant
- PREDIRE les performances futures basees sur les patterns observes
- Identifier les RISQUES potentiels avant qu'ils ne deviennent problematiques
- Fournir des PREVISIONS chiffrees et justifiees

METHODOLOGIE D'ANALYSE:
1. Examine les tendances sur les 4 dernieres semaines
2. Calcule la velocite d'apprentissage (leçons/semaine)
3. Identifie les patterns de baisse ou de hausse
4. Evalue les facteurs de risque (inactivité, scores en baisse, matieres faibles)

FORMAT DE REPONSE (JSON):
{
  "predictions": {
    "nextWeekLessons": { "predicted": number, "confidence": "high" | "medium" | "low", "trend": "up" | "stable" | "down" },
    "nextMonthProgress": { "predicted": number, "confidence": "high" | "medium" | "low" },
    "quizScoreForecast": { "predicted": number | null, "trend": "improving" | "stable" | "declining" },
    "engagementScore": { "current": number, "predicted": number, "trend": "up" | "stable" | "down" }
  },
  "riskIndicators": [
    {
      "level": "high" | "medium" | "low",
      "category": "inactivity" | "performance" | "engagement" | "subject_weakness",
      "title": "Titre du risque",
      "description": "Description detaillee",
      "probability": number,
      "preventiveAction": "Action preventive recommandee"
    }
  ],
  "trendAnalysis": {
    "weekOverWeek": { "direction": "up" | "stable" | "down", "percentage": number },
    "monthOverMonth": { "direction": "up" | "stable" | "down", "percentage": number },
    "velocityChange": "accelerating" | "steady" | "slowing"
  },
  "forecast": {
    "shortTerm": "Prevision pour les 2 prochaines semaines",
    "mediumTerm": "Prevision pour le prochain mois",
    "keyFactors": ["facteur1", "facteur2"]
  },
  "recommendations": [
    {
      "priority": "urgent" | "important" | "suggested",
      "action": "Action concrete a prendre",
      "expectedImpact": "Impact attendu si action prise"
    }
  ]
}

REGLES:
- Reponds UNIQUEMENT en JSON valide
- Base tes predictions sur les DONNEES fournies, pas des suppositions
- Sois precis avec les chiffres (predictions chiffrees)
- Les risques doivent etre objectifs et bases sur des patterns reels
- Maximum 4 risques identifies
- Maximum 3 recommandations
- Les predictions doivent avoir un niveau de confiance justifie`;
}

// Types for predictive analytics
export interface PredictionValue {
  predicted: number;
  confidence: "high" | "medium" | "low";
  trend?: "up" | "stable" | "down" | "improving" | "declining";
}

export interface RiskIndicator {
  level: "high" | "medium" | "low";
  category: "inactivity" | "performance" | "engagement" | "subject_weakness";
  title: string;
  description: string;
  probability: number;
  preventiveAction: string;
}

export interface TrendAnalysis {
  weekOverWeek: {
    direction: "up" | "stable" | "down";
    percentage: number;
  };
  monthOverMonth: {
    direction: "up" | "stable" | "down";
    percentage: number;
  };
  velocityChange: "accelerating" | "steady" | "slowing";
}

export interface Forecast {
  shortTerm: string;
  mediumTerm: string;
  keyFactors: string[];
}

export interface Recommendation {
  priority: "urgent" | "important" | "suggested";
  action: string;
  expectedImpact: string;
}

export interface PredictiveAnalyticsResponse {
  predictions: {
    nextWeekLessons: PredictionValue;
    nextMonthProgress: PredictionValue;
    quizScoreForecast: {
      predicted: number | null;
      trend: "improving" | "stable" | "declining";
    };
    engagementScore: {
      current: number;
      predicted: number;
      trend: "up" | "stable" | "down";
    };
  };
  riskIndicators: RiskIndicator[];
  trendAnalysis: TrendAnalysis;
  forecast: Forecast;
  recommendations: Recommendation[];
}

// Calculate historical metrics for predictions
export interface HistoricalMetrics {
  childName: string;
  gradeLevel: string;
  // Weekly activity data (last 4 weeks)
  weeklyData: Array<{
    weekNumber: number;
    lessonsCompleted: number;
    timeSpentMinutes: number;
    avgQuizScore: number | null;
    activeDays: number;
  }>;
  // Subject performance
  subjectPerformance: Array<{
    subject: string;
    recentScores: number[];
    trend: "improving" | "stable" | "declining";
  }>;
  // Current status
  currentStatus: {
    daysSinceLastActivity: number;
    currentStreak: number;
    totalLessonsCompleted: number;
    avgQuizScoreAllTime: number | null;
    coursesInProgress: number;
    coursesCompleted: number;
  };
  // Engagement metrics
  engagement: {
    aiConversationsThisMonth: number;
    exercisesAttemptedThisMonth: number;
    quizzesTakenThisMonth: number;
    avgSessionDuration: number;
  };
}

// Generate predictions using Claude AI
export async function generatePredictions(
  metrics: HistoricalMetrics,
): Promise<PredictiveAnalyticsResponse> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 2048,
    system: getPredictiveAnalyticsSystemPrompt(),
    messages: [
      {
        role: "user",
        content: `Analyse ces donnees historiques et genere des predictions pour ${metrics.childName}:\n\n${JSON.stringify(metrics, null, 2)}`,
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("Invalid AI response");
  }

  try {
    return JSON.parse(textContent.text) as PredictiveAnalyticsResponse;
  } catch {
    // Return fallback predictions if AI fails
    return generateFallbackPredictions(metrics);
  }
}

// Fallback predictions based on simple heuristics
function generateFallbackPredictions(
  metrics: HistoricalMetrics,
): PredictiveAnalyticsResponse {
  const recentWeeks = metrics.weeklyData.slice(-2);
  const avgLessonsRecent =
    recentWeeks.length > 0
      ? recentWeeks.reduce((sum, w) => sum + w.lessonsCompleted, 0) /
        recentWeeks.length
      : 0;

  const olderWeeks = metrics.weeklyData.slice(0, -2);
  const avgLessonsOlder =
    olderWeeks.length > 0
      ? olderWeeks.reduce((sum, w) => sum + w.lessonsCompleted, 0) /
        olderWeeks.length
      : avgLessonsRecent;

  const weekOverWeekChange =
    avgLessonsOlder > 0
      ? ((avgLessonsRecent - avgLessonsOlder) / avgLessonsOlder) * 100
      : 0;

  const riskIndicators: RiskIndicator[] = [];

  // Check for inactivity risk
  if (metrics.currentStatus.daysSinceLastActivity > 3) {
    riskIndicators.push({
      level:
        metrics.currentStatus.daysSinceLastActivity > 7 ? "high" : "medium",
      category: "inactivity",
      title: "Risque d'inactivité",
      description: `${metrics.childName} n'a pas etudie depuis ${metrics.currentStatus.daysSinceLastActivity} jours`,
      probability: Math.min(
        90,
        50 + metrics.currentStatus.daysSinceLastActivity * 5,
      ),
      preventiveAction:
        "Planifiez une session d'etude ensemble pour relancer la motivation",
    });
  }

  // Check for performance decline
  const recentScores = metrics.weeklyData
    .slice(-2)
    .filter((w) => w.avgQuizScore !== null)
    .map((w) => w.avgQuizScore as number);
  const avgRecentScore =
    recentScores.length > 0
      ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      : null;

  if (avgRecentScore !== null && avgRecentScore < 60) {
    riskIndicators.push({
      level: avgRecentScore < 50 ? "high" : "medium",
      category: "performance",
      title: "Performance en baisse",
      description: `Score moyen recent de ${Math.round(avgRecentScore)}% en dessous des attentes`,
      probability: 70,
      preventiveAction:
        "Revoir les leçons difficiles avec l'assistant IA ou envisager des exercices supplementaires",
    });
  }

  // Check for subject weakness
  const weakSubjects = metrics.subjectPerformance.filter(
    (s) => s.trend === "declining",
  );
  if (weakSubjects.length > 0) {
    riskIndicators.push({
      level: "medium",
      category: "subject_weakness",
      title: `Difficultes en ${weakSubjects[0].subject}`,
      description: `Les resultats en ${weakSubjects[0].subject} sont en baisse`,
      probability: 65,
      preventiveAction: `Concentrez les efforts sur ${weakSubjects[0].subject} cette semaine`,
    });
  }

  return {
    predictions: {
      nextWeekLessons: {
        predicted: Math.round(avgLessonsRecent),
        confidence: recentWeeks.length >= 2 ? "medium" : "low",
        trend:
          weekOverWeekChange > 10
            ? "up"
            : weekOverWeekChange < -10
              ? "down"
              : "stable",
      },
      nextMonthProgress: {
        predicted: Math.round(avgLessonsRecent * 4),
        confidence: "medium",
      },
      quizScoreForecast: {
        predicted: avgRecentScore,
        trend:
          weekOverWeekChange > 5
            ? "improving"
            : weekOverWeekChange < -5
              ? "declining"
              : "stable",
      },
      engagementScore: {
        current: calculateEngagementScore(metrics),
        predicted: calculateEngagementScore(metrics),
        trend: "stable",
      },
    },
    riskIndicators,
    trendAnalysis: {
      weekOverWeek: {
        direction:
          weekOverWeekChange > 10
            ? "up"
            : weekOverWeekChange < -10
              ? "down"
              : "stable",
        percentage: Math.round(Math.abs(weekOverWeekChange)),
      },
      monthOverMonth: {
        direction: "stable",
        percentage: 0,
      },
      velocityChange: "steady",
    },
    forecast: {
      shortTerm: `${metrics.childName} devrait completer environ ${Math.round(avgLessonsRecent)} leçons cette semaine.`,
      mediumTerm: `Prevision de ${Math.round(avgLessonsRecent * 4)} leçons sur le prochain mois.`,
      keyFactors: ["regularite", "engagement"],
    },
    recommendations: [
      {
        priority: riskIndicators.length > 0 ? "important" : "suggested",
        action: "Maintenir un rythme regulier de 3-5 leçons par semaine",
        expectedImpact: "Progression constante et meilleure retention",
      },
    ],
  };
}

// Calculate engagement score (0-100)
function calculateEngagementScore(metrics: HistoricalMetrics): number {
  let score = 50; // Base score

  // Recent activity bonus
  if (metrics.currentStatus.daysSinceLastActivity === 0) {
    score += 15;
  } else if (metrics.currentStatus.daysSinceLastActivity <= 2) {
    score += 10;
  } else if (metrics.currentStatus.daysSinceLastActivity > 5) {
    score -= 15;
  }

  // Streak bonus
  if (metrics.currentStatus.currentStreak >= 7) {
    score += 15;
  } else if (metrics.currentStatus.currentStreak >= 3) {
    score += 10;
  }

  // AI usage bonus
  if (metrics.engagement.aiConversationsThisMonth >= 5) {
    score += 10;
  }

  // Exercise attempts bonus
  if (metrics.engagement.exercisesAttemptedThisMonth >= 10) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}
