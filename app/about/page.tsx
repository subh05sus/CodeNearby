import Link from "next/link";
import { Button } from "@/components/ui/button";
import Features from "@/components/home/Features";
import { AuroraText } from "@/components/magicui/aurora-text";
import { Jersey_10 } from "next/font/google";
import ProductHunt from "@/components/ProductHunt";
import FeatureBigPreview from "@/components/FeatureBigPreview";

const jersey = Jersey_10({
  subsets: ["latin"],
  weight: "400",
});

const whyItems = [
  "Connect with developers who share your interests and tech stack",
  "Find potential collaborators for your next big project",
  "Share your coding journey and learn from others' experiences",
  "Stay updated with the latest trends in your preferred technologies",
  "Build meaningful professional relationships in the tech community",
  "Discover local coding events and meetups",
];

const whatItems = [
  { emoji: "🔍", label: "Discover", desc: "Find developers based on location & skills." },
  { emoji: "💬", label: "Chat", desc: "Connect and collaborate in real-time." },
  { emoji: "📢", label: "Feed", desc: "Share thoughts, code snippets & tech ideas." },
  { emoji: "🎭", label: "Gatherings", desc: "Host meetups, anonymous polls & discussions." },
  { emoji: "🤖", label: "AI-Connect", desc: "Use AI to find the perfect developers." },
  { emoji: "🐙", label: "GitHub Integration", desc: "Auto-fetch profile & activity." },
];

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="text-center my-16">
      <h2 className="text-3xl font-bold text-primary relative inline-block">
        {title}
        <span className="absolute -z-10 text-primary/5 left-1/2 transform -translate-x-1/2 -translate-y-1/3 font-extrabold text-8xl whitespace-nowrap">
          {title}
        </span>
      </h2>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="md:text-5xl text-2xl font-bold mb-4">
          👋 Welcome to{" "}
          <span className={`tracking-wide md:text-6xl text-3xl ${jersey.className}`}>
            Code<AuroraText>Nearby</AuroraText>
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          A social networking platform designed specifically for developers — helping you connect, share ideas, collaborate, and stay updated with the coding community.
        </p>
        <ProductHunt />
      </div>

      <SectionHeading title="Features" />
      <Features />

      {/* AI-Connect Feature Spotlight */}
      <div className="my-16">
        <FeatureBigPreview />
      </div>

      <SectionHeading title="Why CodeNearby?" />
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {whyItems.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "hsl(24 95% 53% / 0.15)" }}
            >
              <span className="text-xs font-bold" style={{ color: "hsl(24 95% 53%)" }}>{i + 1}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
          </div>
        ))}
      </div>

      <SectionHeading title="What Can You Do?" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {whatItems.map((item, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition-colors"
          >
            <div className="text-2xl mb-2">{item.emoji}</div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: "hsl(24 95% 53%)" }}>{item.label}</h3>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Vision */}
      <SectionHeading title="Our Vision" />
      <div className="rounded-2xl border border-border bg-card p-6 mb-16">
        <p className="text-muted-foreground leading-relaxed">
          We believe that networking should be effortless for developers. Whether you&apos;re looking for an open-source collaborator, a mentor, or a hackathon buddy, Codenearby makes it simple and effective. Our goal is to break down the barriers between developers worldwide and foster a community where innovation thrives through connection.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-6">
          Join CodeNearby today and become part of a vibrant community of developers!
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            asChild
            className="rounded-full text-white px-6"
            style={{ background: "hsl(24 95% 53%)" }}
          >
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" className="rounded-full px-6" asChild>
            <Link href="/discover">Find Developers</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
