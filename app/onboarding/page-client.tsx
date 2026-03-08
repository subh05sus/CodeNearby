"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import FeaturesStep from "@/components/onboarding/FeaturesStep";
import GatheringsStep from "@/components/onboarding/GatheringsStep";
import SkillsStep from "@/components/onboarding/SkillsStep";
import DevelopersStep from "@/components/onboarding/DevelopersStep";
import FinalStep from "@/components/onboarding/FinalStep";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
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
import SwissButton from "@/components/swiss/SwissButton";
import { cn } from "@/lib/utils";

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
    { id: 0, name: "WELCOME", icon: "👋" },
    { id: 1, name: "FEATURES", icon: "⚡" },
    { id: 2, name: "GATHERINGS", icon: "👥" },
    { id: 3, name: "SKILLS", icon: "🛠️" },
    { id: 4, name: "DEVS", icon: "👩‍💻" },
    { id: 5, name: "COMPLETE", icon: "🎉" },
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
    <div className="flex flex-col min-h-[calc(100vh-6rem)] bg-swiss-white dark:bg-black transition-colors duration-300">
      {/* Header with Step Indicator */}
      <div className="py-12 px-4 md:px-8 border-b-8 border-swiss-black dark:border-white sticky top-0 z-10 bg-swiss-white dark:bg-black/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
              <div className="bg-swiss-red p-2 text-swiss-white dark:text-black">
                <ChevronRight className="h-6 w-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.4em] text-black dark:text-white">INIT_FLOW // PREFERENCES</span>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 dark:opacity-60 italic text-black dark:text-white">
              STEP_0{currentStep + 1} // 0{totalSteps}
            </div>
          </div>

          <div className="hidden md:flex justify-between relative">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className="flex flex-col items-center relative z-10 cursor-pointer group"
                onClick={() => i < currentStep && setCurrentStep(i)}
              >
                <div
                  className={cn(
                    "w-14 h-14 border-4 transition-all duration-300 flex items-center justify-center mb-3",
                    i < currentStep
                      ? "bg-swiss-black dark:bg-white border-swiss-black dark:border-white text-swiss-white dark:text-black"
                      : i === currentStep
                        ? "bg-swiss-red border-swiss-black dark:border-white text-swiss-white dark:text-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,1)]"
                        : "bg-swiss-white dark:bg-black border-swiss-muted dark:border-white/20 text-swiss-muted dark:text-white/20"
                  )}
                >
                  {i < currentStep ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <span className="text-xl font-black">{step.icon || i + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-opacity leading-none text-black dark:text-white",
                    currentStep === i ? "opacity-100" : "opacity-40 flex dark:opacity-20"
                  )}
                >
                  {step.name}
                </span>

                {/* Connecting Line Segment */}
                {i < steps.length - 1 && (
                  <div className="absolute top-7 left-[calc(50%+28px)] w-[calc(100%)] h-1 bg-swiss-muted -z-10 group-first:ml-0">
                    <div
                      className="h-full bg-swiss-black dark:bg-white transition-all duration-500"
                      style={{ width: i < currentStep ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile indicator */}
          <div className="md:hidden flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-white">{steps[currentStep].name}</h2>
              <span className="font-black text-swiss-red italic">0{currentStep + 1}</span>
            </div>
            <div className="w-full h-4 bg-swiss-muted dark:bg-white/10 border-2 border-swiss-black dark:border-white">
              <div
                className="h-full bg-swiss-red transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-12 md:py-24">
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

        {/* Footer Actions */}
        <div className="border-t-8 border-swiss-black dark:border-white py-12 px-4 md:px-8 bg-swiss-white dark:bg-black sticky bottom-0">
          <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
            <div>
              {currentStep > 0 && (
                <SwissButton
                  variant="secondary"
                  onClick={prevStep}
                  className="h-16 px-8 border-4"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  <span className="font-black uppercase tracking-widest sm:inline hidden">PREVIOUS_NODE</span>
                </SwissButton>
              )}
            </div>

            <div className="flex gap-4 items-center">
              {currentStep < totalSteps - 1 ? (
                <>
                  <Dialog
                    open={showSkipDialog}
                    onOpenChange={setShowSkipDialog}
                  >
                    <DialogTrigger asChild>
                      <button className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 dark:opacity-60 dark:hover:opacity-100 transition-opacity sm:inline-flex hidden items-center gap-2 mr-6 italic text-black dark:text-white">
                        BYPASS_FLOW <ArrowRight className="h-3 w-3" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="border-8 border-swiss-black dark:border-white p-12 bg-swiss-white dark:bg-black rounded-none">
                      <DialogHeader className="p-0 space-y-6">
                        <DialogTitle className="text-5xl font-black uppercase tracking-tighter italic leading-tight text-black dark:text-white">ABORT_ONBOARDING?</DialogTitle>
                        <DialogDescription className="text-lg font-bold uppercase tracking-tight opacity-60 dark:opacity-80 italic text-black dark:text-white">
                          SKIP_PROTOCOLS // YOU_WILL_MISS_SYSTEM_CALIBRATION. YOU_CAN_CONFIGURE_PARAMETERS_LATER_IN_PROFILE_REGISTRY.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="mt-12 flex flex-row justify-between gap-4">
                        <SwissButton
                          variant="secondary"
                          className="flex-1 h-16 border-4"
                          onClick={() => setShowSkipDialog(false)}
                        >
                          RESUME_SETUP
                        </SwissButton>
                        <SwissButton
                          variant="primary"
                          className="flex-1 h-16 border-4"
                          onClick={skipToEnd}
                        >
                          SKIP_ANYWAY
                        </SwissButton>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SwissButton
                          onClick={nextStep}
                          className="h-20 px-12 text-xl font-black uppercase tracking-widest border-4 bg-swiss-red text-swiss-white dark:text-black hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,1)] group"
                        >
                          <span>CONTINUE</span>
                          <ChevronRight className="h-6 w-6 ml-2 transition-transform group-hover:translate-x-1" />
                        </SwissButton>
                      </TooltipTrigger>
                      <TooltipContent className="bg-swiss-black dark:bg-white text-swiss-white dark:text-black border-0 font-black uppercase tracking-widest p-4 italic">
                        MOVE_TO: {steps[currentStep + 1]?.name}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              ) : (
                <SwissButton
                  onClick={completeOnboarding}
                  className="h-20 px-12 text-xl font-black uppercase tracking-widest border-4 bg-swiss-black dark:bg-white text-swiss-white dark:text-black hover:bg-swiss-red dark:hover:bg-swiss-red hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,1)]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-4">
                      <div className="animate-spin h-6 w-6 border-4 border-swiss-white dark:border-black border-t-transparent" />
                      <span>SYNCHRONIZING...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span>INITIALIZE_SYSTEM</span>
                      <Check className="h-6 w-6" />
                    </div>
                  )}
                </SwissButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
