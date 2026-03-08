"use client";

import { LayoutGroup, motion } from "motion/react";
import { TextRotate } from "../dev/text-rotate";

function TextRotatePreview() {
  return (
    <div className="text-base flex flex-row items-center justify-center font-black overflow-hidden uppercase tracking-widest">
      <LayoutGroup>
        <motion.div className="flex items-center gap-4" layout>
          <motion.span
            className="leading-none text-black dark:text-white"
            layout
            transition={{ type: "tween", duration: 0.3 }}
          >
            Make Connections
          </motion.span>

          <div
            className="bg-swiss-red text-white border-2 border-black dark:border-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] px-6 inline-flex items-center justify-center text-center whitespace-nowrap"
            style={{
              height: "3rem",
              lineHeight: "1",
            }}
          >
            <TextRotate
              texts={[
                "happen!",
                "real",
                "meaningful",
                "fast",
                "strong",
                "immediate",
                "objective",
              ]}
              mainClassName="w-full overflow-hidden"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.015}
              splitLevelClassName="overflow-hidden"
              transition={{ type: "tween", duration: 0.2 }}
              rotationInterval={2500}
            />
          </div>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}

export { TextRotatePreview };