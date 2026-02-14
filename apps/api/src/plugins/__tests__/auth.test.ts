import { describe, it, expect, vi } from 'vitest';

// Mock the env module before importing auth
vi.mock('../../config/env.js', () => ({
  env: {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test',
    JWT_SECRET: 'test-secret',
    PORT: 3001,
    CORS_ORIGINS: '',
    RATE_LIMIT_MAX: 100,
  },
}));

import { requireAuth } from '../auth.js';

describe('requireAuth', () => {
  it('returns 401 when currentUser is undefined', async () => {
    const request = { currentUser: undefined } as any;
    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await requireAuth(request, reply);

    expect(status).toHaveBeenCalledWith(401);
    expect(send).toHaveBeenCalledWith({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
  });

  it('does nothing when currentUser is present', async () => {
    const request = {
      currentUser: {
        userId: 'u1',
        email: 'test@test.com',
        name: 'Test',
        role: 'ADMIN',
        organizationId: 'org1',
      },
    } as any;
    const status = vi.fn();
    const reply = { status } as any;

    const result = await requireAuth(request, reply);

    expect(status).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
