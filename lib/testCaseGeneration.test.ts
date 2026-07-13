import { describe, expect, it } from 'vitest';
import {
  extractJsonPayload,
  normalizeTargetFiles,
  buildFallbackTestCases,
} from './testCaseGeneration';

describe('generate test case normalization helpers', () => {
  it('extracts JSON from markdown-wrapped Gemini output', () => {
    const rawText = `\`\`\`json
{
  "testCases": [
    {
      "title": "Landing page renders successfully",
      "description": "Verify the home page loads and the main UI content is visible.",
      "type": "ui",
      "priority": "high",
      "targetRoute": "/",
      "targetFiles": ["app/page.tsx"],
      "expectedResult": "The landing page is displayed with visible primary content."
    }
  ]
}
\`\`\``;

    expect(extractJsonPayload(rawText)).toEqual({
      testCases: [
        {
          title: 'Landing page renders successfully',
          description: 'Verify the home page loads and the main UI content is visible.',
          type: 'ui',
          priority: 'high',
          targetRoute: '/',
          targetFiles: ['app/page.tsx'],
          expectedResult: 'The landing page is displayed with visible primary content.',
        },
      ],
    });
  });

  it('falls back when target files are missing or malformed', () => {
    const fallbackFiles = ['app/page.tsx', 'app/layout.tsx'];

    expect(normalizeTargetFiles(['', null as unknown], fallbackFiles)).toEqual(fallbackFiles);
    expect(normalizeTargetFiles(['app/page.tsx'], fallbackFiles)).toEqual(['app/page.tsx']);
  });

  it('creates fallback test cases from repository files', () => {
    const fallbackCases = buildFallbackTestCases([{ path: 'app/page.tsx' }]);

    expect(fallbackCases).toHaveLength(3);
    expect(fallbackCases.every((entry) => entry.targetFiles.includes('app/page.tsx'))).toBe(true);
  });
});
