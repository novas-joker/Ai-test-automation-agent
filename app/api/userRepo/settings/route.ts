import { NextRequest ,NextResponse} from "next/server";
import { db } from "@/db";
import { Repositories} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req:NextRequest){
    const {repoId,userId,targetDomain,globalInstruction}=await req.json();
    const result = await db.update(Repositories).set({
        targetDomain:targetDomain,
        globalInstruction:globalInstruction,
    }).where(eq(Repositories.repoId, repoId));
    return NextResponse.json(result);
}