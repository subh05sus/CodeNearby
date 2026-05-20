"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";

const features = [
  {
    icon: <Search className="h-5 w-5" />,
    title: "Smart Developer Search",
    desc: "Find developers by skills, technologies, or interests. Search for experts in React, Python, Machine Learning, and more.",
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    title: "Location-Based Discovery",
    desc: "Find developers near you or in specific cities worldwide. Connect with tech talent in your area or explore remote collaboration opportunities.",
  },
  {
    icon: <User className="h-5 w-5" />,
    title: "Detailed Profiles",
    desc: "Access comprehensive developer profiles including their top repositories, skills, followers, and contributions on GitHub.",
  },
];

const faqItems = [
  {
    q: "Is AI-Connect free to use?",
    a: "Yes, AI-Connect is available to all registered CodeNearby users at no additional cost.",
  },
  {
    q: "How accurate are the developer search results?",
    a: "AI-Connect uses real-time data from GitHub to provide accurate developer information. However, search results may be limited by GitHub API rate limits and the availability of public information on user profiles.",
  },
  {
    q: "Can I use AI-Connect to find remote collaborators?",
    a: "Absolutely! You can search for developers based on specific skills without location constraints, making it perfect for finding remote team members or collaborators worldwide.",
  },
];

export default function AIConnectAboutPage() {
  const { resolvedTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState("light");
  const [isOpen, setIsOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setCurrentTheme(resolvedTheme === "dark" ? "dark" : "light");
  }, [resolvedTheme]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Hero */}
      <div className="text-center mb-12">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "hsl(24 95% 53% / 0.12)", border: "1px solid hsl(24 95% 53% / 0.25)" }}
        >
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-heading text-4xl md:text-5xl mb-3">AI-Connect</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          An intelligent way to discover and connect with developers worldwide using natural language.
        </p>
      </div>

      {/* Intro + preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="flex flex-col justify-center">
          <h2 className="font-heading text-2xl mb-3">
            Find the right developers for your projects
          </h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            AI-Connect uses advanced artificial intelligence to help you discover GitHub developers based on skills, location, and specific requirements. Whether you&apos;re looking for collaborators, team members, or just want to expand your network, our AI assistant makes it easy.
          </p>
          <div className="flex gap-3">
            <Button
              asChild
              className="rounded-full text-white"
              style={{ background: "hsl(24 95% 53%)" }}
            >
              <Link href="/ai-connect">Try AI-Connect</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full">
              <Link href="/explore">Explore Developers</Link>
            </Button>
          </div>
        </div>
        <div className="relative h-64 md:h-auto rounded-2xl overflow-hidden shadow-lg border border-border">
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
                  className="relative w-[90vw] h-[90vh] max-w-6xl rounded-2xl overflow-hidden"
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
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                  >
                    <X size={20} />
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Key features */}
      <h2 className="font-heading text-2xl mb-5 text-center">Key Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
        {features.map((f, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 flex flex-col items-center text-center gap-3 hover:border-primary/30 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(24 95% 53% / 0.12)" }}
            >
              <span className="text-primary">{f.icon}</span>
            </div>
            <h3 className="font-semibold text-sm">{f.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <h2 className="font-heading text-2xl mb-8">How It Works</h2>
      <div className="space-y-6 mb-16">
        {[
          {
            icon: <Bot className="h-12 w-12" style={{ color: "hsl(24 95% 53% / 0.7)" }} />,
            title: "Ask the AI Assistant",
            desc: 'Simply chat with our AI assistant about the kind of developers you\'re looking for. Try prompts like:',
            examples: [
              '"Find React developers in New York"',
              '"Who are the top Python developers?"',
              '"Do you know @username?"',
              '"Find developers near me"',
            ],
          },
          {
            icon: <Github className="h-12 w-12" style={{ color: "hsl(24 95% 53% / 0.7)" }} />,
            title: "Review Developer Profiles",
            desc: "The AI will present relevant developers with detailed information about their skills, repositories, and contributions. You can ask for more details about specific developers by referencing them by name or position in the results.",
            examples: [],
          },
          {
            icon: <Users className="h-12 w-12" style={{ color: "hsl(24 95% 53% / 0.7)" }} />,
            title: "Connect and Collaborate",
            desc: "When you find developers you're interested in, you can view their full profiles, visit their GitHub repositories, or add them as friends on CodeNearby to start collaborating.",
            examples: [],
          },
        ].map((step, i) => (
          <div
            key={i}
            className={`flex flex-col md:flex-row gap-5 items-center ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
          >
            <div className="rounded-2xl border border-border bg-muted/50 w-full md:w-1/3 aspect-video flex items-center justify-center p-8">
              {step.icon}
            </div>
            <div className="md:w-2/3">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                  style={{ background: "hsl(24 95% 53%)" }}
                >
                  {i + 1}
                </span>
                <h3 className="font-heading text-xl">{step.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{step.desc}</p>
              {step.examples.length > 0 && (
                <ul className="space-y-1">
                  {step.examples.map((ex, j) => (
                    <li
                      key={j}
                      className="text-xs font-mono bg-muted rounded-xl px-3 py-1.5 w-fit"
                      style={{ color: "hsl(24 95% 53%)" }}
                    >
                      {ex}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Powered by Gemini */}
      <h2 className="font-heading text-2xl mb-6 text-center">Powered by Advanced AI</h2>
      <div className="flex flex-col md:flex-row gap-6 items-center mb-16">
        <div className="md:w-1/4 flex justify-center">
          <div className="relative h-24 w-24">
            <Image src="/gemini-logo.svg" alt="Gemini AI" fill className="object-contain" priority />
          </div>
        </div>
        <div className="md:w-3/4 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            AI-Connect leverages Gemini AI, Google&apos;s state-of-the-art large language model, to provide intelligent and contextual responses to your developer search queries. The AI analyzes GitHub profiles, repositories, and user data to match you with the most relevant developers for your needs.
          </p>
        </div>
      </div>

      {/* Conversation example */}
      <div className="rounded-2xl border border-border bg-card p-5 mb-16">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Conversation Example</h3>
        </div>
        <div className="space-y-3">
          <div className="bg-muted rounded-2xl p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">You</p>
            <p className="text-sm">Find React developers in San Francisco</p>
          </div>
          <div className="rounded-2xl p-3" style={{ background: "hsl(24 95% 53% / 0.08)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "hsl(24 95% 53%)" }}>AI Assistant</p>
            <p className="text-sm mb-2">I found 5 developers that might match your criteria. Here&apos;s a summary:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-sm text-muted-foreground">
              <li>Sarah Chen (@sarahcoder)</li>
              <li>Michael Johnson (@mjreact)</li>
              <li>Taylor Rodriguez (@troddev)</li>
              <li>Alex Kim (@alexk)</li>
              <li>Jamie Smith (@jsmith)</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-2">
              Say &quot;Tell me more about @username&quot; for details on a specific developer.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mb-12">
        <h2 className="font-heading text-2xl mb-4">Ready to find your next collaborator?</h2>
        <Button
          asChild
          size="lg"
          className="rounded-full px-8 text-white"
          style={{ background: "hsl(24 95% 53%)" }}
        >
          <Link href="/ai-connect">Start Using AI-Connect</Link>
        </Button>
      </div>

      {/* FAQ */}
      <div className="border-t pt-8">
        <h3 className="font-heading text-xl mb-5">Frequently Asked Questions</h3>
        <div className="space-y-2">
          {faqItems.map((item, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-medium text-sm">{item.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
