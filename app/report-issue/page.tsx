"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import SwissButton from "@/components/swiss/SwissButton";
import SwissSection from "@/components/swiss/SwissSection";
import SwissCard from "@/components/swiss/SwissCard";
import { Loader2, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Session } from "next-auth";

export default function ReportIssuePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession() as { data: Session | null };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error("You must be logged in to report an issue.");
      return;
    }

    setIsLoading(true);

    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        const uploadPromises = images.map(async (image) => {
          const formData = new FormData();
          formData.append("file", image);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload image: ${image.name}`);
          }

          const { imageUrl } = await response.json();
          return imageUrl;
        });

        imageUrls = await Promise.all(uploadPromises);
      }

      const response = await fetch("/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          imageUrls,
          userId: (session.user as any).githubId,
        }),
      });

      if (response.ok) {
        toast.success("Issue submitted successfully!");
        setTitle("");
        setDescription("");
        setImages([]);
      } else {
        throw new Error("Failed to submit issue");
      }
    } catch (error) {
      console.error("Error submitting issue:", error);
      toast.error("Failed to submit issue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <SwissSection
        number="01"
        title="REPORT"
        variant="white"
        pattern="grid"
      >
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4 self-start">
            <SwissCard variant="accent" pattern="dots">
              <AlertCircle className="h-12 w-12 mb-6 text-white transition-colors" />
              <h4 className="text-2xl font-black uppercase mb-4 tracking-tighter text-white transition-colors">System Integrity</h4>
              <p className="text-lg font-bold uppercase leading-tight mb-8 text-white transition-colors">
                PLEASE PROVIDE PRECISE DETAILS REGARDING THE TECHNICAL ANOMALY DETECTED.
              </p>
              <div className="border-t-4 border-white/20 pt-6">
                <p className="text-sm font-black uppercase tracking-widest text-white/80 transition-colors">Protocol: Debug-01</p>
              </div>
            </SwissCard>
          </div>

          <div className="md:col-span-8">
            <SwissCard variant="white">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Title</label>
                  <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="ENTER ISSUE TITLE..."
                    className="w-full bg-white dark:bg-black border-4 border-black dark:border-white p-4 font-bold uppercase tracking-tight focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black transition-colors outline-none text-black dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Description</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="DESCRIBE THE ANOMALY IN DETAIL..."
                    rows={5}
                    className="w-full bg-white dark:bg-black border-4 border-black dark:border-white p-4 font-bold uppercase tracking-tight focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black transition-colors outline-none resize-none text-black dark:text-white"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Media Attachments (Optional)</label>
                  <div className="flex flex-col gap-4">
                    <SwissButton
                      type="button"
                      variant="secondary"
                      onClick={() => document.getElementById("images")?.click()}
                      className="w-full md:w-fit"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      SELECT FILES
                    </SwissButton>
                    <input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => setImages(Array.from(e.target.files || []))}
                    />
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      {images.map((image, index) => (
                        <div className="relative border-4 border-black dark:border-white" key={index}>
                          <Image
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            width={120}
                            height={120}
                            className="w-full h-24 object-cover"
                          />
                          <button
                            type="button"
                            className="absolute -top-4 -right-4 w-8 h-8 bg-swiss-red text-white font-black border-4 border-black dark:border-white flex items-center justify-center hover:bg-black dark:hover:bg-white dark:hover:text-black transition-colors"
                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-8 border-t-4 border-black dark:border-white">
                  <SwissButton type="submit" disabled={isLoading} variant="primary" size="xl" className="w-full dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)]">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        UPLOADING...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-6 w-6" />
                        SUBMIT REPORT
                      </>
                    )}
                  </SwissButton>
                </div>
              </form>
            </SwissCard>
          </div>
        </div>
      </SwissSection>
    </div>
  );
}
