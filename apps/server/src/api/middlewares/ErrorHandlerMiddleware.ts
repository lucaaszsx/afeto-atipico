/**
 * @file ErrorHandlerMiddleware.ts
 * @description Error handler middleware responsible for catching and handling all application exceptions.
 * Maps custom exceptions to appropriate HTTP status codes and API responses.
 * Provides detailed validation error feedback for client-side debugging.
 * @author Lucas
 * @license MIT
 */

import {
    ExpressErrorMiddlewareInterface,
    Middleware,
    HttpError,
    BadRequestError
} from 'routing-controllers';
import { ApiErrorCodes, sendApiResponse } from '../responses';
import { Request, Response, NextFunction } from 'express';
import { LoggerInterface } from '../../lib/logger';
import { LoggerDecorator } from '../../decorators';
import { BaseException } from '../responses/exceptions/Base';
import { ValidationError } from 'class-validator';
import type { ApiResponse } from '@/types/common';
import { EnvConfig } from '@/config/env';
import { Service } from 'typedi';

// Extend BadRequestError interface to include errors property
interface ExtendedBadRequestError extends BadRequestError {
    errors?: ValidationError[];
}

@Middleware({ type: 'after' })
@Service()
export default class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
    constructor(
        @LoggerDecorator(__filename)
        private readonly logger: LoggerInterface
    ) {}

    error(
        error: any,
        req: Request,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Response<ApiResponse> | void {
        const isExpectedError =
            error.name === 'NotFoundException' || error.name === 'ValidationException';

        // Log the error with cleaner format
        if (isExpectedError) {
            this.logger.warn(
                `[${error.name}] ${error.message} | ${req.method} ${req.url} | IP: ${req.ip}`
            );
        } else {
            this.logger.error(
                `[${error.name}] ${error.message} | ${req.method} ${req.url} | IP: ${req.ip}`,
                {
                    error: error.message,
                    stack: error.stack?.split('\n').slice(0, 3).join('\n'), // Only first 3 lines of stack
                    userAgent: req.get('User-Agent')
                }
            );
        }

        // Handle custom BaseException errors
        if (error instanceof BaseException) {
            return sendApiResponse(req, res, {
                apiCode: error.apiCode,
                errorDetails: error.details
            });
        }

        // Handle BadRequestError from routing-controllers (validation errors)
        if (error instanceof BadRequestError) {
            const extendedError = error as ExtendedBadRequestError;
            // Check if it has validation errors in the 'errors' property
            if (extendedError.errors && Array.isArray(extendedError.errors)) {
                // Check if these are ValidationError objects from class-validator
                if (
                    extendedError.errors.every(
                        (e: any) => e instanceof ValidationError || (e.property && e.constraints)
                    )
                ) {
                    const details = this.extractValidationErrors(extendedError.errors);

                    return sendApiResponse(req, res, {
                        apiCode: ApiErrorCodes.VALIDATION_FAILED,
                        errorDetails: details
                    });
                }
            }

            // Fallback for other BadRequestError cases
            return sendApiResponse(req, res, {
                apiCode: ApiErrorCodes.VALIDATION_FAILED,
                errorDetails: [error.message || 'Invalid request body']
            });
        }

        // Handle direct ValidationError array (fallback case)
        if (
            Array.isArray(error?.errors) &&
            error.errors.every(
                (e: any) => e instanceof ValidationError || (e.property && e.constraints)
            )
        ) {
            const details = this.extractValidationErrors(error.errors);

            return sendApiResponse(req, res, {
                apiCode: ApiErrorCodes.VALIDATION_FAILED,
                errorDetails: details
            });
        }

        // Handle generic HttpError
        if (error instanceof HttpError) {
            return sendApiResponse(req, res, {
                apiCode: ApiErrorCodes.VALIDATION_FAILED,
                errorDetails: [error.message || 'Bad request']
            });
        }

        // Handle unexpected errors
        return sendApiResponse(req, res, {
            apiCode: ApiErrorCodes.INTERNAL_SERVER_ERROR,
            errorDetails:
                EnvConfig.Environment.node === 'dev'
                    ? [error.message || 'Internal server error']
                    : undefined
        });
    }

    private extractValidationErrors(errors: ValidationError[], parentPath = ''): string[] {
        const messages: string[] = [];

        for (const error of errors) {
            const propertyPath = parentPath ? `${parentPath}.${error.property}` : error.property;

            if (error.constraints) {
                for (const constraint of Object.values(error.constraints)) {
                    messages.push(`${propertyPath}: ${constraint}`);
                }
            }

            if (error.children && error.children.length > 0) {
                messages.push(...this.extractValidationErrors(error.children, propertyPath));
            }
        }

        return messages;
    }
}