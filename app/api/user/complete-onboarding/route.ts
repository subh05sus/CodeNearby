import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json(
            { error: "You must be signed in to update your profile" },
            { status: 401 }
        );
    }

    try {
        const data = await request.json();
        const { skills, joinGathering } = data;

        const client = await clientPromise;
        const db = client.db();

        // Update user with skills and mark onboarding as completed
        await db.collection("users").updateOne(
            { _id: new ObjectId(session.user.id) },
            {
                $set: {
                    skills: skills,
                    onboardingCompleted: true
                }
            }
        );

        // Handle gathering joining
        const defaultGatheringId = process.env.ALL_GATHERING_ID;

        if (defaultGatheringId) {
            if (joinGathering) {
                // Add user to the default gathering
                await db.collection("gatherings").updateOne(
                    { _id: new ObjectId(defaultGatheringId) },
                    { $addToSet: { participants: new ObjectId(session.user.id) } }
                );
            } else {
                // If user opted out, remove them from the gathering
                if (session.user.id) {
                    await db.collection("gatherings").updateOne(
                        { _id: new ObjectId(defaultGatheringId) },
                        { $pull: { participants: new ObjectId(session.user.id) } as any }
                    );
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error completing onboarding:", error);
        return NextResponse.json(
            { error: "Failed to complete onboarding" },
            { status: 500 }
        );
    }
}