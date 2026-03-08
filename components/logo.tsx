import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "black" | "white" | "red";
}

export default function Logo({ className, variant = "black" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-1 bg-none", className)}>
      <div
        className={cn(
          "px-2 py-0.5 font-black uppercase tracking-tighter text-3xl italic leading-none border-4",

          variant === "black" &&
          "bg-swiss-black text-swiss-white border-swiss-black dark:bg-swiss-white dark:text-swiss-black dark:border-swiss-white",

          variant === "white" &&
          "bg-swiss-white text-swiss-black border-swiss-white dark:bg-swiss-black dark:text-swiss-white dark:border-swiss-black",

          variant === "red" &&
          "bg-swiss-red text-swiss-white border-swiss-red dark:bg-swiss-red dark:text-swiss-white dark:border-swiss-red"
        )}
      >
        CODE
      </div>

      <div
        className={cn(
          "font-black uppercase tracking-tighter text-3xl italic leading-none",

          variant === "black" && "text-swiss-black dark:text-swiss-white",

          variant === "white" && "text-swiss-white dark:text-swiss-black",

          variant === "red" && "text-swiss-red dark:text-swiss-red"
        )}
      >
        NEARBY
      </div>
    </div>
  );
}