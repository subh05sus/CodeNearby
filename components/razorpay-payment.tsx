"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

interface RazorpayPaymentProps {
  packageId: string;
  currency: "USD" | "INR";
  amount: number;
  packageName: string;
  tokens: number;
  bonus: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayPayment({
  packageId,
  currency,
  amount,
  packageName,
  tokens,
  bonus,
  onSuccess,
  onError,
  disabled = false,
  className = "",
}: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      // Load Razorpay script first
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      // Create order
      const orderResponse = await fetch("/api/v1/billing/buy-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId,
          currency,
        }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.error || "Failed to create order");
      }

      const orderData = await orderResponse.json();

      // Check if window.Razorpay is available
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded properly");
      }

      // Configure Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CodeNearby",
        description: `${packageName} - ${tokens + bonus} tokens`,
        image: "/logo.png", // Your logo URL here
        order_id: orderData.orderId,

        prefill: {
          email: orderData.userEmail || "",
          name: orderData.userName || "",
        },
        theme: {
          color: "#ff6600", // Orange primary color
        },
        handler: function (response: any) {
          handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      // Create and open Razorpay instance
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        toast.error(
          `Payment failed: ${response.error?.description || "Unknown error"}`
        );
        setIsLoading(false);
        onError?.(response.error?.description || "Payment failed");
      });

      // Open the modal
      rzp.open();
    } catch (error) {
      toast.error(`Error: ${error}`);
      setIsLoading(false);
      onError?.(String(error));
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      const verifyResponse = await fetch("/api/v1/billing/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || "Payment verification failed");
      }

      const verifyData = await verifyResponse.json();

      toast.success(
        `Payment successful! ${verifyData.tokensAdded} tokens added.`
      );
      setIsLoading(false);
      onSuccess?.();
    } catch (error) {
      toast.error(`Verification failed: ${error}`);
      setIsLoading(false);
      onError?.(String(error));
    }
  };

  return (
    <Button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handlePayment();
      }}
      disabled={disabled || isLoading}
      className={`w-full ${className}`}
      size="lg"
      variant="default"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay {currency === "INR" ? "₹" : "$"}
          {amount}
        </>
      )}
    </Button>
  );
}
