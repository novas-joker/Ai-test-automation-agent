import { NextRequest ,NextResponse} from "next/server";
import { db } from "@/db";
import { Repositories} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function POST(req:NextRequest){
    try {
        const { userId: authUserId } = await auth();

        if (!authUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {repoId,targetDomain,globalInstruction}=await req.json();

        const result = await db.update(Repositories).set({
            targetDomain:targetDomain,
            globalInstruction:globalInstruction,
        }).where(
            and(
                eq(Repositories.repoId, repoId),
                eq(Repositories.userId, authUserId)
            )
        );
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error updating repository settings:", error);
        return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
    }
}