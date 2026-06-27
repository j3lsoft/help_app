import { Injectable } from '@angular/core';
import { BaseErrorFacade } from '../../../core/errors/facades/base-error.facade';
import { AppError } from '../../../core/models/app-error.model';
import { handleSocialError } from './social-error.handler';
import { SocialErrorContext } from './social-error.config';

@Injectable({
  providedIn: 'root',
})
export class SocialErrorFacade extends BaseErrorFacade<SocialErrorContext> {
  handle(error: AppError, context: SocialErrorContext): void {
    this.handleBase(error, context, handleSocialError);
  }

  getMessage(error: AppError, context: SocialErrorContext): string {
    return this.getMessageBase(error, context, handleSocialError);
  }
}
