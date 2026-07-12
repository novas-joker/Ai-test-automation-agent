import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/db";
import { TestCasesTable, Repositories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { Browserbase } from "@browserbasehq/sdk";
import { chromium } from "playwright-core";
import { auth } from "@clerk/nextjs/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const bb = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY!,
});

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
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
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
}

export async function POST(req: NextRequest) {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { testCaseId, baseUrl, mode = "generate", customPrompt = "" } = body;

    if (!testCaseId || !baseUrl) {
      return NextResponse.json(
        { error: "testCaseId and baseUrl are required" },
        { status: 400 }
      );
    }

    const [testCase] = await db
      .select()
      .from(TestCasesTable)
      .where(
        and(
          eq(TestCasesTable.id, Number(testCaseId)),
          eq(TestCasesTable.userId, authUserId)
        )
      );

    if (!testCase) {
      return NextResponse.json({ error: "Test case not found" }, { status: 404 });
    }

    let repoRecord: any = null;
    if (testCase.repoId) {
      const [r] = await db
        .select()
        .from(Repositories)
        .where(eq(Repositories.repoId, Number.parseInt(testCase.repoId, 10)));
      repoRecord = r;
    }

    if (!repoRecord) {
      const [r] = await db
        .select()
        .from(Repositories)
        .where(eq(Repositories.fullName, `${testCase.repoOwner}/${testCase.repoName}`));
      repoRecord = r;
    }

    let scriptText = (testCase.browserbaseScript as string | null) ?? null;
    const forceRegenerate = mode === "generate" || !scriptText;
    const logs: string[] = [];

    if (forceRegenerate) {
      const cookiesStore = await cookies();
      const githubToken = cookiesStore.get(`gh_token_${authUserId}`)?.value;

      if (!githubToken) {
        return NextResponse.json(
          { error: "GitHub authentication token is missing or expired" },
          { status: 401 }
        );
      }

      const targetFiles = Array.isArray(testCase.targetFiles) ? testCase.targetFiles : [];
      let repoContext = "";

      if (targetFiles.length > 0) {
        const fileContents = await Promise.all(
          targetFiles.map((path: string) =>
            readGithubFile({
              owner: testCase.repoOwner,
              repo: testCase.repoName,
              branch: testCase.branch || "main",
              path,
              githubToken,
            })
          )
        );

        const validFiles = fileContents.filter(Boolean) as any[];
        repoContext = validFiles
          .map((file: any) => `File Path: ${file.path}\nFile Content:\n${file.content}`)
          .join("\n\n----------------------\n\n");
      }

      const globalIns = repoRecord?.globalInstruction
        ? `\n[GLOBAL PROJECT INSTRUCTIONS] (Follow strictly):\n${repoRecord.globalInstruction}\n`
        : "";

      const tempIns = customPrompt
        ? `\n[ADDITIONAL RUNTIME INSTRUCTIONS] (Follow strictly):\n${customPrompt}\n`
        : "";

      const promptText = [
        "You are an expert QA automation engineer.",
        `Your task is to write a Playwright Node.js script body that executes a test case on an application running at URL: "${baseUrl}".`,
        "Test Case Details:",
        `Title: ${testCase.title}`,
        `Description: ${testCase.description}`,
        `Target Route: ${testCase.targetRoute || "/"}`,
        `Expected Result: ${testCase.expectedResult}`,
        globalIns,
        tempIns,
        "Source File Context for Reference (Read this to extract exact tags, component text, input fields, and class names):",
        repoContext || "No source file context available for this test case.",
        "Write only the JavaScript code that executes within an async function context.",
        "The following variables are pre-injected into your runtime environment:",
        "'page': The Playwright Page object.",
        "'console': The custom console object to output log messages.",
        "IMPORTANT:",
        "Do NOT assume Node.js 'assert' is available.",
        "Do NOT import assert or any other module.",
        "At the top of the generated script, always define this custom assert helper:",
        "function assert(condition, message) {",
        " if (!condition) {",
        " throw new Error(message || 'Assertion failed');",
        " }",
        "}",
        "Rules for your code:",
        "DO NOT import playwright, browserbase, assert, or any other modules.",
        "Navigate to the target route using:",
        `await page.goto('${baseUrl}${testCase.targetRoute || ""}', { waitUntil: 'load', timeout: 15000 })`,
        "followed by a short settle wait: await page.waitForTimeout(1000).",
        "Carefully analyze the Source File Context provided to find the EXACT forms, inputs, placeholders, buttons, and elements. Look for:",
        "Input names, placeholder texts, or labels (e.g. page.getByPlaceholder('Enter your name') or page.locator('input[name=\"email\"]')).",
        "Button texts (e.g. page.getByRole('button', { name: /submit/i }) or page.locator('button:has-text(\"Submit\")')).",
        "Apply extreme selector resilience:",
        "If a specific selector or locator might fail, use flexible text-matching locators or check multiple variations.",
        "ALWAYS wait for an element to be visible before interacting with it: await page.waitForSelector('selector-or-text', { state: 'visible', timeout: 4000 }).catch(() => {}).",
        "Scroll elements into view before interaction to prevent out-of-bounds clicks: await locator.scrollIntoViewIfNeeded().catch(() => {}).",
        "If standard click fails or throws a timeout, try forcing it or using DOM-based dispatch click as a safe backup:",
        "await locator.click({ force: true, timeout: 2000 }).catch(async () => { await locator.evaluate(node => node.click()).catch(() => {}) })",
        "Introduce generous settling times:",
        "Add await page.waitForTimeout(1000) after major actions (clicks, inputs, typing, form submissions) to allow React, Next.js, or server state updates to propagate and elements to render.",
        "Use lenient, substring-based assertions:",
        "Do NOT use strict case-sensitive equality matches on text contents.",
        "Instead, search for presence or substring content in a relaxed, case-insensitive way. E.g.:",
        "const bodyText = await page.innerText('body');",
        `assert(bodyText.toLowerCase().includes('${testCase?.expectedResult?.toLowerCase().replace(/'/g, "\\'")}'), 'Expected result state not matched');`,
        "Or assert visibility of key success elements instead of exact string matching.",
        "Print descriptive logs at each step using console.log() to make debugging a breeze for the user.",
        "Return ONLY the raw JavaScript executable code.",
        "DO NOT wrap the code in markdown code blocks like ```javascript or ```.",
        "DO NOT include any explanation.",
        "Just return the executable code."
      ].join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: promptText,
      });

      let generatedCode = response.text || "";
      generatedCode = generatedCode.replace(/^```javascript\s*/i, "");
      generatedCode = generatedCode.replace(/^```js\s*/i, "");
      generatedCode = generatedCode.replace(/```$/, "");
      generatedCode = generatedCode.trim();

      if (!generatedCode) {
        return NextResponse.json(
          { error: "Gemini failed to generate an automation script" },
          { status: 500 }
        );
      }

      scriptText = generatedCode;

      await db
        .update(TestCasesTable)
        .set({
          browserbaseScript: scriptText,
          status: "running",
        })
        .where(eq(TestCasesTable.id, testCase.id));
    } else {
      await db
        .update(TestCasesTable)
        .set({ status: "running" })
        .where(eq(TestCasesTable.id, testCase.id));
    }

    const customConsole = {
      log: (...args: any[]) =>
        logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
      error: (...args: any[]) =>
        logs.push(`[ERROR] ` + args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
      warn: (...args: any[]) =>
        logs.push(`[WARN] ` + args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
    };

    let session: any = null;
    let browser: any = null;

    const abortHandler = async () => {
      console.warn("Client aborted request, closing CDP connection");
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          console.error("Error closing browser on abort:", e);
        }
      }
    };

    req.signal.addEventListener("abort", abortHandler);

    try {
      const sessionResponse = await bb.sessions.create({
        projectId: process.env.BROWSERBASE_PROJECT_ID,
      });

      session = sessionResponse;
      logs.push(`[SYSTEM] Browserbase session created successfully with ID: ${session.id}`);

      const connectUrl = session.connectUrl;
      browser = await chromium.connectOverCDP(connectUrl);
      const context = browser.contexts()[0];
      const page = context.pages()[0];

      page.on("console", (msg: any) => {
        logs.push(`[BROWSER] [${msg.type().toUpperCase()}] ${msg.text()}`);
      });

      logs.push(`[SYSTEM] Connected to Browserbase cloud browser, executing script...`);

      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const runFn = new AsyncFunction("page", "assert", "console", scriptText || "");

      const assertHelper = (condition: boolean, message?: string) => {
        if (!condition) {
          throw new Error(message || "Assertion failed");
        }
      };

      await runFn(page, assertHelper, customConsole);
      logs.push(`[SYSTEM] Script execution completed successfully without errors.`);

      await page.close().catch(() => {});
      await browser.close().catch(() => {});

      const dbLogFinal = logs.map((message) => ({ timestamp: new Date().toISOString(), message }));
      await db
        .update(TestCasesTable)
        .set({
          status: "passed",
          browserbaseScript: scriptText,
          log: dbLogFinal as any,
        })
        .where(eq(TestCasesTable.id, testCase.id));

      return NextResponse.json({
        success: true,
        status: "passed",
        sessionId: session.id,
        sessionUrl: `https://www.browserbase.com/sessions/${session.id}`,
        logs,
        browserbaseScript: scriptText,
      });
    } catch (execError: any) {
      console.error("Script execution error:", execError);
      const isAborted = req.signal.aborted;
      const displayError = isAborted ? "Execution cancelled by user" : (execError.message || String(execError));
      logs.push(`[SYSTEM ERROR] Script execution failed: ${displayError}`);

      if (browser) {
        await browser.close().catch(() => {});
      }

      const dbLogError = logs.map((message) => ({ timestamp: new Date().toISOString(), message }));
      await db
        .update(TestCasesTable)
        .set({
          status: "failed",
          browserbaseScript: scriptText,
          log: dbLogError as any,
        })
        .where(eq(TestCasesTable.id, testCase.id));

      return NextResponse.json({
        success: false,
        status: "failed",
        error: displayError,
        sessionId: session?.id,
        sessionUrl: session ? `https://www.browserbase.com/sessions/${session.id}` : null,
        logs,
        browserbaseScript: scriptText,
      });
    } finally {
      req.signal.removeEventListener("abort", abortHandler);
    }
  } catch (error: any) {
    console.error("API endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

