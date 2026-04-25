export interface AppError {
  status: number;
  code?: string;
  message?: string;
  details?: AppErrorDetails;
  handled: boolean;
}
export interface ServerValidationErrorItem {
  message: string;
  meta?: Record<string, unknown>;
}
export interface ValidationErrorDetails {
  message?: string;
  fieldErrors: Record<string, ServerValidationErrorItem[]>;
}
export type AppErrorDetails = {
  validation?: ValidationErrorDetails;
  [key: string]: unknown;
};