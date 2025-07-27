/**
 * @file IoCLoader.ts
 * @description Loader responsible for configuring dependency injection using TypeDI.
 * Integrates TypeDI with routing-controllers and class-validator for global container usage.
 * Emits a structured log after successful initialization for traceability purposes.
 * @author Lucas
 * @license MIT
 */

import { MicroframeworkSettings, MicroframeworkLoader } from 'microframework-w3tec';
import { useContainer as routingUseContainer } from 'routing-controllers';
import { useContainer as classValidatorUseContainer, Validator } from 'class-validator';
import { Logger } from '@/lib/logger';
import { Container } from 'typedi';

export const IoCLoader: MicroframeworkLoader = async (
    settings?: MicroframeworkSettings
): Promise<void> => {
    const logger: Logger = new Logger(__filename);

    // Register Validator manually in the container
    Container.set(Validator, new Validator());

    // Configure containers
    classValidatorUseContainer(Container);
    routingUseContainer(Container);

    // Register common constraint classes that class-validator needs
    registerConstraintClasses();

    logger.info('Dependency Injection initialized.');
};

/**
 * Register constraint classes in the TypeDI container
 * This prevents "Service with identifier was not found" errors
 */
function registerConstraintClasses() {
    // Create a custom container resolver for class-validator constraints
    const originalGet = Container.get.bind(Container);

    Container.get = function <T = any>(id: any): T {
        try {
            return originalGet(id);
        } catch (error) {
            // If service not found and it looks like a constraint class, create it
            if (
                error.name === 'ServiceNotFoundError' &&
                (typeof id === 'function' || (typeof id === 'string' && id.includes('Constraint')))
            ) {
                // For constraint classes, try to create a new instance
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
