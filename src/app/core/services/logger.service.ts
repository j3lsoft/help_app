import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

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
  private level: LogLevel = environment.production ? LogLevel.OFF : LogLevel.DEBUG;
  private isProduction = environment.production;

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
        stack: this.isProduction ? undefined : error.stack,
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
    if (this.isProduction) {
      return;
    }

    const logFn = this.getConsoleMethod(entry.level);
    const formatted = this.formatEntry(entry);

    if (entry.error) {
      logFn(formatted, entry.error.stack);
    } else {
      logFn(formatted);
    }
  }

  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug.bind(console);
      case LogLevel.INFO:
        return console.info.bind(console);
      case LogLevel.WARN:
        return console.warn.bind(console);
      case LogLevel.ERROR:
        return console.error.bind(console);
      default:
        return console.log.bind(console);
    }
  }

  private formatEntry(entry: LogEntry): string {
    const levelPadding = entry.levelName.padEnd(5, ' ');
    return `[${levelPadding}] [${entry.context}] ${entry.message}`;
  }

  private sanitizeData(data?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!data) return undefined;

    const sensitiveKeys = ['password', 'token', 'authorization', 'secret', 'apiKey', 'credential'];
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
