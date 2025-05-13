"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
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
    <div className="min-h-[calc(100vh-250px)] flex items-center justify-center bg-gradient-to-b from-background to-background/90 p-4 md:p-8">
      <Card
        className={`max-w-md w-full shadow-lg border border-primary/10 transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <CardHeader className="text-center pb-3">
          <div className="mx-auto bg-primary/10 rounded-full p-3 mb-4 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Onboarding Already Completed
          </CardTitle>
          <CardDescription className="text-base mt-2">
            You&apos;ve already completed the onboarding process for CodeNearby.
          </CardDescription>
        </CardHeader>
        {/* <CardContent className="space-y-5 px-6">
          <div className="bg-muted/30 p-5 rounded-lg border border-muted/50 shadow-sm">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>Your profile is already set up with:</span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 group transition-all hover:bg-muted/20 p-2 rounded-md">
                <div className="rounded-full bg-primary/15 p-1.5 text-primary mt-0.5 shadow-sm group-hover:bg-primary/20">
                  <Code className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-foreground/90">
                    Skills:{" "}
                  </span>
                  {user.skills && user.skills.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {user.skills.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">
                      No skills selected
                    </span>
                  )}
                </div>
              </li>
              {user.joinedGathering !== undefined && (
                <li className="flex items-start gap-3 group transition-all hover:bg-muted/20 p-2 rounded-md">
                  <div className="rounded-full bg-primary/15 p-1.5 text-primary mt-0.5 shadow-sm group-hover:bg-primary/20">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-foreground/90">
                      Gathering Preference:{" "}
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.joinedGathering
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {user.joinedGathering
                          ? "Receiving gathering notifications"
                          : "Not receiving gathering notifications"}
                      </span>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Would you like to reset your onboarding preferences and go through
            the process again?
          </p>
        </CardContent> */}
        <CardFooter className="flex flex-col sm:flex-row gap-3 px-6 pb-6">
          <Button
            variant="outline"
            className="w-full sm:flex-1 gap-2 hover:bg-muted/50"
            onClick={() => router.push("/profile")}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Button>
          <Button
            className="w-full sm:flex-1 gap-2 sm:order-3"
            onClick={() => router.push("/")}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Button>
          <Button
            variant="secondary"
            className="w-full sm:flex-1 gap-2 border border-secondary/20 hover:border-secondary/40 sm:order-2"
            onClick={handleRestartOnboarding}
            disabled={isResetting}
          >
            {isResetting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Restart</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
