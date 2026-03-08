import Link from "next/link";
import SwissButton from "@/components/swiss/SwissButton";
import SwissSection from "@/components/swiss/SwissSection";
import { updatedDate } from "@/consts/BASIC";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <SwissSection
        number="01"
        title="PRIVACY"
        variant="white"
        pattern="grid"
      >
        <div className="max-w-4xl">
          <p className="text-xl font-bold uppercase mb-12  text-swiss-red">
            Last updated: {updatedDate}
          </p>
          <div className="space-y-12">
            {[
              {
                id: "1",
                title: "1. Information We Collect",
                content: "We collect information you provide directly to us, such as when you create or modify your account, request services, contact customer support, or otherwise communicate with us."
              },
              {
                id: "2",
                title: "2. How We Use Your Information",
                content: "We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect Codenearby and our users."
              },
              {
                id: "3",
                title: "3. Information Sharing",
                content: "We may share the information we collect with third parties for various purposes, including to provide and improve our services, to comply with legal obligations, and to protect against fraudulent or illegal activity."
              },
              {
                id: "4",
                title: "4. Data Retention",
                content: "We retain your information for as long as your account is active or as needed to provide you services, comply with our legal obligations, resolve disputes, and enforce our agreements."
              },
              {
                id: "5",
                title: "5. Security",
                content: "We take reasonable measures to help protect your information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction."
              }
            ].map((section) => (
              <section key={section.id} className="border-t-4 border-black dark:border-white pt-8">
                <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter text-black dark:text-white">
                  {section.title}
                </h2>
                <p className="text-lg font-bold leading-tight uppercase tracking-tight text-black dark:text-white/80">
                  {section.content}
                </p>
              </section>
            ))}
          </div>

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
