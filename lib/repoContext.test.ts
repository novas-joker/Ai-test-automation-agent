import { describe, expect, it } from 'vitest';
import { isUsefulFile } from './repoContext';

describe('isUsefulFile', () => {
  it('keeps plain HTML, CSS, and JavaScript files in repo context', () => {
    expect(isUsefulFile('index.html')).toBe(true);
    expect(isUsefulFile('styles.css')).toBe(true);
    expect(isUsefulFile('app.js')).toBe(true);
  });

  it('ignores large build directories and image assets', () => {
    expect(isUsefulFile('node_modules/react/index.js')).toBe(false);
    expect(isUsefulFile('public/logo.svg')).toBe(false);
  });
});
