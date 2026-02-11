// src/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const IS_DEV = import.meta.env.DEV; // Vite's built-in env check

class Logger {
  private prefix = '[NEURAL_CORE]';

  // Colors for browser console
  private colors = {
    debug: '#7f8c8d',
    info: '#00ffff', // Matches your Cyan theme
    warn: '#ff810a', // Matches your Action theme
    error: '#ff0055',
  };

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (!IS_DEV && level !== 'error') return;

    const color = this.colors[level];
    console.log(
      `%c${this.prefix} %c[${level.toUpperCase()}] %c${message}`,
      'color: #888; font-weight: bold;',
      `color: ${color}; font-weight: bold;`,
      'color: inherit;',
      ...args
    );
  }

  debug(msg: string, ...args: any[]) { this.log('debug', msg, ...args); }
  info(msg: string, ...args: any[]) { this.log('info', msg, ...args); }
  warn(msg: string, ...args: any[]) { this.log('warn', msg, ...args); }
  error(msg: string, ...args: any[]) { this.log('error', msg, ...args); }
}

export const logger = new Logger();