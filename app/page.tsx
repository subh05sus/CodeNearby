import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import NotLoggedInView from "@/components/not-logged-in-view";
import LoggedInView from "@/components/logged-in-view";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If user is logged in, check if they've completed onboarding
  if (session) {
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({
      _id: new ObjectId(session.user.id),
    });

    // If onboardingCompleted is not true, redirect to onboarding
    if (!user?.onboardingCompleted) {
      redirect("/onboarding");
    }
  }

  return (
    <div>
      {session ? (
        <div className="flex flex-col items-center justify-center p-4 h-[-webkit-fill-available]">
          <LoggedInView user={session.user} />
        </div>
      ) : (
        <NotLoggedInView />
      )}
    </div>
  );
}
