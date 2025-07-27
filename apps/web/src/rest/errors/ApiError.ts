import { ApiErrorCodes } from '../assets/ApiCodes';

export default class ApiError extends Error {
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
    }
    
    static fromResponse(response: ApiResponse): ApiError {
        return new ApiError(
            response.apiCode as ApiErrorCodes,
            response.statusCode,
            response.error?.message,
            response.error?.details || []
        );
    }
}