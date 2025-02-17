"use client";

import type React from "react";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Users2, Clock, Sparkles } from "lucide-react";
import LoginButton from "@/components/login-button";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";

const expirationOptions = [
  { value: "1h", label: "1 hour" },
  { value: "2h", label: "2 hours" },
  { value: "4h", label: "4 hours" },
  { value: "8h", label: "8 hours" },
  { value: "12h", label: "12 hours" },
  { value: "24h", label: "24 hours" },
  { value: "36h", label: "36 hours" },
  { value: "72h", label: "72 hours" },
];

const container = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function CreateGatheringPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [expiration, setExpiration] = useState("4h");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("You must be logged in to create a gathering.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/gathering", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, expiration }),
      });

      if (!response.ok) {
        throw new Error("Failed to create gathering");
      }

      const data = await response.json();

      toast.success("Gathering created successfully!");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      router.push(`/gathering/${data.slug}`);
    } catch {
      toast.error("Failed to create gathering. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Gatherings</CardTitle>
            <CardDescription>
              Sign in to create and join gatherings with other developers
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <LoginButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-[80vh] flex items-center justify-center">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-lg"
      >
        <Card className="relative overflow-hidden pb-4">
          <div className="absolute inset-0 bg-background" />

          <CardHeader className="relative">
            <motion.div variants={item}>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Create a Gathering
              </CardTitle>
              <CardDescription>
                Bring developers together for collaboration and discussion
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="relative space-y-8">
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              variants={item}
            >
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Users2 className="h-4 w-4" />
                  Gathering Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter a memorable name for your gathering"
                  className="bg-background/50 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="expiration"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Expiration Time
                </Label>
                <Select value={expiration} onValueChange={setExpiration}>
                  <SelectTrigger
                    id="expiration"
                    className="bg-background/50 backdrop-blur-sm"
                  >
                    <SelectValue placeholder="Select expiration time" />
                  </SelectTrigger>
                  <SelectContent>
                    {expirationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  The gathering will automatically expire after this duration
                </p>
              </div>
            </motion.form>
          </CardContent>

          <CardFooter className="relative">
            <motion.div variants={item} className="w-full">
              <Button
                type="submit"
                className="w-full relative overflow-hidden group hover:scale-[1.02] transition-transform"
                size="lg"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Creating..." : "Create Gathering"}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/25 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
