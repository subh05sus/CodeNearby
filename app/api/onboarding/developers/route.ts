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
    const db = client.db();    // Get the current user to access their friends list
    const currentUser = await db.collection("users").findOne({
      _id: new ObjectId(session.user.id)
    });

    // Extract friend GitHub IDs to exclude from results (friends array contains numerical GitHub IDs)
    const friendGithubIds = currentUser?.friends || [];

    // We'll use this to exclude the current user's ID
    const excludeIds = [new ObjectId(session.user.id)];

    let developers = [];
    let isRandom = false;    // If skills are provided, find users with matching skills
    if (skills.length > 0 && skills[0] !== "") {
      // Find users with matching skills and sort by number of matches (most matches first)
      developers = await db.collection("users")
        .aggregate([
          {
            $match: {
              _id: { $ne: new ObjectId(session.user.id) }, // Exclude current user
              githubId: { $nin: friendGithubIds }, // Exclude friends by GitHub ID
              skills: { $in: skills }, // Match at least one skill
              onboardingCompleted: true // Only show users who completed onboarding
            }
          },
          {
            // Add a field to count how many skills match
            $addFields: {
              matchingSkillsCount: {
                $size: {
                  $setIntersection: ["$skills", skills]
                }
              }
            }
          },
          {
            $sort: { matchingSkillsCount: -1 } // Sort by most matching skills first
          },
          {
            $limit: 6
          }
        ])
        .toArray();
      console.log("Developers with matching skills:", developers);      // If not enough developers found with matching skills, get some random developers
      if (developers.length < 3) {
        isRandom = true;
        // Get IDs of developers we already have to avoid duplicates
        const existingDevIds = developers.map(dev => dev._id.toString());

        // Get random developers, but still try to prioritize those with some skill matches
        const randomDevelopers = await db.collection("users")
          .aggregate([
            {
              $match: {
                _id: { $nin: [...excludeIds, ...existingDevIds.map(id => new ObjectId(id))] }, // Exclude current user and already found developers
                githubId: { $nin: friendGithubIds }, // Exclude friends by GitHub ID
                skills: { $exists: true, $ne: [] }, // Must have some skills
                onboardingCompleted: true // Only show users who completed onboarding
              }
            },
            {
              // Add a field to count how many skills match (might be 0)
              $addFields: {
                matchingSkillsCount: {
                  $size: {
                    $setIntersection: [{ $ifNull: ["$skills", []] }, skills]
                  }
                }
              }
            },
            {
              $sort: { matchingSkillsCount: -1 } // Still prioritize skill matches
            },
            {
              $limit: 6 - developers.length
            }
          ])
          .toArray();
        console.log("Random developers:", randomDevelopers);

        // Combine the results
        developers = [...developers, ...randomDevelopers];
      }
    } else {
      // If no skills provided, still try to find developers with well-populated profiles
      isRandom = true;
      developers = await db.collection("users")
        .aggregate([
          {
            $match: {
              _id: { $nin: excludeIds }, // Exclude current user
              githubId: { $nin: friendGithubIds }, // Exclude friends by GitHub ID
              onboardingCompleted: true // Prefer users who completed onboarding
            }
          },
          {
            // Add a field to count how many skills they have (prefer users with more skills)
            $addFields: {
              skillsCount: { $size: { $ifNull: ["$skills", []] } }
            }
          },
          {
            $sort: { skillsCount: -1 } // Sort by most skills first
          },
          {
            $limit: 6
          }
        ])
        .toArray();
      console.log("Random developers no skills:", developers);
    }    // If less than 6 developers found, add more developers to reach 6
    if (developers.length < 6) {
      isRandom = true;
      // Store existing developer IDs to avoid duplicates
      const existingIds = developers.map(dev => dev._id.toString());

      const fallbackDevelopers = await db.collection("users")
        .aggregate([
          {
            $match: {
              _id: { $nin: [...excludeIds, ...existingIds.map(id => new ObjectId(id))] }, // Exclude current user and existing developers
              githubId: { $nin: friendGithubIds } // Exclude friends by GitHub ID
            }
          },
          {
            // Add fields to help with sorting
            $addFields: {
              // Count matching skills (if skills provided)
              matchingSkillsCount: skills.length > 0 ? {
                $size: {
                  $setIntersection: [{ $ifNull: ["$skills", []] }, skills]
                }
              } : 0,
              // Count total skills
              totalSkillsCount: { $size: { $ifNull: ["$skills", []] } },
              // Check if onboarding is completed
              hasCompletedOnboarding: { $ifNull: ["$onboardingCompleted", false] }
            }
          },
          {
            // Sort by: onboarding completed, matching skills, total skills
            $sort: {
              hasCompletedOnboarding: -1,
              matchingSkillsCount: -1,
              totalSkillsCount: -1
            }
          },
          {
            $limit: 6 - developers.length
          }
        ])
        .toArray();
      console.log("Fallback developers:", fallbackDevelopers);

      // Combine the existing developers with the fallback developers
      developers = [...developers, ...fallbackDevelopers];
    }    // Remove sensitive information and format developers data
    const formattedDevelopers = developers.map(dev => ({
      _id: dev._id.toString(),
      name: dev.name,
      image: dev.image,
      githubId: dev.githubId,
      githubUsername: dev.githubUsername,
      githubLocation: dev.githubLocation,
      skills: dev.skills || [],
      // Include matching skills information if it exists
      matchingSkillsCount: dev.matchingSkillsCount !== undefined ? dev.matchingSkillsCount :
        // Calculate it if not already present
        (skills.length > 0 ? (dev.skills || []).filter((skill: string) => skills.includes(skill)).length : 0)
    }));

    // Ensure no duplicates in the final response
    const uniqueDevelopers = formattedDevelopers.filter((dev, index, self) =>
      index === self.findIndex(d => d._id === dev._id)
    );

    return NextResponse.json({
      developers: uniqueDevelopers,
      isRandom: isRandom,
      totalSkills: skills.length // Send total skills count for frontend percentage calculation
    });
  } catch (error) {
    console.error("Error fetching developers:", error);
    return NextResponse.json(
      { error: "Failed to fetch developers", isRandom: true },
      { status: 500 }
    );
  }
}