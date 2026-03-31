import { HttpErrorResponse } from '@angular/common/http';

export function extractBackendMessage(error: HttpErrorResponse): string {
  const message = error.error?.message;
  if (Array.isArray(message)) {
    return message.join(', ');
  }
  return typeof message === 'string' ? message : '';
}