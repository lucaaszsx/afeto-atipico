/**
 * @file UserDecorator.ts
 * @description Provides custom decorators for injecting the current user into controller methods.
 * Includes a strict variant that enforces authentication and a permissive one for optional context.
 * Requires a tolerant currentUserChecker (e.g., maybeUserChecker) configured globally.
 * Enables authentication validation directly at the parameter level without external middleware logic.
 * Suitable for class-based APIs using routing-controllers and TypeDI integration with JWT-based auth flows.
 * @author Lucas
 * @license MIT
 */

import { UserNotFoundException } from '@/api/responses';
import { CurrentUser as NativeCurrentUser } from 'routing-controllers';
import { IUser } from '@/types/entities';

/**
 * Injects the current authenticated user.
 * Throws UnauthorizedError if no user is present.
 *
 * @returns ParameterDecorator injecting a guaranteed IUser instance
 */
export function RequiredUser() {
    return function(target: any, propertyKey: string | symbol, parameterIndex: number) {
        NativeCurrentUser({ required: true })(target, String(propertyKey), parameterIndex);
        
        const originalDescriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        const originalMethod = originalDescriptor?.value || target[propertyKey];
        
        if (originalMethod) {
            const wrappedMethod = async function(this: any, ...args: any[]) {
                const user = args[parameterIndex];
                
                if (!user) throw new UserNotFoundException();
                
                return await originalMethod.apply(this, args);
            };
            
            if (originalDescriptor) Object.defineProperty(target, propertyKey, {
                ...originalDescriptor,
                value: wrappedMethod
            });
            else target[propertyKey] = wrappedMethod;
        }
    };
}

/**
 * Injects the current user if available, or null otherwise.
 *
 * @returns ParameterDecorator injecting an IUser or null
 */
export function OptionalUser() {
    return NativeCurrentUser({ required: false });
}