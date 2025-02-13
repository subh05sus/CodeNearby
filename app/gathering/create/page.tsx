"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import LoginButton from "@/components/login-button";

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

export default function CreateGatheringPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [expiration, setExpiration] = useState("4h");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast({
        title: "Error",
        description: "You must be signed in to create a gathering.",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Gathering created successfully!",
      });
      router.push(`/gathering/${data.slug}`);
    } catch {
      toast({
        title: "Error",
        description: "Failed to create gathering. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to create a gathering.</p>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create a Gathering</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Gathering Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter gathering name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiration">Expiration Time</Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger id="expiration">
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
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Gathering
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
