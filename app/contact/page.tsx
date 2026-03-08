import { Metadata } from "next";
import SwissButton from "@/components/swiss/SwissButton";
import SwissSection from "@/components/swiss/SwissSection";
import SwissCard from "@/components/swiss/SwissCard";
import { Mail, Phone, Globe } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us | CodeNearby",
  description:
    "Get in touch with the CodeNearby team. Find our contact information including email, phone, and website details for support and inquiries.",
};

export default function ContactPage() {
  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <SwissSection
        number="01"
        title="CONTACT"
        variant="white"
        pattern="grid"
      >
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-8">
            <h3 className="text-4xl font-black uppercase mb-12 tracking-tighter text-black dark:text-white">
              WE ARE HERE TO HELP. REACH OUT THROUGH THE CHANNELS BELOW.
            </h3>

            <div className="grid sm:grid-cols-2 gap-8">
              <SwissCard variant="white">
                <Mail className="h-8 w-8 mb-4 text-swiss-red" />
                <h4 className="text-xl font-black uppercase mb-2 text-black dark:text-white transition-colors">Primary</h4>
                <p className="text-sm font-bold uppercase  mb-4 opacity-60 text-black dark:text-white transition-colors">General Inquiries</p>
                <a href="mailto:hello@codenearby.space" className="text-lg font-black uppercase tracking-tighter hover:text-swiss-red transition-colors text-black dark:text-white dark:hover:text-swiss-red">
                  hello@codenearby.space
                </a>
              </SwissCard>

              <SwissCard variant="white">
                <Mail className="h-8 w-8 mb-4 text-swiss-red" />
                <h4 className="text-xl font-black uppercase mb-2 text-black dark:text-white transition-colors">Developer</h4>
                <p className="text-sm font-bold uppercase  mb-4 opacity-60 text-black dark:text-white transition-colors">Technical Support</p>
                <a href="mailto:sahasubhadip54@gmail.com" className="text-lg font-black uppercase tracking-tighter hover:text-swiss-red transition-colors text-black dark:text-white dark:hover:text-swiss-red">
                  sahasubhadip54@gmail.com
                </a>
              </SwissCard>

              <SwissCard variant="white">
                <Phone className="h-8 w-8 mb-4 text-swiss-red" />
                <h4 className="text-xl font-black uppercase mb-2 text-black dark:text-white transition-colors">Urgent</h4>
                <p className="text-sm font-bold uppercase  mb-4 opacity-60 text-black dark:text-white transition-colors">Phone Support</p>
                <a href="tel:+918653462940" className="text-lg font-black uppercase tracking-tighter hover:text-swiss-red transition-colors text-black dark:text-white dark:hover:text-swiss-red">
                  +91 8653462940
                </a>
              </SwissCard>

              <SwissCard variant="white">
                <Globe className="h-8 w-8 mb-4 text-swiss-red" />
                <h4 className="text-xl font-black uppercase mb-2 text-black dark:text-white transition-colors">Platform</h4>
                <p className="text-sm font-bold uppercase  mb-4 opacity-60 text-black dark:text-white transition-colors">Main Website</p>
                <a href="https://codenearby.space" target="_blank" rel="noopener noreferrer" className="text-lg font-black uppercase tracking-tighter hover:text-swiss-red transition-colors text-black dark:text-white dark:hover:text-swiss-red">
                  codenearby.space
                </a>
              </SwissCard>
            </div>
          </div>

          <div className="md:col-span-4 self-start">
            <SwissCard variant="accent" pattern="dots" className="border-4 border-black dark:border-white">
              <h4 className="text-2xl font-black uppercase mb-6 text-white">Response Time</h4>
              <p className="text-lg font-bold uppercase leading-none mb-8 text-white">
                WE AIM TO RESPOND TO ALL INQUIRIES WITHIN 24 HOURS.
              </p>
              <div className="border-t-4 border-white/20 pt-6">
                <p className="text-sm font-black uppercase  text-white/80">System Efficiency: 100%</p>
              </div>
            </SwissCard>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t-8 border-black dark:border-white flex flex-wrap gap-4">
          <SwissButton variant="secondary" asChild>
            <Link href="/about">ABOUT</Link>
          </SwissButton>
          <SwissButton variant="secondary" asChild>
            <Link href="/privacy">PRIVACY</Link>
          </SwissButton>
          <div className="mt-24 pt-12 border-t-8 border-black dark:border-white flex justify-between items-end transition-colors">
            <div>
              <p className="text-sm font-black uppercase  mb-4 text-black dark:text-white transition-colors">The system is objective.</p>
              <SwissButton variant="primary" asChild className="dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)]">
                <Link href="/">RETURN TO ROOT</Link>
              </SwissButton>
            </div>
            <p className="text-8xl font-black tracking-tighter opacity-10 text-black dark:text-white transition-colors">DATA</p>
          </div>
        </div>
      </SwissSection>
    </div>
  );
}
