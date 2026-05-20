/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Save,
  Camera,
  ArrowLeft,
  X,
  Check,
  ImageIcon,
  Trash2,
  Star,
  GitFork,
  Search,
  Pin,
  Github,
  CodeIcon,
  User,
  Palette,
  BookMarked,
} from "lucide-react";
import { toast } from "sonner";
import type { UserProfile, PinnedRepo } from "@/types";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { fetchUserRepositories } from "@/lib/github";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const popularSkills = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
  "Java", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin",
  "HTML", "CSS", "SQL", "MongoDB", "GraphQL", "Docker", "AWS", "Azure",
  "Git", "DevOps", "TailwindCSS", "Vue.js", "Angular", "Svelte",
  "Flutter", "React Native",
];

function TabParamReader({ onParamLoad }: { onParamLoad: (param: string | null) => void }) {
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

  const [repositories, setRepositories] = useState<PinnedRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [pinnedRepos, setPinnedRepos] = useState<PinnedRepo[]>([]);

  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageType, setImageType] = useState<"profile" | "banner">("profile");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: "%", width: 90, height: 90, x: 5, y: 5 });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [croppedProfileImage, setCroppedProfileImage] = useState<string | null>(null);
  const [croppedBannerImage, setCroppedBannerImage] = useState<string | null>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const [appearance, setAppearance] = useState({
    theme: "default",
    showActivity: true,
    compactPosts: false,
    highlightCode: true,
    showSpotlight: true,
  });

  const handleTabParamLoad = (param: string | null) => {
    if (param) setActiveTab(param);
  };

  useEffect(() => {
    if (!session) { router.push("/profile"); return; }
    fetchProfile();
  }, [session, router]);

  useEffect(() => {
    if (profile?.githubUsername) loadRepositories();
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
      if (data.pinnedRepos && data.pinnedRepos.length > 0) setPinnedRepos(data.pinnedRepos);
      if (data.appearance) setAppearance(data.appearance);
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
      if (croppedProfileImage) profileImageUrl = await uploadImage(croppedProfileImage);
      if (croppedBannerImage) bannerImageUrl = await uploadImage(croppedBannerImage);

      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, githubBio: bio, githubLocation: location,
          image: profileImageUrl, bannerImage: bannerImageUrl,
          pinnedRepos, appearance, skills,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated successfully!");
      router.push("/profile");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (base64Image: string) => {
    const fetchResponse = await fetch(base64Image);
    const blob = await fetchResponse.blob();
    const formData = new FormData();
    formData.append("file", blob, "image.jpg");
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    if (!response.ok) throw new Error("Failed to upload image");
    const data = await response.json();
    return data.imageUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
        setImageType(type);
        setCrop(type === "profile"
          ? { unit: "%", width: 90, height: 90, x: 5, y: 5 }
          : { unit: "%", width: 90, height: 40, x: 5, y: 5 });
        setCropDialogOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (crop: Crop) => setCompletedCrop(crop);

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
    ctx.drawImage(
      imageRef.current,
      completedCrop.x * scaleX, completedCrop.y * scaleY,
      completedCrop.width * scaleX, completedCrop.height * scaleY,
      0, 0, completedCrop.width * scaleX, completedCrop.height * scaleY
    );
    const base64Image = canvas.toDataURL("image/jpeg", 0.95);
    if (imageType === "profile") setCroppedProfileImage(base64Image);
    else setCroppedBannerImage(base64Image);
    setCropDialogOpen(false);
  };

  const clearBannerImage = () => setCroppedBannerImage(null);

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
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const themeGradients: Record<string, string> = {
    default: "from-primary/30 to-primary/10",
    blue: "from-blue-500/30 to-blue-600/10",
    green: "from-green-500/30 to-green-600/10",
    purple: "from-purple-500/30 to-purple-600/10",
    orange: "from-orange-500/30 to-orange-600/10",
  };

  return (
    <Suspense>
      <TabParamReader onParamLoad={handleTabParamLoad} />
      <div className="mx-auto px-2 max-w-3xl py-8">
        <div className="flex flex-col items-start mb-6">
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center text-sm text-muted-foreground mb-3 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Profile
          </button>
          <h1 className="font-heading text-3xl">Edit Profile</h1>
        </div>

        <div className="space-y-6">
          {/* Banner + Avatar card */}
          <div className="rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors overflow-hidden">
            <div className="relative w-full h-44 bg-muted">
              {croppedBannerImage || profile?.bannerImage ? (
                <>
                  <motion.div
                    layoutId="banner"
                    className="w-full h-full cursor-pointer"
                    onClick={() =>
                      handleOpenPreview(croppedBannerImage || profile?.bannerImage || "/bg.webp", "banner")
                    }
                  >
                    <Image
                      src={croppedBannerImage || profile?.bannerImage || "/bg.webp"}
                      alt="Banner"
                      fill
                      className="object-cover"
                      style={{ pointerEvents: "none" }}
                      priority
                    />
                  </motion.div>
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-full h-7 text-xs"
                      onClick={() => bannerInputRef.current?.click()}
                    >
                      <Camera className="h-3.5 w-3.5 mr-1" />
                      Change
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-full h-7 text-xs"
                      onClick={clearBannerImage}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  <ImageIcon className="h-10 w-10 mb-2 text-primary/40" />
                  <p className="text-sm font-medium text-muted-foreground">Click to add a banner image</p>
                  <p className="text-xs text-muted-foreground/60">Recommended: 1500×500</p>
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

            <div className="px-6 pb-5 pt-3">
              <div className="flex items-center gap-4">
                <div className="relative -mt-12">
                  <div
                    className="h-20 w-20 rounded-full overflow-hidden border-4 border-background shadow-lg cursor-pointer"
                    onClick={() =>
                      handleOpenPreview(croppedProfileImage || profile?.image || "/placeholder.svg", "profile")
                    }
                  >
                    <motion.div layoutId="profile">
                      <img
                        src={croppedProfileImage || profile?.image || "/placeholder.svg"}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        style={{ pointerEvents: "none" }}
                      />
                    </motion.div>
                  </div>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full shadow-md"
                    onClick={() => profileInputRef.current?.click()}
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={profileInputRef}
                    onChange={(e) => handleImageChange(e, "profile")}
                  />
                </div>
                <div>
                  <h2 className="font-semibold">{name || "Your Name"}</h2>
                  <p className="text-sm text-muted-foreground font-mono">@{profile?.githubUsername}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue={activeTab} className="space-y-4">
            <TabsList className="w-full rounded-2xl bg-muted/50 border border-border p-1">
              <TabsTrigger value="information" className="flex-1 rounded-xl flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Information</span>
              </TabsTrigger>
              <TabsTrigger value="repositories" className="flex-1 rounded-xl flex items-center gap-1.5">
                <BookMarked className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Repositories</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex-1 rounded-xl flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="information" className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
                <h2 className="font-semibold">Personal Details</h2>
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm">Display Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-sm">GitHub Username</Label>
                  <Input
                    id="username"
                    value={profile?.githubUsername || ""}
                    disabled
                    className="bg-muted rounded-xl font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Synced with GitHub — cannot be changed.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bio" className="text-sm">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself"
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-sm">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Your location"
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Skills</h2>
                  <span className="text-xs text-muted-foreground font-mono">{skills.length}/15</span>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                  {skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="rounded-full px-2.5 py-1 gap-1 text-xs"
                      style={{ background: "hsl(24 95% 53% / 0.12)", color: "hsl(24 95% 53%)" }}
                    >
                      {skill}
                      <button
                        onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                        className="hover:opacity-60 transition-opacity"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                  {skills.length === 15 && (
                    <Badge variant="outline" className="rounded-full text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                      Max reached
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="customSkill"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add a skill (e.g., React, Python)"
                    className="rounded-xl text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customSkill.trim()) {
                        e.preventDefault();
                        if (!skills.includes(customSkill.trim()) && skills.length < 15) {
                          setSkills([...skills, customSkill.trim()]);
                          setCustomSkill("");
                        } else if (skills.length >= 15) {
                          toast.error("You can add a maximum of 15 skills");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-xl flex-shrink-0"
                    onClick={() => {
                      if (customSkill.trim() && !skills.includes(customSkill.trim()) && skills.length < 15) {
                        setSkills([...skills, customSkill.trim()]);
                        setCustomSkill("");
                      } else if (skills.length >= 15) {
                        toast.error("You can add a maximum of 15 skills");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Popular skills — click to add:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {popularSkills.map((skill, index) => (
                      <button
                        key={index}
                        disabled={skills.includes(skill) || skills.length >= 15}
                        onClick={() => {
                          if (!skills.includes(skill) && skills.length < 15) {
                            setSkills([...skills, skill]);
                          } else if (skills.length >= 15) {
                            toast.error("You can add a maximum of 15 skills");
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          skills.includes(skill)
                            ? "bg-primary/10 border-primary/30 text-primary cursor-default"
                            : "border-border hover:border-primary/40 hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="repositories" className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
                <div>
                  <h2 className="font-semibold mb-1">Pinned Repositories</h2>
                  <p className="text-sm text-muted-foreground">Select up to 2 repositories to showcase on your profile.</p>
                </div>

                {/* Currently pinned */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Currently Pinned</h3>
                  {pinnedRepos.length === 0 ? (
                    <div className="bg-muted/50 rounded-xl p-4 text-center">
                      <p className="text-sm text-muted-foreground">No repositories pinned yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pinnedRepos.map((repo) => (
                        <div key={repo.id} className="flex items-start justify-between rounded-xl border border-border bg-card p-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Pin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              <span className="font-medium text-sm truncate">{repo.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 pl-5 mb-1">
                              {repo.description || "No description"}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground pl-5">
                              {repo.language && (
                                <div className="flex items-center gap-1">
                                  <CodeIcon className="h-3 w-3" />
                                  {repo.language}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {repo.stargazers_count}
                              </div>
                              <div className="flex items-center gap-1">
                                <GitFork className="h-3 w-3" />
                                {repo.forks_count}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 w-8 p-0 flex-shrink-0"
                            onClick={() => {
                              setPinnedRepos(pinnedRepos.filter((r) => r.id !== repo.id));
                              toast.success(`Unpinned ${repo.name}`);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search repos */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Add Repositories</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search your repositories"
                      className="pl-9 rounded-xl"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {loadingRepos ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {repositories
                        .filter((repo) =>
                          repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        .map((repo) => {
                          const isPinned = pinnedRepos.some((r) => r.id === repo.id);
                          const isPinningDisabled = pinnedRepos.length >= 2 && !isPinned;

                          return (
                            <div
                              key={repo.id}
                              className={`flex items-start justify-between rounded-xl border p-3 gap-3 transition-colors ${
                                isPinned ? "border-primary/30 bg-primary/5" : "border-border hover:bg-muted/30"
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Github className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                                  <span className="font-medium text-sm truncate">{repo.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1 pl-5 mb-1">
                                  {repo.description || "No description"}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground pl-5">
                                  {repo.language && (
                                    <div className="flex items-center gap-1">
                                      <span className="h-2 w-2 rounded-full bg-primary" />
                                      {repo.language}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    {repo.stargazers_count}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <GitFork className="h-3 w-3" />
                                    {repo.forks_count}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant={isPinned ? "destructive" : "secondary"}
                                size="sm"
                                className="rounded-xl text-xs flex-shrink-0 h-7"
                                disabled={isPinningDisabled}
                                onClick={() => {
                                  if (isPinned) {
                                    setPinnedRepos(pinnedRepos.filter((r) => r.id !== repo.id));
                                    toast.success(`Unpinned ${repo.name}`);
                                  } else {
                                    setPinnedRepos([...pinnedRepos, repo]);
                                    toast.success(`Pinned ${repo.name}`);
                                  }
                                }}
                              >
                                {isPinned ? "Unpin" : "Pin"}
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-6">
                <h2 className="font-semibold">Theme & Visual Preferences</h2>

                <div>
                  <h3 className="text-sm font-medium mb-3">Profile Theme</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {["default", "blue", "green", "purple", "orange"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setAppearance((prev) => ({ ...prev, theme: color as any }))}
                        className={`relative rounded-xl overflow-hidden border-2 h-20 transition-all ${
                          appearance.theme === color
                            ? "border-primary shadow-md"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${themeGradients[color] || themeGradients.default}`} />
                        <div className="absolute bottom-1.5 left-0 right-0 text-center text-xs font-medium capitalize">
                          {color}
                        </div>
                        {appearance.theme === color && (
                          <div className="absolute top-1.5 right-1.5">
                            <Check className="h-3.5 w-3.5 text-primary" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Display Options</h3>
                  {[
                    {
                      id: "showActivity",
                      label: "Show GitHub Activity",
                      desc: "Display your recent GitHub activity on your profile",
                      key: "showActivity" as const,
                    },
                    {
                      id: "compactPosts",
                      label: "Compact Posts",
                      desc: "Display posts in a more compact layout",
                      key: "compactPosts" as const,
                    },
                    {
                      id: "showSpotlight",
                      label: "Show Animated Spotlight",
                      desc: "Show an animated spotlight on your profile",
                      key: "showSpotlight" as const,
                    },
                  ].map((opt) => (
                    <div key={opt.id} className="flex items-center justify-between gap-4">
                      <div>
                        <Label htmlFor={opt.id} className="font-medium text-sm cursor-pointer">{opt.label}</Label>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                      <Switch
                        id={opt.id}
                        checked={appearance[opt.key]}
                        onCheckedChange={(checked) =>
                          setAppearance((prev) => ({ ...prev, [opt.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" className="rounded-full" onClick={() => router.push("/profile")}>
              Cancel
            </Button>
            <Button
              className="rounded-full text-white"
              style={{ background: "hsl(24 95% 53%)" }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Crop Dialog */}
        <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle>
                {imageType === "profile" ? "Crop Profile Picture" : "Crop Banner Image"}
              </DialogTitle>
            </DialogHeader>
            <div className="my-4 max-h-[60vh] overflow-auto">
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
                    style={{ maxWidth: "100%" }}
                  />
                </ReactCrop>
              )}
            </div>
            <DialogFooter>
              <Button variant="secondary" className="rounded-xl" onClick={() => setCropDialogOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                className="rounded-xl text-white"
                style={{ background: "hsl(24 95% 53%)" }}
                onClick={getCroppedImg}
              >
                <Check className="mr-2 h-4 w-4" />
                Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Preview Modal */}
        <AnimatePresence>
          {previewImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
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
                  className="relative w-full h-full overflow-hidden rounded-2xl"
                >
                  <Image
                    src={previewImage}
                    alt={previewId === "banner" ? "Banner Preview" : "Profile Preview"}
                    width={previewId === "banner" ? 1920 : 1000}
                    height={previewId === "banner" ? 1080 : 1000}
                    className="object-contain"
                    style={{ maxHeight: "90vh", width: "auto" }}
                    priority
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
      </div>
    </Suspense>
  );
}
