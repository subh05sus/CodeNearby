"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Github,
  Search,
  MapPin,
  Users,
  User,
  MessageCircle,
  Bot,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";

export default function AIConnectAboutPage() {
  const { resolvedTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState("light");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Use resolvedTheme which gives the actual applied theme
    setCurrentTheme(resolvedTheme === "dark" ? "dark" : "light");
  }, [resolvedTheme]);
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">AI-Connect</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          An intelligent way to discover and connect with developers worldwide
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">
            Find the right developers for your projects
          </h2>
          <p className="text-lg mb-6">
            AI-Connect uses advanced artificial intelligence to help you
            discover GitHub developers based on skills, location, and specific
            requirements. Whether you&apos;re looking for collaborators, team
            members, or just want to expand your network, our AI assistant makes
            it easy.
          </p>
          <div className="flex gap-4">
            <Button asChild className="rounded-full">
              <Link href="/ai-connect">Try AI-Connect</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full">
              <Link href="/explore">Explore Developers</Link>
            </Button>
          </div>
        </div>
        <div className="relative h-64 md:h-auto rounded-xl overflow-hidden shadow-lg border border-primary/10">
          {/* Using Framer Motion for zoom effect */}
          <motion.div
            layoutId="ai-preview-image"
            onClick={() => setIsOpen(true)}
            className="w-full h-full cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={`/ai-preview-${currentTheme}.png`}
              alt="AI-Connect Interface"
              fill
              className="object-cover"
              priority
            />
          </motion.div>

          {/* Modal overlay for the zoomed image */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
              >
                <motion.div
                  layoutId="ai-preview-image"
                  className="relative w-[90vw] h-[90vh] max-w-6xl rounded-xl overflow-hidden"
                >
                  <Image
                    src={`/ai-preview-${currentTheme}.png`}
                    alt="AI-Connect Interface"
                    fill
                    className="object-contain"
                    priority
                  />
                  <motion.button
                    className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                  >
                    <X size={24} />
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6 text-center">Key Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-card border border-primary/10">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Developer Search</h3>
              <p className="text-muted-foreground">
                Find developers by skills, technologies, or interests. Search
                for experts in React, Python, Machine Learning, and more.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-primary/10">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">
                Location-Based Discovery
              </h3>
              <p className="text-muted-foreground">
                Find developers near you or in specific cities worldwide.
                Connect with tech talent in your area or explore remote
                collaboration opportunities.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-primary/10">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Detailed Profiles</h3>
              <p className="text-muted-foreground">
                Access comprehensive developer profiles including their top
                repositories, skills, followers, and contributions on GitHub.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-3xl font-bold mb-6">How It Works</h2>
      <div className="space-y-8 mb-12">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-muted w-full md:w-1/3 aspect-video rounded-xl flex items-center justify-center p-8">
            <Bot className="h-16 w-16 text-primary/70" />
          </div>
          <div className="md:w-2/3">
            <h3 className="text-2xl font-semibold mb-3">
              Ask the AI Assistant
            </h3>
            <p className="text-lg">
              Simply chat with our AI assistant about the kind of developers
              you&apos;re looking for. Try prompts like:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
              <li>&quot;Find React developers in New York&quot;</li>
              <li>&quot;Who are the top Python developers?&quot;</li>
              <li>&quot;Do you know @username?&quot;</li>
              <li>&quot;Find developers near me&quot;</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="md:w-2/3 order-2 md:order-1">
            <h3 className="text-2xl font-semibold mb-3">
              Review Developer Profiles
            </h3>
            <p className="text-lg">
              The AI will present relevant developers with detailed information
              about their skills, repositories, and contributions. You can ask
              for more details about specific developers by referencing them by
              name or position in the results.
            </p>
          </div>
          <div className="bg-muted w-full md:w-1/3 aspect-video rounded-xl flex items-center justify-center p-8 order-1 md:order-2">
            <Github className="h-16 w-16 text-primary/70" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-muted w-full md:w-1/3 aspect-video rounded-xl flex items-center justify-center p-8">
            <Users className="h-16 w-16 text-primary/70" />
          </div>
          <div className="md:w-2/3">
            <h3 className="text-2xl font-semibold mb-3">
              Connect and Collaborate
            </h3>
            <p className="text-lg">
              When you find developers you&apos;re interested in, you can view
              their full profiles, visit their GitHub repositories, or add them
              as friends on CodeNearby to start collaborating.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6 text-center">
        Powered by Advanced AI
      </h2>
      <div className="flex flex-col md:flex-row gap-8 items-center mb-12">
        <div className="md:w-1/3 flex justify-center">
          <div className="relative h-40 w-40">
            <Image
              src={`/gemini-logo.svg`}
              alt="Gemini AI"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div className="md:w-2/3">
          <Card className="bg-card/50 border border-primary/10">
            <CardContent className="pt-6">
              <p className="text-lg">
                AI-Connect leverages Gemini AI, Google&apos;s state-of-the-art
                large language model, to provide intelligent and contextual
                responses to your developer search queries. The AI analyzes
                GitHub profiles, repositories, and user data to match you with
                the most relevant developers for your needs.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-6">
          Ready to find your next collaborator?
        </h2>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/ai-connect">Start Using AI-Connect</Link>
        </Button>
      </div>

      <Card className="bg-muted/50 border border-primary/10 mb-12">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Conversation Example</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-background rounded-xl p-4 shadow-sm">
              <p className="font-medium text-sm">User:</p>
              <p className="mt-1">Find React developers in San Francisco</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 shadow-sm">
              <p className="font-medium text-sm">AI Assistant:</p>
              <p className="mt-1">
                I found 5 developers that might match your criteria. Here&apos;s
                a summary of the developers I found:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Sarah Chen (@sarahcoder)</li>
                <li>Michael Johnson (@mjreact)</li>
                <li>Taylor Rodriguez (@troddev)</li>
                <li>Alex Kim (@alexk)</li>
                <li>Jamie Smith (@jsmith)</li>
              </ol>
              <p className="mt-2 text-sm">
                You can ask for more details about a specific developer by
                saying &quot;Tell me more about @username&quot; or &quot;Show me
                details for the 3rd one&quot;.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border-t pt-8">
        <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold">
              Is AI-Connect free to use?
            </h4>
            <p className="mt-2 text-muted-foreground">
              Yes, AI-Connect is available to all registered CodeNearby users at
              no additional cost.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold">
              How accurate are the developer search results?
            </h4>
            <p className="mt-2 text-muted-foreground">
              AI-Connect uses real-time data from GitHub to provide accurate
              developer information. However, search results may be limited by
              GitHub API rate limits and the availability of public information
              on user profiles.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold">
              Can I use AI-Connect to find remote collaborators?
            </h4>
            <p className="mt-2 text-muted-foreground">
              Absolutely! You can search for developers based on specific skills
              without location constraints, making it perfect for finding remote
              team members or collaborators worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
