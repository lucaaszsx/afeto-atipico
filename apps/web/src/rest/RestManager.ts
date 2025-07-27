import {
    RequestSuccessCallback,
    RequestErrorCallback,
    RestManagerCallbacks,
    ResponseInterceptor,
    RestManagerConfig,
    CallbackConfig,
    QueuedRequest,
    RequestConfig,
    RequestInfo,
    ApiResponse,
    AuthContext
} from './types/common';
import {
    IResendEmailVerificationRequestDTO,
    IRegisterUserRequestDTO,
    IVerifyEmailRequestDTO,
    ILoginUserRequestDTO
} from './types/dtos/requests/AuthRequests';
import {
    IRegisterUserResponseDTO,
    ILoginUserResponseDTO
} from './types/dtos/responses/AuthResponses';
import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';
import { ApiErrorCodes } from './assets/ApiCodes';
import ApiRoutes from './assets/ApiRoutes';
import ApiError from './errors/ApiError';

export default class RestManager {
    private axiosInstance: AxiosInstance;
    private authContext?: AuthContext;
    private onTokenExpired?: () => void;
    private onUnauthorized?: () => void;
    private onNetworkError?: (error: Error) => void;
    private isRefreshing = false;
    private failedQueue: QueuedRequest[] = [];
    private maxRetryAttempts = 3;
    private retryDelay = 1000;
    private callbacks: RestManagerCallbacks = {};

    constructor(config: RestManagerConfig & { 
        authContext?: AuthContext;
        callbacks?: RestManagerCallbacks;
    }) {
        this.authContext = config.authContext;
        this.onTokenExpired = config.onTokenExpired;
        this.onUnauthorized = config.onUnauthorized;
        this.onNetworkError = config.onNetworkError;
        this.callbacks = config.callbacks || {};
        
        this.axiosInstance = axios.create({
            baseURL: config.baseURL.replace(/\/$/, ''),
            timeout: config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
                ...config.defaultHeaders
            },
            withCredentials: config.withCredentials ?? true
        });
        
        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = this.authContext?.getAccessToken();
                
