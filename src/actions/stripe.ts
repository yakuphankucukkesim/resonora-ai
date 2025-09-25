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
  try {
    const serverSession = await auth();

    if (!serverSession?.user?.id) {
      console.error("No authenticated user found", { session: serverSession });
      throw new Error("User not authenticated");
    }

    console.log("Creating checkout session for user", { userId: serverSession.user.id, priceId });

    const user = await db.user.findUnique({
      where: {
        id: serverSession.user.id,
      },
      select: { stripeCustomerId: true, email: true, name: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    let stripeCustomerId = user.stripeCustomerId;

    // Create Stripe customer if one doesn't exist
    if (!stripeCustomerId) {
      try {
        const stripeCustomer = await stripe.customers.create({
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          metadata: {
            userId: serverSession.user.id,
          },
        });

        stripeCustomerId = stripeCustomer.id;

        // Update user with the new Stripe customer ID
        await db.user.update({
          where: { id: serverSession.user.id },
          data: { stripeCustomerId },
        });

        console.log("Created new Stripe customer", {
          customerId: stripeCustomerId,
          userId: serverSession.user.id,
        });
      } catch (error) {
        console.error("Error creating Stripe customer", error);
        throw new Error("Failed to create Stripe customer");
      }
    }

    try {
      // Validate and ensure BASE_URL has proper scheme
      if (!env.BASE_URL) {
        throw new Error("BASE_URL environment variable is not set");
      }
      
      // Ensure the URL has a proper scheme
      let baseUrl = env.BASE_URL;
      if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        baseUrl = `https://${baseUrl}`;
      }
      
      console.log("Using base URL for Stripe:", baseUrl);
      
      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: PRICE_IDS[priceId], quantity: 1 }],
        customer: stripeCustomerId,
        mode: "payment",
        success_url: `${baseUrl}/dashboard?success=true`,
        cancel_url: `${baseUrl}/dashboard?canceled=true`,
      });

      if (!session.url) {
        console.error("Stripe session created without URL", { sessionId: session.id });
        throw new Error("Failed to create session URL");
      }

      console.log("Stripe checkout session created", {
        sessionId: session.id,
        customerId: stripeCustomerId,
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
  } catch (error) {
    // Don't treat NEXT_REDIRECT as an error - it's expected behavior
    if (error instanceof Error && (error.message.includes('NEXT_REDIRECT') || (error as any).digest?.includes('NEXT_REDIRECT'))) {
      throw error; // Re-throw redirect errors without logging
    }
    console.error("Unexpected error in createCheckoutSession", error);
    throw new Error("Failed to create checkout session");
  }
}