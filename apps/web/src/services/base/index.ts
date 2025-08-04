import type { NetworkError, ApiError } from '@/types/errors';
import type { RestManager, RequestConfig } from '@/lib/rest';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type ServiceResult<T> = {
    data: T | null;
    error: ApiError | NetworkError | null;
    success: boolean;
};

export abstract class BaseService {
    protected restManager: RestManager;
    private _isLoading: boolean = false;
    private loadingOperations: Set<string> = new Set();

    constructor(restManager: RestManager) {
        this.restManager = restManager;
    }

    /**
     * Executes HTTP request safely with error handling
     * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH)
     * @param endpoint - API endpoint
     * @param data - Data to send (optional, only for methods that support body)
     * @param config - Additional request configuration
     * @param operationId - Unique ID for loading control (optional)
     */
    protected async run<T>(
        method: HttpMethod,
        endpoint: string,
        data?: any,
        config?: RequestConfig,
        operationId?: string
    ): Promise<ServiceResult<T>> {
        const opId = operationId || `${method}:${endpoint}`;
        
        try {
            this.setLoading(true, opId);
            
            let result: T;
            
            // Use the appropriate method based on HTTP method
            switch (method.toUpperCase()) {
                case 'GET':
                    result = await this.restManager.get<T>(endpoint, config);
                    break;
                case 'POST':
                    result = await this.restManager.post<T>(endpoint, data, config);
                    break;
                case 'PUT':
                    result = await this.restManager.put<T>(endpoint, data, config);
                    break;
                case 'PATCH':
                    result = await this.restManager.patch<T>(endpoint, data, config);
                    break;
                case 'DELETE':
                    result = await this.restManager.delete<T>(endpoint, config);
                    break;
                default:
                    throw new Error(`Unsupported HTTP method: ${method}`);
            }
            
            return {
                data: result,
                error: null,
                success: true
            };
            
        } catch (error) {
            // RestManager already converts errors to ApiError or NetworkError
            const serviceError = error as ApiError | NetworkError;
            
            return {
                data: null,
                error: serviceError,
                success: false
            };
        } finally {
            this.setLoading(false, opId);
        }
    }

    /**
     * Convenience methods for different request types
     */
    protected async get<T>(
        endpoint: string,
        config?: RequestConfig,
        operationId?: string
    ): Promise<ServiceResult<T>> {
        return this.run<T>('GET', endpoint, undefined, config, operationId);
    }

    protected async post<T>(
        endpoint: string,
        data?: any,
        config?: RequestConfig,
        operationId?: string
    ): Promise<ServiceResult<T>> {
        return this.run<T>('POST', endpoint, data, config, operationId);
    }

    protected async put<T>(
        endpoint: string,
        data?: any,
        config?: RequestConfig,
        operationId?: string
    ): Promise<ServiceResult<T>> {
        return this.run<T>('PUT', endpoint, data, config, operationId);
    }

    protected async patch<T>(
        endpoint: string,
        data?: any,
        config?: RequestConfig,
        operationId?: string
    ): Promise<ServiceResult<T>> {
        return this.run<T>('PATCH', endpoint, data, config, operationId);
    }

    protected async delete<T>(
        endpoint: string,
        config?: RequestConfig,
        operationId?: string
    ): Promise<ServiceResult<T>> {
        return this.run<T>('DELETE', endpoint, undefined, config, operationId);
    }

    /**
     * Loading control
     */
    private setLoading(loading: boolean, operationId: string): void {
        if (loading) this.loadingOperations.add(operationId);
        else this.loadingOperations.delete(operationId);
        
        this._isLoading = this.loadingOperations.size > 0;
    }

    /**
     * Checks if the service is running any operation
     */
    public get isLoading(): boolean {
        return this._isLoading;
    }

    /**
     * Checks if a specific operation is running
     */
    public isOperationLoading(operationId: string): boolean {
        return this.loadingOperations.has(operationId);
    }

    /**
     * Clears all loading states (useful for cleanup)
     */
    protected clearLoadingStates(): void {
        this.loadingOperations.clear();
        this._isLoading = false;
    }
}