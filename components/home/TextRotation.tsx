"use client";

import { LayoutGroup, motion } from "motion/react";
import { TextRotate } from "../dev/text-rotate";

function TextRotatePreview() {
  return (
    <div className="text-base flex flex-row items-center justify-center font-overusedGrotesk dark:text-muted-foreground text-foreground font-light overflow-hidden">
      <LayoutGroup>
        <motion.div className="flex items-center gap-2" layout>
          <motion.span
            className="leading-none"
            layout
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          >
            Make Connections
          </motion.span>

          <div
            className="bg-[#ff5941] text-white rounded-lg px-4 inline-flex items-center justify-center text-center whitespace-nowrap"
            style={{
              height: "2.5rem",
              lineHeight: "1",
            }}
          >
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
              mainClassName="w-full overflow-hidden"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </div>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}

export { TextRotatePreview };