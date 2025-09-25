"use server";

import { redirect } from "next/navigation";
import Stripe from "stripe";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// Use SDK default API version to avoid version mismatches locally
const stripe = new Stripe(env.STRIPE_SECRET_KEY);
 
export type PriceId = "small" | "medium" | "large";

const PRICE_IDS: Record<PriceId, string> = {
  small: env.STRIPE_SMALL_CREDIT_PACK,
  medium: env.STRIPE_MEDIUM_CREDIT_PACK,
  large: env.STRIPE_LARGE_CREDIT_PACK,
};

export async function createCheckoutSession(priceId: PriceId) {
  const serverSession = await auth();

  const user = await db.user.findUniqueOrThrow({
    where: {
      id: serverSession?.user.id,
    },
    select: { stripeCustomerId: true },
  });

  if (!user.stripeCustomerId) {
    throw new Error("User has no stripeCustomerId");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: PRICE_IDS[priceId], quantity: 1 }],
      customer: user.stripeCustomerId,
      mode: "payment",
      success_url: `${env.BASE_URL}/dashboard?success=true`,
      cancel_url: `${env.BASE_URL}/dashboard?canceled=true`,
    });

    if (!session.url) {
      console.error("Stripe session created without URL", { sessionId: session.id });
      throw new Error("Failed to create session URL");
    }

    console.log("Stripe checkout session created", {
      sessionId: session.id,
      customerId: user.stripeCustomerId,
      price: PRICE_IDS[priceId],
    });

    redirect(session.url);
  } catch (err) {
    // Don't log NEXT_REDIRECT as an error - it's expected behavior
    if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
      throw err; // Re-throw redirect errors without logging
    }
    console.error("Error creating Stripe session", err);
    throw err;
  }
}