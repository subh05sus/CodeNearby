import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import { redirect } from "next/navigation";
import OnboardingPage from "./page-client";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import OnboardingCompleted from "./onboarding-completed";

export default async function OnboardingLayout() {
  const session = await getServerSession(authOptions);

  // Redirect to home if not logged in
  if (!session) {
    redirect("/");
  }

  // Connect to the database
  const client = await clientPromise;
  const db = client.db();

  // Check if user has already completed onboarding
  const user = await db.collection("users").findOne({
    _id: new ObjectId(session.user.id),
  });

  // If onboarding is already completed, show the option to restart instead of redirecting
  if (user?.onboardingCompleted === true) {
    return <OnboardingCompleted />;
  }

  // Fetch some developers to show initially
  // We'll fetch more specific ones based on skills later via API
  const developers = await db
    .collection("users")
    .aggregate([
      {
        $match: {
          _id: { $ne: new ObjectId(session.user.id) }, // Exclude current user
          onboardingCompleted: true, // Show users who have already completed onboarding
        },
      },
      {
        $addFields: {
          hasSkills: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ["$skills", []] } }, 0] },
              1,
              0,
            ],
          },
        },
      },
      { $sort: { hasSkills: -1 } },
      { $limit: 6 },
    ])
    .toArray();

  return <OnboardingPage session={session} developers={developers} />;
}
