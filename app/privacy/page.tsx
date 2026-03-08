import Link from "next/link";
import SwissButton from "@/components/swiss/SwissButton";
import SwissSection from "@/components/swiss/SwissSection";
import SwissCard from "@/components/swiss/SwissCard";
import { updatedDate } from "@/consts/BASIC";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-swiss-white min-h-screen">
      <SwissSection
        number="01"
        title="PRIVACY"
        variant="white"
        pattern="grid"
      >
        <div className="max-w-4xl">
          <p className="text-xl font-bold uppercase mb-12 tracking-widest text-swiss-red">
            Last updated: {updatedDate}
          </p>
          <div className="space-y-12">
            <section className="border-t-4 border-swiss-black pt-8">
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">
                1. Information We Collect
              </h2>
              <p className="text-lg font-bold leading-tight uppercase tracking-tight">
                We collect information you provide directly to us, such as when you
                create or modify your account, request services, contact customer
                support, or otherwise communicate with us.
              </p>
            </section>

            <section className="border-t-4 border-swiss-black pt-8">
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">
                2. How We Use Your Information
              </h2>
              <p className="text-lg font-bold leading-tight uppercase tracking-tight">
                We use the information we collect to provide, maintain, and improve
                our services, to develop new ones, and to protect Codenearby and our
                users.
              </p>
            </section>

            <section className="border-t-4 border-swiss-black pt-8">
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">
                3. Information Sharing
              </h2>
              <p className="text-lg font-bold leading-tight uppercase tracking-tight">
                We may share the information we collect with third parties for
                various purposes, including to provide and improve our services, to
                comply with legal obligations, and to protect against fraudulent or
                illegal activity.
              </p>
            </section>

            <section className="border-t-4 border-swiss-black pt-8">
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">
                4. Data Retention
              </h2>
              <p className="text-lg font-bold leading-tight uppercase tracking-tight">
                We retain your information for as long as your account is active or
                as needed to provide you services, comply with our legal
                obligations, resolve disputes, and enforce our agreements.
              </p>
            </section>

            <section className="border-t-4 border-swiss-black pt-8">
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">
                5. Security
              </h2>
              <p className="text-lg font-bold leading-tight uppercase tracking-tight">
                We take reasonable measures to help protect your information from
                loss, theft, misuse, unauthorized access, disclosure, alteration,
                and destruction.
              </p>
            </section>
          </div>

          <div className="mt-24 pt-12 border-t-8 border-swiss-black flex justify-between items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-widest mb-4">The system is objective.</p>
              <SwissButton variant="primary" asChild>
                <Link href="/">RETURN TO ROOT</Link>
              </SwissButton>
            </div>
            <p className="text-8xl font-black tracking-tighter opacity-10">DATA</p>
          </div>
        </div>
      </SwissSection>
    </div>
  );
}
