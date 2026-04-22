type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMeta {
  [key: string]: unknown;
}

class Logger {
  private isDev = process.env.NODE_ENV !== 'production';

  private log(level: LogLevel, message: string, meta?: LogMeta): void {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (level === 'error') {
      console.error(`${prefix} ${message}${metaStr}`);
    } else if (level === 'warn') {
      console.warn(`${prefix} ${message}${metaStr}`);
    } else {
      console.log(`${prefix} ${message}${metaStr}`);
    }
  }

  info(message: string, meta?: LogMeta): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: LogMeta): void {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: LogMeta): void {
    if (this.isDev) {
      this.log('debug', message, meta);
    }
  }
}

export const logger = new Logger();
