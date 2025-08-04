import {
    IRegisterUserRequestDTO,
    IVerifyEmailRequestDTO,
    ILoginUserRequestDTO
} from './types/dtos/requests/AuthRequests';
import {
    IRegisterUserResponseDTO,
    IRefreshTokenResponseDTO,
    ILoginUserResponseDTO
} from './types/dtos/responses/AuthResponses';
import { LoggerInterface, Logger } from '@/lib/logger';
import { RequestConfig, AuthProvider, RestManager, ApiRoutes } from '@/lib/rest';
import { BaseService } from '../base';

type AuthChangeListener = () => void;

export class AuthService extends BaseService implements AuthProvider {
    private accessToken: string | null = null;
    private currentUser: any | null = null;
    private onUnauthorizedCallback?: () => void;
    private logger: LoggerInterface = new Logger(this.constructor.name);
    
    // Event listeners for auth changes
    private listeners: Set<AuthChangeListener> = new Set();
    
    private static readonly ACCESS_TOKEN_KEY = 'auth_access_token';

    constructor(restManager: RestManager) {
        super(restManager);
        
        this.loadStoredToken();
        
        // Set this service as the auth provider for the RestManager
        this.restManager.setAuthProvider(this);
    }

    // Subscribe to auth changes
    public subscribe(listener: AuthChangeListener): () => void {
        this.listeners.add(listener);
        
        // Return unsubscribe function
        return () => this.listeners.delete(listener);
    }

    // Notify all listeners of auth changes
    private notifyAuthChange(): void {
        this.listeners.forEach(listener => {
            try {
                listener();
            } catch (error) {
                this.logger.error('Error in auth change listener:', error);
            }
        });
    }

    private loadStoredToken(): void {
        try {
            const storedToken = localStorage.getItem(AuthService.ACCESS_TOKEN_KEY);
            
            if (storedToken) this.accessToken = storedToken;
        } catch (error) {
            this.accessToken = null;
        }
    }

    private persistToken(): void {
        try {
            if (this.accessToken) localStorage.setItem(AuthService.ACCESS_TOKEN_KEY, this.accessToken);
            else localStorage.removeItem(AuthService.ACCESS_TOKEN_KEY);
        } catch (error) {} // Silent fail
    }

    private setAccessToken(token: string | null): void {
        this.accessToken = token;
        this.persistToken();
        this.notifyAuthChange();
    }

    private clearAuth(): void {
        this.logger.info('Clearing authentication data');
        
        this.setAccessToken(null);
        this.setCurrentUser(null);
    }

    // AuthProvider implementation
    public getToken(): string | null {
        return this.accessToken;
    }

    public getCurrentUser(): any | null {
        return this.currentUser;
    }

    public setCurrentUser(user: any | null): void {
        this.currentUser = user;
        this.notifyAuthChange();
    }
    
    public setOnUnauthorizedCallback(callback: () => void): void {
        this.onUnauthorizedCallback = callback;
    }

    public onUnauthorized(): void {
        this.clearAuth();
        
        if (this.onUnauthorizedCallback) {
            this.onUnauthorizedCallback();
        }
    }

    // Auth methods
    public async register(data: IRegisterUserRequestDTO) {
        const result = await this.post<IRegisterUserResponseDTO>(
            ApiRoutes.register(), 
            data,
            undefined,
            'register'
        );
        
        if (result.success) {
            this.setCurrentUser(result.data!.user);
            this.setAccessToken(result.data!.accessToken);
        }
        
        return result;
    }

    public async login(data: ILoginUserRequestDTO) {
        const result = await this.post<ILoginUserResponseDTO>(
            ApiRoutes.login(), 
            data,
            undefined,
            'login'
        );
        
        if (result.success) {
            this.setAccessToken(result.data!.accessToken);
            this.setCurrentUser(result.data!.user);
        }
        
        return result;
    }

    public async logout() {
        const result = await this.post<void>(
            ApiRoutes.logout(),
            undefined,
            undefined,
            'logout'
        );
        
        // Always clear auth, even if request fails
        this.clearAuth();
        
        return result;
    }

    public async verifyEmail(data: IVerifyEmailRequestDTO) {
        const result = await this.post<void>(
            ApiRoutes.verifyEmail(), 
            data,
            undefined,
            'verifyEmail'
        );
        
        // Update current user
        
        return result;
    }

    public async resendEmailVerification() {
        return this.post<void>(
            ApiRoutes.resendEmailVerification(),
            undefined,
            undefined,
            'resendEmailVerification'
        );
    }

    public async refreshToken() {
        const result = await this.post<IRefreshTokenResponseDTO>(
            ApiRoutes.refreshToken(), 
            {}, 
            { headers: { skipAuth: true } },
            'refreshToken'
        );
        
        if (result.success) this.setAccessToken(result.data!.accessToken);
        
        return result;
    }

    // Utility methods
    public get hasAccessToken(): boolean {
        return !!this.accessToken;
    }
    
    public get hasCurrentUser(): boolean {
        return !!this.getCurrentUser();
    }
    
    public get isAuthenticated(): boolean {
        return this.hasAccessToken && this.hasCurrentUser;
    }
    
    public get isPendingVerification(): boolean {
        const currentUser = this.getCurrentUser();
        
        return currentUser && !currentUser.isVerified;
    }

    // Specific methods to check loading for specific operations
    public get isLoggingIn(): boolean {
        return this.isOperationLoading('login');
    }

    public get isRegistering(): boolean {
        return this.isOperationLoading('register');
    }

    public get isLoggingOut(): boolean {
        return this.isOperationLoading('logout');
    }

    public get isVerifyingEmail(): boolean {
        return this.isOperationLoading('verifyEmail');
    }

    public get isRefreshingToken(): boolean {
        return this.isOperationLoading('refreshToken');
    }
}