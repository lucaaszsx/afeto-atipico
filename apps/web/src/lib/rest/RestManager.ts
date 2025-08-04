import {
    RestManagerConfig,
    RequestConfig,
    ApiResponse,
    AuthProvider,
    RetryConfig
} from './types/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { RequestError, ApiError } from './errors';
import { LoggerInterface, Logger } from '../logger';
import { ApiErrorCodes } from './assets/ApiCodes';

export class RestManager {
    private axiosInstance: AxiosInstance;
    private authProvider?: AuthProvider;
    private logger: LoggerInterface = new Logger(this.constructor.name);
    private isRefreshing = false;
    private failedQueue: Array<{
        resolve: (token: string) => void;
        reject: (error: any) => void;
    }> = [];
    private defaultRetryConfig: RetryConfig;
    
    constructor(config: RestManagerConfig) {
        this.logger.info(`Initializing RestManager with baseURL: ${config.baseURL}, timeout: ${config.timeout || 30000}ms`);
        this.authProvider = config.authProvider;
        this.defaultRetryConfig = config.retryConfig || {
            maxAttempts: 3,
            delayMs: 1000,
            backoffMultiplier: 2,
            maxDelayMs: 10000
        };
        
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
        this.logger.debug('RestManager initialized successfully');
    }

