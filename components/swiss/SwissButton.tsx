"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

interface SwissButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "accent";
    size?: "sm" | "md" | "lg" | "xl" | "icon";
    asChild?: boolean;
}

const SwissButton = React.forwardRef<HTMLButtonElement, SwissButtonProps>(
    ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        const variants = {
            primary: "bg-swiss-black dark:bg-swiss-white text-swiss-white dark:text-swiss-black hover:bg-swiss-red",
            secondary: "bg-swiss-white dark:bg-neutral-900 text-swiss-black dark:text-swiss-white border-4 border-swiss-black dark:border-swiss-white hover:bg-swiss-black dark:hover:bg-swiss-white hover:text-swiss-white dark:hover:text-swiss-black",
            accent: "bg-swiss-red text-swiss-white hover:bg-swiss-black dark:hover:bg-swiss-white dark:hover:text-swiss-black",
        };

        const sizes = {
            sm: "px-4 py-2 text-sm",
            md: "px-6 py-3 text-base",
            lg: "px-8 py-4 text-xl",
            xl: "px-12 py-6 text-2xl",
            icon: "h-10 w-10 p-0",
        };

        return (
            <Comp
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center font-black uppercase tracking-widest transition-colors duration-150 ease-linear active:scale-95",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);

SwissButton.displayName = "SwissButton";

export default SwissButton;
