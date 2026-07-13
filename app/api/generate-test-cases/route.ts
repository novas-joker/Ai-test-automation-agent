import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { TestCasesTable } from "@/db/schema";
import { cookies } from "next/headers";
import { GoogleGenAI } from "@google/genai";

const ALLOWED_EXTENSIONS = [
  ".html",
  ".htm",
  ".css",
  ".scss",
  ".sass",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".md",
];

const IGNORE_PATHS = [
  "node_modules",
  ".next",
  "dist",
  "build",
  ".git",
  "coverage",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
  ".mp4",
  ".mov",
];

function isUsefulFile(path: string) {
  const normalizedPath = path.toLowerCase();
  const isIgnored = IGNORE_PATHS.some((item) => normalizedPath.includes(item));
  const isAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => normalizedPath.endsWith(ext));

  return !isIgnored && isAllowedExtension;
}

function extractJsonPayload(rawText: string) {
  const cleanedText = rawText.replace(/```(?:json)?/gi, "").trim();
  const startIndex = cleanedText.indexOf("{");
  const endIndex = cleanedText.lastIndexOf("}");

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    return JSON.parse(cleanedText.slice(startIndex, endIndex + 1));
  }

  return JSON.parse(cleanedText || "{}");
}

function normalizeText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeTargetFiles(value: unknown, fallbackFiles: string[]) {
  if (Array.isArray(value)) {
    const files = value
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .slice(0, 5);

    return files.length ? files : fallbackFiles;
  }

  return fallbackFiles;
}

function buildFallbackTestCases(validFiles: Array<{ path: string }>) {
  const fallbackTargetFiles = validFiles.slice(0, 3).map((file) => file.path);

  return [
    {
      title: "Landing page renders successfully",
      description: "Verify the home page loads and the main UI content is visible.",
      type: "ui",
      priority: "high",
      targetRoute: "/",
      targetFiles: fallbackTargetFiles.length ? fallbackTargetFiles : ["index.html"],
      expectedResult: "The landing page is displayed with visible primary content.",
    },
    {
      title: "Primary navigation is available",
      description: "Check that the top-level navigation links or buttons are shown and usable.",
      type: "ui",
      priority: "medium",
      targetRoute: "/",
      targetFiles: fallbackTargetFiles.length ? fallbackTargetFiles : ["index.html"],
      expectedResult: "Navigation options are available and can be clicked.",
    },
    {
      title: "Static assets are wired correctly",
      description: "Confirm that the main page styles and scripts are loading without obvious runtime errors.",
      type: "integration",
      priority: "medium",
      targetRoute: "/",
      targetFiles: fallbackTargetFiles.length ? fallbackTargetFiles : ["index.html"],
      expectedResult: "The page loads with expected styling and no critical runtime errors.",
    },
  ];
}

async function getRepoTree({
  owner,
  repo,
  branch,
  githubToken,
}: {
  owner: string;
  repo: string;
  branch: string;
  githubToken: string;
}) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`GitHub repo tree request failed with status ${res.status}`);
    }

    const data = await res.json();

    return data.tree
      .filter((item: any) => item.type === "blob")
      .filter((item: any) => isUsefulFile(item.path))
      .slice(0, 25);
  } catch (error: any) {
    console.error("Failed to fetch GitHub repo tree:", error);
    throw new Error(`Failed to fetch GitHub repo tree: ${error?.message || "Unknown error"}`);
  }
}

async function readGithubFile({
  owner,
  repo,
  path,
  branch,
  githubToken,
}: {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  githubToken: string;
}) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    if (!data.content) {
      return null;
    }

    const decodedContent = Buffer.from(data.content, "base64").toString("utf-8");

    return {
      path,
      content: decodedContent.slice(0, 5000),
    };
  } catch (error: any) {
    console.error(`Failed to read GitHub file ${path}:`, error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

    if (!geminiApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing GEMINI_API_KEY in server environment.",
        },
        { status: 500 }
      );
    }

    const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const body = (await req.json()) as {
      userId?: string | number;
      repoId?: number;
      owner?: string;
      repo?: string;
      branch?: string;
    };
    const { userId, repoId, owner, repo } = body;
    const cookieStore = await cookies();
    const githubToken = cookieStore.get(`gh_token_${userId}`)?.value ?? "";
    const branch = body.branch ?? "main";

    const missingFields = [];
    if (!userId) missingFields.push("userId");
    if (!owner) missingFields.push("owner");
    if (!repo) missingFields.push("repo");
    if (!githubToken) missingFields.push("githubToken");

    if (missingFields.length) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const ownerValue = owner!;
    const repoValue = repo!;
    const safeUserId = String(userId);
    const safeRepoId = repoId ? String(repoId) : null;

    // 1. Get repo tree
    const repoFiles = await getRepoTree({
      owner: ownerValue,
      repo: repoValue,
      branch,
      githubToken,
    });

    // 2. Read useful files
    const fileContents = await Promise.all(
      repoFiles.map((file: any) =>
        readGithubFile({
          owner: ownerValue,
          repo: repoValue,
          branch,
          path: file.path,
          githubToken,
        })
      )
    );

    const validFiles = fileContents.filter(Boolean);

    if (validFiles.length === 0) {
      return NextResponse.json(
        {
          error: "No useful source files found in this repository",
        },
        { status: 400 }
      );
    }

    // 3. Prepare compact repo context
    const repoContext = validFiles
      .map(
        (file: any) => `
File Path: ${file.path}

File Content:
${file.content}
`
      )
      .join("\n\n----------------------\n\n");

    // 4. Ask Gemini to generate test cases with metadata
    const prompt = `
You are an expert QA automation engineer.

Analyze the GitHub repository source code and generate useful small test cases.

Your goal:
Generate test cases that can later be converted into Playwright / Browserbase automation scripts.

Repository:
Owner: ${ownerValue}
Repo: ${repoValue}
Branch: ${branch}

Repository File Context:
${repoContext}

Generate 5 to 10 test cases.

Each test case must include:
- title: clear test case title
- description: one-line description
- type: one of ui, auth, api, form, integration, edge-case
- priority: low, medium, high
- targetRoute: most likely app route/page to test, for example /sign-in, /dashboard, /api/users
- targetFiles: related file paths from the repository context
- expectedResult: what should happen when the test passes

Important rules:
- Only use file paths that exist in the repository context.
- Do not invent fake target files.
- If route is unclear, infer from Next.js app/page structure.
- Keep description short, only one line.
- Return only valid JSON.
`;

    let generatedText = "";

    try {
      const geminiResponse = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      generatedText = typeof geminiResponse?.text === "string" ? geminiResponse.text : "";
    } catch (error: any) {
      console.error("Gemini test-case generation failed:", error);
      throw new Error(`Gemini generation failed: ${error?.message || "Unknown error"}`);
    }

    let testCases: any[] = [];
    const fallbackFiles = validFiles.map((file: any) => file.path);

    try {
      const aiResult = extractJsonPayload(generatedText || "{}");
      const rawCases = Array.isArray(aiResult.testCases) ? aiResult.testCases : [];

      testCases = rawCases.map((testCase: any) => ({
        title: normalizeText(testCase?.title, "Landing page renders successfully"),
        description: normalizeText(testCase?.description, "Verify the primary UI loads correctly."),
        type: normalizeText(testCase?.type, "ui"),
        priority: normalizeText(testCase?.priority, "medium"),
        targetRoute: normalizeText(testCase?.targetRoute, "/"),
        targetFiles: normalizeTargetFiles(testCase?.targetFiles, fallbackFiles),
        expectedResult: normalizeText(testCase?.expectedResult, "The expected UI state is visible."),
      }));
    } catch {
      testCases = buildFallbackTestCases(validFiles);
    }

    if (!testCases.length) {
      testCases = buildFallbackTestCases(validFiles);
    }

    // 5. Save generated test cases to Neon DB
    const insertedTestCases = await db
      .insert(TestCasesTable)
      .values(
        testCases.map((testCase: any) => ({
          userId: safeUserId,
          repoId: safeRepoId,
          repoName: repoValue,
          repoOwner: ownerValue,
          branch,

          title: normalizeText(testCase?.title, "Landing page renders successfully"),
          description: normalizeText(testCase?.description, "Verify the primary UI loads correctly."),
          type: normalizeText(testCase?.type, "ui"),
          priority: normalizeText(testCase?.priority, "medium"),

          targetRoute: normalizeText(testCase?.targetRoute, "/"),
          targetFiles: normalizeTargetFiles(testCase?.targetFiles, fallbackFiles),
          expectedResult: normalizeText(testCase?.expectedResult, "The expected UI state is visible."),

          status: "generated",
        }))
      )
      .returning();

    return NextResponse.json({
      success: true,
      message: "Test cases generated successfully",
      count: insertedTestCases.length,
      testCases: insertedTestCases,
    });
  } catch (error: any) {
    console.error("Generate test cases error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate test cases",
      },
      { status: 500 }
    );
  }
}

