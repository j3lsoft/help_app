export const HTTP_STATUS = {
  NETWORK_ERROR: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export function isTechnicalError(status: number): boolean {
  return (
    status === HTTP_STATUS.NETWORK_ERROR ||
    status >= HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}

export function getHttpErrorLogLevel(status: number): 'error' | 'warn' | 'ignore' {
  if (isTechnicalError(status)) return 'error';
  if (status === HTTP_STATUS.TOO_MANY_REQUESTS) return 'warn';
  return 'ignore';
}
