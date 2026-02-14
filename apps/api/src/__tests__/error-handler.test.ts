import { describe, it, expect, vi } from 'vitest';
import { ZodError, ZodIssueCode } from 'zod';

// Unit-test the error handler logic extracted from app.ts
function handleError(error: any, requestId: string) {
  // Zod validation errors → 400
  if (error.name === 'ZodError' && 'issues' in error) {
    const issues = error.issues as Array<{ path: (string | number)[]; message: string }>;
    const details: Record<string, string> = {};
    for (const issue of issues) {
      details[issue.path.join('.')] = issue.message;
    }
    return {
      statusCode: 400,
      body: {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details },
        meta: { requestId, timestamp: expect.any(String) },
      },
    };
  }

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : error.message;

  return {
    statusCode,
    body: {
      success: false,
      error: { code: error.code || 'INTERNAL_ERROR', message },
      meta: { requestId, timestamp: expect.any(String) },
    },
  };
}

describe('error handler', () => {
  it('returns 400 with field details for ZodError', () => {
    const zodError = new ZodError([
      {
        code: ZodIssueCode.too_small,
        minimum: 1,
        type: 'string',
        inclusive: true,
        exact: false,
        message: 'Required',
        path: ['name'],
      },
      {
        code: ZodIssueCode.invalid_type,
        expected: 'string',
        received: 'number',
        message: 'Expected string, received number',
        path: ['sector'],
      },
    ]);

    const result = handleError(zodError, 'req-1');

    expect(result.statusCode).toBe(400);
    expect(result.body.error.code).toBe('VALIDATION_ERROR');
    expect(result.body.error.details).toEqual({
      name: 'Required',
      sector: 'Expected string, received number',
    });
  });

  it('returns 500 with sanitized message for unknown errors', () => {
    const error = new Error('Database connection failed');
    const result = handleError(error, 'req-2');

    expect(result.statusCode).toBe(500);
    expect(result.body.error.message).toBe('Internal Server Error');
    expect(result.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('preserves message for non-500 errors', () => {
    const error = Object.assign(new Error('Not found'), { statusCode: 404, code: 'NOT_FOUND' });
    const result = handleError(error, 'req-3');

    expect(result.statusCode).toBe(404);
    expect(result.body.error.message).toBe('Not found');
    expect(result.body.error.code).toBe('NOT_FOUND');
  });
});
