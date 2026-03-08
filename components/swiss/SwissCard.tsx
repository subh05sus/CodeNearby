"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SwissCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "white" | "muted" | "accent";
    hoverEffect?: "none" | "invert" | "lift";
    pattern?: "grid" | "dots" | "diagonal" | "none";
}

const SwissCard = React.forwardRef<HTMLDivElement, SwissCardProps>(
    ({ className, variant = "white", hoverEffect = "none", pattern = "none", ...props }, ref) => {
        const variants = {
            white: "bg-white dark:bg-black text-black dark:text-white border-4 border-black dark:border-white transition-colors duration-300",
            muted: "bg-gray-100 dark:bg-neutral-900 text-black dark:text-white border-4 border-black dark:border-white transition-colors duration-300",
            accent: "bg-swiss-red text-white border-4 border-black dark:border-white transition-colors duration-300",
        };

        const patterns = {
            grid: "swiss-grid-pattern dark:opacity-40",
            dots: "swiss-dots dark:opacity-40",
            diagonal: "swiss-diagonal dark:opacity-40",
            none: "",
        };

        const hovers = {
            none: "",
            invert: "",
            lift: "hover:-translate-y-1 transition-transform duration-150 ease-linear",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "p-8 relative overflow-hidden",
                    variants[variant],
                    patterns[pattern],
                    hovers[hoverEffect],
                    className
                )}
                {...props}
            />
        );
    }
);

SwissCard.displayName = "SwissCard";

export default SwissCard;
