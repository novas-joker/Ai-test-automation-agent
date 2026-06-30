import { db } from "@/db";
import { Repositories } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {

    //@ts-ignore
    const { repoId, userId, name, fullName, private_, htmlUrl, description, language, owner, default_branch } = await req.json();
    const result = await db.insert(Repositories).values({
        repoId,
        userId,
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
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    const result = await db.select().from(Repositories).where(
        eq(Repositories.userId, Number(userId))
    );
    return NextResponse.json(result);
}