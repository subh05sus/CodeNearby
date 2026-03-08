"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SwissSection from "@/components/swiss/SwissSection";
import SwissCard from "@/components/swiss/SwissCard";
import SwissButton from "@/components/swiss/SwissButton";
import { RefreshCw, Home, User, CheckCircle2 } from "lucide-react";

export default function OnboardingCompleted() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Animation effect when component mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRestartOnboarding = async () => {
    try {
      setIsResetting(true);

      // Reset the onboarding status in the database
      await fetch("/api/user/reset-onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Clear any existing onboarding data from localStorage
      localStorage.removeItem("onboardingStep");
      localStorage.removeItem("onboardingSkills");
      localStorage.removeItem("onboardingJoinGathering");

      // Reload the page to start onboarding again
      window.location.reload();
    } catch (error) {
      console.error("Error resetting onboarding:", error);
      setIsResetting(false);
    }
  };

  return (
    <SwissSection variant="white" className="min-h-[calc(100vh-250px)] flex items-center justify-center bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-xl w-full px-4">
        <SwissCard
          className={`p-12 border-8 border-black dark:border-white shadow-[24px_24px_0_0_rgba(255,0,0,1)] bg-white dark:bg-black transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
        >
          <div className="space-y-10">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-swiss-red flex items-center justify-center text-white">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-white">
                SETUP_<span className="text-swiss-red">VERIFIED</span>
              </h1>
              <p className="text-lg font-bold uppercase tracking-widest opacity-40 italic text-black dark:text-white">
                ONBOARDING_ALREADY_COMPLETED // SYSTEM_READY
              </p>
            </div>

            <p className="text-sm font-bold uppercase tracking-tight opacity-60 leading-relaxed text-center px-4 text-black dark:text-white">
              YOU_HAVE_SUCCESSFULLY_INITIALIZED_YOUR_NEURAL_UPLINK. CURRENT_PARAMETERS_ARE_LOCKED_IN_PRIMARY_REGISTRY.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SwissButton
                onClick={() => router.push("/")}
                className="h-16 border-4 flex items-center justify-center gap-3 bg-black dark:bg-white text-white dark:text-black hover:bg-swiss-red dark:hover:bg-swiss-red"
              >
                <Home className="h-5 w-5" />
                <span>HOME</span>
              </SwissButton>
              <SwissButton
                variant="secondary"
                onClick={() => router.push("/profile")}
                className="h-16 border-4 flex items-center justify-center gap-3"
              >
                <User className="h-5 w-5" />
                <span>PROFILE</span>
              </SwissButton>
            </div>

            <div className="pt-8 border-t-4 border-black dark:border-white border-dotted">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center opacity-40 mb-6 text-black dark:text-white">
                WOULD_YOU_LIKE_TO_RE_INITIALIZE_PROTOCOLS?
              </p>
              <SwissButton
                variant="primary"
                className="w-full h-16 border-4 dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)]"
                onClick={handleRestartOnboarding}
                disabled={isResetting}
              >
                {isResetting ? (
                  <div className="flex items-center gap-4">
                    <div className="animate-spin h-5 w-5 border-4 border-white dark:border-black border-t-transparent" />
                    <span>RESETTING...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <RefreshCw className="h-5 w-5" />
                    <span>RESTART_ONBOARDING</span>
                  </div>
                )}
              </SwissButton>
            </div>
          </div>
        </SwissCard>
      </div>
    </SwissSection>
  );
}
