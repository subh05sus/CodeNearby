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
import { Check, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
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
  const [direction, setDirection] = useState<1 | -1>(1);

  const steps = [
    { id: 0, name: "Welcome", icon: "👋" },
    { id: 1, name: "Features", icon: "⚡" },
    { id: 2, name: "Gatherings", icon: "👥" },
    { id: 3, name: "Skills", icon: "🛠️" },
    { id: 4, name: "Developers", icon: "👩‍💻" },
    { id: 5, name: "Complete", icon: "🎉" },
  ];

  const totalSteps = steps.length;

  useEffect(() => {
    setProgress(((currentStep + 1) / totalSteps) * 100);

    if (typeof window !== "undefined") {
      localStorage.setItem("onboardingStep", currentStep.toString());
      localStorage.setItem("onboardingSkills", JSON.stringify(selectedSkills));
      localStorage.setItem("onboardingJoinGathering", joinGathering.toString());
    }
  }, [currentStep, selectedSkills, joinGathering, totalSteps]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStep = localStorage.getItem("onboardingStep");
      const savedSkills = localStorage.getItem("onboardingSkills");
      const savedJoinGathering = localStorage.getItem("onboardingJoinGathering");

      if (savedStep) setCurrentStep(parseInt(savedStep));

      if (savedSkills) {
        try {
          setSelectedSkills(JSON.parse(savedSkills));
        } catch (e) {
          console.error("Error parsing saved skills:", e);
        }
      }

      if (savedJoinGathering) setJoinGathering(savedJoinGathering === "true");
    }
  }, []);

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const skipToEnd = () => {
    setShowSkipDialog(false);
    setDirection(1);
    setCurrentStep(totalSteps - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSkillChange = (skills: string[]) => setSelectedSkills(skills);
  const handleGatheringJoinChange = (join: boolean) => setJoinGathering(join);

  const completeOnboarding = async () => {
    try {
      setIsLoading(true);
      await fetch("/api/user/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: selectedSkills, joinGathering }),
      });

      localStorage.removeItem("onboardingStep");
      localStorage.removeItem("onboardingSkills");
      localStorage.removeItem("onboardingJoinGathering");

      router.push("/");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <WelcomeStep session={session} />;
      case 1: return <FeaturesStep />;
      case 2: return <GatheringsStep onJoinChange={handleGatheringJoinChange} isJoining={joinGathering} />;
      case 3: return <SkillsStep onSkillChange={handleSkillChange} selectedSkills={selectedSkills} />;
      case 4: return <DevelopersStep skills={selectedSkills} developers={developers} />;
      case 5: return <FinalStep />;
      default: return <WelcomeStep session={session} />;
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-250px)]">
      {/* Sticky top progress header */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">

          {/* Desktop step indicator */}
          <div className="hidden md:flex justify-between relative">
            {/* Connecting track */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-border -z-0">
              <motion.div
                className="h-full"
                style={{ background: "hsl(24 95% 53%)" }}
                animate={{ width: `${progress - 100 / totalSteps / 2}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>

            {steps.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center relative z-10 cursor-pointer group"
                  onClick={() => done && setCurrentStep(i)}
                >
                  <motion.div
                    animate={{
                      scale: active ? 1.15 : 1,
                      background: done || active ? "hsl(24 95% 53%)" : "hsl(var(--muted))",
                    }}
                    transition={{ duration: 0.25 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-2 text-sm"
                    style={active ? { boxShadow: "0 0 0 4px hsl(24 95% 53% / 0.2)" } : {}}
                  >
                    {done ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <span className={active ? "text-white" : "text-muted-foreground"}>
                        {step.icon}
                      </span>
                    )}
                  </motion.div>
                  <span
                    className="text-xs whitespace-nowrap font-medium transition-colors"
                    style={{ color: active ? "hsl(24 95% 53%)" : done ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile step indicator */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm text-white font-bold"
                  style={{ background: "hsl(24 95% 53%)" }}
                >
                  {currentStep + 1}
                </div>
                <span className="font-semibold text-sm">{steps[currentStep].name}</span>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {currentStep + 1} / {totalSteps}
              </span>
            </div>
            {/* Mobile progress bar */}
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "hsl(24 95% 53%)" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sticky bottom nav */}
        <div className="sticky bottom-0 border-t bg-background/80 backdrop-blur-sm py-4 px-4 md:px-8">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-3">
            {/* Back */}
            <div>
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="rounded-full gap-1.5 h-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sm:inline hidden">Back</span>
                </Button>
              )}
            </div>

            {/* Right actions */}
            <div className="flex gap-2 items-center">
              {currentStep < totalSteps - 1 ? (
                <>
                  {/* Skip dialog */}
                  <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="hidden sm:inline-flex rounded-full h-10 text-muted-foreground hover:text-foreground"
                      >
                        Skip to end
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl sm:rounded-2xl">
                      <DialogHeader>
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                          style={{ background: "hsl(24 95% 53% / 0.12)" }}
                        >
                          <span className="text-xl">⚡</span>
                        </div>
                        <DialogTitle>Skip onboarding?</DialogTitle>
                        <DialogDescription>
                          You&apos;ll miss setting up your skills and preferences.
                          You can always update these later in your profile settings.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="mt-4 gap-2 flex-col sm:flex-row">
                        <Button
                          variant="outline"
                          onClick={() => setShowSkipDialog(false)}
                          className="rounded-full"
                        >
                          Continue Setup
                        </Button>
                        <Button
                          onClick={skipToEnd}
                          className="rounded-full text-white"
                          style={{ background: "hsl(24 95% 53%)" }}
                        >
                          Skip Anyway
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Continue */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={nextStep}
                          className="rounded-full gap-1.5 h-10 px-6 text-white sm:min-w-[120px]"
                          style={{ background: "hsl(24 95% 53%)" }}
                        >
                          <span>Continue</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Next: {steps[currentStep + 1]?.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              ) : (
                <Button
                  onClick={completeOnboarding}
                  className="rounded-full gap-2 h-10 px-6 text-white sm:min-w-[140px]"
                  style={{ background: "hsl(24 95% 53%)" }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
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
