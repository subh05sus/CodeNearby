import Link from "next/link";
import SwissButton from "@/components/swiss/SwissButton";
import SwissSection from "@/components/swiss/SwissSection";
import SwissCard from "@/components/swiss/SwissCard";
import Features from "@/components/home/Features";
import ProductHunt from "@/components/ProductHunt";
import FeatureBigPreview from "@/components/FeatureBigPreview";

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <SwissSection
        number="01"
        title="ABOUT"
        variant="white"
        pattern="grid"
        className="border-b-0"
      >
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-8">
            <h3 className="text-4xl font-black uppercase mb-8 tracking-tighter text-black dark:text-white">
              A SYSTEM FOR UNIVERSAL COLLABORATION
            </h3>
            <p className="text-2xl text-black dark:text-white mb-12 leading-tight">
              CodeNearby is a social networking platform designed specifically for
              developers. Our mission is to help developers connect, share ideas,
              collaborate on projects, and stay updated with the coding community.
            </p>
            <ProductHunt />
          </div>
        </div>
      </SwissSection>

      <SwissSection
        number="02"
        title="FEATURES"
        variant="muted"
      >
        <Features />
        <div className="mt-24">
          <FeatureBigPreview />
        </div>
      </SwissSection>

      <SwissSection
        number="03"
        className="mb-0"
        title="METHODOLOGY"
        variant="white"
        pattern="dots"
      >
        <div className="grid md:grid-cols-2 gap-12">
          <SwissCard variant="white" className="border-4 border-black dark:border-white bg-white dark:bg-black">
            <h4 className="text-2xl font-black uppercase mb-4 text-black dark:text-white">Why Codenearby?</h4>
            <ul className="space-y-4 font-bold uppercase tracking-tight">
              {[
                "Connect with developers sharing interests",
                "Find potential collaborators",
                "Share your coding journey",
                "Stay updated with tech trends",
                "Build professional relationships"
              ].map((item, i) => (
                <li key={i} className="flex gap-4 items-start text-black dark:text-white">
                  <span className="text-swiss-red">/</span> {item}
                </li>
              ))}
            </ul>
          </SwissCard>

          <SwissCard variant="accent" className="border-4 border-black dark:border-white">
            <h4 className="text-2xl font-black uppercase mb-4 text-white">What Can You Do?</h4>
            <ul className="space-y-4 font-bold uppercase tracking-tight text-white/90">
              <li className="flex gap-4 items-start">
                <span className="text-white">/</span> 🔍 Discover - Find developers
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-white">/</span> 💬 Chat - Connect in real-time
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-white">/</span> 📢 Feed - Share thoughts
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-white">/</span> 🎭 Gatherings - Host meetups
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-white">/</span> 🤖 AI-Connect - Perfect matches
              </li>
            </ul>
          </SwissCard>
        </div>
      </SwissSection>

      <SwissSection
        number="04"
        title="VISION"
        variant="muted"
      >
        <div className="max-w-3xl">
          <p className="text-3xl font-bold uppercase tracking-tighter leading-none mb-12 text-black dark:text-white">
            Networking should be effortless for developers. Whether you&apos;re looking for an open-source collaborator, a mentor, or a hackathon buddy, Codenearby makes it simple and effective.
          </p>
          <div className="border-t-4 border-black dark:border-white pt-12">
            <p className="text-lg font-bold mb-12 uppercase tracking-widest text-black dark:text-white">
              Join Codenearby today and become part of a vibrant community of developers.
            </p>
            <SwissButton variant="primary" size="xl" asChild className="dark:shadow-[12px_12px_0_0_rgba(255,255,255,1)]">
              <Link href="/">INITIALIZE ACCESS</Link>
            </SwissButton>
          </div>
        </div>
      </SwissSection>
    </div>
  );
}
