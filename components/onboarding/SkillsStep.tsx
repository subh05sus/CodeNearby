"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SwissCard from "@/components/swiss/SwissCard";
import SwissButton from "@/components/swiss/SwissButton";
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

const popularSkills = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
  "Java", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin",
  "HTML", "CSS", "SQL", "MongoDB", "GraphQL", "Docker", "AWS",
  "Azure", "Git", "DevOps", "TailwindCSS", "Vue.js", "Angular",
  "Svelte", "Flutter", "React Native", "Unity", "Game Development",
  "Machine Learning", "AI", "Blockchain", "Data Science",
  "Cloud Computing", "Cybersecurity",
];

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

  useEffect(() => {
    const filtered = popularSkills.filter((skill) =>
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setNoResults(searchTerm.length > 0 && filtered.length === 0);
    setFilteredSkills(filtered);
    setAnimateList(false);
    const timer = setTimeout(() => setAnimateList(true), 50);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (
      !selectedSkills.includes(trimmedSkill) &&
      trimmedSkill !== "" &&
      trimmedSkill.length <= MAX_SKILL_LENGTH &&
      selectedSkills.length < 15
    ) {
      onSkillChange([...selectedSkills, trimmedSkill]);
      if (searchInputRef.current) searchInputRef.current.focus();
    }
  };

  const removeSkill = (skill: string) => {
    onSkillChange(selectedSkills.filter((s) => s !== skill));
  };

  const handleAddCustomSkill = () => {
    if (
      customSkill.trim() !== "" &&
      customSkill.length <= MAX_SKILL_LENGTH &&
      selectedSkills.length < 15
    ) {
      addSkill(customSkill);
      setCustomSkill("");
      if (customInputRef.current) customInputRef.current.focus();
    }
  };

  const handleCustomSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomSkill();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <motion.h2
          className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none border-b-8 border-swiss-red pb-4 text-black dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          SKILL_IDENTIFICATION_MODULE
        </motion.h2>

        <motion.p
          className="text-xl font-bold uppercase tracking-tight opacity-40 dark:opacity-60 italic max-w-xl mx-auto text-black dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          DEFINE_TECHNICAL_PARAMETERS // CAPACITY_MAPPING
        </motion.p>
      </div>

      <div className="w-full space-y-8">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-swiss-black dark:text-white" />
          </div>
          <Input
            placeholder="SEARCH_SKILLS_FOR_SYSTEM_INTEGRATION..."
            className="h-20 pl-16 pr-12 text-xl font-black uppercase tracking-tighter italic border-4 border-swiss-black dark:border-white bg-swiss-white dark:bg-black text-black dark:text-white rounded-none focus-visible:ring-0 focus-visible:bg-swiss-red dark:focus-visible:bg-swiss-red focus-visible:text-swiss-white dark:focus-visible:text-black transition-all placeholder:text-swiss-black/20 dark:placeholder:text-white/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            ref={searchInputRef}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-6 flex items-center hover:text-swiss-red transition-colors text-black dark:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </motion.div>

        {/* Selected skills */}
        <SwissCard className="p-8 border-4 border-swiss-black dark:border-white bg-swiss-white dark:bg-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] dark:shadow-[16px_16px_0_0_rgba(255,255,255,1)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic border-l-8 border-swiss-red pl-4 text-black dark:text-white">
              ACTIVE_PARAMETERS // <span className="opacity-40 dark:opacity-60">{selectedSkills.length}_OF_15</span>
            </h3>
            {selectedSkills.length > 0 && (
              <button
                onClick={() => onSkillChange([])}
                className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-transparent hover:border-swiss-black dark:hover:border-white transition-all text-black dark:text-white"
              >
                PURGE_ALL_DATA
              </button>
            )}
          </div>

          <div className={cn(
            "flex flex-wrap gap-4 min-h-[120px] p-6 border-4 border-dotted border-swiss-black/20 dark:border-white/20",
            selectedSkills.length > 0 && "border-solid border-swiss-black/10 dark:border-white/10 bg-swiss-muted/30 dark:bg-white/5"
          )}>
            <AnimatePresence>
              {selectedSkills.length === 0 ? (
                <div className="w-full flex items-center justify-center opacity-20 dark:opacity-30 italic">
                  <p className="text-lg font-black uppercase tracking-widest text-black dark:text-white">AWAIT_INPUT_DATA...</p>
                </div>
              ) : (
                selectedSkills.map((skill) => (
                  <motion.div
                    key={skill}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <div className="flex items-center gap-2 bg-swiss-black dark:bg-white text-swiss-white dark:text-black px-4 py-2 font-black uppercase tracking-tighter italic border-2 border-swiss-black dark:border-white hover:bg-swiss-red dark:hover:bg-swiss-red transition-colors group">
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="hover:scale-125 transition-transform"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </SwissCard>

        {/* Popular list */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-swiss-black/40 dark:text-white/40">AVAILABLE_IDENTIFIERS:</h4>
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {animateList && filteredSkills.slice(0, 24).map((skill, idx) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <motion.button
                    key={skill}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => isSelected ? removeSkill(skill) : addSkill(skill)}
                    className={cn(
                      "px-4 py-2 font-black uppercase tracking-tighter italic border-2 transition-all",
                      isSelected
                        ? "bg-swiss-red text-swiss-white dark:text-black border-swiss-red shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)]"
                        : "bg-swiss-white dark:bg-black text-swiss-black dark:text-white border-swiss-black dark:border-white hover:bg-swiss-black dark:hover:bg-white hover:text-swiss-white dark:hover:text-black"
                    )}
                  >
                    {skill}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Custom skill */}
        <div className="pt-8 border-t-8 border-swiss-black dark:border-white">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-swiss-black/40 dark:text-white/40">DEFINE_CUSTOM_PARAMETER:</h4>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="ENTER_NEW_SKILL_IDENTIFIER..."
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value.toUpperCase().slice(0, MAX_SKILL_LENGTH))}
                onKeyDown={handleCustomSkillKeyDown}
                ref={customInputRef}
                className="h-16 px-6 text-xl font-black uppercase tracking-tighter italic border-4 border-swiss-black dark:border-white bg-swiss-white dark:bg-black text-black dark:text-white rounded-none focus-visible:ring-0 focus-visible:bg-swiss-muted dark:focus-visible:bg-neutral-900"
                disabled={selectedSkills.length >= 15}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase opacity-20 dark:opacity-40 text-black dark:text-white">
                {customSkill.length}/{MAX_SKILL_LENGTH}
              </div>
            </div>

            <SwissButton
              onClick={handleAddCustomSkill}
              disabled={!customSkill.trim() || selectedSkills.length >= 15}
              className="px-10 h-16 text-xl"
            >
              <Plus className="h-6 w-6 mr-2" />
              INJECT
            </SwissButton>
          </div>
        </div>
      </div>
    </div>
  );
}
