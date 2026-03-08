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
            white: "bg-swiss-white dark:bg-black text-swiss-black dark:text-swiss-white border-4 border-swiss-black dark:border-swiss-white",
            muted: "bg-swiss-muted dark:bg-neutral-900 text-swiss-black dark:text-swiss-white border-4 border-swiss-black dark:border-swiss-white",
            accent: "bg-swiss-red text-swiss-white border-4 border-swiss-black dark:border-swiss-white",
        };

        const patterns = {
            grid: "swiss-grid-pattern dark:opacity-40",
            dots: "swiss-dots dark:opacity-40",
            diagonal: "swiss-diagonal dark:opacity-40",
            none: "",
        };

        const hovers = {
            none: "",
            invert: "hover:bg-swiss-black dark:hover:bg-swiss-white hover:text-swiss-white dark:hover:text-swiss-black transition-colors duration-150 ease-linear",
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
