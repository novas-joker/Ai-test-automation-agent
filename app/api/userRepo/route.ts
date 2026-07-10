import { db } from "@/db";
import { Repositories } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //@ts-ignore
    const { repoId, userId, name, fullName, private_, htmlUrl, description, language, owner, default_branch } = await req.json();

    if (userId !== authUserId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!repoId || isNaN(Number(repoId))) {
        return NextResponse.json({ error: "Invalid repoId" }, { status: 400 });
    }

    const result = await db.insert(Repositories).values({
        repoId: Number(repoId),
        userId: authUserId,
        name,
        fullName: fullName,
        private: private_ ? "true" : "false",
        htmlUrl: htmlUrl,
        description: description || "",
        language: language || "",
        defaultBranch: default_branch || "",
        owner
    }).returning();
    return NextResponse.json(result[0]);
}

export async function GET(req: NextRequest) {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (userId !== authUserId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await db.select().from(Repositories).where(
        eq(Repositories.userId, authUserId)
    );
    return NextResponse.json(result);
}