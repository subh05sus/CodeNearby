import Link from "next/link";
import { Button } from "@/components/ui/button";
import { updatedDate } from "@/consts/BASIC";

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Terms and Conditions</h1>
      <p className="mb-4">Last updated: {updatedDate}</p>
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Codenearby, you agree to be bound by these
            Terms and Conditions.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">
            2. User Responsibilities
          </h2>
          <p>
            Users are responsible for maintaining the confidentiality of their
            account information and for all activities that occur under their
            account.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">3. Content</h2>
          <p>
            Users retain ownership of the content they post on Codenearby. By
            posting content, you grant Codenearby a non-exclusive, worldwide,
            royalty-free license to use, copy, reproduce, process, adapt,
            modify, publish, transmit, display, and distribute such content.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">
            4. Prohibited Activities
          </h2>
          <p>
            Users may not engage in any activity that interferes with or
            disrupts the Services or servers and networks connected to the
            Services.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">5. Termination</h2>
          <p>
            Codenearby reserves the right to terminate or suspend access to our
            Services immediately, without prior notice or liability, for any
            reason whatsoever.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">6. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time.
            It is your responsibility to check the Terms periodically for
            changes.
          </p>
        </section>
      </div>
      <div className="mt-8">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
