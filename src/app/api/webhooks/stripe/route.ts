import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { markArtworkSold, updateOrderBySession } from "@/lib/store";
import type Stripe from "stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const artworkId = session.metadata?.artworkId;

    await updateOrderBySession(session.id, {
      status: "paid",
      customerEmail: session.customer_details?.email ?? null,
      paidAt: new Date().toISOString(),
    });

    if (artworkId) {
      await markArtworkSold(artworkId);
    }
  }

  return NextResponse.json({ received: true });
}
