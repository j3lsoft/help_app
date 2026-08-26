import { Injectable } from '@angular/core';
import { BaseErrorFacade } from '../../../core/errors/facades/base-error.facade';
import { AppError } from '../../../core/models/app-error.model';
import { handlePostError } from './post-error.handler';
import { PostErrorContext } from './post-error.config';

@Injectable({
  providedIn: 'root',
})
export class PostErrorFacade extends BaseErrorFacade<PostErrorContext> {
  handle(error: AppError, context: PostErrorContext): void {
    this.handleBase(error, context, handlePostError);
  }

  getMessage(error: AppError, context: PostErrorContext): string {
    return this.getMessageBase(error, context, handlePostError);
  }
}
