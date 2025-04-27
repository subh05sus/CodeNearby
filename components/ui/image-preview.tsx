"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
  previewClassName?: string;
  layoutId?: string;
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  width?: number;
  height?: number;
  objectFit?: "cover" | "contain";
  quality?: number;
}

export function ImagePreview({
  src,
  alt = "Image",
  className,
  previewClassName,
  layoutId,
  aspectRatio = "auto",
  width = 500,
  height = 500,
  objectFit = "cover",
  quality = 100,
}: ImagePreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

  const handleOpenPreview = useCallback(() => {
    setShowPreview(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setShowPreview(false);
  }, []);

  // Determine aspect ratio class
  const aspectRatioClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "video"
      ? "aspect-video"
      : aspectRatio === "portrait"
      ? "aspect-[3/4]"
      : "";

  return (
    <>
      <motion.div
        layoutId={layoutId}
        className={cn(
          "overflow-hidden relative cursor-pointer",
          aspectRatioClass,
          className
        )}
        onClick={handleOpenPreview}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          className={cn(
            "transition-all duration-300",
            objectFit === "cover" ? "object-cover" : "object-contain"
          )}
        />
      </motion.div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={handleClosePreview}
          >
            <motion.div
              layoutId={layoutId}
              className={cn(
                "relative max-w-[90vw] max-h-[90vh]",
                previewClassName
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full h-full overflow-hidden rounded-lg"
              >
                <Image
                  src={src}
                  alt={alt}
                  width={1500}
                  height={1500}
                  quality={quality}
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
                <X className="h-5 w-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
