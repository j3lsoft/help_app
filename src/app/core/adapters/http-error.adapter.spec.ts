import { HttpErrorResponse } from '@angular/common/http';
import { HttpErrorAdapter } from './http-error.adapter';

describe('HttpErrorAdapter', () => {
  it('adapts code, message and validation details', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: { traceId: 'abc' },
        errors: {
          email: [{ message: 'invalid email' }],
        },
      },
    });

    const result = HttpErrorAdapter.adapt(error);

    expect(result.status).toBe(422);
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.message).toBe('Validation failed');
    expect(result.details?.['traceId']).toBe('abc');
    expect(result.details?.validation?.fieldErrors['email'][0].message).toBe(
      'invalid email'
    );
    expect(result.handled).toBeFalse();
  });
});
