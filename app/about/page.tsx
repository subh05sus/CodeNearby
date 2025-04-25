import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Features from "@/components/home/Features";
import { AuroraText } from "@/components/magicui/aurora-text";
import { Jersey_10 } from "next/font/google";
import ProductHunt from "@/components/ProductHunt";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, ExternalLink } from "lucide-react";

const jersey = Jersey_10({
  subsets: ["latin"],
  weight: "400",
});

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="md:text-5xl text-2xl font-bold mb-6">
        👋 Welcome to{" "}
        <span
          className={` tracking-wide md:text-6xl text-3xl ${jersey.className}`}
        >
          Code<AuroraText>Nearby</AuroraText>
        </span>
      </h1>
      <p className="text-lg mb-6 text-muted-foreground">
        Codenearby is a social networking platform designed specifically for
        developers. Our mission is to help developers connect, share ideas,
        collaborate on projects, and stay updated with the coding community.
      </p>
      <ProductHunt />
      <div className="text-center my-20">
        <h2 className="text-3xl font-bold text-primary relative">
          Features
          <span className="absolute -z-50 text-primary/5 left-1/2 transform -translate-x-1/2 -translate-y-1/3 font-extrabold text-8xl">
            Features
          </span>
        </h2>
      </div>

      <Features />

      {/* AI-Connect Feature Spotlight */}
      <div className="my-16">
        <Card className="overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-background to-primary/5">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-6 md:p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Meet AI-Connect</h3>
                </div>
                <p className="text-lg mb-6">
                  Our newest feature uses Gemini AI to help you find the perfect
                  developers for your projects. Search by skills, location, or
                  specific requirements through a conversational interface.
                </p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Find React developers in San Francisco</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Search for Python experts near your location</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Look up specific GitHub users</span>
                  </li>
                </ul>
                <Button asChild className="rounded-full">
                  <Link
                    href="/about/ai-connect"
                    className="inline-flex items-center"
                  >
                    Learn more about AI-Connect
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="md:w-1/2 relative  md:h-auto flex justify-center items-center">
                <Image
                  src="/ai.gif"
                  alt="AI-Connect feature preview"
                  width={300}
                  height={300}
                  className="object-cover"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="text-center my-20">
          <h2 className="text-3xl font-bold text-primary relative">
            Why Codenearby?
            <span className="absolute -z-50 text-primary/5 left-1/2 transform -translate-x-1/2 -translate-y-1/3 font-extrabold text-8xl">
              Why
            </span>
          </h2>
        </div>
        <div className="grid gap-6 text-left">
          <div className="space-y-2">
            <ul className="list-disc pl-6 space-y-4 text-muted-foreground">
              <li>
                Connect with developers who share your interests and tech stack
              </li>
              <li>Find potential collaborators for your next big project</li>
              <li>
                Share your coding journey and learn from others&apos;
                experiences
              </li>
              <li>
                Stay updated with the latest trends in your preferred
                technologies
              </li>
              <li>
                Build meaningful professional relationships in the tech
                community
              </li>
              <li>Discover local coding events and meetups</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="text-center my-20">
          <h2 className="text-3xl font-bold text-primary relative">
            What Can You Do?
            <span className="absolute -z-50 text-primary/5 left-1/2 transform -translate-x-1/2 -translate-y-1/3 font-extrabold text-8xl">
              We Offer
            </span>
          </h2>
        </div>

        <ul className="text-neutral-600 dark:text-neutral-400 space-y-4 text-lg">
          <li>🔍 Discover - Find developers based on location & skills.</li>
          <li>💬 Chat - Connect and collaborate in real-time.</li>
          <li>📢 Feed - Share thoughts, code snippets & tech ideas.</li>
          <li>🎭 Gatherings - Host meetups, anonymous polls & discussions.</li>
          <li>🤖 AI-Connect - Use AI to find the perfect developers.</li>
          <li>🐙 GitHub Integration - Auto-fetch profile & activity.</li>
        </ul>
      </section>

      {/* Vision Section */}
      <section className="mt-16 ">
        <div className="text-center my-20">
          <h2 className="text-3xl font-bold text-primary relative">
            Our Vision
            <span className="absolute -z-50 text-primary/5 left-1/2 transform -translate-x-1/2 -translate-y-1/3 font-extrabold text-8xl">
              Vision
            </span>
          </h2>
        </div>{" "}
        <p className="text-lg text-muted-foreground mt-4">
          We believe that networking should be effortless for developers.
          Whether you&apos;re looking for an open-source collaborator, a mentor,
          or a hackathon buddy, Codenearby makes it simple and effective.
        </p>
      </section>
      <div className="mt-16 text-center flex flex-col items-center">
        <p className="text-sm mb-6 text-muted-foreground mt-10">
          Join Codenearby today and become part of a vibrant community of
          developers, where collaboration and innovation thrive!
        </p>
        <div className="flex space-x-4">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
