"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CreditCard, AlertTriangle } from "lucide-react";

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

export default function RazorpayPaymentDebug({
  packageId,
  currency,
  amount,
  packageName,
  onSuccess,
  onError,
  disabled = false,
  className = "",
}: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    console.log(`[Razorpay Debug] ${info}`);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    addDebugInfo("Component mounted");
    addDebugInfo(`Package: ${packageId}, Currency: ${currency}, Amount: ${amount}`);
  }, [packageId, currency, amount]);

  const testAPIConnection = async () => {
    try {
      addDebugInfo("Testing API connection...");
      
      const response = await fetch("/api/v1/billing/buy-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: "basic", // test package
          currency: "INR",
        }),
      });

      addDebugInfo(`API Response Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        addDebugInfo(`API Response: ${JSON.stringify(data).substring(0, 100)}...`);
      } else {
        const error = await response.text();
        addDebugInfo(`API Error: ${error.substring(0, 100)}...`);
      }
    } catch (error) {
      addDebugInfo(`API Test Failed: ${error}`);
    }
  };

  const testRazorpayScript = async () => {
    try {
      addDebugInfo("Testing Razorpay script...");
      
      if (window.Razorpay) {
        addDebugInfo("Razorpay already loaded");
        return true;
      }

      addDebugInfo("Loading Razorpay script...");
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      
      return new Promise<boolean>((resolve) => {
        script.onload = () => {
          addDebugInfo("Razorpay script loaded successfully");
          resolve(true);
        };
        script.onerror = () => {
          addDebugInfo("Razorpay script failed to load");
          resolve(false);
        };
        document.head.appendChild(script);
      });
    } catch (error) {
      addDebugInfo(`Script test failed: ${error}`);
      return false;
    }
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      addDebugInfo("=== Starting Payment Process ===");

      // Test auth
      addDebugInfo("Checking authentication...");
      const authCheck = await fetch("/api/auth/session");
      const session = await authCheck.json();
      
      if (!session?.user) {
        throw new Error("Please sign in to purchase tokens");
      }
      
      addDebugInfo(`User authenticated: ${session.user.email || session.user.name || 'Unknown'}`);

      // Test Razorpay script
      const scriptLoaded = await testRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      // Create order
      addDebugInfo("Creating payment order...");
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

      addDebugInfo(`Order response status: ${orderResponse.status}`);

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        addDebugInfo(`Order creation failed: ${JSON.stringify(error)}`);
        throw new Error(error.error || "Failed to create order");
      }

      const orderData = await orderResponse.json();
      addDebugInfo(`Order created: ${orderData.orderId}`);

      if (!orderData.orderId || !orderData.key) {
        throw new Error("Invalid order data received");
      }

      // Configure Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CodeNearby",
        description: `Purchase ${packageName}`,
        order_id: orderData.orderId,
        prefill: {
          email: orderData.userEmail || "",
          name: orderData.userName || "",
        },
        theme: {
          color: "#3399cc",
        },
        handler: async (response: any) => {
          addDebugInfo(`Payment successful: ${response.razorpay_payment_id}`);
          toast.success("Payment successful! Verifying...");
          
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

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              addDebugInfo(`Payment verified: ${verifyData.tokensAdded} tokens added`);
              toast.success(`Payment verified! ${verifyData.tokensAdded} tokens added.`);
              onSuccess?.();
            } else {
              const error = await verifyResponse.json();
              throw new Error(error.error || "Verification failed");
            }
          } catch (error) {
            addDebugInfo(`Verification error: ${error}`);
            toast.error(`Verification failed: ${error}`);
            onError?.(String(error));
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            addDebugInfo("Payment modal dismissed");
            setIsLoading(false);
          },
        },
      };

      addDebugInfo("Opening Razorpay checkout...");
      
      if (!window.Razorpay) {
        throw new Error("Razorpay not available after script load");
      }

      const razorpay = new window.Razorpay(options);
      
      razorpay.on("payment.failed", (response: any) => {
        addDebugInfo(`Payment failed: ${JSON.stringify(response.error)}`);
        toast.error(`Payment failed: ${response.error?.description || "Unknown error"}`);
        setIsLoading(false);
        onError?.(response.error?.description || "Payment failed");
      });

      // Try to open the modal
      try {
        razorpay.open();
        addDebugInfo("Razorpay modal opened successfully");
      } catch (modalError) {
        addDebugInfo(`Modal open failed: ${modalError}`);
        throw new Error("Failed to open payment modal");
      }

    } catch (error) {
      addDebugInfo(`Payment process error: ${error}`);
      console.error("Payment error:", error);
      toast.error(`Payment error: ${error}`);
      onError?.(String(error));
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        type="button"
        onClick={handlePayment}
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
            Pay {currency === "INR" ? "₹" : "$"}{amount}
          </>
        )}
      </Button>

      {/* Debug buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={testAPIConnection}
          size="sm"
          variant="outline"
          className="text-xs"
        >
          <AlertTriangle className="mr-1 h-3 w-3" />
          Test API
        </Button>
        <Button
          type="button"
          onClick={testRazorpayScript}
          size="sm"
          variant="outline"
          className="text-xs"
        >
          <AlertTriangle className="mr-1 h-3 w-3" />
          Test Script
        </Button>
      </div>

      {/* Debug info */}
      {debugInfo.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
          <div className="font-semibold mb-2">Debug Log:</div>
          {debugInfo.map((info, index) => (
            <div key={index} className="text-gray-600 dark:text-gray-400">
              {info}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
