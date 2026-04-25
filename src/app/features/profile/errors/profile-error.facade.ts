import { Injectable } from '@angular/core';
import { BaseErrorFacade } from '../../../core/errors/facades/base-error.facade';
import { AppError } from '../../../core/models/app-error.model';
import { handleProfileError } from './profile-error.handler';
import { ProfileErrorContext } from './profile-error.config';

@Injectable({
  providedIn: 'root',
})
export class ProfileErrorFacade extends BaseErrorFacade<ProfileErrorContext> {
  handle(error: AppError, context: ProfileErrorContext): void {
    this.handleBase(error, context, handleProfileError);
  }

  getMessage(error: AppError, context: ProfileErrorContext): string {
    return this.getMessageBase(error, context, handleProfileError);
  }
}
