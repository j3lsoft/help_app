import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  OFF = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  context: string;
  message: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LogOptions {
  context?: string;
  data?: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private level: LogLevel = environment.production
    ? LogLevel.ERROR
    : LogLevel.DEBUG;
  private readonly sensitiveKeys = [
    'password',
    'token',
    'authorization',
    'secret',
    'apikey',
    'credential',
    'cookie',
    'session',
  ];

  debug(message: string, options?: LogOptions): void {
    this.log(LogLevel.DEBUG, message, options);
  }

  info(message: string, options?: LogOptions): void {
    this.log(LogLevel.INFO, message, options);
  }

  warn(message: string, options?: LogOptions): void {
    this.log(LogLevel.WARN, message, options);
  }

  error(message: string, options?: LogOptions): void {
    this.log(LogLevel.ERROR, message, options);
  }

  logError(error: Error, options?: LogOptions): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      levelName: 'ERROR',
      context: options?.context || 'Unknown',
      message: error.message,
      data: options?.data,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    };

    if (this.shouldLog(LogLevel.ERROR)) {
      this.output(entry);
    }
  }

  private log(level: LogLevel, message: string, options?: LogOptions): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LogLevel[level],
      context: options?.context || 'App',
      message,
      data: this.sanitizeData(options?.data),
    };

    this.output(entry);
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private output(entry: LogEntry): void {
    const logFn = this.getConsoleMethod(entry.level);
    const formatted = this.formatEntry(entry);

    if (entry.error) {
      logFn(formatted, entry.error.stack);
    } else {
      logFn(formatted);
    }
  }

  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    const consoleMethods: Partial<
      Record<LogLevel, (...args: unknown[]) => void>
    > = {
      [LogLevel.DEBUG]: console.debug.bind(console),
      [LogLevel.INFO]: console.info.bind(console),
      [LogLevel.WARN]: console.warn.bind(console),
      [LogLevel.ERROR]: console.error.bind(console),
    };
    return consoleMethods[level] || console.log.bind(console);
  }

  private formatEntry(entry: LogEntry): string {
    const levelPadding = entry.levelName.padEnd(5, ' ');
    return `[${levelPadding}] [${entry.context}] ${entry.message}`;
  }

  private sanitizeData(
    data?: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    if (!data) return undefined;
    return this.sanitizeValue(data, 0) as Record<string, unknown>;
  }

  private sanitizeValue(value: unknown, depth: number): unknown {
    const maxDepth = 4;
    if (value == null || depth > maxDepth) return value;

    if (Array.isArray(value)) {
      return value.map((entry) => this.sanitizeValue(entry, depth + 1));
    }

    if (typeof value !== 'object') {
      return value;
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(
      value as Record<string, unknown>
    )) {
      if (this.isSensitiveKey(key)) {
        sanitized[key] = '[REDACTED]';
        continue;
      }
      sanitized[key] = this.sanitizeValue(entry, depth + 1);
    }
    return sanitized;
  }

  private isSensitiveKey(key: string): boolean {
    const normalizedKey = key.toLowerCase();
    return this.sensitiveKeys.some((sensitive) =>
      normalizedKey.includes(sensitive)
    );
  }
}
