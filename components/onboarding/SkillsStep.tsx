"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Plus, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SkillsStepProps {
  onSkillChange: (skills: string[]) => void;
  selectedSkills: string[];
}

// List of popular programming skills
const popularSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "HTML",
  "CSS",
  "SQL",
  "MongoDB",
  "GraphQL",
  "Docker",
  "AWS",
  "Azure",
  "Git",
  "DevOps",
  "TailwindCSS",
  "Vue.js",
  "Angular",
  "Svelte",
  "Flutter",
  "React Native",
  "Unity",
  "Game Development",
  "Machine Learning",
  "AI",
  "Blockchain",
  "Data Science",
  "Cloud Computing",
  "Cybersecurity",
];

// Maximum character length for custom skills
const MAX_SKILL_LENGTH = 25;

export default function SkillsStep({
  onSkillChange,
  selectedSkills,
}: SkillsStepProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSkills, setFilteredSkills] = useState(popularSkills);
  const [customSkill, setCustomSkill] = useState("");
  const [animateList, setAnimateList] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  // Filter skills based on search term
  useEffect(() => {
    const filtered = popularSkills.filter((skill) =>
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setNoResults(searchTerm.length > 0 && filtered.length === 0);
    setFilteredSkills(filtered);

    // Add a small delay before starting the animation
    setAnimateList(false);
    const timer = setTimeout(() => {
      setAnimateList(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Add a skill
  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (
      !selectedSkills.includes(trimmedSkill) &&
      trimmedSkill !== "" &&
      trimmedSkill.length <= MAX_SKILL_LENGTH &&
      selectedSkills.length < 15
    ) {
      const newSkills = [...selectedSkills, trimmedSkill];
      onSkillChange(newSkills);

      // Focus back on search after adding
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  };

  // Remove a skill
  const removeSkill = (skill: string) => {
    const newSkills = selectedSkills.filter((s) => s !== skill);
    onSkillChange(newSkills);
  };

  // Add custom skill
  const handleAddCustomSkill = () => {
    if (
      customSkill.trim() !== "" &&
      customSkill.length <= MAX_SKILL_LENGTH &&
      selectedSkills.length < 15
    ) {
      addSkill(customSkill);
      setCustomSkill("");

      // Focus back on custom input after adding
      if (customInputRef.current) {
        customInputRef.current.focus();
      }
    }
  };

  // Handle pressing enter in the custom skill input
  const handleCustomSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomSkill();
    }
  };

  // Clear search term
  const clearSearch = () => {
    setSearchTerm("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <motion.h2
        className="text-2xl font-bold mb-3 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Select Your Skills
      </motion.h2>

      <motion.p
        className="text-center text-muted-foreground mb-6 max-w-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Choose programming languages, frameworks, and technologies you know.
        This helps us connect you with developers who share similar interests.
      </motion.p>

      {/* Search and add skills */}
      <motion.div
        className="w-full mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            className="pl-10 pr-10 bg-background/60 focus-visible:bg-background transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            ref={searchInputRef}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {noResults && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground mt-1 ml-1 flex items-center"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            No results found for &quot;{searchTerm}&quot;. Try adding it as a custom skill
            below.
          </motion.p>
        )}
      </motion.div>

      {/* Selected skills section */}
      <motion.div
        className="mb-5 w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="font-medium text-sm flex items-center">
            Your Skills
            <span className="text-xs ml-2 text-muted-foreground">
              ({selectedSkills.length}/15 max)
            </span>
          </div>

          {selectedSkills.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onSkillChange([])}
            >
              Clear All
            </Button>
          )}
        </div>

        <div
          className={cn(
            "flex flex-wrap gap-2 min-h-[80px] p-3 border rounded-md transition-colors",
            selectedSkills.length === 0
              ? "border-dashed border-muted-foreground/30"
              : "bg-muted/30"
          )}
        >
          <AnimatePresence>
            {selectedSkills.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center"
              >
                <p className="text-sm text-muted-foreground text-center">
                  Select skills from below or add your own custom skills
                </p>
              </motion.div>
            ) : (
              selectedSkills.map((skill) => (
                <motion.div
                  key={skill}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center"
                >
                  <Badge
                    variant="secondary"
                    className="px-3 py-1.5 flex items-center gap-1 bg-primary/10 hover:bg-primary/15 transition-colors"
                  >
                    {skill}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80"
                      onClick={() => removeSkill(skill)}
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Popular skills list */}
      <motion.div
        className="w-full mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="text-xs font-medium uppercase tracking-wider mb-2 text-muted-foreground">
          Popular skills:
        </div>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {animateList &&
              filteredSkills.slice(0, 24).map((skill, index) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.02, duration: 0.15 }}
                  >
                    <Badge
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "px-3 py-1.5 cursor-pointer transition-all duration-200 hover:shadow-sm",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                      onClick={() =>
                        isSelected ? removeSkill(skill) : addSkill(skill)
                      }
                    >
                      {skill}
                    </Badge>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Add custom skill */}
      <motion.div
        className="w-full space-y-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="text-xs font-medium uppercase tracking-wider mb-2 text-muted-foreground">
          Add Custom Skill:
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Enter a custom skill..."
              value={customSkill}
              onChange={(e) =>
                setCustomSkill(e.target.value.slice(0, MAX_SKILL_LENGTH))
              }
              onKeyDown={handleCustomSkillKeyDown}
              ref={customInputRef}
              className="pr-16 bg-background/60 focus-visible:bg-background transition-colors"
              disabled={selectedSkills.length >= 15}
            />
            {customSkill && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                {customSkill.length}/{MAX_SKILL_LENGTH}
              </div>
            )}
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    onClick={handleAddCustomSkill}
                    type="button"
                    disabled={
                      !customSkill.trim() ||
                      customSkill.length > MAX_SKILL_LENGTH ||
                      selectedSkills.length >= 15
                    }
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add</span>
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {selectedSkills.length >= 15 ? (
                  <p>Maximum of 15 skills reached</p>
                ) : (
                  <p>Add a custom skill (press Enter)</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>
    </div>
  );
}
