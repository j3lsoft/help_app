import { HttpErrorResponse } from '@angular/common/http';
import { InjectionToken } from '@angular/core';

export interface ErrorMapper {
  context: string;
  mapError(error: HttpErrorResponse): string | null;
}

export const ERROR_MAPPER_TOKEN = new InjectionToken<ErrorMapper>(
  'ErrorMapper'
);
