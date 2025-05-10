import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in to access this endpoint" },
      { status: 401 }
    );
  }

  try {
    // Extract skills from URL parameters
    const { searchParams } = new URL(request.url);
    const skills = searchParams.get("skills")?.split(",") || [];
    const client = await clientPromise;
    const db = client.db();

    let developers = [];
    let isRandom = false;

    // If skills are provided, find users with matching skills
    if (skills.length > 0 && skills[0] !== "") {
      // Find users with at least one matching skill
      developers = await db.collection("users")
        .find({
          _id: { $ne: new ObjectId(session.user.id) }, // Exclude current user
          skills: { $in: skills },
          onboardingCompleted: true // Only show users who completed onboarding
        })
        .limit(6)
        .toArray();

      // If not enough developers found with matching skills, get some random developers
      if (developers.length < 3) {
        isRandom = true;
        const randomDevelopers = await db.collection("users")
          .find({
            _id: { $ne: new ObjectId(session.user.id) },
            skills: { $exists: true, $ne: [] },
            onboardingCompleted: true
          })
          .sort({ _id: 1 }) // Consistent sort to avoid duplicates
          .limit(8 - developers.length)
          .toArray();

        // Combine the results
        developers = [...developers, ...randomDevelopers];
      }
    } else {
      // If no skills provided, just get random developers
      isRandom = true;
      developers = await db.collection("users")
        .aggregate([
          {
            $match: {
              _id: { $ne: new ObjectId(session.user.id) }, // Exclude current user
            }
          },
          { $sample: { size: 6 } } // Randomly select 6 developers
        ])
        .toArray();
    }


    // If no developers found at all (empty database), return empty array with isRandom flag
    if (developers.length < 6) {
      isRandom = true;
      developers = await db.collection("users")
        .aggregate([
          {
            $match: {
              _id: { $ne: new ObjectId(session.user.id) }, // Exclude current user
            }
          },
          { $sample: { size: 6 - developers.length } } // Randomly select remaining developers
        ])
        .toArray();
    }

    // Remove sensitive information and format developers data
    const formattedDevelopers = developers.map(dev => ({
      _id: dev._id.toString(),
      name: dev.name,
      image: dev.image,
      githubId: dev.githubId,
      githubUsername: dev.githubUsername,
      githubLocation: dev.githubLocation,
      skills: dev.skills || []
    }));

    return NextResponse.json({
      developers: formattedDevelopers,
      isRandom: isRandom
    });
  } catch (error) {
    console.error("Error fetching developers:", error);
    return NextResponse.json(
      { error: "Failed to fetch developers", isRandom: true },
      { status: 500 }
    );
  }
}