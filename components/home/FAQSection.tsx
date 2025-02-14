"use client";

import { faqs } from "@/consts/faq";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto w-full space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl text-primary relative">
          Frequently asked questions
          <span className="absolute -z-50 text-primary/5 left-1/2 transform -translate-x-1/2 -translate-y-1/3 font-extrabold text-8xl">
            FAQS
          </span>
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="relative">
            {/* Vertical line decoration */}
            <div className="absolute left-0 top-0 w-px h-full dark:bg-orange-300/20 bg-orange-300/50" />

            <div className="pl-6">
              <button
                onClick={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
                className="w-full flex items-center justify-between text-left text-primary p-4 hover:bg-primary/5 rounded-lg transition-colors"
              >
                <span className="text-lg">{faq.question}</span>
                <motion.div
                  animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 dark:text-orange-300" />
                </motion.div>
              </button>

              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 text-primary/70 text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
