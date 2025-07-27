/**
 * @file LoggerInterface.ts
 * @description Defines the contract for a logging service with standard log levels. Intended to be implemented by custom logger classes like Winston-based loggers.
 * @author Lucas
 * @license MIT
 */

export interface LoggerInterface {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
}
