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
    <div className="bg-swiss-white min-h-screen">
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

          <SwissCard variant="accent" className="mb-12">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-swiss-white" />
              <p className="text-2xl font-black uppercase tracking-tighter">
                Important Notice: No refunds and cancellations will be provided for any services or purchases.
              </p>
            </div>
          </SwissCard>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <section className="border-t-4 border-swiss-black pt-8">
                <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">General Policy</h2>
                <p className="text-lg font-bold uppercase tracking-tight leading-tight">
                  CodeNearby operates on a strict no-refund and no-cancellation policy. Once a service is purchased, it cannot be reversed.
                </p>
              </section>

              <section className="border-t-4 border-swiss-black pt-8">
                <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">Scope</h2>
                <p className="text-lg font-bold uppercase tracking-tight leading-tight">
                  This policy applies to all services, subscriptions, premium features, and any other paid content offered through the platform.
                </p>
              </section>
            </div>

            <SwissCard variant="muted" hoverEffect="invert">
              <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                <Info className="h-6 w-6" /> Special Cases
              </h3>
              <p className="font-bold uppercase tracking-tight mb-6">
                Exceptional circumstances may be considered at our sole discretion:
              </p>
              <ul className="space-y-2 text-sm font-black uppercase tracking-widest opacity-80">
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
              <h4 className="text-xl font-black uppercase mb-2">Primary</h4>
            </div>
            <a href="mailto:hello@codenearby.space" className="text-lg font-bold uppercase tracking-tighter hover:text-swiss-red transition-colors">
              hello@codenearby.space
            </a>
          </SwissCard>

          <SwissCard variant="white" className="flex flex-col justify-between">
            <div>
              <Mail className="h-8 w-8 mb-4 text-swiss-red" />
              <h4 className="text-xl font-black uppercase mb-2">Developer</h4>
            </div>
            <a href="mailto:sahasubhadip54@gmail.com" className="text-lg font-bold uppercase tracking-tighter hover:text-swiss-red transition-colors">
              sahasubhadip54@gmail.com
            </a>
          </SwissCard>

          <SwissCard variant="white" className="flex flex-col justify-between">
            <div>
              <Phone className="h-8 w-8 mb-4 text-swiss-red" />
              <h4 className="text-xl font-black uppercase mb-2">Support</h4>
            </div>
            <a href="tel:+918653462940" className="text-lg font-bold uppercase tracking-tighter hover:text-swiss-red transition-colors">
              +91 8653462940
            </a>
          </SwissCard>
        </div>

        <div className="mt-24 pt-12 border-t-8 border-swiss-black flex gap-4">
          <SwissButton variant="secondary" asChild>
            <Link href="/terms">TERMS</Link>
          </SwissButton>
          <SwissButton variant="secondary" asChild>
            <Link href="/privacy">PRIVACY</Link>
          </SwissButton>
          <SwissButton variant="primary" asChild>
            <Link href="/">RETURN TO ROOT</Link>
          </SwissButton>
        </div>
      </SwissSection>
    </div>
  );
}
