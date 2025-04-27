"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    enablePreview?: boolean;
    layoutId?: string;
  }
>(({ className, enablePreview, layoutId, ...props }, ref) => {
  const [showPreview, setShowPreview] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Get image source from child AvatarImage if available
  React.useEffect(() => {
    if (enablePreview) {
      // Find AvatarImage child to get src
      React.Children.forEach(props.children, (child) => {
        if (React.isValidElement(child) && child.type === AvatarImage) {
          setImageSrc(child.props.src);
        }
      });
    }
  }, [props.children, enablePreview]);

  const handleClick = React.useCallback(() => {
    if (enablePreview && imageSrc) {
      setShowPreview(true);
    }
  }, [enablePreview, imageSrc]);

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  return (
    <>
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          enablePreview && "cursor-pointer",
          className
        )}
        onClick={handleClick}
        {...props}
      />

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showPreview && imageSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={handleClosePreview}
          >
            <motion.div
              layoutId={layoutId}
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full h-full overflow-hidden rounded-lg"
              >
                <Image
                  src={imageSrc}
                  alt="Preview"
                  width={1000}
                  height={1000}
                  className="object-contain"
                  style={{ maxHeight: "90vh", width: "auto" }}
                />
              </motion.div>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2 } }}
                className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white"
                onClick={handleClosePreview}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
