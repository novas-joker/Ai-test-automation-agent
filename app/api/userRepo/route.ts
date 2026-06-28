import { db } from "@/db";
import { Repositories } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    //@ts-ignore
    const { repoId, userId, name, fullName, private_, htmlUrl, description, language, owner } = await req.json();
    const result = await db.insert(Repositories).values({
        repoId,
        userId,
        name,
        fullName: fullName,
        private: private_ ? "true" : "false",
        htmlUrl: htmlUrl,
        description: description || "",
        language: language || "",
        owner
    }).returning();
    return NextResponse.json(result[0]);
}