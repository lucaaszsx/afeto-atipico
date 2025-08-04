/**
 * @file EventDispatcherDecorator.ts
 * @description Provides a custom dependency injection decorator for event dispatching using TypeDI and EventDispatcher. Enables automatic injection of EventDispatcher instances into services, controllers, etc.
 * @author Lucas
 * @license MIT
 */

import { EventDispatcher } from 'event-dispatch';
import { Container } from 'typedi';

/**
 * Dependency injection decorator for injecting an EventDispatcher instance using TypeDI.
 * Provides a centralized event dispatching mechanism for the application.
 *
 * @returns ParameterDecorator function to be used on constructor parameters
 */
export function EventDispatcherDecorator(): ParameterDecorator {
    return (targetClass: any, propertyKey, parameterIndex): void => {
        const eventDispatcher = new EventDispatcher();

        Container.registerHandler({
            object: targetClass,
            propertyName: propertyKey ? propertyKey.toString() : '',
            index: parameterIndex,
            value: () => eventDispatcher
        });
    };
}