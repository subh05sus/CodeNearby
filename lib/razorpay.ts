import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay instance
export const razorpayInstance = new Razorpay({
  key_id: process.env.RZP_TEST_KEY_ID!,
  key_secret: process.env.RZP_TEST_KEY_SECRET!,
});

// Razorpay configuration
export const razorpayConfig = {
  keyId: process.env.RZP_TEST_KEY_ID!,
  keySecret: process.env.RZP_TEST_KEY_SECRET!,
  currency: {
    USD: "USD",
    INR: "INR",
  },
  theme: {
    color: "#3399cc",
  },
};

// Convert amount to smallest currency unit (paise for INR, cents for USD)
export const convertToSmallestUnit = (amount: number): number => {
  return Math.round(amount * 100);
};

// Convert amount from smallest unit to regular unit
export const convertFromSmallestUnit = (amount: number): number => {
  return amount / 100;
};

// Generate receipt ID
export const generateReceiptId = (userId: string): string => {
  return `rcpt_${Date.now()}_${userId.slice(-8)}`;
};

// Validate Razorpay payment signature
export const validatePaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RZP_TEST_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === signature;
};

// Razorpay order status
export const ORDER_STATUS = {
  CREATED: "created",
  ATTEMPTED: "attempted",
  PAID: "paid",
} as const;

// Razorpay payment status
export const PAYMENT_STATUS = {
  CREATED: "created",
  AUTHORIZED: "authorized",
  CAPTURED: "captured",
  REFUNDED: "refunded",
  FAILED: "failed",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
