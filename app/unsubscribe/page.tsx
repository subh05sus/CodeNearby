"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    if (!email) {
      setStatus("error");
      return;
    }

    fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}`)
      .then((res) => {
        if (res.ok) setStatus("done");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [email]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4">
        {status === "loading" && (
          <p className="text-muted-foreground text-sm">Unsubscribing...</p>
        )}

        {status === "done" && (
          <>
            <h1 className="text-xl font-semibold">You&apos;re unsubscribed.</h1>
            <p className="text-muted-foreground text-sm">
              {email} has been removed from our mailing list. You won&apos;t receive
              broadcast emails from CodeNearby anymore.
            </p>
            <Link
              href="/"
              className="inline-block text-sm text-muted-foreground underline underline-offset-4 mt-2"
            >
              Go back to CodeNearby
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-semibold">Something went wrong.</h1>
            <p className="text-muted-foreground text-sm">
              {email
                ? "We couldn't find that email address in our system."
                : "No email address provided."}
            </p>
            <Link
              href="/"
              className="inline-block text-sm text-muted-foreground underline underline-offset-4 mt-2"
            >
              Go back to CodeNearby
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
