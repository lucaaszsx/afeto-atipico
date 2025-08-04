/**
 * @file IoCLoader.ts
 * @description Loader responsible for configuring dependency injection using TypeDI.
 * Integrates TypeDI with routing-controllers and class-validator for global container usage.
 * Emits a structured log after successful initialization for traceability purposes.
 * Also registers global singleton instances required throughout the application lifecycle, such as WSEventEmitter and Validator services.
 * @author Lucas
 * @license MIT
 */

import { MicroframeworkSettings, MicroframeworkLoader } from 'microframework-w3tec';
import { useContainer as routingUseContainer } from 'routing-controllers';
import { useContainer as classValidatorUseContainer, Validator } from 'class-validator';
import { Container } from 'typedi';
import { Logger } from '@/lib/logger';
import { WSEventEmitter } from '@/websocket';

export const IoCLoader: MicroframeworkLoader = async (
    settings?: MicroframeworkSettings
): Promise<void> => {
    const logger: Logger = new Logger(__filename);

    // Register global singleton services
    Container.set(Validator, new Validator());
    Container.set(WSEventEmitter, new WSEventEmitter());

    // Configure containers
    classValidatorUseContainer(Container);
    routingUseContainer(Container);

    // Register class-validator constraints
    registerConstraintClasses();

    logger.info('Dependency Injection initialized.');
};

/**
 * Register constraint classes in the TypeDI container
 * This prevents "Service with identifier was not found" errors
 */
function registerConstraintClasses() {
    const originalGet = Container.get.bind(Container);

    Container.get = function <T = any>(id: any): T {
        try {
            return originalGet(id);
        } catch (error: unknown) {
            if (
                error &&
                typeof error === 'object' &&
                'name' in error &&
                error.name === 'ServiceNotFoundError' &&
                (typeof id === 'function' || (typeof id === 'string' && id.includes('Constraint')))
            ) {
                if (typeof id === 'function') {
                    const instance = new id();
                    Container.set(id, instance);
                    return instance;
                }
            }
            throw error;
        }
    };
}