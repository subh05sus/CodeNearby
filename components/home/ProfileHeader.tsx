import Link from "next/link";
import Image from "next/image";
import SwissButton from "../swiss/SwissButton";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  imageUrl: string;
  bannerUrl?: string;
  editable?: boolean;
  appearance?: {
    theme: "default" | "blue" | "green" | "purple" | "orange";
    showActivity?: boolean;
    compactPosts?: boolean;
    highlightCode?: boolean;
  };
}

const ProfileHeader = ({
  imageUrl,
  bannerUrl,
  editable = false,
  appearance,
}: ProfileHeaderProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const getThemeColor = () => {
    switch (appearance?.theme) {
      case "blue": return "bg-blue-600";
      case "green": return "bg-green-600";
      case "purple": return "bg-purple-600";
      case "orange": return "bg-orange-600";
      default: return "bg-swiss-red";
    }
  };

  const handleOpenPreview = (image: string, id: string) => {
    setPreviewImage(image);
    setPreviewId(id);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
    setPreviewId(null);
  };

  return (
    <>
      <div className="h-64 relative border-8 border-black dark:border-white bg-muted dark:bg-neutral-900 overflow-visible mb-24 swiss-noise">
        {editable && (
          <div className="absolute top-6 right-6 z-10">
            <SwissButton variant="primary" size="sm" asChild className="shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)]">
              <Link href="/profile/edit" className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                <span className="font-black">EDIT_PROFILE</span>
              </Link>
            </SwissButton>
          </div>
        )}

        {/* Profile Avatar Container */}
        <div className="absolute -bottom-20 left-12 z-20">
          <div
            className="w-40 h-40 border-8 border-black dark:border-white bg-white dark:bg-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] dark:shadow-[12px_12px_0_0_rgba(255,255,255,1)] cursor-pointer group overflow-hidden flex items-center justify-center p-0"
            onClick={() => handleOpenPreview(imageUrl || "/placeholder.svg", "avatar")}
          >
            <motion.div layoutId="avatar" className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 relative">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt="Profile"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>

        {/* Banner Container */}
        <div className="absolute inset-0 overflow-hidden">
          {bannerUrl ? (
            <motion.div
              layoutId="banner"
              className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700 cursor-pointer"
              onClick={() => handleOpenPreview(bannerUrl, "banner")}
            >
              <Image
                src={bannerUrl}
                alt="Background"
                fill
                className="object-cover"
              />
            </motion.div>
          ) : (
            <div className={cn("w-full h-full flex items-end p-8 border-b-4 border-black dark:border-white", getThemeColor())}>
              <div className="opacity-40 dark:opacity-20 font-black text-8xl uppercase tracking-tighter text-white select-none leading-none">
                PROFILE_NODE<br />COORDINATES
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal (Swiss Style) */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 dark:bg-black p-8"
            onClick={handleClosePreview}
          >
            <motion.div
              layoutId={previewId || undefined}
              className="relative max-w-[90vw] max-h-[90vh] border-8 border-white dark:border-swiss-red shadow-[20px_20px_0_0_rgba(255,0,0,1)] dark:shadow-[20px_20px_0_0_rgba(0,0,0,1)]"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative w-full h-full bg-black"
              >
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={1200}
                  height={1200}
                  className="object-contain"
                  style={{ maxHeight: "80vh", width: "auto" }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-black p-4 border-t-4 border-black dark:border-white">
                  <p className="font-black uppercase  text-black dark:text-white text-xs text-center">
                    VISUAL_DATA_INTERCEPT / {previewId?.toUpperCase()}
                  </p>
                </div>
              </motion.div>

              <button
                className="absolute -top-6 -right-6 w-12 h-12 bg-swiss-red text-white flex items-center justify-center font-black text-2xl border-4 border-white dark:border-black hover:scale-110 transition-transform"
                onClick={handleClosePreview}
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileHeader;
