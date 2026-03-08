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
    <div className="bg-swiss-white min-h-screen">
      <SwissSection
        number="01"
        title="CONTACT"
        variant="white"
        pattern="grid"
      >
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-8">
            <h3 className="text-4xl font-black uppercase mb-12 tracking-tighter">
              WE ARE HERE TO HELP. REACH OUT THROUGH THE CHANNELS BELOW.
            </h3>

            <div className="grid sm:grid-cols-2 gap-8">
              <SwissCard variant="white" hoverEffect="invert">
                <Mail className="h-8 w-8 mb-4 text-swiss-red" />
                <h4 className="text-xl font-black uppercase mb-2">Primary</h4>
                <p className="text-sm font-bold uppercase tracking-widest mb-4 opacity-60">General Inquiries</p>
                <a href="mailto:hello@codenearby.space" className="text-lg font-black uppercase tracking-tighter hover:text-swiss-red transition-colors">
                  hello@codenearby.space
                </a>
              </SwissCard>

              <SwissCard variant="white" hoverEffect="invert">
                <Mail className="h-8 w-8 mb-4 text-swiss-red" />
                <h4 className="text-xl font-black uppercase mb-2">Developer</h4>
                <p className="text-sm font-bold uppercase tracking-widest mb-4 opacity-60">Technical Support</p>
                <a href="mailto:sahasubhadip54@gmail.com" className="text-lg font-black uppercase tracking-tighter hover:text-swiss-red transition-colors">
                  sahasubhadip54@gmail.com
                </a>
              </SwissCard>

              <SwissCard variant="white" hoverEffect="invert">
                <Phone className="h-8 w-8 mb-4 text-swiss-red" />
                <h4 className="text-xl font-black uppercase mb-2">Urgent</h4>
                <p className="text-sm font-bold uppercase tracking-widest mb-4 opacity-60">Phone Support</p>
                <a href="tel:+918653462940" className="text-lg font-black uppercase tracking-tighter hover:text-swiss-red transition-colors">
                  +91 8653462940
                </a>
              </SwissCard>

              <SwissCard variant="white" hoverEffect="invert">
                <Globe className="h-8 w-8 mb-4 text-swiss-red" />
                <h4 className="text-xl font-black uppercase mb-2">Platform</h4>
                <p className="text-sm font-bold uppercase tracking-widest mb-4 opacity-60">Main Website</p>
                <a href="https://codenearby.space" target="_blank" rel="noopener noreferrer" className="text-lg font-black uppercase tracking-tighter hover:text-swiss-red transition-colors">
                  codenearby.space
                </a>
              </SwissCard>
            </div>
          </div>

          <div className="md:col-span-4 self-start">
            <SwissCard variant="accent" pattern="dots">
              <h4 className="text-2xl font-black uppercase mb-6">Response Time</h4>
              <p className="text-lg font-bold uppercase leading-none mb-8">
                WE AIM TO RESPOND TO ALL INQUIRIES WITHIN 24 HOURS.
              </p>
              <div className="border-t-4 border-swiss-white pt-6">
                <p className="text-sm font-black uppercase tracking-widest">System Efficiency: 100%</p>
              </div>
            </SwissCard>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t-8 border-swiss-black flex flex-wrap gap-4">
          <SwissButton variant="secondary" asChild>
            <Link href="/about">ABOUT</Link>
          </SwissButton>
          <SwissButton variant="secondary" asChild>
            <Link href="/privacy">PRIVACY</Link>
          </SwissButton>
          <SwissButton variant="secondary" asChild>
            <Link href="/terms">TERMS</Link>
          </SwissButton>
          <SwissButton variant="primary" asChild>
            <Link href="/">INIT ROOT</Link>
          </SwissButton>
        </div>
      </SwissSection>
    </div>
  );
}
