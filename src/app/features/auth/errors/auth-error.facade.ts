import { Injectable } from '@angular/core';
import { BaseErrorFacade } from '../../../core/errors/facades/base-error.facade';
import { AppError } from '../../../core/models/app-error.model';
import { handleAuthError } from './auth-error-handler';
import { AuthErrorContext } from './auth-error.config';

@Injectable({
  providedIn: 'root',
})
export class AuthErrorFacade extends BaseErrorFacade<AuthErrorContext> {
  handle(error: AppError, context: AuthErrorContext): void {
    this.handleBase(error, context, handleAuthError);
  }

  getMessage(error: AppError, context: AuthErrorContext): string {
    return this.getMessageBase(error, context, handleAuthError);
  }
}
