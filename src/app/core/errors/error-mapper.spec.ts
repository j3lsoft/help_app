import { AppError } from '../models/app-error.model';
import { mapError } from './error-mapper';

describe('mapError', () => {
  const config = {
    byCode: { CONFLICT: 'Conflict by code' },
    byStatus: { 404: 'Not found by status' },
    fallback: 'Fallback error',
  };

  it('prioritizes code mapping', () => {
    const error: AppError = { status: 404, code: 'CONFLICT', handled: false };
    expect(mapError(error, config)).toBe('Conflict by code');
  });

  it('uses status mapping when code is absent', () => {
    const error: AppError = { status: 404, handled: false };
    expect(mapError(error, config)).toBe('Not found by status');
  });

  it('returns fallback when no mapping exists', () => {
    const error: AppError = { status: 418, handled: false };
    expect(mapError(error, config)).toBe('Fallback error');
  });
});
