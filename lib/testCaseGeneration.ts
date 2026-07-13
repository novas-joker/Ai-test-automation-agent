export function extractJsonPayload(rawText: string) {
  const cleanedText = rawText.replace(/```(?:json)?/gi, "").trim();
  const startIndex = cleanedText.indexOf("{");
  const endIndex = cleanedText.lastIndexOf("}");

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    return JSON.parse(cleanedText.slice(startIndex, endIndex + 1));
  }

  return JSON.parse(cleanedText || "{}");
}

export function normalizeText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function normalizeTargetFiles(value: unknown, fallbackFiles: string[]) {
  if (!Array.isArray(value)) {
    return fallbackFiles;
  }

  const files = value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, 5);

  return files.length ? files : fallbackFiles;
}

export function buildFallbackTestCases(validFiles: Array<{ path: string }>) {
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
