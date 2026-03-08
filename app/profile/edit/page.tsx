/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import SwissCard from "@/components/swiss/SwissCard";
import SwissButton from "@/components/swiss/SwissButton";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Save,
  ArrowLeft,
  Camera,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  Pin,
  Search,
  Star,
  Code as CodeIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { UserProfile, PinnedRepo } from "@/types";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Image from "next/image";
import { fetchUserRepositories } from "@/lib/github";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

// List of popular programming skills
const popularSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "HTML",
  "CSS",
  "SQL",
  "MongoDB",
  "GraphQL",
  "Docker",
  "AWS",
  "Azure",
  "Git",
  "DevOps",
  "TailwindCSS",
  "Vue.js",
  "Angular",
  "Svelte",
  "Flutter",
  "React Native",
];

// Component to safely use search parameters with Suspense
function TabParamReader({
  onParamLoad,
}: {
  onParamLoad: (param: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  useEffect(() => {
    onParamLoad(tabParam);
  }, [tabParam, onParamLoad]);

  return null;
}

export default function EditProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [activeTab, setActiveTab] = useState<string>("information");
  const [skills, setSkills] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customSkill, setCustomSkill] = useState("");

  // For repositories
  const [repositories, setRepositories] = useState<PinnedRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [pinnedRepos, setPinnedRepos] = useState<PinnedRepo[]>([]);

  // For profile image cropping
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageType, setImageType] = useState<"profile" | "banner">("profile");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [croppedProfileImage, setCroppedProfileImage] = useState<string | null>(
    null
  );
  const [croppedBannerImage, setCroppedBannerImage] = useState<string | null>(
    null
  );

  // For image preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: "default",
    showActivity: true,
    compactPosts: false,
    highlightCode: true,
    showSpotlight: true,
  });

  // Handler for tab parameter
  const handleTabParamLoad = (param: string | null) => {
    if (param) {
      setActiveTab(param);
    }
  };

  useEffect(() => {
    if (!session) {
      router.push("/profile");
      return;
    }

    fetchProfile();
  }, [session, router]);

  // Fetch the GitHub repositories when the profile loads
  useEffect(() => {
    if (profile?.githubUsername) {
      loadRepositories();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      setProfile(data);
      setName(data.name || "");
      setBio(data.githubBio || "");
      setLocation(data.githubLocation || "");
      setSkills(data.skills || []);

      // Initialize pinned repos if they exist
      if (data.pinnedRepos && data.pinnedRepos.length > 0) {
        setPinnedRepos(data.pinnedRepos);
      }

      // Initialize appearance settings if they exist
      if (data.appearance) {
        setAppearance(data.appearance);
      }
    } catch {
      toast.error("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  const loadRepositories = async () => {
    if (!profile?.githubUsername) return;

    setLoadingRepos(true);
    try {
      const repos = await fetchUserRepositories(profile.githubUsername);
      setRepositories(repos);
    } catch {
      toast.error("Failed to load repositories.");
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleSave = async () => {
    if (!session) return;

    setSaving(true);
    try {
      let profileImageUrl = profile?.image;
      let bannerImageUrl = profile?.bannerImage;

      // If there's a cropped profile image, upload it first
      if (croppedProfileImage) {
        profileImageUrl = await uploadImage(croppedProfileImage);
      }

      // If there's a cropped banner image, upload it
      if (croppedBannerImage) {
        bannerImageUrl = await uploadImage(croppedBannerImage);
      }

      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          githubBio: bio,
          githubLocation: location,
          image: profileImageUrl,
          bannerImage: bannerImageUrl,
          pinnedRepos,
          appearance,
          skills,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      router.push("/profile");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (base64Image: string) => {
    // Convert base64 to blob
    const fetchResponse = await fetch(base64Image);
    const blob = await fetchResponse.blob();

    // Create form data
    const formData = new FormData();
    formData.append("file", blob, "image.jpg");

    // Upload to server
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.imageUrl;
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
        setImageType(type);

        // Set different crop settings for profile vs banner
        if (type === "profile") {
          setCrop({
            unit: "%",
            width: 90,
            height: 90,
            x: 5,
            y: 5,
          });
        } else {
          setCrop({
            unit: "%",
            width: 90,
            height: 40,
            x: 5,
            y: 5,
          });
        }

        setCropDialogOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (crop: Crop) => {
    setCompletedCrop(crop);
  };

  const getCroppedImg = () => {
    if (!imageRef.current || !completedCrop) return;

    const canvas = document.createElement("canvas");
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixelRatio = window.devicePixelRatio;
    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = "high";

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    ctx.drawImage(
      imageRef.current,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    const base64Image = canvas.toDataURL("image/jpeg", 0.95);

    if (imageType === "profile") {
      setCroppedProfileImage(base64Image);
    } else {
      setCroppedBannerImage(base64Image);
    }

    setCropDialogOpen(false);
  };

  const clearBannerImage = () => {
    setCroppedBannerImage(null);
  };

  const handleOpenPreview = (image: string, id: string) => {
    setPreviewImage(image);
    setPreviewId(id);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
    setPreviewId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Suspense>
      <TabParamReader onParamLoad={handleTabParamLoad} />
      <div className="mx-auto px-2 max-w-4xl py-8">
        <div className="flex flex-col items-start mb-12">
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center text-xs font-black uppercase tracking-widest mb-6 hover:text-swiss-red transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            RETURN_TO_NODE
          </button>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none border-b-8 border-swiss-black pb-4">
            CONFIG_PROFILE
          </h1>
        </div>

        <div className="space-y-12">
          {/* Banner Image Section */}
          <SwissCard className="p-0 overflow-hidden shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
            <div className="relative w-full h-[240px] overflow-hidden border-b-8 border-swiss-black">
              {croppedBannerImage || profile?.bannerImage ? (
                <>
                  <motion.div
                    layoutId="banner"
                    className="w-full h-full cursor-pointer grayscale hover:grayscale-0 transition-all"
                    onClick={() =>
                      handleOpenPreview(
                        croppedBannerImage ||
                        profile?.bannerImage ||
                        "/bg.webp",
                        "banner"
                      )
                    }
                  >
                    <Image
                      src={
                        croppedBannerImage || profile?.bannerImage || "/bg.webp"
                      }
                      alt="Banner"
                      fill
                      className="object-cover"
                      style={{ pointerEvents: "none" }}
                      priority
                    />
                  </motion.div>
                  <div className="absolute bottom-6 right-6 flex gap-4">
                    <SwissButton
                      variant="secondary"
                      className="h-12 px-6 border-4"
                      onClick={() => bannerInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4 mr-3" />
                      SWAP_BANNER
                    </SwissButton>
                    <SwissButton
                      variant="primary"
                      className="h-12 px-6 border-4 border-swiss-black bg-swiss-red hover:bg-swiss-black"
                      onClick={clearBannerImage}
                    >
                      <Trash2 className="h-4 w-4 mr-3" />
                      PURGE
                    </SwissButton>
                  </div>
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center w-full h-full bg-swiss-muted/10 cursor-pointer group"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  <ImageIcon className="h-16 w-16 mb-4 text-swiss-black opacity-10 group-hover:opacity-100 transition-opacity" />
                  <p className="text-xl font-black uppercase tracking-tighter italic">
                    UPLOAD_BANNER_PLANE
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-2">
                    RECOMMENDED_RESOLUTION: 1500X500
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={bannerInputRef}
                onChange={(e) => handleImageChange(e, "banner")}
              />
            </div>

            <div className="p-10 flex flex-col md:flex-row items-center gap-10">
              <div className="relative group">
                <div
                  className="h-40 w-40 border-8 border-swiss-black shadow-[8px_8px_0_0_rgba(255,0,0,1)] overflow-hidden cursor-pointer grayscale group-hover:grayscale-0 transition-all"
                  onClick={() =>
                    handleOpenPreview(
                      croppedProfileImage ||
                      profile?.image ||
                      "/placeholder.svg",
                      "profile"
                    )
                  }
                >
                  <motion.div layoutId="profile">
                    <img
                      src={
                        croppedProfileImage ||
                        profile?.image ||
                        "/placeholder.svg"
                      }
                      alt="Profile"
                      className="h-full w-full object-cover px-0"
                      style={{ pointerEvents: "none" }}
                    />
                  </motion.div>
                </div>
                <SwissButton
                  variant="secondary"
                  className="absolute -bottom-4 -right-4 h-12 w-12 border-4 p-0 flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                  onClick={() => profileInputRef.current?.click()}
                >
                  <Camera className="h-5 w-5" />
                </SwissButton>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={profileInputRef}
                  onChange={(e) => handleImageChange(e, "profile")}
                />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
                  {name || "SUBJECT_NAME"}
                </h2>
                <div className="inline-block bg-swiss-black text-swiss-white px-3 py-1 font-black text-xs tracking-[0.2em] uppercase">
                  @{profile?.githubUsername}
                </div>
              </div>
            </div>
          </SwissCard>

          <div className="flex flex-wrap gap-4 mb-12 border-b-8 border-swiss-black pb-8">
            {[
              { id: "information", label: "NODE_PARAMETERS" },
              { id: "repositories", label: "PINNED_SYNCS" },
              { id: "appearance", label: "VISUAL_CORE" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-8 py-4 border-4 border-swiss-black font-black uppercase tracking-widest text-sm transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                  activeTab === tab.id
                    ? "bg-swiss-black text-swiss-white shadow-[8px_8px_0_0_rgba(255,0,0,1)] -translate-y-1"
                    : "bg-swiss-white text-swiss-black hover:bg-swiss-muted"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[600px] pb-24">
            {activeTab === "information" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SwissCard className="p-10 border-8 border-swiss-black shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-10 border-b-4 border-swiss-black pb-4">
                    BIOMETRIC_DATA
                  </h3>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest opacity-60">
                        IDENTIFIER_LABEL
                      </Label>
                      <input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ENTER_NAME"
                        className="w-full h-16 bg-swiss-muted/10 border-4 border-swiss-black px-6 text-xl font-black uppercase tracking-tighter italic placeholder:opacity-10 focus:outline-none focus:bg-swiss-white transition-all"
                      />
                    </div>

                    <div className="space-y-3 opacity-60">
                      <Label htmlFor="username" className="text-xs font-black uppercase tracking-widest">
                        UPLINK_SERIAL
                      </Label>
                      <input
                        id="username"
                        value={profile?.githubUsername || ""}
                        disabled
                        className="w-full h-16 bg-swiss-muted/5 border-4 border-swiss-black/20 px-6 text-xl font-black uppercase tracking-tighter italic"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                        // READ_ONLY: SYNCED_WITH_GITHUB_CORE
                      </span>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="bio" className="text-xs font-black uppercase tracking-widest opacity-60">
                        NEURAL_SYNOPSIS
                      </Label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="DESCRIBE_INTERFACE_PURPOSE"
                        rows={4}
                        className="w-full bg-swiss-muted/10 border-4 border-swiss-black p-6 text-xl font-black uppercase tracking-tighter italic placeholder:opacity-10 focus:outline-none focus:bg-swiss-white transition-all min-h-[160px]"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="location" className="text-xs font-black uppercase tracking-widest opacity-60">
                        GEOSPATIAL_COORD
                      </Label>
                      <input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="PHYSICAL_NODE_LOCATION"
                        className="w-full h-16 bg-swiss-muted/10 border-4 border-swiss-black px-6 text-xl font-black uppercase tracking-tighter italic placeholder:opacity-10 focus:outline-none focus:bg-swiss-white transition-all"
                      />
                    </div>

                    <div className="space-y-6 pt-6">
                      <Label htmlFor="skills" className="text-xs font-black uppercase tracking-widest opacity-60">
                        CAPABILITY_MATRIX
                      </Label>
                      <div className="flex flex-wrap gap-3">
                        {skills.map((skill, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 bg-swiss-black text-swiss-white font-black uppercase text-xs tracking-widest flex items-center gap-3 group"
                          >
                            {skill}
                            <X
                              className="h-4 w-4 cursor-pointer text-swiss-red hover:scale-125 transition-transform"
                              onClick={() => {
                                setSkills(skills.filter((_, i) => i !== index));
                              }}
                            />
                          </div>
                        ))}
                        {skills.length >= 15 && (
                          <div className="px-4 py-2 border-4 border-swiss-red text-swiss-red font-black uppercase text-[10px] tracking-widest">
                            CAPACITY_LIMIT_REACHED
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4">
                        <input
                          id="customSkill"
                          value={customSkill}
                          onChange={(e) => setCustomSkill(e.target.value)}
                          placeholder="ADD_MODULE_TYPE"
                          className="flex-1 h-16 bg-swiss-muted/10 border-4 border-swiss-black px-6 text-xl font-black uppercase tracking-tighter italic placeholder:opacity-10 focus:outline-none focus:bg-swiss-white transition-all"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && customSkill.trim()) {
                              e.preventDefault();
                              if (
                                !skills.includes(customSkill.trim()) &&
                                skills.length < 15
                              ) {
                                setSkills([...skills, customSkill.trim()]);
                                setCustomSkill("");
                              } else if (skills.length >= 15) {
                                toast.error("Maximum of 15 skills allowed.");
                              }
                            }
                          }}
                        />
                        <SwissButton
                          type="button"
                          variant="secondary"
                          className="h-16 px-10 border-4"
                          onClick={() => {
                            if (
                              customSkill.trim() &&
                              !skills.includes(customSkill.trim()) &&
                              skills.length < 15
                            ) {
                              setSkills([...skills, customSkill.trim()]);
                              setCustomSkill("");
                            } else if (skills.length >= 15) {
                              toast.error("Maximum of 15 skills allowed.");
                            }
                          }}
                        >
                          REGISTER
                        </SwissButton>
                      </div>

                      <div className="pt-8">
                        <Label className="text-xs font-black uppercase tracking-widest opacity-60 block mb-6">
                          QUICK_SYNC_MODULES
                        </Label>
                        <div className="flex flex-wrap gap-3">
                          {popularSkills.map((skill, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                if (!skills.includes(skill) && skills.length < 15) {
                                  setSkills([...skills, skill]);
                                } else if (skills.length >= 15) {
                                  toast.error("Maximum of 15 skills allowed.");
                                }
                              }}
                              className={cn(
                                "px-4 py-2 border-4 font-black uppercase text-[10px] tracking-widest transition-all",
                                skills.includes(skill)
                                  ? "bg-swiss-muted text-swiss-black opacity-20 cursor-not-allowed"
                                  : "border-swiss-black hover:bg-swiss-black hover:text-swiss-white"
                              )}
                              disabled={skills.includes(skill)}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </SwissCard>
              </div>
            )}

            {activeTab === "repositories" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SwissCard className="p-10 border-8 border-swiss-black shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-4 border-b-4 border-swiss-black pb-4">
                    PINNED_SYNCS
                  </h3>
                  <p className="text-sm font-bold uppercase tracking-tight opacity-60 mb-10">
                    SELECT_UP_TO_2_MODULES_FOR_FRONT_DISPLAY. NODE_EXPOSURE_PROTOCOL_ACTIVE.
                  </p>

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6 italic">CURRENTLY_PINNED</h4>
                      {pinnedRepos.length === 0 ? (
                        <div className="p-10 border-4 border-dashed border-swiss-black/10 text-center">
                          <p className="text-xl font-black uppercase tracking-tighter opacity-10 italic">
                            NULL_BUFFER_DETECTED
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-6">
                          {pinnedRepos.map((repo) => (
                            <div
                              key={repo.id}
                              className="flex items-start justify-between border-4 border-swiss-black p-6 bg-swiss-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
                            >
                              <div className="flex-1 mr-6">
                                <div className="flex items-center gap-3 mb-2">
                                  <Pin className="h-4 w-4 text-swiss-red" />
                                  <span className="text-2xl font-black uppercase tracking-tighter italic">
                                    {repo.name}
                                  </span>
                                </div>
                                <p className="text-xs font-bold uppercase tracking-tight opacity-60 line-clamp-2 mb-4 italic leading-none">
                                  {repo.description || "NO_DESCRIPTION_AVAILABLE"}
                                </p>
                                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest opacity-40">
                                  {repo.language && (
                                    <div className="flex items-center gap-2">
                                      <CodeIcon className="h-3 w-3" />
                                      <span>{repo.language}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span>{repo.stargazers_count}</span>
                                  </div>
                                </div>
                              </div>
                              <SwissButton
                                variant="primary"
                                className="h-12 w-12 bg-swiss-red hover:bg-swiss-black border-4 border-swiss-black p-0"
                                onClick={() => {
                                  setPinnedRepos(
                                    pinnedRepos.filter((r) => r.id !== repo.id)
                                  );
                                  toast.success(`DE-PINNED: ${repo.name}`);
                                }}
                              >
                                <Trash2 className="h-5 w-5" />
                              </SwissButton>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-6 pt-10 border-t-8 border-swiss-muted/10">
                      <h4 className="text-xs font-black uppercase tracking-widest opacity-40 italic">REPOSITORY_SCRAPER</h4>
                      <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-swiss-red" />
                        <input
                          placeholder="SEARCH_REPOSITORY_CORE"
                          className="w-full h-16 bg-swiss-muted/10 border-4 border-swiss-black pl-16 pr-6 text-xl font-black uppercase tracking-tighter italic placeholder:opacity-10 focus:outline-none focus:bg-swiss-white transition-all"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      {loadingRepos ? (
                        <div className="flex justify-center p-12">
                          <Loader2 className="h-10 w-10 animate-spin text-swiss-red" />
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                          {repositories
                            .filter(
                              (repo) =>
                                repo.name
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()) ||
                                (repo.description &&
                                  repo.description
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase()))
                            )
                            .map((repo) => {
                              const isPinned = pinnedRepos.some(
                                (r) => r.id === repo.id
                              );
                              return (
                                <div
                                  key={repo.id}
                                  className={cn(
                                    "flex items-center justify-between p-6 border-4 border-swiss-black transition-all",
                                    isPinned ? "bg-swiss-muted/10 opacity-40" : "hover:bg-swiss-muted/5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[8px_8px_0_0_rgba(255,0,0,1)]"
                                  )}
                                >
                                  <div>
                                    <p className="text-xl font-black uppercase tracking-tighter italic">
                                      {repo.name}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1 italic">
                                      {repo.language || "DATA_TYPE_UNKNOWN"} // {repo.stargazers_count} STARS
                                    </p>
                                  </div>
                                  <SwissButton
                                    variant="secondary"
                                    size="sm"
                                    className="h-12 px-6 border-4"
                                    disabled={isPinned || pinnedRepos.length >= 2}
                                    onClick={() => {
                                      setPinnedRepos([...pinnedRepos, repo]);
                                      toast.success(`PINNED: ${repo.name}`);
                                    }}
                                  >
                                    {isPinned ? "ACTIVE" : "PIN_MODULE"}
                                  </SwissButton>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </SwissCard>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
                <SwissCard className="p-10 border-8 border-swiss-black shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-10 border-b-4 border-swiss-black pb-4">
                    VISUAL_ENGINE_CONFIG
                  </h3>
                  <div className="space-y-12">
                    {[
                      {
                        label: "SPOTLIGHT_PARTICLES",
                        sub: "EMIT_VISUAL_ENERGY_OVERLAY",
                        key: "showSpotlight"
                      },
                      {
                        label: "GITHUB_PULSE_SYNC",
                        sub: "REALTIME_ACTIVITY_MIRRORING",
                        key: "showActivity"
                      },
                      {
                        label: "COMPACT_NODE_VIEW",
                        sub: "MINIMIZE_INTERFACE_DENSITY",
                        key: "compactPosts"
                      },
                      {
                        label: "SYNTAX_HIGHLIGHTING",
                        sub: "COLOR_CODE_NEURAL_LOGS",
                        key: "highlightCode"
                      }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between group pb-8 border-b-4 border-swiss-muted/20 last:border-0 last:pb-0">
                        <div>
                          <p className="font-black uppercase tracking-widest text-sm">{setting.label}</p>
                          <p className="text-[10px] font-bold uppercase opacity-40 mt-1">{setting.sub}</p>
                        </div>
                        <button
                          className={cn(
                            "w-20 h-10 border-4 border-swiss-black relative transition-all",
                            appearance[setting.key as keyof typeof appearance] ? "bg-swiss-red" : "bg-swiss-muted"
                          )}
                          onClick={() => setAppearance(prev => ({ ...prev, [setting.key]: !prev[setting.key as keyof typeof appearance] }))}
                        >
                          <div className={cn("absolute top-0 bottom-0 w-8 bg-swiss-black transition-all", appearance[setting.key as keyof typeof appearance] ? "right-0" : "left-0")} />
                        </button>
                      </div>
                    ))}
                  </div>
                </SwissCard>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-6 mb-24">
            <SwissButton
              variant="secondary"
              className="h-16 px-10 border-4"
              onClick={() => router.push("/profile")}
            >
              ABORT_CHANGES
            </SwissButton>
            <SwissButton
              variant="primary"
              className="h-16 px-12 border-4 bg-swiss-red border-swiss-black hover:bg-swiss-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  SYNCING...
                </>
              ) : (
                <>
                  <Save className="mr-3 h-5 w-5" />
                  COMMIT_SYNC
                </>
              )}
            </SwissButton>
          </div>
        </div>

        {/* Image Cropping Modal */}
        <AnimatePresence>
          {cropDialogOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-swiss-black/90 backdrop-blur-sm"
                onClick={() => setCropDialogOpen(false)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-swiss-white border-8 border-swiss-black shadow-[16px_16px_0_0_rgba(255,0,0,1)] max-w-2xl w-full overflow-hidden"
              >
                <div className="p-8 border-b-8 border-swiss-black bg-swiss-black text-swiss-white flex justify-between items-center">
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">
                    {imageType === "profile"
                      ? "CROP_AVATAR_MODULE"
                      : "CROP_BANNER_MODULE"}
                  </h3>
                  <X className="h-8 w-8 cursor-pointer hover:text-swiss-red transition-colors" onClick={() => setCropDialogOpen(false)} />
                </div>

                <div className="p-8 max-h-[60vh] overflow-auto bg-[url('/grid.svg')] bg-repeat">
                  {imagePreview && (
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={handleCropComplete}
                      aspect={imageType === "profile" ? 1 : 3}
                      circularCrop={imageType === "profile"}
                    >
                      <img
                        src={imagePreview}
                        ref={imageRef}
                        alt="Upload Preview"
                        className="max-w-full border-4 border-swiss-black"
                      />
                    </ReactCrop>
                  )}
                </div>

                <div className="p-8 border-t-8 border-swiss-black flex justify-end gap-4">
                  <SwissButton
                    variant="secondary"
                    className="h-14 px-8 border-4"
                    onClick={() => setCropDialogOpen(false)}
                  >
                    DISCARD
                  </SwissButton>
                  <SwissButton
                    variant="primary"
                    className="h-14 px-10 border-4 bg-swiss-red border-swiss-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
                    onClick={getCroppedImg}
                  >
                    <Check className="mr-3 h-5 w-5" />
                    APPLY_SLICE
                  </SwissButton>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Image Preview Modal */}
        <AnimatePresence>
          {previewImage && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-swiss-black/95"
                onClick={handleClosePreview}
              />
              <motion.div
                layoutId={previewId || undefined}
                className="relative max-w-full max-h-full border-8 border-swiss-white shadow-[24px_24px_0_0_rgba(255,0,0,1)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={previewId === "banner" ? 1920 : 1000}
                  height={previewId === "banner" ? 1080 : 1000}
                  className="object-contain max-h-[80vh] w-auto grayscale contrast-125"
                  priority
                />
                <button
                  className="absolute top-6 right-6 p-4 bg-swiss-red text-swiss-white border-4 border-swiss-black hover:bg-swiss-black transition-colors"
                  onClick={handleClosePreview}
                >
                  <X className="h-8 w-8" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Suspense>
  );
}
