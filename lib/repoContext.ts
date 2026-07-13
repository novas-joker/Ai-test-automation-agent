export const REPO_CONTEXT_ALLOWED_EXTENSIONS = [
  ".html",
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

export const REPO_CONTEXT_IGNORE_PATHS = [
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

export function isUsefulFile(path: string) {
  const normalizedPath = path.toLowerCase();

  const isIgnored = REPO_CONTEXT_IGNORE_PATHS.some((item) => normalizedPath.includes(item));
  const isAllowedExtension = REPO_CONTEXT_ALLOWED_EXTENSIONS.some((ext) => normalizedPath.endsWith(ext));

  return !isIgnored && isAllowedExtension;
}
