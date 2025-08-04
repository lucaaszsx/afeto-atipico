/**
 * @file ApiResponse.ts
 * @description Centralized API response handler.
 * @author Lucas
 * @license MIT
 */

import { InternalErrorException } from './exceptions/infra/InternalError';
import { ApiSuccessCodes, ApiErrorCodes } from './ApiCodes';
import { ApiCodeHTTPMap } from './ApiCodeHTTPMap';
import { ApiErrorMessages } from './ApiMessages';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import type { Request, Response } from 'express';
import type { ApiResponse } from '@/types/common';

/**
 * Defines the input structure for creating a standardized API response.
 */
interface CreateApiResponseOptions<T = any> {
    /** Internal response code representing the result of the operation. */
    apiCode: ApiSuccessCodes | ApiErrorCodes;

    /** Optional payload to include in the response. */
    data?: T | null;

    /** In case of error, details will be provided to the user */
    errorDetails?: string[];

    /** The API resource path */
    path?: string;
}

/**
 * Creates a standardized API response object based on the given parameters.
 *
 * This function is responsible for building the response structure used across
 * the application, including success flags, API codes, HTTP status codes,
 * payload data, and optional error details.
 *
 * @param options - Object containing API code, data, error details, and optionally the request path.
 *
 * @throws {InternalErrorException} If the provided apiCode is invalid.
 *
 * @returns A structured {@link ApiResponse} object.
 */
export const createApiResponse = <T = any>({
    data = null,
    errorDetails = [],
    apiCode,
    path = 'unknown'
}: CreateApiResponseOptions<T>): ApiResponse<T> => {
    if (
        !Object.values(ApiSuccessCodes).includes(apiCode as number) &&
        !Object.values(ApiErrorCodes).includes(apiCode as number)
    )
        throw new InternalErrorException([
            `Invalid or missing "apiCode" in createApiResponse: ${apiCode}`
        ]);

    const isSuccess = apiCode >= 1000 && apiCode < 2000;
    const statusCode = ApiCodeHTTPMap[apiCode];
    const timestamp = new Date().toISOString();

    if (isSuccess) {
        return {
            success: true,
            statusCode,
            apiCode: apiCode as ApiSuccessCodes,
            data: data as T,
            error: null,
            path,
            timestamp
        } as ApiResponse<T>;
    } else {
        const message = isSuccess 
            ? getReasonPhrase(statusCode) || 'Unknown message'
            : ApiErrorMessages[apiCode as ApiErrorCodes] || getReasonPhrase(statusCode) || 'Unknown message';

        return {
            success: false,
            statusCode,
            apiCode: apiCode as ApiErrorCodes,
            data: null,
            error: {
                message,
                details: errorDetails
            },
            path,
            timestamp
        } as ApiResponse<T>;
    }
};

/**
 * Sends a standardized API response using Express's response object.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 * @param options - Options for constructing the API response.
 *
 * @returns The finalized Express response.
 */
export const sendApiResponse = <T = any>(
    req: Request,
    res: Response<ApiResponse<T>>,
    options: CreateApiResponseOptions<T>
): Response<ApiResponse<T>> => {
    const response = createApiResponse({
        ...options,
        path: options.path ?? req.path
    });

    return res.status(response.statusCode).json(response);
};