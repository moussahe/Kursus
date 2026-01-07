import Stripe from "stripe";

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not defined");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return _stripe;
}

// Backward compatibility export - lazily evaluated
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

// Platform commission: 30%
export const PLATFORM_FEE_PERCENT = 30;

/**
 * Create a Stripe Connect Express account for a teacher
 */
export async function createConnectAccount(
  teacherId: string,
  email: string,
): Promise<Stripe.Account> {
  const account = await stripe.accounts.create({
    type: "express",
    country: "FR",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
    metadata: {
      teacherId,
    },
  });

  return account;
}

/**
 * Create an account link for Stripe Connect onboarding
 */
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string,
): Promise<Stripe.AccountLink> {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return accountLink;
}

/**
 * Create a Stripe login link for connected accounts
 */
export async function createLoginLink(
  accountId: string,
): Promise<Stripe.LoginLink> {
  const loginLink = await stripe.accounts.createLoginLink(accountId);
  return loginLink;
}

/**
 * Get Stripe Connect account details
 */
export async function getConnectAccount(
  accountId: string,
): Promise<Stripe.Account> {
  const account = await stripe.accounts.retrieve(accountId);
  return account;
}

/**
 * Calculate platform fee from course price
 */
export function calculatePlatformFee(priceInCents: number): number {
  return Math.round(priceInCents * (PLATFORM_FEE_PERCENT / 100));
}

/**
 * Calculate teacher revenue from course price
 */
export function calculateTeacherRevenue(priceInCents: number): number {
  return priceInCents - calculatePlatformFee(priceInCents);
}

/**
 * Create a Checkout Session for course purchase with Connect
 */
export async function createCheckoutSession({
  courseId,
  courseTitle,
  coursePrice,
  buyerId,
  childId,
  teacherStripeAccountId,
  successUrl,
  cancelUrl,
}: {
  courseId: string;
  courseTitle: string;
  coursePrice: number; // in cents
  buyerId: string;
  childId?: string;
  teacherStripeAccountId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const platformFee = calculatePlatformFee(coursePrice);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    locale: "fr",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: courseTitle,
            description: `Acces au cours: ${courseTitle}`,
          },
          unit_amount: coursePrice,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFee,
      transfer_data: {
        destination: teacherStripeAccountId,
      },
      metadata: {
        courseId,
        buyerId,
        childId: childId || "",
      },
    },
    metadata: {
      courseId,
      buyerId,
      childId: childId || "",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

/**
 * Verify Stripe webhook signature
 */
export function constructWebhookEvent(
  body: string,
  signature: string,
  webhookSecret: string,
): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

export const PLANS = {
  FREE: {
    name: "Gratuit",
    description: "Acces limite aux cours gratuits",
    price: 0,
    features: [
      "Acces aux cours gratuits",
      "Assistant IA limite (5 questions/jour)",
      "1 enfant",
    ],
  },
  PREMIUM: {
    name: "Premium",
    description: "Acces complet a tous les cours",
    price: 1999, // 19.99 EUR in cents
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    features: [
      "Acces illimite a tous les cours",
      "Assistant IA illimite",
      "Jusqu'a 5 enfants",
      "Suivi de progression detaille",
      "Support prioritaire",
    ],
  },
  FAMILY: {
    name: "Famille",
    description: "Pour les grandes familles",
    price: 2999, // 29.99 EUR in cents
    priceId: process.env.STRIPE_FAMILY_PRICE_ID,
    features: [
      "Tout Premium",
      "Enfants illimites",
      "Sessions de tutorat (2/mois)",
      "Rapports mensuels",
    ],
  },
} as const;
