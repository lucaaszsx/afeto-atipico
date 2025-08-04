export type RequestErrorCode = 
    | 'NETWORK_ERROR'
    | 'TIMEOUT_ERROR'
    | 'CANCELLED_ERROR'
    | 'CONNECTION_ERROR'
    | 'REQUEST_FAILED'
    | 'UNKNOWN_REQUEST_ERROR';

export class RequestError extends Error {
    public readonly errorCode: RequestErrorCode;
    public readonly title: string;
    public readonly isRequestError = true;
    public readonly success = false;
    public readonly metadata: Record<string, any>;
    
    constructor(
        errorCode: RequestErrorCode,
        title: string,
        message: string,
        metadata: Record<string, any> = {}
    ) {
        super(message);
        
        this.errorCode = errorCode;
        this.title = title;
        this.metadata = metadata;
        this.name = 'RequestError';
        
        // Preserve stack trace if available
        if (Error.captureStackTrace) Error.captureStackTrace(this, RequestError);
    }
    
    // Method to check if it's a specific error type
    isErrorCode(code: RequestErrorCode): boolean {
        return this.errorCode === code;
    }
    
    // Method to check if it's a network connectivity error
    isConnectivityError(): boolean {
        return this.errorCode === 'NETWORK_ERROR' || 
               this.errorCode === 'CONNECTION_ERROR' ||
               this.errorCode === 'TIMEOUT_ERROR';
    }
    
    // Method to get original error from metadata
    getOriginalError(): Error | undefined {
        return this.metadata.originalError;
    }
}