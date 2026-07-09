import {NextRequest,NextResponse} from "next/server";
import { db } from "@/db";
import { TestCasesTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
    

export async function POST(req:NextRequest){
    const { userId: authUserId } = await auth();

    if (!authUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {title,description,targetRoute,expectedResult,testCaseId}=await req.json();
    const result = await db.update(TestCasesTable).set({
        title,
        description,
        targetRoute,
        expectedResult
    }).where(
        and(
            eq(TestCasesTable.id, testCaseId),
            eq(TestCasesTable.userId, authUserId)
        )
    );

    return NextResponse.json({message:"Test case updated successfully",result});
}