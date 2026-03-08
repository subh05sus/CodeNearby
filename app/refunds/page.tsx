import { Metadata } from "next";
import SwissButton from "@/components/swiss/SwissButton";
import SwissSection from "@/components/swiss/SwissSection";
import SwissCard from "@/components/swiss/SwissCard";
import { AlertTriangle, Info, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { updatedDate } from "@/consts/BASIC";

export const metadata: Metadata = {
  title: "Cancellations and Refunds Policy | CodeNearby",
  description:
    "Read CodeNearby's cancellations and refunds policy. Learn about our no-refund policy and contact information for special cases and exceptions.",
};

export default function CancellationsRefundsPage() {
  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <SwissSection
        number="01"
        title="REFUNDS"
        variant="white"
        pattern="grid"
      >
        <div className="max-w-4xl">
          <p className="text-xl font-bold uppercase mb-12 tracking-widest text-swiss-red">
            Last updated: {updatedDate}
          </p>

          <SwissCard variant="accent" className="mb-12 border-4 border-black dark:border-white">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-white" />
              <p className="text-2xl font-black uppercase tracking-tighter text-white">
                Important Notice: No refunds and cancellations will be provided for any services or purchases.
              </p>
            </div>
          </SwissCard>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <section className="border-t-4 border-black dark:border-white pt-8">
                <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter text-black dark:text-white">General Policy</h2>
                <p className="text-lg font-bold uppercase tracking-tight leading-tight text-black dark:text-white/80">
                  CodeNearby operates on a strict no-refund and no-cancellation policy. Once a service is purchased, it cannot be reversed.
                </p>
              </section>

              <section className="border-t-4 border-black dark:border-white pt-8">
                <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter text-black dark:text-white">Scope</h2>
                <p className="text-lg font-bold uppercase tracking-tight leading-tight text-black dark:text-white/80">
                  This policy applies to all services, subscriptions, premium features, and any other paid content offered through the platform.
                </p>
              </section>
            </div>

            <SwissCard variant="muted">
              <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-2 text-black dark:text-white transition-colors">
                <Info className="h-6 w-6" /> Special Cases
              </h3>
              <p className="font-bold uppercase tracking-tight mb-6 text-black dark:text-white transition-colors">
                Exceptional circumstances may be considered at our sole discretion:
              </p>
              <ul className="space-y-2 text-sm font-black uppercase tracking-widest opacity-80 text-black dark:text-white transition-colors">
                <li>/ Technical access issues</li>
                <li>/ Billing errors</li>
                <li>/ Service delivery failure</li>
                <li>/ Legal requirements</li>
              </ul>
            </SwissCard>
          </div>
        </div>
      </SwissSection>

      <SwissSection
        number="02"
        title="CONTACT"
        variant="muted"
      >
        <div className="grid md:grid-cols-3 gap-8">
          <SwissCard variant="white" className="flex flex-col justify-between">
            <div>
              <Mail className="h-8 w-8 mb-4 text-swiss-red" />
              <h4 className="text-xl font-black uppercase mb-2 text-black dark:text-white transition-colors">Primary</h4>
            </div>
            <a href="mailto:hello@codenearby.space" className="text-lg font-bold uppercase tracking-tighter hover:text-swiss-red transition-colors text-black dark:text-white dark:hover:text-swiss-red">
              hello@codenearby.space
            </a>
          </SwissCard>

          <SwissCard variant="white" className="flex flex-col justify-between">
            <div>
              <Mail className="h-8 w-8 mb-4 text-swiss-red" />
              <h4 className="text-xl font-black uppercase mb-2 text-black dark:text-white transition-colors">Developer</h4>
            </div>
            <a href="mailto:sahasubhadip54@gmail.com" className="text-lg font-bold uppercase tracking-tighter hover:text-swiss-red transition-colors text-black dark:text-white dark:hover:text-swiss-red">
              sahasubhadip54@gmail.com
            </a>
          </SwissCard>

          <SwissCard variant="white" className="flex flex-col justify-between">
            <div>
              <Phone className="h-8 w-8 mb-4 text-swiss-red" />
              <h4 className="text-xl font-black uppercase mb-2 text-black dark:text-white transition-colors">Support</h4>
            </div>
            <a href="tel:+918653462940" className="text-lg font-bold uppercase tracking-tighter hover:text-swiss-red transition-colors text-black dark:text-white dark:hover:text-swiss-red">
              +91 8653462940
            </a>
          </SwissCard>
        </div>

        <div className="mt-24 pt-12 border-t-8 border-black dark:border-white flex gap-4">
          <SwissButton variant="secondary" asChild>
            <Link href="/terms">TERMS</Link>
          </SwissButton>
          <SwissButton variant="secondary" asChild>
            <Link href="/privacy">PRIVACY</Link>
          </SwissButton>
          <SwissButton variant="primary" asChild className="dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)]">
            <Link href="/">RETURN TO ROOT</Link>
          </SwissButton>
        </div>
      </SwissSection>
    </div>
  );
}
