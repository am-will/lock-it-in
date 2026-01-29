import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import type Stripe from "stripe";

/**
 * HTTP Actions for Stripe Webhooks
 * 
 * Routes:
 * - POST /stripe/checkout - Stripe Checkout webhooks
 * - POST /stripe/identity - Stripe Identity webhooks
 * 
 * Both endpoints verify Stripe signatures and handle idempotency
 */

const http = httpRouter();

/**
 * Verify Stripe webhook signature
 */
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<Stripe.Event | null> {
  const Stripe = await import("stripe");
  const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
  });

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return event as Stripe.Event;
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return null;
  }
}

/**
 * Check if webhook event has already been processed (idempotency)
 */
async function isEventProcessed(ctx: any, eventId: string): Promise<boolean> {
  const existingEvent = await ctx.runQuery(api.webhooks.getEventById, {
    eventId,
  });
  return existingEvent !== null;
}

/**
 * Record processed webhook event
 */
async function recordEvent(ctx: any, eventId: string, eventType: string, metadata: any) {
  await ctx.runMutation(api.webhooks.recordEvent, {
    eventId,
    eventType,
    metadata,
  });
}

/**
 * Stripe Checkout webhook handler
 */
http.route({
  path: "/stripe/checkout",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    // Verify signature
    const secret = process.env.STRIPE_WEBHOOK_SECRET_CHECKOUT;
    if (!secret) {
      console.error("STRIPE_WEBHOOK_SECRET_CHECKOUT not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const event = await verifyStripeSignature(payload, signature, secret);
    if (!event) {
      return new Response("Invalid signature", { status: 400 });
    }

    // Idempotency check
    const alreadyProcessed = await isEventProcessed(ctx, event.id);
    if (alreadyProcessed) {
      console.log(`[Checkout Webhook] Event ${event.id} already processed`);
      return new Response(JSON.stringify({ received: true, idempotent: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`[Checkout Webhook] Processing event: ${event.type} (${event.id})`);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          
          // Extract metadata
          const orderId = session.metadata?.orderId;
          if (!orderId) {
            throw new Error("No orderId in session metadata");
          }

          // Mark order as paid
          await ctx.runMutation(api.orders.markPaid, {
            orderId,
            stripeCheckoutSessionId: session.id,
          });

          console.log(`[Checkout Webhook] Order ${orderId} marked as paid`);

          // Create grading request if grading was included
          const includeGrading = session.metadata?.includeGrading === "true";
          if (includeGrading) {
            try {
              const gradingResult = await ctx.runMutation(api.grading.createRequest, {
                orderId,
                gradeCompany: undefined, // Use partner's default
                notes: "Grading service requested at checkout",
              });
              console.log(`[Checkout Webhook] Grading request created for order ${orderId}`);

              // Optionally submit to partner immediately (async)
              // Note: This would be done in a separate action or scheduled function
              // to avoid blocking the webhook response
            } catch (gradingError) {
              // Log error but don't fail the webhook - grading can be handled manually
              console.error(`[Checkout Webhook] Failed to create grading request for order ${orderId}:`, gradingError);
            }
          }
          break;
        }

        case "checkout.session.expired": {
          const session = event.data.object as Stripe.Checkout.Session;
          const orderId = session.metadata?.orderId;
          
          if (orderId) {
            await ctx.runMutation(api.orders.expireOrder, { orderId });
            console.log(`[Checkout Webhook] Order ${orderId} expired`);
          }
          break;
        }

        case "charge.refunded": {
          const charge = event.data.object as Stripe.Charge;
          // Handle refund if needed
          console.log(`[Checkout Webhook] Charge refunded: ${charge.id}`);
          break;
        }

        default:
          console.log(`[Checkout Webhook] Unhandled event type: ${event.type}`);
      }

      // Record event as processed
      await recordEvent(ctx, event.id, event.type, {
        objectId: (event.data.object as any).id,
      });

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("[Checkout Webhook] Error processing event:", error);
      return new Response(
        JSON.stringify({ error: "Failed to process webhook" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * Stripe Identity webhook handler
 */
http.route({
  path: "/stripe/identity",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    // Verify signature
    const secret = process.env.STRIPE_WEBHOOK_SECRET_IDENTITY;
    if (!secret) {
      console.error("STRIPE_WEBHOOK_SECRET_IDENTITY not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const event = await verifyStripeSignature(payload, signature, secret);
    if (!event) {
      return new Response("Invalid signature", { status: 400 });
    }

    // Idempotency check
    const alreadyProcessed = await isEventProcessed(ctx, event.id);
    if (alreadyProcessed) {
      console.log(`[Identity Webhook] Event ${event.id} already processed`);
      return new Response(JSON.stringify({ received: true, idempotent: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`[Identity Webhook] Processing event: ${event.type} (${event.id})`);

    try {
      switch (event.type) {
        case "identity.verification_session.verified": {
          const session = event.data.object as Stripe.Identity.VerificationSession;
          
          await ctx.runMutation(api.identity.updateStatusFromWebhook, {
            stripeSessionId: session.id,
            status: "verified",
            verificationReportId: session.last_verification_report || undefined,
            processedAt: Date.now(),
          });

          console.log(`[Identity Webhook] Session ${session.id} verified`);
          break;
        }

        case "identity.verification_session.canceled": {
          const session = event.data.object as Stripe.Identity.VerificationSession;
          
          await ctx.runMutation(api.identity.updateStatusFromWebhook, {
            stripeSessionId: session.id,
            status: "canceled",
            processedAt: Date.now(),
          });

          console.log(`[Identity Webhook] Session ${session.id} canceled`);
          break;
        }

        case "identity.verification_session.requires_input": {
          const session = event.data.object as Stripe.Identity.VerificationSession;
          
          await ctx.runMutation(api.identity.updateStatusFromWebhook, {
            stripeSessionId: session.id,
            status: "requires_input",
            processedAt: Date.now(),
          });

          console.log(`[Identity Webhook] Session ${session.id} requires input`);
          break;
        }

        case "identity.verification_session.created":
        case "identity.verification_session.processing":
          // These are informational, no action needed
          console.log(`[Identity Webhook] Session event: ${event.type}`);
          break;

        default:
          console.log(`[Identity Webhook] Unhandled event type: ${event.type}`);
      }

      // Record event as processed
      await recordEvent(ctx, event.id, event.type, {
        objectId: (event.data.object as any).id,
      });

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("[Identity Webhook] Error processing event:", error);
      return new Response(
        JSON.stringify({ error: "Failed to process webhook" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

/**
 * Health check endpoint
 */
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    return new Response(JSON.stringify({ status: "ok", timestamp: Date.now() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
