"use client";

import { LayoutGroup, motion } from "motion/react";
import { TextRotate } from "../dev/text-rotate";

function TextRotatePreview() {
  return (
    <div className="text-base  flex flex-row items-center justify-center font-overusedGrotesk dark:text-muted-foreground text-foreground font-light overflow-hidden ">
      <LayoutGroup>
        <motion.div className="flex whitespace-pre" layout>
          <motion.span
            className="pt-0.5 sm:pt-1 md:pt-2"
            layout
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          >
            Make Connections{" "}
          </motion.span>
          <TextRotate
            texts={[
              "happen!",
              "real",
              "meaningful ✽",
              "fast",
              "strong",
              "fun",
              "👨‍💻🚀👩‍💻",
            ]}
            mainClassName="text-white px-2 sm:px-2 md:px-3 bg-[#ff5941] overflow-hidden py-0.5 sm:py-1 justify-center rounded-lg"
            staggerFrom={"last"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
        </motion.div>
      </LayoutGroup>
    </div>
  );
}

export { TextRotatePreview };
