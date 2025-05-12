import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        // Update the user document to reset onboarding status
        await db.collection("users").updateOne(
            { _id: new ObjectId(session.user.id) },
            {
                $set: {
                    onboardingCompleted: false,
                    skills: [],
                },
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error resetting onboarding:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}