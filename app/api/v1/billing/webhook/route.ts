import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RZP_WEBHOOK_SECRET || process.env.RZP_PROD_KEY_SECRET!
      )
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    const client = await clientPromise;
    const db = client.db();

    switch (event.event) {
      case "payment.captured":
        // Payment was successfully captured
        const paymentData = event.payload.payment.entity;

        // Log the webhook event
        await db.collection("webhook_logs").insertOne({
          event: event.event,
          paymentId: paymentData.id,
          orderId: paymentData.order_id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: paymentData.status,
          createdAt: new Date(),
        });

        // Update pending order if exists
        await db.collection("pending_orders").updateOne(
          { orderId: paymentData.order_id },
          {
            $set: {
              webhookReceived: true,
              webhookStatus: "captured",
              webhookTimestamp: new Date(),
            },
          }
        );
        break;

      case "payment.failed":
        // Payment failed
        const failedPaymentData = event.payload.payment.entity;

        await db.collection("webhook_logs").insertOne({
          event: event.event,
          paymentId: failedPaymentData.id,
          orderId: failedPaymentData.order_id,
          amount: failedPaymentData.amount,
          currency: failedPaymentData.currency,
          status: failedPaymentData.status,
          error: failedPaymentData.error_description,
          createdAt: new Date(),
        });

        // Update pending order
        await db.collection("pending_orders").updateOne(
          { orderId: failedPaymentData.order_id },
          {
            $set: {
              webhookReceived: true,
              webhookStatus: "failed",
              webhookTimestamp: new Date(),
              error: failedPaymentData.error_description,
            },
          }
        );
        break;

      default:
        // Log other events
        await db.collection("webhook_logs").insertOne({
          event: event.event,
          payload: event.payload,
          createdAt: new Date(),
        });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
