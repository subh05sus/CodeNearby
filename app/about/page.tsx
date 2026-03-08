import Link from "next/link";
import SwissButton from "@/components/swiss/SwissButton";
import SwissSection from "@/components/swiss/SwissSection";
import SwissCard from "@/components/swiss/SwissCard";
import Features from "@/components/home/Features";
import ProductHunt from "@/components/ProductHunt";
import FeatureBigPreview from "@/components/FeatureBigPreview";

export default function AboutPage() {
  return (
    <div className="bg-swiss-white min-h-screen">
      <SwissSection
        number="01"
        title="ABOUT"
        variant="white"
        pattern="grid"
      >
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-8">
            <h3 className="text-4xl font-black uppercase mb-8 tracking-tighter">
              A SYSTEM FOR UNIVERSAL COLLABORATION
            </h3>
            <p className="text-2xl text-swiss-black mb-12 leading-tight">
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
        title="METHODOLOGY"
        variant="white"
        pattern="dots"
      >
        <div className="grid md:grid-cols-2 gap-12">
          <SwissCard variant="white" hoverEffect="invert">
            <h4 className="text-2xl font-black uppercase mb-4">Why Codenearby?</h4>
            <ul className="space-y-4 font-bold uppercase tracking-tight">
              <li className="flex gap-4 items-start">
                <span className="text-swiss-red">/</span> Connect with developers sharing interests
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-swiss-red">/</span> Find potential collaborators
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-swiss-red">/</span> Share your coding journey
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-swiss-red">/</span> Stay updated with tech trends
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-swiss-red">/</span> Build professional relationships
              </li>
            </ul>
          </SwissCard>

          <SwissCard variant="accent">
            <h4 className="text-2xl font-black uppercase mb-4">What Can You Do?</h4>
            <ul className="space-y-4 font-bold uppercase tracking-tight">
              <li className="flex gap-4 items-start">
                <span className="text-swiss-white">/</span> 🔍 Discover - Find developers
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-swiss-white">/</span> 💬 Chat - Connect in real-time
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-swiss-white">/</span> 📢 Feed - Share thoughts
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-swiss-white">/</span> 🎭 Gatherings - Host meetups
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-swiss-white">/</span> 🤖 AI-Connect - Perfect matches
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
          <p className="text-3xl font-bold uppercase tracking-tighter leading-none mb-12">
            Networking should be effortless for developers. Whether you&apos;re looking for an open-source collaborator, a mentor, or a hackathon buddy, Codenearby makes it simple and effective.
          </p>
          <div className="border-t-4 border-swiss-black pt-12">
            <p className="text-lg font-bold mb-12 uppercase tracking-widest">
              Join Codenearby today and become part of a vibrant community of developers.
            </p>
            <SwissButton variant="primary" size="xl" asChild>
              <Link href="/">INITIALIZE ACCESS</Link>
            </SwissButton>
          </div>
        </div>
      </SwissSection>
    </div>
  );
}
