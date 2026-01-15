"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Gift,
  Users,
  Copy,
  Check,
  Share2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Coins,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ReferralData {
  code: string;
  link: string;
  stats: {
    successfulReferrals: number;
    pendingReferrals: number;
    totalCreditsEarned: number;
    availableCredits: number;
  };
  rewards: {
    referrerReward: number;
    referredReward: number;
  };
}

interface ReferralPanelProps {
  className?: string;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function ReferralPanel({ className }: ReferralPanelProps) {
  const [data, setData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const fetchReferralData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/referral");
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Erreur de chargement");
      }

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const copyToClipboard = async () => {
    if (!data) return;

    try {
      await navigator.clipboard.writeText(data.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = data.link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareVia = (platform: string) => {
    if (!data) return;

    const message = `Je t'invite a découvrir Schoolaris ! Utilise mon code ${data.code} pour obtenir ${formatCurrency(data.rewards.referredReward)} de reduction sur ton premier cours.`;
    const url = data.link;

    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${message}\n${url}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent("Invitation Schoolaris")}&body=${encodeURIComponent(`${message}\n\n${url}`)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "noopener,noreferrer");
    }

    setShowShareMenu(false);
  };

  const nativeShare = async () => {
    if (!data || !navigator.share) return;

    try {
      await navigator.share({
        title: "Invitation Schoolaris",
        text: `Je t'invite a découvrir Schoolaris ! Utilise mon code ${data.code} pour obtenir ${formatCurrency(data.rewards.referredReward)} de reduction.`,
        url: data.link,
      });
    } catch {
      // User cancelled or share failed, show fallback menu
      setShowShareMenu(true);
    }
  };

  return (
    <div className={cn("rounded-2xl bg-white shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500">
            <Gift className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Parrainez vos amis</h3>
            <p className="text-xs text-gray-500">
              Gagnez {data ? formatCurrency(data.rewards.referrerReward) : "5€"}{" "}
              par filleul
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        <Button
          onClick={fetchReferralData}
          disabled={isLoading}
          size="sm"
          variant="ghost"
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Error state */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Loading state */}
          {isLoading && !data && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-orange-300" />
              <p className="mt-4 text-sm text-gray-500">Chargement...</p>
            </div>
          )}

          {/* Data loaded */}
          {data && (
            <div className="space-y-4">
              {/* Referral Link */}
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-rose-50 p-4">
                <p className="mb-2 text-xs font-medium text-gray-600">
                  Votre lien de parrainage
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 overflow-hidden rounded-lg border border-orange-200 bg-white px-3 py-2">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {data.link}
                    </p>
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    className={cn(
                      "flex-shrink-0 gap-2",
                      copied
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-orange-500 hover:bg-orange-600",
                    )}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copie!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copier
                      </>
                    )}
                  </Button>
                </div>

                {/* Referral Code */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Code:</span>
                  <span className="rounded-md bg-white px-2 py-1 font-mono text-sm font-bold text-orange-600">
                    {data.code}
                  </span>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={nativeShare}
                    className="flex-1 gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
                  >
                    <Share2 className="h-4 w-4" />
                    Partager
                  </Button>
                  <Button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* Share Menu Dropdown */}
                {showShareMenu && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                    <button
                      onClick={() => shareVia("whatsapp")}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <ExternalLink className="h-4 w-4 text-green-600" />
                      </span>
                      WhatsApp
                    </button>
                    <button
                      onClick={() => shareVia("facebook")}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                      </span>
                      Facebook
                    </button>
                    <button
                      onClick={() => shareVia("twitter")}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100">
                        <ExternalLink className="h-4 w-4 text-sky-600" />
                      </span>
                      Twitter/X
                    </button>
                    <button
                      onClick={() => shareVia("email")}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                        <ExternalLink className="h-4 w-4 text-gray-600" />
                      </span>
                      Email
                    </button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Filleuls</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {data.stats.successfulReferrals}
                  </p>
                  {data.stats.pendingReferrals > 0 && (
                    <p className="text-xs text-amber-600">
                      +{data.stats.pendingReferrals} en attente
                    </p>
                  )}
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600">
                    <Coins className="h-4 w-4" />
                    <span className="text-xs">Credits</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-green-600">
                    {formatCurrency(data.stats.availableCredits)}
                  </p>
                  {data.stats.totalCreditsEarned >
                    data.stats.availableCredits && (
                    <p className="text-xs text-gray-500">
                      {formatCurrency(data.stats.totalCreditsEarned)} gagnes au
                      total
                    </p>
                  )}
                </div>
              </div>

              {/* How it works */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <p className="mb-3 text-sm font-medium text-gray-900">
                  Comment ca marche?
                </p>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                      1
                    </span>
                    <span>Partagez votre lien avec vos amis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                      2
                    </span>
                    <span>
                      Ils recoivent{" "}
                      {formatCurrency(data.rewards.referredReward)} de reduction
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                      3
                    </span>
                    <span>
                      Vous gagnez {formatCurrency(data.rewards.referrerReward)}{" "}
                      en credits apres leur premier achat
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
