import { describe, it, expect } from 'vitest';
import { ApiRequestError } from '../api';

describe('ApiRequestError', () => {
  it('classifies 401 as auth error', () => {
    const err = new ApiRequestError('Unauthorized', 401, 'UNAUTHORIZED');
    expect(err.isAuth).toBe(true);
    expect(err.isValidation).toBe(false);
    expect(err.isServer).toBe(false);
    expect(err.isNetwork).toBe(false);
  });

  it('classifies 400 as validation error', () => {
    const err = new ApiRequestError('Bad input', 400, 'VALIDATION_ERROR', { name: 'Required' });
    expect(err.isValidation).toBe(true);
    expect(err.isAuth).toBe(false);
    expect(err.details).toEqual({ name: 'Required' });
  });

  it('classifies 500 as server error', () => {
    const err = new ApiRequestError('Server error', 500, 'INTERNAL_ERROR');
    expect(err.isServer).toBe(true);
    expect(err.isAuth).toBe(false);
  });

  it('classifies network errors', () => {
    const err = new ApiRequestError('Network error', 0, 'NETWORK_ERROR');
    expect(err.isNetwork).toBe(true);
    expect(err.isServer).toBe(false);
  });

  it('classifies 404 as not found', () => {
    const err = new ApiRequestError('Not found', 404, 'NOT_FOUND');
    expect(err.isNotFound).toBe(true);
    expect(err.isAuth).toBe(false);
  });

  it('extends Error with proper name', () => {
    const err = new ApiRequestError('test', 400, 'TEST');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ApiRequestError');
    expect(err.message).toBe('test');
    expect(err.status).toBe(400);
    expect(err.code).toBe('TEST');
  });
});
