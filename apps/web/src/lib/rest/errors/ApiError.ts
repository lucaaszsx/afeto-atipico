import { ApiErrorCodes } from '../assets/ApiCodes';
import { ApiErrorMessages } from '../assets/ApiMessages';
import { ApiResponse } from '../types/common';

export class ApiError extends Error {
    public readonly apiCode: ApiErrorCodes;
    public readonly statusCode: number;
    public readonly details: string[];
    public readonly isApiError = true;
    
    constructor(
        apiCode: ApiErrorCodes,
        statusCode: number,
        message?: string,
        details: string[] = []
    ) {
        super(message || ApiErrorMessages[apiCode] || 'Unknown API error');
        this.apiCode = apiCode;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'ApiError';
        
        // Preserve stack trace if available
        if (Error.captureStackTrace) Error.captureStackTrace(this, ApiError);
    }
    
    static fromResponse(response: ApiResponse): ApiError {
        return new ApiError(
            response.apiCode as ApiErrorCodes,
            response.statusCode,
            response.error?.message,
            response.error?.details || []
        );
    }
    
    // Method to check if it's an unauthorized error
    isUnauthorized(): boolean {
        return this.apiCode === ApiErrorCodes.ACCESS_TOKEN_EXPIRED ||
               this.apiCode === ApiErrorCodes.ACCESS_TOKEN_MISSING ||
               this.apiCode === ApiErrorCodes.INVALID_ACCESS_TOKEN ||
               this.apiCode === ApiErrorCodes.REFRESH_TOKEN_EXPIRED ||
               this.apiCode === ApiErrorCodes.INVALID_REFRESH_TOKEN;
    }
}