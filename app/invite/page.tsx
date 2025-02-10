"use client";
import InviteContent from "@/components/invite-content";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function InvitePage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const { data: session } = useSession() as { data: Session | null };

  const referrer = searchParams.ref;
  useEffect(() => {
    if (
      session?.user ||
      referrer === session?.user?.githubUsername ||
      !referrer
    ) {
      redirect("/");
    }
  }, [session, referrer]);

  return <InviteContent referrer={referrer as string} />;
}
