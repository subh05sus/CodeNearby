"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SwissSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    number?: string;
    title?: string;
    variant?: "white" | "muted";
    pattern?: "grid" | "dots" | "none";
}

const SwissSection = React.forwardRef<HTMLDivElement, SwissSectionProps>(
    ({ className, number, title, variant = "white", pattern = "none", children, ...props }, ref) => {
        const variants = {
            white: "bg-white dark:bg-black text-black dark:text-white border-4 border-black dark:border-white transition-colors duration-300",
            muted: "bg-gray-100 dark:bg-neutral-900 text-black dark:text-white border-4 border-black dark:border-white transition-colors duration-300",
            accent: "bg-swiss-red text-white border-4 border-black dark:border-white transition-colors duration-300",
        };

        const patterns = {
            grid: "swiss-grid-pattern",
            dots: "swiss-dots",
            none: "",
        };

        return (
            <section
                ref={ref}
                className={cn("w-full py-24 px-8 border-b-4 border-black dark:border-white transition-colors duration-300 swiss-noise", variants[variant], patterns[pattern], className)}
                {...props}
            >
                <div className="max-w-7xl mx-auto">
                    {(number || title) && (
                        <div className="flex items-baseline gap-4 mb-24">
                            {number && <span className="text-swiss-red font-black text-2xl tracking-widest">{number}.</span>}
                            {title && <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-black dark:text-white transition-colors">{title}</h2>}
                        </div>
                    )}
                    {children}
                </div>
            </section>
        );
    }
);

SwissSection.displayName = "SwissSection";

export default SwissSection;
