import { describe, it, expect } from 'vitest';

describe('Project smoke test', () => {
  it('basic math works', () => {
    expect(1 + 1).toBe(2);
  });

  it('authApi is importable', async () => {
    const mod = await import('../shared/api/authApi');
    expect(mod.authApi).toBeDefined();
    expect(typeof mod.authApi.login).toBe('function');
  });
});
