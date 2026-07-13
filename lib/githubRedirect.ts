export function resolveGithubRedirectUri(
  requestUrl?: string,
  fallbackRedirectUri?: string
): string {
  if (requestUrl) {
    const url = new URL(requestUrl);
    const origin = url.origin;

    return `${origin}/api/github/callback`;
  }

  return fallbackRedirectUri || 'http://localhost:3000/api/github/callback';
}
