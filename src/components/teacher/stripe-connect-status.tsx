"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StripeConnectStatusProps {
  className?: string;
}

interface ConnectStatus {
  connected: boolean;
  onboarded: boolean;
  accountId: string | null;
  dashboardUrl: string | null;
}

export function StripeConnectStatus({ className }: StripeConnectStatusProps) {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/stripe/connect");
      if (!response.ok) {
        throw new Error("Erreur lors de la verification du statut");
      }
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la connexion");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setIsConnecting(false);
    }
  }, []);

  const handleViewDashboard = useCallback(() => {
    if (status?.dashboardUrl) {
      window.open(status.dashboardUrl, "_blank");
    }
  }, [status?.dashboardUrl]);

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-10 w-32 rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-destructive", className)}>
        <CardHeader>
          <CardTitle>Paiements</CardTitle>
          <CardDescription className="text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchStatus} variant="outline">
            Reessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Not connected - show connect button
  if (!status?.connected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Paiements</CardTitle>
          <CardDescription>
            Connectez votre compte Stripe pour recevoir vos paiements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full sm:w-auto"
          >
            {isConnecting ? "Redirection..." : "Connecter avec Stripe"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Connected but not fully onboarded
  if (!status.onboarded) {
    return (
      <Card className={cn("border-yellow-500", className)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Paiements</CardTitle>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              En cours
            </Badge>
          </div>
          <CardDescription>
            Completez votre configuration Stripe pour commencer a recevoir des
            paiements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full sm:w-auto"
          >
            {isConnecting ? "Redirection..." : "Terminer la configuration"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Fully connected and onboarded
  return (
    <Card className={cn("border-green-500", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Paiements</CardTitle>
          <Badge className="bg-green-100 text-green-800">Connecte</Badge>
        </div>
        <CardDescription>
          Votre compte Stripe est configure. Vous pouvez recevoir des paiements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleViewDashboard}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Voir le tableau de bord Stripe
        </Button>
      </CardContent>
    </Card>
  );
}
