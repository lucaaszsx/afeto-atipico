/**
 * @file LoggerDecorator.ts
 * @description Provides a custom dependency injection decorator for scoped logging using TypeDI and a Winston-based Logger instance. Enables automatic injection of scoped loggers into services, controllers, etc., based on context (e.g., class or method name).
 * @author Lucas
 * @license MIT
 */

import { Logger } from '@/lib/logger';
import { Container } from 'typedi';

/**
 * Dependency injection decorator for injecting a scoped logger instance using TypeDI.
 * The scope helps categorize logs per module (e.g., by controller or service).
 *
 * @param scope - Typically the current module's name or __filename
 * @returns ParameterDecorator function to be used on constructor parameters
 */
export function LoggerDecorator(scope: string): ParameterDecorator {
    return (targetClass: any, propertyKey, parameterIndex): void => {
        const logger = new Logger(scope);

        Container.registerHandler({
            object: targetClass,
            propertyName: propertyKey ? propertyKey.toString() : '',
            index: parameterIndex,
            value: () => logger
        });
    };
}