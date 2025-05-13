"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import FeaturesStep from "@/components/onboarding/FeaturesStep";
import GatheringsStep from "@/components/onboarding/GatheringsStep";
import SkillsStep from "@/components/onboarding/SkillsStep";
import DevelopersStep from "@/components/onboarding/DevelopersStep";
import FinalStep from "@/components/onboarding/FinalStep";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface OnboardingPageProps {
  session: any;
  developers: any[];
}

export default function OnboardingPage({
  session,
  developers,
}: OnboardingPageProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [joinGathering, setJoinGathering] = useState(true);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { id: 0, name: "Welcome", icon: "👋" },
    { id: 1, name: "Features", icon: "⚡" },
    { id: 2, name: "Gatherings", icon: "👥" },
    { id: 3, name: "Skills", icon: "🛠️" },
    { id: 4, name: "Developers", icon: "👩‍💻" },
    { id: 5, name: "Complete", icon: "🎉" },
  ];

  const totalSteps = steps.length;

  // Calculate progress when step changes
  useEffect(() => {
    setProgress(((currentStep + 1) / totalSteps) * 100);

    // Save progress to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("onboardingStep", currentStep.toString());
      localStorage.setItem("onboardingSkills", JSON.stringify(selectedSkills));
      localStorage.setItem("onboardingJoinGathering", joinGathering.toString());
    }
  }, [currentStep, selectedSkills, joinGathering, totalSteps]);

  // Load progress from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStep = localStorage.getItem("onboardingStep");
      const savedSkills = localStorage.getItem("onboardingSkills");
      const savedJoinGathering = localStorage.getItem(
        "onboardingJoinGathering"
      );

      if (savedStep) {
        setCurrentStep(parseInt(savedStep));
      }

      if (savedSkills) {
        try {
          setSelectedSkills(JSON.parse(savedSkills));
        } catch (e) {
          console.error("Error parsing saved skills:", e);
        }
      }

      if (savedJoinGathering) {
        setJoinGathering(savedJoinGathering === "true");
      }
    }
  }, []);

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const skipToEnd = () => {
    setShowSkipDialog(false);
    setCurrentStep(totalSteps - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSkillChange = (skills: string[]) => {
    setSelectedSkills(skills);
  };

  const handleGatheringJoinChange = (join: boolean) => {
    setJoinGathering(join);
  };

  const completeOnboarding = async () => {
    try {
      setIsLoading(true);
      // Save user preferences and complete onboarding
      await fetch("/api/user/complete-onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: selectedSkills,
          joinGathering: joinGathering,
        }),
      });

      // Clear onboarding data from localStorage
      localStorage.removeItem("onboardingStep");
      localStorage.removeItem("onboardingSkills");
      localStorage.removeItem("onboardingJoinGathering");

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep session={session} />;
      case 1:
        return <FeaturesStep />;
      case 2:
        return (
          <GatheringsStep
            onJoinChange={handleGatheringJoinChange}
            isJoining={joinGathering}
          />
        );
      case 3:
        return (
          <SkillsStep
            onSkillChange={handleSkillChange}
            selectedSkills={selectedSkills}
          />
        );
      case 4:
        return (
          <DevelopersStep skills={selectedSkills} developers={developers} />
        );
      case 5:
        return <FinalStep />;
      default:
        return <WelcomeStep session={session} />;
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-250px)] bg-gradient-to-b from-background to-background/90">
      <div className="py-6 px-4 md:px-8 border-b bg-background/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto w-full">
          {/* Desktop step indicator */}
          <div className="hidden md:flex justify-between mb-2 relative">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className="flex flex-col items-center relative z-10 cursor-pointer"
                onClick={() => i < currentStep && setCurrentStep(i)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2
                    ${
                      i < currentStep
                        ? "bg-primary text-primary-foreground"
                        : i === currentStep
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                >
                  {i < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.icon || i + 1
                  )}
                </div>
                <span
                  className={`text-xs whitespace-nowrap ${
                    currentStep === i
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.name}
                </span>
              </div>
            ))}

            {/* Connecting line */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-muted -z-0">
              <div
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${progress - 100 / totalSteps / 2}%` }}
              />
            </div>
          </div>

          {/* Mobile step indicator */}
          <div className="md:hidden flex items-center justify-between mb-1">
            <span className="text-sm font-medium">
              Step {currentStep + 1}: {steps[currentStep].name}
            </span>
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} of {totalSteps}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="border-t py-6 px-4 md:px-8 bg-background/60 backdrop-blur-sm sticky bottom-0">
          <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
            <div>
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="gap-1"
                  size="lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sm:inline hidden">Back</span>
                </Button>
              )}
            </div>
            <div className="flex gap-2 items-center">
              {currentStep < totalSteps - 1 ? (
                <>
                  <Dialog
                    open={showSkipDialog}
                    onOpenChange={setShowSkipDialog}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="sm:inline-flex hidden">
                        Skip to end
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Skip the onboarding process?</DialogTitle>
                        <DialogDescription>
                          If you skip, you&apos;ll miss setting up your skills
                          and preferences. You can always update these later in
                          your profile settings.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="mt-4 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowSkipDialog(false)}
                        >
                          Continue Setup
                        </Button>
                        <Button variant="default" onClick={skipToEnd}>
                          Skip Anyway
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={nextStep}
                          size="lg"
                          className="gap-1 px-6 sm:min-w-[120px]"
                        >
                          <span>Continue</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Move to the next step: {steps[currentStep + 1]?.name}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              ) : (
                <Button
                  onClick={completeOnboarding}
                  className="gap-2 px-6 sm:min-w-[140px]"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Started</span>
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
