"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ArrowRight, RefreshCw } from "lucide-react";

interface OnboardingCompletedProps {
  user: any;
}

export default function OnboardingCompleted({
  user,
}: OnboardingCompletedProps) {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

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
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-gradient-to-b from-background to-background/90 p-4 md:p-8">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Onboarding Already Completed
          </CardTitle>
          <CardDescription>
            You&apos;ve already completed the onboarding process for CodeNearby.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">
              Your profile is already set up with:
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 text-primary">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-medium">Skills: </span>
                  {user.skills && user.skills.length > 0 ? (
                    <span>{user.skills.join(", ")}</span>
                  ) : (
                    <span className="text-muted-foreground italic">
                      No skills selected
                    </span>
                  )}
                </div>
              </li>
              {user.joinedGathering !== undefined && (
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 text-primary">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-medium">Gathering Preference: </span>
                    <span>
                      {user.joinedGathering
                        ? "Joined gathering notifications"
                        : "Not receiving gathering notifications"}
                    </span>
                  </div>
                </li>
              )}
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            Would you like to reset your onboarding preferences and go through
            the process again?
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.push("/profile")}
          >
            Go to Profile
          </Button>
          <Button
            className="w-full sm:w-auto gap-1"
            onClick={() => router.push("/")}
          >
            <span>Home</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            className="w-full sm:w-auto gap-1"
            onClick={handleRestartOnboarding}
            disabled={isResetting}
          >
            {isResetting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1"></span>
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Restart Onboarding</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
