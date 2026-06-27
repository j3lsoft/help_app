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

  it('returns empty string when code maps to empty string', () => {
    const cfg = { byCode: { EMPTY_MSG: '' }, fallback: 'Fallback error' };
    const error: AppError = { status: 500, code: 'EMPTY_MSG', handled: false };
    expect(mapError(error, cfg)).toBe('');
  });

  it('returns empty string when status maps to empty string', () => {
    const cfg = { byStatus: { 204: '' }, fallback: 'Fallback error' };
    const error: AppError = { status: 204, handled: false };
    expect(mapError(error, cfg)).toBe('');
  });
});
