/**
 * @file Logger utility class for structured logging using Winston.
 * @description Provides scoped logging with support for multiple log levels and path-based scope formatting.
 * @author Lucas
 * @license MIT
 */

import * as winston from 'winston';
import * as path from 'path';
import chalk from 'chalk';

/**
 * Enum representing available logger levels.
 */
export enum LoggerLevels {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
}

/**
 * Logger class that wraps Winston for structured and scoped logging.
 */
export class Logger {
    /** Default scope name used when none is provided. */
    public static DEFAULT_SCOPE = 'app';

    /**
     * Transforms a file path into a readable scope string.
     * - Removes project root
     * - Strips out `/src/` or `/dist/`
     * - Removes file extensions
     * - Replaces path separators with colons
     *
     * @param filepath - Absolute or relative path of the file
     * @returns Formatted scope string
     */
    private static parsePathToScope(filepath: string): string {
        if (filepath.indexOf(path.sep) >= 0) {
            filepath = filepath.replace(process.cwd(), '');
            filepath = filepath.replace(`${path.sep}src${path.sep}`, '');
            filepath = filepath.replace(`${path.sep}dist${path.sep}`, '');
            filepath = filepath.replace('.ts', '');
            filepath = filepath.replace('.js', '');
            filepath = filepath.replace(new RegExp(path.sep, 'g'), ':');
        }

        return filepath;
    }

    /** Holds the formatted scope of the logger instance. */
    private scope: string;

    /**
     * Creates a new Logger instance with optional scope.
     * If no scope is provided, uses DEFAULT_SCOPE.
     *
     * @param scope - Optional scope, typically the current file's `__filename`
     */
    constructor(scope?: string) {
        this.scope = Logger.parsePathToScope(scope ? scope : Logger.DEFAULT_SCOPE);
    }

    /**
     * Logs a debug-level message.
     *
     * @param message - Message to log
     * @param args - Additional arguments (e.g., metadata)
     */
    public debug(message: string, ...args: any[]): void {
        this.log(LoggerLevels.DEBUG, message, args);
    }

    /**
     * Logs an info-level message.
     *
     * @param message - Message to log
     * @param args - Additional arguments (e.g., metadata)
     */
    public info(message: string, ...args: any[]): void {
        this.log(LoggerLevels.INFO, message, args);
    }

    /**
     * Logs a warning-level message.
     *
     * @param message - Message to log
     * @param args - Additional arguments (e.g., metadata)
     */
    public warn(message: string, ...args: any[]): void {
        this.log(LoggerLevels.WARN, message, args);
    }

    /**
     * Logs an error-level message.
     *
     * @param message - Message to log
     * @param args - Additional arguments (e.g., metadata)
     */
    public error(message: string, ...args: any[]): void {
        this.log(LoggerLevels.ERROR, message, args);
    }

    /**
     * Internal method to send a log message to Winston with proper scope formatting.
     *
     * @param level - Logging level from LoggerLevels
     * @param message - Message to log
     * @param args - Additional arguments
     */
    private log(level: LoggerLevels, message: string, args: any[]): void {
        if (Object.prototype.hasOwnProperty.call(winston, level))
            (winston as any)[level](`${this.formatScope()} ${message}`, args);
    }

    /**
     * Formats the scope string for consistent log prefixing.
     *
     * @returns Scope wrapped in brackets (e.g., `[auth:controller]`)
     */
    private formatScope(): string {
        return chalk.hex('#9b59b6')(`[${this.scope}]`);
    }
}
