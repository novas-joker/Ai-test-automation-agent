import {NextRequest,NextResponse} from "next/server";
import { db } from "@/db";
import { TestCasesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
    

export async function POST(req:NextRequest){
    const {title,description,targetRoute,expectedResult,testCaseId}=await req.json();
    const result = await db.update(TestCasesTable).set({
        title,
        description,
        targetRoute,
        expectedResult
    }).where(eq(TestCasesTable.id, testCaseId));

    return NextResponse.json({message:"Test case updated successfully",result});
}