import Link from "next/link";
import SwissButton from "@/components/swiss/SwissButton";
import SwissSection from "@/components/swiss/SwissSection";
import SwissCard from "@/components/swiss/SwissCard";
import { updatedDate } from "@/consts/BASIC";

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-swiss-white min-h-screen">
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
            <section className="border-t-4 border-swiss-black pt-8">
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">
                1. Acceptance of Terms
              </h2>
              <p className="text-lg font-bold leading-tight uppercase tracking-tight">
                By accessing or using Codenearby, you agree to be bound by these
                Terms and Conditions.
              </p>
            </section>

            <section className="border-t-4 border-swiss-black pt-8">
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">
                2. User Responsibilities
              </h2>
              <p className="text-lg font-bold leading-tight uppercase tracking-tight">
                Users are responsible for maintaining the confidentiality of their
                account information and for all activities that occur under their
                account.
              </p>
            </section>

            <section className="border-t-4 border-swiss-black pt-8">
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">
                3. Content
              </h2>
              <p className="text-lg font-bold leading-tight uppercase tracking-tight">
                Users retain ownership of the content they post on Codenearby. By
                posting content, you grant Codenearby a non-exclusive, worldwide,
                royalty-free license to use, copy, reproduce, process, adapt,
                modify, publish, transmit, display, and distribute such content.
              </p>
            </section>

            <section className="border-t-4 border-swiss-black pt-8">
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">
                4. Prohibited Activities
              </h2>
              <p className="text-lg font-bold leading-tight uppercase tracking-tight">
                Users may not engage in any activity that interferes with or
                disrupts the Services or servers and networks connected to the
                Services.
              </p>
            </section>

            <section className="border-t-4 border-swiss-black pt-8">
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">
                5. Termination
              </h2>
              <p className="text-lg font-bold leading-tight uppercase tracking-tight">
                Codenearby reserves the right to terminate or suspend access to our
                Services immediately, without prior notice or liability, for any
                reason whatsoever.
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
            <p className="text-8xl font-black tracking-tighter opacity-10">LEGAL</p>
          </div>
        </div>
      </SwissSection>
    </div>
  );
}
