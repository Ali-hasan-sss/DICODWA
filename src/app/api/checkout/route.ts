import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createOrder, getArtworkById } from "@/lib/store";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { artworkId, locale = "en" } = body as {
      artworkId?: string;
      locale?: string;
    };

    if (!artworkId) {
      return NextResponse.json({ error: "Missing artworkId" }, { status: 400 });
    }

    const artwork = await getArtworkById(artworkId);
    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }
    if (artwork.status !== "available") {
      return NextResponse.json({ error: "Artwork is not available" }, { status: 400 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local",
        },
        { status: 503 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const stripe = getStripe();
    const title = artwork.title[locale === "ar" ? "ar" : "en"];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: artwork.currency || "usd",
            unit_amount: Math.round(artwork.price * 100),
            product_data: {
              name: title,
              description: artwork.description[locale === "ar" ? "ar" : "en"],
              images: artwork.image.startsWith("http")
                ? [artwork.image]
                : [`${siteUrl}${artwork.image}`],
            },
          },
        },
      ],
      metadata: {
        artworkId: artwork.id,
      },
      success_url: `${siteUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/${locale}/checkout/cancel`,
    });

    await createOrder({
      id: `ord-${randomUUID().slice(0, 8)}`,
      artworkId: artwork.id,
      artworkTitle: title,
      amount: artwork.price,
      currency: artwork.currency || "usd",
      customerEmail: null,
      stripeSessionId: session.id,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