                if (token) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${token}`;
                }
                
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse<ApiResponse<any>>) => {
                const responseData = response.data;
                
                if (!responseData.success) {
                    const apiError = ApiError.fromResponse(responseData);
                    throw apiError;
                }
                
                return response;
            },
            async (error) => {
                const originalRequest = error.config;

                // Handle network errors
                if (this.isNetworkError(error)) {
                    const networkError = new Error(this.getNetworkErrorMessage(error));
                    this.onNetworkError?.(networkError);
                    throw networkError;
                }

                // Handle API response errors
                if (error.response?.data) {
                    const responseData: ApiResponse<any> = error.response.data;
                    if (!responseData.success) {
                        const apiError = ApiError.fromResponse(responseData);
                        
                        // Handle token expiration
                        if (this.isTokenExpiredError(apiError)) {
                            return this.handleTokenExpired(originalRequest);
                        }
                        
                        // Handle unauthorized access
                        if (this.isUnauthorizedError(apiError)) {
                            this.handleUnauthorized();
                        }
                        
                        throw apiError;
                    }
                }
                
                // Handle 401 status without API response structure
                if (error.response?.status === 401) {
                    return this.handleTokenExpired(originalRequest);
                }
                
                throw error;
            }
        );
    }

    private isNetworkError(error: any): boolean {
        return error.code === 'ECONNABORTED' || 
               error.code === 'ERR_NETWORK' || 
               error.message?.includes('timeout') ||
               !error.response;
    }

    private getNetworkErrorMessage(error: any): string {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return 'Request timeout';
        }
        return 'Network error';
    }

    private isTokenExpiredError(apiError: ApiError): boolean {
        return apiError.apiCode === ApiErrorCodes.ACCESS_TOKEN_EXPIRED ||
               apiError.apiCode === ApiErrorCodes.INVALID_ACCESS_TOKEN;
    }

    private isUnauthorizedError(apiError: ApiError): boolean {
        return apiError.apiCode === ApiErrorCodes.AUTHENTICATION_FAILED ||
               apiError.apiCode === ApiErrorCodes.FORBIDDEN;
    }

    private handleUnauthorized(): void {
        if (this.authContext) {
            this.authContext.setAccessToken(null);
            this.authContext.onAuthFailure?.();
        }
        this.onUnauthorized?.();
    }

    private async handleTokenExpired(originalRequest: any): Promise<any> {
        // Prevent infinite retry loops
        if (originalRequest._retry) {
            this.handleAuthFailure();
            throw new ApiError(
                ApiErrorCodes.ACCESS_TOKEN_EXPIRED,
                401,
                'Unable to refresh token'
            );
        }

        // If already refreshing, queue the request
        if (this.isRefreshing) {
            return this.queueRequest(originalRequest);
        }

        originalRequest._retry = true;
        this.isRefreshing = true;

        try {
            const refreshResponse = await this.refreshAccessToken();
            const newToken = refreshResponse.accessToken;

            // Update auth context
            if (this.authContext) {
                this.authContext.setAccessToken(newToken);
                this.authContext.onAuthSuccess?.(refreshResponse);
            }

            // Process queued requests
            this.processQueuedRequests(newToken);

            // Retry original request
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            return this.axiosInstance(originalRequest);
        } catch (refreshError) {
            // Clear queue and handle auth failure
            this.clearQueueWithError(refreshError);
            this.handleAuthFailure();
            throw refreshError;
        } finally {
            this.isRefreshing = false;
        }
    }

    private queueRequest(originalRequest: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.failedQueue.push({
                resolve: (token: string) => {
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    resolve(this.axiosInstance(originalRequest));
                },
                reject
            });
        });
    }

    private processQueuedRequests(newToken: string): void {
        this.failedQueue.forEach(({ resolve }) => resolve(newToken));
        this.failedQueue = [];
    }

    private clearQueueWithError(error: any): void {
        this.failedQueue.forEach(({ reject }) => reject(error));
        this.failedQueue = [];
    }

    private handleAuthFailure(): void {
        if (this.authContext) {
            this.authContext.setAccessToken(null);
            this.authContext.onAuthFailure?.();
        }
        this.onTokenExpired?.();
    }

    private async refreshAccessToken(): Promise<{ accessToken: string; user: any }> {
        try {
            const response = await this.axiosInstance.post<ApiResponse<{ accessToken: string; user: any }>>(
                ApiRoutes.refreshToken(),
                {}, 
                { 
                    _skipAuthInterceptor: true // Prevent infinite loops
                }
            );

            if (!response.data.success || !response.data.data) {
                throw new ApiError(
                    ApiErrorCodes.REFRESH_TOKEN_EXPIRED,
                    401,
                    'Failed to refresh access token'
                );
            }

            return response.data.data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(
                ApiErrorCodes.REFRESH_TOKEN_EXPIRED,
                401,
                'Refresh token failed'
            );
        }
    }

    public setAuthContext(authContext: AuthContext): void {
        this.authContext = authContext;
    }

    public async forceRefreshToken(): Promise<{ accessToken: string; user: any }> {
        // If already refreshing, wait for it to complete
        if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
                this.failedQueue.push({ 
                    resolve: (token: string) => {
                        // We need to get the user data somehow, but for forced refresh
                        // we'll return the current token and null user as a fallback
                        resolve({ accessToken: token, user: null });
                    },
                    reject 
                });
            });
        }

        this.isRefreshing = true;
        try {
            const result = await this.refreshAccessToken();
            
            if (this.authContext) {
                this.authContext.setAccessToken(result.accessToken);
                this.authContext.onAuthSuccess?.(result);
            }

            this.processQueuedRequests(result.accessToken);
            return result;
        } finally {
            this.isRefreshing = false;
        }
    }

    private async executeWithCallbacks<T>(
        requestFn: () => Promise<T>,
        requestInfo: RequestInfo,
        callbackType: keyof RestManagerCallbacks = 'api'
    ): Promise<T | null> {
        try {
            const result = await requestFn();
            
            // Execute success callback
            const successCallback = this.callbacks[callbackType]?.onSuccess || this.callbacks.global?.onSuccess;
            if (successCallback) {
                const processedResult = await successCallback(result, requestInfo);
                return processedResult;
            }
            
            return result;
        } catch (error) {
            // Execute error callback
            const errorCallback = this.callbacks[callbackType]?.onError || this.callbacks.global?.onError;
            
            if (errorCallback) {
                const processedError = await errorCallback(error, requestInfo);
                
                if (processedError) {
                    // If callback returns an error, throw it only if throwOnError is true
                    const shouldThrow = this.callbacks[callbackType]?.throwOnError ?? this.callbacks.global?.throwOnError ?? false;
                    if (shouldThrow) {
                        throw processedError;
                    }
                }
                
                // If callback handles the error (returns void), return null
                return null;
            }
            
            // If no error callback, check if we should throw
            const shouldThrow = this.callbacks[callbackType]?.throwOnError ?? this.callbacks.global?.throwOnError ?? false;
            if (shouldThrow) {
                throw error;
            }
            
            // Default behavior: return null for errors when no callback handles them
            return null;
        }
    }

    private async processResponse<T>(
        response: ApiResponse<T>,
        requestInfo: RequestInfo,
        callbackType: keyof RestManagerCallbacks = 'api'
    ): Promise<ApiResponse<T>> {
        const responseCallback = this.callbacks[callbackType]?.onResponse || this.callbacks.global?.onResponse;
        
        if (responseCallback) {
            return await responseCallback(response, requestInfo);
        }
        
        return response;
    }

    public setCallbacks(callbacks: RestManagerCallbacks): void {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    public updateCallbacks(type: keyof RestManagerCallbacks, config: CallbackConfig): void {
        this.callbacks[type] = { ...this.callbacks[type], ...config };
    }

    public clearCallbacks(type?: keyof RestManagerCallbacks): void {
        if (type) {
            delete this.callbacks[type];
        } else {
            this.callbacks = {};
        }
    }
    
    public async retryRequest<T>(
        requestFn: () => Promise<T>,
        maxAttempts = this.maxRetryAttempts
    ): Promise<T> {
        let lastError: any;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error;
                
                // Don't retry certain types of errors
                if (error instanceof ApiError) {
                    if (this.isTokenExpiredError(error) || 
                        this.isUnauthorizedError(error) ||
                        error.statusCode >= 400 && error.statusCode < 500) {
                        throw error;
                    }
                }
                
                // Don't retry on last attempt
                if (attempt === maxAttempts) {
                    break;
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
            }
        }
        
        throw lastError;
    }
    
    private async request<T>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        endpoint: string,
        data?: any,
        config?: RequestConfig,
        callbackType: keyof RestManagerCallbacks = 'api'
    ): Promise<T | null> {
        const requestInfo: RequestInfo = {
            method,
            endpoint,
            data,
            config,
            attempt: 1,
            timestamp: Date.now()
        };

        const requestFn = async (): Promise<T> => {
            const axiosConfig: AxiosRequestConfig = {
                method,
                url: endpoint,
                data,
                headers: config?.headers,
                timeout: config?.timeout,
                signal: config?.signal,
                withCredentials: config?.withCredentials
            };

            const response = await this.axiosInstance.request<ApiResponse<T>>(axiosConfig);
            
            // Process response through callbacks
            const processedResponse = await this.processResponse(response.data, requestInfo, callbackType);
            return processedResponse.data as T;
        };

        return this.executeWithCallbacks(() => this.retryRequest(requestFn), requestInfo, callbackType);
    }
    
    public async get<T>(endpoint: string, config?: RequestConfig & { callbacks?: keyof RestManagerCallbacks }): Promise<T | null> {
        const { callbacks: callbackType = 'api', ...requestConfig } = config || {};
        return this.request<T>('GET', endpoint, undefined, requestConfig, callbackType);
    }
    
    public async post<T>(endpoint: string, data?: any, config?: RequestConfig & { callbacks?: keyof RestManagerCallbacks }): Promise<T | null> {
        const { callbacks: callbackType = 'api', ...requestConfig } = config || {};
        return this.request<T>('POST', endpoint, data, requestConfig, callbackType);
    }
    
    public async put<T>(endpoint: string, data?: any, config?: RequestConfig & { callbacks?: keyof RestManagerCallbacks }): Promise<T | null> {
        const { callbacks: callbackType = 'api', ...requestConfig } = config || {};
        return this.request<T>('PUT', endpoint, data, requestConfig, callbackType);
    }
    
    public async patch<T>(endpoint: string, data?: any, config?: RequestConfig & { callbacks?: keyof RestManagerCallbacks }): Promise<T | null> {
        const { callbacks: callbackType = 'api', ...requestConfig } = config || {};
        return this.request<T>('PATCH', endpoint, data, requestConfig, callbackType);
    }
    
    public async delete<T>(endpoint: string, config?: RequestConfig & { callbacks?: keyof RestManagerCallbacks }): Promise<T | null> {
        const { callbacks: callbackType = 'api', ...requestConfig } = config || {};
        return this.request<T>('DELETE', endpoint, undefined, requestConfig, callbackType);
    }
    
    // Auth methods
    public async register(data: IRegisterUserRequestDTO): Promise<IRegisterUserResponseDTO | null> {
        return this.request<IRegisterUserResponseDTO>('POST', ApiRoutes.register(), data, undefined, 'auth');
    }
    
    public async login(data: ILoginUserRequestDTO): Promise<ILoginUserResponseDTO | null> {
        const requestInfo: RequestInfo = {
            method: 'POST',
            endpoint: ApiRoutes.login(),
            data,
            attempt: 1,
            timestamp: Date.now()
        };

        const requestFn = async (): Promise<ILoginUserResponseDTO> => {
            const result = await this.axiosInstance.post<ApiResponse<ILoginUserResponseDTO>>(
                ApiRoutes.login(), 
                data
            );
            
            const processedResponse = await this.processResponse(result.data, requestInfo, 'auth');
            const loginResult = processedResponse.data as ILoginUserResponseDTO;
            
            if (this.authContext && loginResult.accessToken) {
                this.authContext.setAccessToken(loginResult.accessToken);
                this.authContext.onAuthSuccess?.(loginResult);
            }
            
            return loginResult;
        };

        return this.executeWithCallbacks(requestFn, requestInfo, 'auth');
    }

    public async logout(): Promise<void | null> {
        const requestInfo: RequestInfo = {
            method: 'POST',
            endpoint: ApiRoutes.logout(),
            attempt: 1,
            timestamp: Date.now()
        };

        const requestFn = async (): Promise<void> => {
            try {
                await this.axiosInstance.post<ApiResponse<void>>(ApiRoutes.logout());
            } catch (error) {
                // Even if logout fails on server, clear local auth
                console.warn('Logout request failed, but clearing local auth:', error);
            } finally {
                if (this.authContext) {
                    this.authContext.setAccessToken(null);
                    this.authContext.onAuthFailure?.();
                }
            }
        };

        return this.executeWithCallbacks(requestFn, requestInfo, 'auth');
    }

    public async verifyEmail(data: IVerifyEmailRequestDTO): Promise<null> {
        return this.request<null>('POST', ApiRoutes.verifyEmail(), data, undefined, 'auth');
    }
    
    public async resendEmailVerification(data: IResendEmailVerificationRequestDTO): Promise<null> {
        return this.request<null>('POST', ApiRoutes.resendEmailVerification(), data, undefined, 'auth');
    }
}