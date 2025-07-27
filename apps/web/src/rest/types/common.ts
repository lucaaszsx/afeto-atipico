/**
 * Generic structure for all API responses.
 */
export interface ApiResponse<T = any> {
    path: string;
    success: boolean;
    statusCode: number;
    apiCode: number;
    data: T | null;
    error: {
        message: string;
        details: string[];
    } | null;
}

/**
 * Global configuration for the REST manager.
 */
export interface RestManagerConfig {
    baseURL: string;
    timeout?: number;
    defaultHeaders?: Record<string, string>;
    withCredentials?: boolean;
    onTokenExpired?: () => void;
    onUnauthorized?: () => void;
    onNetworkError?: (error: Error) => void;
}

/**
 * Configuration applied to individual requests.
 */
export interface RequestConfig {
    headers?: Record<string, string>;
    timeout?: number;
    withCredentials?: boolean;
    signal?: AbortSignal;
}

/**
 * Manages authentication state and hooks.
 */
export interface AuthContext {
    setAccessToken: (token: string | null) => void;
    getAccessToken: () => string | null;
    onAuthSuccess?: (data: { accessToken: string; user: any }) => void;
    onAuthFailure?: () => void;
}

/**
 * Represents a request waiting for a new access token.
 */
export interface QueuedRequest {
    resolve: (token: string) => void;
    reject: (error: any) => void;
}

/**
 * Contains metadata about a specific request.
 */
export interface RequestInfo {
    method: string;
    endpoint: string;
    data?: any;
    config?: RequestConfig;
    attempt: number;
    timestamp: number;
}

/**
 * Optional callbacks for request lifecycle events.
 */
export interface CallbackConfig {
    onSuccess?: RequestSuccessCallback;
    onError?: RequestErrorCallback;
    onResponse?: ResponseInterceptor;
    throwOnError?: boolean;
}

/**
 * Groups callback configurations by context.
 */
export interface RestManagerCallbacks {
    global?: CallbackConfig;
    auth?: CallbackConfig;
    api?: CallbackConfig;
}

/**
 * Called on successful request completion.
 */
export type RequestSuccessCallback<T = any> = (data: T, requestInfo: RequestInfo) => T | Promise<T>;

/**
 * Called when a request fails.
 */
export type RequestErrorCallback = (error: ApiError | Error, requestInfo: RequestInfo) => ApiError | Error | void | Promise<ApiError | Error | void>;

/**
 * Called on every response, before it's returned.
 */
export type ResponseInterceptor<T = any> = (response: ApiResponse<T>, requestInfo: RequestInfo) => ApiResponse<T> | Promise<ApiResponse<T>>;