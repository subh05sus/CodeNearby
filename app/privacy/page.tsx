import Link from "next/link";
import { Button } from "@/components/ui/button";
import { updatedDate } from "@/consts/BASIC";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">Last updated: {updatedDate}</p>
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-2">
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us, such as when you
            create or modify your account, request services, contact customer
            support, or otherwise communicate with us.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">
            2. How We Use Your Information
          </h2>
          <p>
            We use the information we collect to provide, maintain, and improve
            our services, to develop new ones, and to protect Codenearby and our
            users.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">
            3. Information Sharing and Disclosure
          </h2>
          <p>
            We may share the information we collect with third parties for
            various purposes, including to provide and improve our services, to
            comply with legal obligations, and to protect against fraudulent or
            illegal activity.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">4. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or
            as needed to provide you services, comply with our legal
            obligations, resolve disputes, and enforce our agreements.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">5. Security</h2>
          <p>
            We take reasonable measures to help protect your information from
            loss, theft, misuse, unauthorized access, disclosure, alteration,
            and destruction.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">
            6. Changes to this Policy
          </h2>
          <p>
            We may change this privacy policy from time to time. If we make
            changes, we will notify you by revising the date at the top of the
            policy.
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
