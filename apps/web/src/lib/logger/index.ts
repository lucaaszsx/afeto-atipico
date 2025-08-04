/**
 * @file Logger utility class for structured logging in browser environments.
 * @description Provides scoped logging with support for multiple log levels and path-based scope formatting.
 * @author Lucas
 * @license MIT
 */

export enum LoggerLevels {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

export interface LoggerInterface {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
}

/**
 * Lightweight Logger class for the browser, using console methods with colored scope.
 */
export class Logger {
    public static DEFAULT_SCOPE = 'app';

    private scope: string;

    constructor(scope?: string) {
        this.scope = Logger.parsePathToScope(scope ?? Logger.DEFAULT_SCOPE);
    }

    public debug(message: string, ...args: any[]): void {
        if (import.meta.env.MODE === 'development') this.log(LoggerLevels.DEBUG, message, args);
    }

    public info(message: string, ...args: any[]): void {
        this.log(LoggerLevels.INFO, message, args);
    }

    public warn(message: string, ...args: any[]): void {
        this.log(LoggerLevels.WARN, message, args);
    }

    public error(message: string, ...args: any[]): void {
        this.log(LoggerLevels.ERROR, message, args);
    }

    private log(level: LoggerLevels, message: string, args: any[]): void {
        const scopeTag = `%c[${this.scope}]`;
        const color = Logger.colorForLevel(level);
        const method = console[level] ?? console.log;
        method(`${scopeTag} ${message}`, `color: ${color}; font-weight: bold;`, ...args);
    }

    private static parsePathToScope(filepath: string): string {
        return filepath
            .replace(/^\/?src\//, '') // remove src/
            .replace(/\.(ts|tsx|js|jsx)$/, '') // remove extensions
            .replace(/\//g, ':'); // convert path to colon format
    }

    private static colorForLevel(level: LoggerLevels): string {
        switch (level) {
            case LoggerLevels.DEBUG:
                return '#3498db';
            case LoggerLevels.INFO:
                return '#2ecc71';
            case LoggerLevels.WARN:
                return '#f1c40f';
            case LoggerLevels.ERROR:
                return '#e74c3c';
            default:
                return '#bdc3c7';
        }
    }
}