    private setupInterceptors(): void {
        this.logger.debug('Setting up request and response interceptors');
        
        this.axiosInstance.interceptors.request.use(
            (config) => {
                try {
                    this.logger.debug(`Processing ${config.method?.toUpperCase()} request to ${config.url}`);
                    
                    if (this.authProvider && !config.headers?.skipAuth) {
                        const token = this.authProvider.getToken();
                        
                        if (token) {
                            config.headers = config.headers || {};
                            config.headers.Authorization = `Bearer ${token}`;
                            this.logger.debug('Authentication token attached to request');
                        } else this.logger.debug('No authentication token available');
                    }
                    
                    return config;
                } catch (error) {
                    this.logger.warn(`Failed to get authentication token: ${error instanceof Error ? error.message : String(error)}`);
                    return config;
                }
            },
            (error) => {
                this.logger.error(`Request interceptor error: ${error instanceof Error ? error.message : String(error)}`);
                return Promise.reject(this.handleRequestError(error));
            }
        );

        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse<ApiResponse<any>>) => {
                this.logger.debug(`Response received: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
                
                if (response.data && typeof response.data === 'object' && 'error' in response.data) {
                    const apiResponse = response.data as ApiResponse;
                    
                    if (apiResponse.error) {
                        this.logger.warn(`API error detected in response: ${apiResponse.apiCode} - ${apiResponse.error.message}`);
                        
                        const apiError = ApiError.fromResponse(apiResponse);
                        console.log(apiError)
                        // Only call onUnauthorized for actual unauthorized API errors
                        if (apiError.isUnauthorized() && this.authProvider?.onUnauthorized) {
                            this.logger.info('Calling onUnauthorized callback for API unauthorized error');
                            this.authProvider.onUnauthorized();
                        }
                        
                        throw apiError;
                    }
                }
                
                return response;
            },
            async (error) => {
                this.logger.error(`Response interceptor error: ${error.response?.status} ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.message}`);
                
                const originalRequest = error.config;
                
                if (this.shouldAttemptTokenRefresh(error, originalRequest)) {
                    return this.handleTokenRefresh(originalRequest);
                }
                
                return Promise.reject(this.handleResponseError(error));
            }
        );
        
        this.logger.debug('Interceptors setup completed');
    }

    private shouldAttemptTokenRefresh(error: AxiosError, originalRequest: any): boolean {
        if (!this.authProvider?.refreshToken || originalRequest._retry || originalRequest.headers?.skipAuth) {
            return false;
        }

        if (error.response?.data) {
            const apiResponse = error.response.data as ApiResponse;
            return apiResponse.apiCode === ApiErrorCodes.ACCESS_TOKEN_EXPIRED;
        }

        return false;
    }

    private async handleTokenRefresh(originalRequest: any): Promise<AxiosResponse> {
        if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.axiosInstance(originalRequest);
            });
        }
    
        this.isRefreshing = true;
        originalRequest._retry = true;
    
        try {
            const refreshResult = await this.authProvider!.refreshToken!();
            
            if (!refreshResult.success || !refreshResult.data?.accessToken) {
                throw new Error('Token refresh failed');
            }
    
            const newToken = refreshResult.data.accessToken;
            this.processQueue(newToken);
            
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.axiosInstance(originalRequest);
        } catch (refreshError) {
            this.processQueue(null, refreshError);
            
            if (this.authProvider?.onUnauthorized) {
                this.logger.info('Calling onUnauthorized callback after token refresh failure');
                this.authProvider.onUnauthorized();
            }
            
            throw refreshError;
        } finally {
            this.isRefreshing = false;
        }
    }

    private processQueue(token: string | null, error: any = null): void {
        this.failedQueue.forEach(({ resolve, reject }) => {
            if (error) reject(error);
            else if (token) resolve(token);
            else reject(new Error('No token available'));
        });
        
        this.failedQueue = [];
    }

    private handleRequestError(error: any): Error {
        if (error instanceof ApiError || error instanceof RequestError) {
            this.logger.debug(`Request error already processed: ${error.constructor.name}`);
            return error;
        }

        if (axios.isAxiosError(error)) {
            this.logger.error(`Axios request error: ${error.message} (code: ${error.code})`);
            
            let errorCode: 'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'CANCELLED_ERROR' | 'REQUEST_FAILED';
            
            if (error.code === 'ECONNABORTED') errorCode = 'TIMEOUT_ERROR';
            else if (error.code === 'ERR_CANCELED') errorCode = 'CANCELLED_ERROR';
            else if (error.code === 'ERR_NETWORK') errorCode = 'NETWORK_ERROR';
            else errorCode = 'REQUEST_FAILED';
            
            return new RequestError(
                errorCode,
                'Request failed',
                error.message,
                { originalError: error, code: error.code }
            );
        }

        this.logger.error(`Unknown request error: ${error?.message || 'Unknown error'}`);
        return new RequestError(
            'UNKNOWN_REQUEST_ERROR',
            'Unknown request error',
            error?.message || 'Unknown error occurred during request',
            { originalError: error }
        );
    }

    private handleResponseError(error: AxiosError): Error {
        if (error instanceof ApiError || error instanceof RequestError) {
            this.logger.debug(`Response error already processed: ${error.constructor.name}`);
            return error;
        }

        if (axios.isAxiosError(error)) {
            const response = error.response;
            
            // If there's a response with API error structure, return ApiError
            if (response?.data && typeof response.data === 'object') {
                const apiResponse = response.data as ApiResponse;
                
                if (apiResponse.error && apiResponse.apiCode) {
                    this.logger.warn(`API error extracted from response: ${apiResponse.apiCode} - ${apiResponse.error.message}`);
                    return ApiError.fromResponse(apiResponse);
                }
            }

            // For non-API errors (network issues, etc.), return RequestError
            this.logger.error(`Network/HTTP error response: ${response?.status || 0} - ${error.message}`);
            
            let errorCode: 'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'CANCELLED_ERROR' | 'CONNECTION_ERROR' | 'REQUEST_FAILED';
            
            if (error.code === 'ECONNABORTED') errorCode = 'TIMEOUT_ERROR';
            else if (error.code === 'ERR_CANCELED') errorCode = 'CANCELLED_ERROR';
            else if (error.code === 'ERR_NETWORK' || !response) errorCode = 'NETWORK_ERROR';
            else if (response.status === 0) errorCode = 'CONNECTION_ERROR';
            else errorCode = 'REQUEST_FAILED';
            
            return new RequestError(
                errorCode,
                'Request failed',
                error.message,
                { 
                    originalError: error, 
                    statusCode: response?.status || 0,
                    responseData: response?.data 
                }
            );
        }

        this.logger.error(`Unknown response error: ${error?.message || 'Unknown error'}`);
        return new RequestError(
            'UNKNOWN_REQUEST_ERROR',
            'Unknown response error',
            error?.message || 'Unknown error occurred during response',
            { originalError: error }
        );
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private shouldRetry(error: Error, attempt: number, retryConfig: RetryConfig): boolean {
        if (attempt >= retryConfig.maxAttempts) return false;
        
        // Don't retry API errors (these are business logic errors)
        if (error instanceof ApiError) return false;
        
        // Only retry RequestErrors that are connectivity related
        if (error instanceof RequestError) {
            return error.isConnectivityError();
        }
        
        return false;
    }

    private async executeWithRetry<T>(
        operation: () => Promise<T>,
        retryConfig: RetryConfig,
        operationName: string
    ): Promise<T> {
        let lastError: Error;
        
        for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
            try {
                this.logger.debug(`${operationName} attempt ${attempt}/${retryConfig.maxAttempts}`);
                return await operation();
            } catch (error) {
                lastError = error as Error;
                
                if (!this.shouldRetry(lastError, attempt, retryConfig)) {
                    this.logger.debug(`${operationName} failed permanently: ${lastError.message}`);
                    throw lastError;
                }
                
                const delay = Math.min(
                    retryConfig.delayMs * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
                    retryConfig.maxDelayMs
                );
                
                this.logger.warn(`${operationName} attempt ${attempt} failed, retrying in ${delay}ms: ${lastError.message}`);
                await this.sleep(delay);
            }
        }
        
        throw lastError!;
    }

    public async request<T>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        endpoint: string,
        data?: any,
        config?: RequestConfig
    ): Promise<T> {
        const retryConfig = config?.retryConfig || this.defaultRetryConfig;
        const skipRetry = config?.skipRetry || false;
        const operationName = `${method} ${endpoint}`;
        
        this.logger.debug(`Making ${method} request to ${endpoint}${data ? ' with data' : ''}${config?.timeout ? ` (timeout: ${config.timeout}ms)` : ''}`);
        
        const operation = async (): Promise<T> => {
            const axiosConfig: AxiosRequestConfig = {
                method,
                url: endpoint,
                data,
                headers: config?.headers,
                timeout: config?.timeout,
                signal: config?.signal,
                withCredentials: config?.withCredentials,
                params: config?.params
            };
            
            const response = await this.axiosInstance.request<ApiResponse<T>>(axiosConfig);
            return this.extractResponseData<T>(response);
        };
        
        try {
            const result = skipRetry 
                ? await operation()
                : await this.executeWithRetry(operation, retryConfig, operationName);
            
            this.logger.debug(`Request completed successfully: ${method} ${endpoint}`);
            return result;
        } catch (error) {
            this.logger.error(`Request failed: ${method} ${endpoint} - ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    public async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        return this.request<T>('GET', endpoint, undefined, config);
    }

    public async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>('POST', endpoint, data, config);
    }

    public async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>('PUT', endpoint, data, config);
    }

    public async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>('PATCH', endpoint, data, config);
    }

    public async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        return this.request<T>('DELETE', endpoint, undefined, config);
    }

    public setAuthProvider(authProvider: AuthProvider): RestManager {
        this.logger.debug('Setting new auth provider');
        this.authProvider = authProvider;
        return this;
    }

    public setRetryConfig(retryConfig: RetryConfig): RestManager {
        this.logger.debug('Setting new retry configuration');
        this.defaultRetryConfig = retryConfig;
        return this;
    }

    private extractResponseData<T>(response: AxiosResponse<ApiResponse<T>>): T {
        const responseData = response.data;
        
        if (responseData && typeof responseData === 'object' && 'data' in responseData) {
            this.logger.debug('Extracted data from API response structure');
            return responseData.data as T;
        }
        
        this.logger.debug('Using raw response data');
        return responseData as unknown as T;
    }
}