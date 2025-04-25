"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

function FeaturedTitle() {
  const router = useRouter();
  const handleFeaturedTitleClick = () => {
    router.push("/about/ai-connect");
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="mt-4 flex justify-center items-center"
      onClick={handleFeaturedTitleClick}
    >
      <motion.div
        initial={{ width: "40px", height: "40px", borderRadius: "50%" }}
        animate={{ width: "auto", height: "auto", borderRadius: "9999px" }}
        transition={{
          delay: 0.8,
          duration: 0.7,
          type: "spring",
          stiffness: 110,
        }}
        className="overflow-hidden flex items-center justify-center text-center border dark:bg-muted/50 bg-muted group cursor-pointer"
      >
        <motion.div className="flex items-center justify-center p-1">
          <motion.img
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src="/ai.gif"
            alt="AI Connect"
            className="h-5 w-5 object-contain group-hover:grayscale-0 transition-all duration-200 ml-1.5"
          />
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="whitespace-nowrap ml-2 text-lg text-muted-foreground"
          >
            AI Connect is Live
            <ArrowRight
              size={18}
              className="inline top-px ml-1 mr-1.5 group-hover:ml-2.5 transition-all duration-200"
            />
            {/* <motion.span
              initial={{ x: -5, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.3 }}
              whileHover={{ x: 5 }}
              className="ml-1 mr-2 inline-flex items-center"
            ></motion.span> */}
          </motion.span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default FeaturedTitle;
