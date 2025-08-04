import { AxiosRequestConfig, AxiosResponse } from 'axios';

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
 * Retry configuration for failed requests.
 */
export interface RetryConfig {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier: number;
    maxDelayMs: number;
}

/**
 * Global configuration for the REST manager.
 */
export interface RestManagerConfig {
    baseURL: string;
    timeout?: number;
    defaultHeaders?: Record<string, string>;
    withCredentials?: boolean;
    authProvider?: AuthProvider;
    retryConfig?: RetryConfig;
}

/**
 * Configuration applied to individual requests.
 */
export interface RequestConfig {
    headers?: Record<string, string>;
    timeout?: number;
    withCredentials?: boolean;
    signal?: AbortSignal;
    params?: Record<string, any>;
    retryConfig?: RetryConfig;
    skipRetry?: boolean;
}

/**
 * Authentication provider interface.
 */
export interface AuthProvider {
    getToken(): string | null;
    getCurrentUser(): any | null;
    setCurrentUser(user: any | null): void;
    onUnauthorized(): void;
    refreshToken?(): Promise<{ success: boolean; data: { accessToken: string } }>;
}