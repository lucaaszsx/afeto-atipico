import {
    ValidationOptions,
    ValidateNested,
    IsOptional,
    IsNotEmpty,
    MinLength,
    MaxLength,
    IsString,
    Matches,
    IsArray,
    IsEmail,
    IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';

// String field: required
export function IsRequiredString(
    min?: number,
    max?: number,
    pattern?: RegExp,
    options?: ValidationOptions
) {
    return function (target: any, propertyKey: string) {
        IsString(options)(target, propertyKey);
        IsNotEmpty({ message: `${propertyKey} is required`, ...options })(target, propertyKey);

        if (min !== undefined) {
            MinLength(min, {
                message: `${propertyKey} must be at least ${min} characters long`,
                ...options
            })(target, propertyKey);
        }

        if (max !== undefined) {
            MaxLength(max, {
                message: `${propertyKey} must not exceed ${max} characters`,
                ...options
            })(target, propertyKey);
        }

        if (pattern) {
            Matches(pattern, {
                message: `${propertyKey} contains invalid characters`,
                ...options
            })(target, propertyKey);
        }
    };
}

// String field: optional
export function IsOptionalString(
    min?: number,
    max?: number,
    pattern?: RegExp,
    options?: ValidationOptions
) {
    return function (target: any, propertyKey: string) {
        IsOptional(options)(target, propertyKey);
        IsString(options)(target, propertyKey);

        if (min !== undefined) {
            MinLength(min, {
                message: `${propertyKey} must be at least ${min} characters long`,
                ...options
            })(target, propertyKey);
        }

        if (max !== undefined) {
            MaxLength(max, {
                message: `${propertyKey} must not exceed ${max} characters`,
                ...options
            })(target, propertyKey);
        }

        if (pattern) {
            Matches(pattern, {
                message: `${propertyKey} contains invalid characters`,
                ...options
            })(target, propertyKey);
        }
    };
}

// Email: required
export function IsRequiredEmail(options?: ValidationOptions) {
    return function (target: any, propertyKey: string) {
        IsEmail(
            {},
            {
                message: 'Email address is not valid. Valid format example: user@example.com',
                ...options
            }
        )(target, propertyKey);
        IsNotEmpty({ message: `${propertyKey} is required`, ...options })(target, propertyKey);
    };
}

// Email: optional
export function IsOptionalEmail(options?: ValidationOptions) {
    return function (target: any, propertyKey: string) {
        IsOptional(options)(target, propertyKey);
        IsEmail(
            {},
            {
                message: 'Email address is not valid. Valid format example: user@example.com',
                ...options
            }
        )(target, propertyKey);
    };
}

// Enum field: required
export function IsRequiredEnum<T>(entity: any, options?: ValidationOptions) {
    return function (target: any, propertyKey: string) {
        IsEnum(entity, { message: `Invalid ${propertyKey}.`, ...options })(target, propertyKey);
    };
}

// Enum field: optional
export function IsOptionalEnum<T>(entity: any, options?: ValidationOptions) {
    return function (target: any, propertyKey: string) {
        IsOptional(options)(target, propertyKey);
        IsEnum(entity, { message: `Invalid ${propertyKey}.`, ...options })(target, propertyKey);
    };
}

// Nested object: required
export function IsRequiredNested(typeFn: () => Function, options?: ValidationOptions) {
    return function (target: any, propertyKey: string) {
        ValidateNested({ ...options })(target, propertyKey);
        Type(typeFn)(target, propertyKey);
    };
}

// Nested object: optional
export function IsOptionalNested(typeFn: () => Function, options?: ValidationOptions) {
    return function (target: any, propertyKey: string) {
        IsOptional(options)(target, propertyKey);
        ValidateNested({ ...options })(target, propertyKey);
        Type(typeFn)(target, propertyKey);
    };
}

// Array of nested objects: optional
export function IsOptionalArrayOf(typeFn: () => Function, options?: ValidationOptions) {
    return function (target: any, propertyKey: string) {
        IsOptional(options)(target, propertyKey);
        IsArray({ ...options })(target, propertyKey);
        ValidateNested({ each: true, ...options })(target, propertyKey);
        Type(typeFn)(target, propertyKey);
    };
}

// Array of nested objects: required
export function IsRequiredArrayOf(typeFn: () => Function, options?: ValidationOptions) {
    return function (target: any, propertyKey: string) {
        IsArray({ ...options })(target, propertyKey);
        ValidateNested({ each: true, ...options })(target, propertyKey);
        Type(typeFn)(target, propertyKey);
    };
}
