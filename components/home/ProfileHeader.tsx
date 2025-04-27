/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { Button } from "../ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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

  const getThemeGradient = () => {
    switch (appearance?.theme) {
      case "blue":
        return "from-blue-500/30 via-blue-400/20 to-blue-600/10";
      case "green":
        return "from-green-500/30 via-green-400/20 to-green-600/10";
      case "purple":
        return "from-purple-500/30 via-purple-400/20 to-purple-600/10";
      case "orange":
        return "from-orange-500/30 via-orange-400/20 to-orange-600/10";
      default:
        return "from-primary/30 via-primary/20 to-primary/10";
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
      <div className={`h-48 rounded-xl relative`}>
        {editable && (
          <Button
            variant="outline"
            size="icon"
            asChild
            className="absolute top-4 right-4 z-10 rounded-full bg-background/70 backdrop-blur-md hover:bg-background/100 transition-all duration-300 ease-in-out"
          >
            <Link href="/profile/edit">
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <div className="absolute -bottom-16 left-8">
          <Avatar
            className="h-32 w-32 border-4 border-background cursor-pointer"
            onClick={() =>
              handleOpenPreview(imageUrl || "/placeholder.svg", "avatar")
            }
          >
            <motion.div layoutId="avatar">
              <AvatarImage src={imageUrl || "/placeholder.svg"} alt="Profile" />
              <AvatarFallback>P</AvatarFallback>
            </motion.div>
          </Avatar>
        </div>
        <div className="absolute w-full h-full left-0 overflow-hidden -z-20 rounded-2xl">
          {bannerUrl ? (
            <motion.div
              layoutId="banner"
              className="w-full h-full"
              onClick={() => handleOpenPreview(bannerUrl, "banner")}
              style={{ cursor: "pointer" }}
            >
              <Image
                src={bannerUrl}
                alt="Background"
                layout="fill"
                objectFit="cover"
                objectPosition="center"
              />
            </motion.div>
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${getThemeGradient()}`}
            ></div>
          )}
        </div>
        <style jsx>
          {`
            @keyframes blurAnimation {
              0% {
                filter: blur(15px);
              }
              25% {
                filter: blur(10px);
              }
              50% {
                filter: blur(6px);
              }
              75% {
                filter: blur(10px);
              }
              100% {
                filter: blur(15px);
              }
            }
          `}
        </style>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={handleClosePreview}
          >
            <motion.div
              layoutId={previewId || undefined}
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
                  src={previewImage}
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
};

export default ProfileHeader;
