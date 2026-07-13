import { describe, expect, it } from 'vitest';
import { resolveGithubRedirectUri } from '@/lib/githubRedirect';

describe('resolveGithubRedirectUri', () => {
  it('uses the incoming request origin for the GitHub callback URL', () => {
    const requestUrl = 'https://my-app.vercel.app/api/github';

    expect(resolveGithubRedirectUri(requestUrl)).toBe(
      'https://my-app.vercel.app/api/github/callback'
    );
  });

  it('falls back to the configured redirect URI when the request URL is missing', () => {
    expect(resolveGithubRedirectUri(undefined, 'https://example.com/api/github/callback')).toBe(
      'https://example.com/api/github/callback'
    );
  });
});
