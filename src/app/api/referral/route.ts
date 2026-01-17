import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "crypto";

// Generate a random alphanumeric string
function generateRandomSuffix(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid confusing characters like O/0, I/1
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

// Generate a unique referral code
function generateReferralCode(name: string): string {
  const cleanName = name
    .split(" ")[0]
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 6);
  const suffix = generateRandomSuffix(4);
  return `${cleanName}${suffix}`;
}

// GET /api/referral - Get user's referral info
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Get or create user's referral
    let referral = await prisma.referral.findFirst({
      where: {
        referrerId: session.user.id,
        referredId: null, // Get the "template" referral (unused)
      },
      orderBy: { createdAt: "desc" },
    });

    // If no referral code exists, create one
    if (!referral) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });

      const code = generateReferralCode(user?.name || "USER");

      referral = await prisma.referral.create({
        data: {
          referrerId: session.user.id,
          referrerCode: code,
          referrerReward: 500, // 5€ in credits
          referredReward: 500, // 5€ discount for new user
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      });
    }

    // Get stats
    const [successfulReferrals, pendingReferrals, totalCreditsEarned] =
      await Promise.all([
        prisma.referral.count({
          where: {
            referrerId: session.user.id,
            status: { in: ["CONVERTED", "REWARDED"] },
          },
        }),
        prisma.referral.count({
          where: {
            referrerId: session.user.id,
            status: "SIGNED_UP",
          },
        }),
        prisma.referralCredit.aggregate({
          where: {
            userId: session.user.id,
            source: "referral_reward",
          },
          _sum: { amount: true },
        }),
      ]);

    // Get available credits
    const availableCredits = await prisma.referralCredit.aggregate({
      where: {
        userId: session.user.id,
        usedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      _sum: { amount: true },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kursus.fr";

    return NextResponse.json({
      code: referral.referrerCode,
      link: `${baseUrl}/r/${referral.referrerCode}`,
      stats: {
        successfulReferrals,
        pendingReferrals,
        totalCreditsEarned: totalCreditsEarned._sum.amount || 0,
        availableCredits: availableCredits._sum.amount || 0,
      },
      rewards: {
        referrerReward: referral.referrerReward,
        referredReward: referral.referredReward,
      },
    });
  } catch (error) {
    console.error("Referral GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/referral - Regenerate referral code
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const customCode = body.customCode as string | undefined;

    let code: string;

    if (customCode) {
      // Validate custom code
      const customCodeSchema = z
        .string()
        .min(4)
        .max(12)
        .regex(/^[A-Z0-9]+$/, "Code must be uppercase alphanumeric");

      const validated = customCodeSchema.parse(customCode.toUpperCase());

      // Check if code is already taken
      const existing = await prisma.referral.findUnique({
        where: { referrerCode: validated },
      });

      if (existing && existing.referrerId !== session.user.id) {
        return NextResponse.json(
          { error: "Ce code est deja utilise" },
          { status: 400 },
        );
      }

      code = validated;
    } else {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });
      code = generateReferralCode(user?.name || "USER");
    }

    // Create new referral with the code
    const referral = await prisma.referral.create({
      data: {
        referrerId: session.user.id,
        referrerCode: code,
        referrerReward: 500,
        referredReward: 500,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kursus.fr";

    return NextResponse.json({
      code: referral.referrerCode,
      link: `${baseUrl}/r/${referral.referrerCode}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Code invalide", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Referral POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
