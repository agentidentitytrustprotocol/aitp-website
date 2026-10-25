import { describe, expect, it } from 'vitest';
import { latestSpecVersion } from './spec-version';

describe('latestSpecVersion', () => {
  const tags = ['schema-v0.3.9', 'v0.2.1-draft', 'v0.3.0-draft', 'v0.3.2-draft', 'v0.3.1-draft'];

  it('picks the newest release tag and ignores schema tags', () => {
    expect(latestSpecVersion(tags)).toBe('v0.3.2-draft');
  });

  it('moves when a newer tag appears', () => {
    expect(latestSpecVersion([...tags, 'v0.3.3-draft'])).toBe('v0.3.3-draft');
    expect(latestSpecVersion([...tags, 'v0.10.0-draft'])).toBe('v0.10.0-draft');
  });

  it('ranks a release above its pre-release', () => {
    expect(latestSpecVersion(['v0.4.0', 'v0.4.0-draft'])).toBe('v0.4.0');
  });

  it('returns null when there is no release tag', () => {
    expect(latestSpecVersion(['schema-v0.3.2', 'archive/x'])).toBeNull();
  });
});
