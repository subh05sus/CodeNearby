"use client";

import { faqs } from "@/consts/faq";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto w-full space-y-12 py-16 px-8">
      <div className="border-b-8 border-black dark:border-white pb-4 mb-12">
        <p className="text-xs font-black uppercase tracking-[0.5em] text-swiss-red mb-2">Knowledge Base</p>
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tightest leading-none text-black dark:text-white">
          FREQUENTLY<br />ASKED<br />QUESTIONS
        </h2>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="border-4 border-black dark:border-white bg-white dark:bg-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            <button
              onClick={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
              className="w-full flex items-center justify-between text-left p-6 group focus:outline-none"
            >
              <span className="text-xl font-black uppercase tracking-tight group-hover:text-swiss-red transition-colors text-black dark:text-white">{faq.question}</span>
              <motion.div
                animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-black dark:text-white"
              >
                <ChevronDown className="w-6 h-6" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expandedIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-muted dark:bg-neutral-900"
                >
                  <div className="p-8 border-t-2 border-black dark:border-white font-bold uppercase tracking-widest text-sm italic leading-relaxed text-black dark:text-white/80">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
