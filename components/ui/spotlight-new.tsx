"use client";
import React from "react";
import { motion } from "motion/react";

type SpotlightProps = {
  gradientFirst?: string;
  gradientSecond?: string;
  gradientThird?: string;
  translateY?: number;
  width?: number;
  height?: number;
  smallWidth?: number;
  duration?: number;
  xOffset?: number;
  themeColor?: "default" | "blue" | "green" | "purple" | "orange";
};

export const Spotlight = ({
  gradientFirst,
  gradientSecond,
  gradientThird,
  translateY = -350,
  width = 560,
  height = 1380,
  smallWidth = 240,
  duration = 7,
  xOffset = 100,
  themeColor = "default",
}: SpotlightProps = {}) => {
  // Determine the theme color to use (from prop or system)
  const getThemeColor = () => {
    if (themeColor) return themeColor;

    // If no theme prop is provided, try to determine from the system theme
    return "default"; // Fallback to default theme
  };

  // Theme-based gradient configurations
  const getGradients = () => {
    const color = getThemeColor();

    const gradients = {
      default: {
        first:
          gradientFirst ||
          "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 85%, .08) 0, hsla(210, 100%, 55%, .02) 50%, hsla(210, 100%, 45%, 0) 80%)",
        second:
          gradientSecond ||
          "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .06) 0, hsla(210, 100%, 55%, .02) 80%, transparent 100%)",
        third:
          gradientThird ||
          "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .04) 0, hsla(210, 100%, 45%, .02) 80%, transparent 100%)",
      },
      blue: {
        first:
          "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 85%, .08) 0, hsla(210, 100%, 55%, .03) 50%, hsla(210, 100%, 45%, 0) 80%)",
        second:
          "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .06) 0, hsla(210, 100%, 55%, .03) 80%, transparent 100%)",
        third:
          "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .04) 0, hsla(210, 100%, 45%, .02) 80%, transparent 100%)",
      },
      green: {
        first:
          "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(142, 90%, 85%, .08) 0, hsla(142, 90%, 55%, .03) 50%, hsla(142, 90%, 45%, 0) 80%)",
        second:
          "radial-gradient(50% 50% at 50% 50%, hsla(142, 90%, 85%, .06) 0, hsla(142, 90%, 55%, .03) 80%, transparent 100%)",
        third:
          "radial-gradient(50% 50% at 50% 50%, hsla(142, 90%, 85%, .04) 0, hsla(142, 90%, 45%, .02) 80%, transparent 100%)",
      },
      purple: {
        first:
          "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(270, 90%, 85%, .08) 0, hsla(270, 90%, 55%, .03) 50%, hsla(270, 90%, 45%, 0) 80%)",
        second:
          "radial-gradient(50% 50% at 50% 50%, hsla(270, 90%, 85%, .06) 0, hsla(270, 90%, 55%, .03) 80%, transparent 100%)",
        third:
          "radial-gradient(50% 50% at 50% 50%, hsla(270, 90%, 85%, .04) 0, hsla(270, 90%, 45%, .02) 80%, transparent 100%)",
      },
      orange: {
        first:
          "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(30, 100%, 85%, .08) 0, hsla(30, 100%, 55%, .03) 50%, hsla(30, 100%, 45%, 0) 80%)",
        second:
          "radial-gradient(50% 50% at 50% 50%, hsla(30, 100%, 85%, .06) 0, hsla(30, 100%, 55%, .03) 80%, transparent 100%)",
        third:
          "radial-gradient(50% 50% at 50% 50%, hsla(30, 100%, 85%, .04) 0, hsla(30, 100%, 45%, .02) 80%, transparent 100%)",
      },
    };

    return gradients[color] || gradients.default;
  };

  const themeGradients = getGradients();

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 1.5,
      }}
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <motion.div
        animate={{
          x: [0, xOffset, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute top-0 left-0 w-screen h-screen z-40 pointer-events-none"
      >
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(-45deg)`,
            background: themeGradients.first,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0`}
        />

        <div
          style={{
            transform: "rotate(-45deg) translate(5%, -50%)",
            background: themeGradients.second,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0 origin-top-left`}
        />

        <div
          style={{
            transform: "rotate(-45deg) translate(-180%, -70%)",
            background: themeGradients.third,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0 origin-top-left`}
        />
      </motion.div>

      <motion.div
        animate={{
          x: [0, -xOffset, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute top-0 right-0 w-screen h-screen z-40 pointer-events-none"
      >
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(45deg)`,
            background: themeGradients.first,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0`}
        />

        <div
          style={{
            transform: "rotate(45deg) translate(-5%, -50%)",
            background: themeGradients.second,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0 origin-top-right`}
        />

        <div
          style={{
            transform: "rotate(45deg) translate(180%, -70%)",
            background: themeGradients.third,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0 origin-top-right`}
        />
      </motion.div>
    </motion.div>
  );
};
