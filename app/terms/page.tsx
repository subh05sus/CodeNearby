import Link from "next/link";
import SwissButton from "@/components/swiss/SwissButton";
import SwissSection from "@/components/swiss/SwissSection";
import { updatedDate } from "@/consts/BASIC";

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <SwissSection
        number="01"
        title="TERMS"
        variant="white"
        pattern="dots"
      >
        <div className="max-w-4xl">
          <p className="text-xl font-bold uppercase mb-12 tracking-widest text-swiss-red">
            Last updated: {updatedDate}
          </p>
          <div className="space-y-12">
            {[
              {
                id: "1",
                title: "1. Acceptance of Terms",
                content: "By accessing or using Codenearby, you agree to be bound by these Terms and Conditions."
              },
              {
                id: "2",
                title: "2. User Responsibilities",
                content: "Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account."
              },
              {
                id: "3",
                title: "3. Content",
                content: "Users retain ownership of the content they post on Codenearby. By posting content, you grant Codenearby a non-exclusive, worldwide, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content."
              },
              {
                id: "4",
                title: "4. Prohibited Activities",
                content: "Users may not engage in any activity that interferes with or disrupts the Services or servers and networks connected to the Services."
              },
              {
                id: "5",
                title: "5. Termination",
                content: "Codenearby reserves the right to terminate or suspend access to our Services immediately, without prior notice or liability, for any reason whatsoever."
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
              <p className="text-sm font-black uppercase tracking-widest mb-4 text-black dark:text-white transition-colors">The system is objective.</p>
              <SwissButton variant="primary" asChild className="dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)]">
                <Link href="/">RETURN TO ROOT</Link>
              </SwissButton>
            </div>
            <p className="text-8xl font-black tracking-tighter opacity-10 text-black dark:text-white transition-colors">LEGAL</p>
          </div>
        </div>
      </SwissSection>
    </div>
  );
}
