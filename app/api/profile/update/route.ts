import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authOptions } from "@/app/options";

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();
        const data = await request.json();

        // Fields that are allowed to be updated
        const allowedUpdates = {
            name: data.name,
            githubBio: data.githubBio,
            githubLocation: data.githubLocation,
            image: data.image,
            bannerImage: data.bannerImage,
            pinnedRepos: data.pinnedRepos,
            appearance: data.appearance, // Add support for appearance settings
        };

        // Filter out undefined values
        const updateData = Object.fromEntries(
            Object.entries(allowedUpdates).filter(([, v]) => v !== undefined)
        );

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No valid fields to update" },
                { status: 400 }
            );
        }

        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(session.user.id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return the updated user
        const updatedUser = await db
            .collection("users")
            .findOne({ _id: new ObjectId(session.user.id) });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}