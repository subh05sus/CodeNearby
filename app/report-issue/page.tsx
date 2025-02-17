"use client";

import type React from "react";

import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { Session } from "next-auth";
import { toast } from "sonner";

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
          userId: session.user.githubId,
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
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Report an Issue</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter issue title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe the issue in detail"
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="images">
                Images (optional, multiple allowed)
              </Label>
              <div className="flex flex-col gap-4"></div>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("images")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Images
              </Button>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => setImages(Array.from(e.target.files || []))}
              />
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div className="relative" key={index}>
                      <Image
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-20 -z-0  object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute scale-75 top-1 z-10  right-1"
                        onClick={() =>
                          setImages(images.filter((_, i) => i !== index))
                        }
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Issue
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
