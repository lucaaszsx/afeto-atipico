import { 
    RestManager, 
    ApiError, 
    ApiErrorCodes,
    IPrivateUserModel,
    ILoginUserRequestDTO,
    IRegisterUserRequestDTO,
    IVerifyEmailRequestDTO,
    IResendEmailVerificationRequestDTO,
    ILoginUserResponseDTO,
    IRegisterUserResponseDTO
} from '@/rest';
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface AuthContextType {
    user: IPrivateUserModel | null;
    isAuthenticated: boolean;
    pendingVerification: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (data: RegisterData) => Promise<{ success: boolean; needsVerification?: boolean }>;
    verifyEmail: (code: string) => Promise<boolean>;
    resendEmailVerification: () => Promise<boolean>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<IPrivateUserModel>) => void;
    uploadAvatar: (file: File) => Promise<boolean>;
    refreshToken: () => Promise<boolean>;
    clearAuth: () => void;
    restManager: RestManager;
}

interface RegisterData {
    username: string;
    displayName: string;
    email: string;
    password: string;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

class AuthManagerSingleton {
    private static instance: RestManager | null = null;
    private static isInitialized: boolean = false;
    private static initPromise: Promise<IPrivateUserModel | null> | null = null;
    
    static getInstance(callbacks: any): RestManager {
        if (!this.instance) {
            const authContext = {
                setAccessToken: (token: string | null) => {
                    if (token) {
                        localStorage.setItem('access_token', token);
                    } else {
                        localStorage.removeItem('access_token');
                    }
                },
                getAccessToken: () => {
                    return localStorage.getItem('access_token');
                },
                onAuthSuccess: callbacks.onAuthSuccess,
                onAuthFailure: callbacks.onAuthFailure
            };

            this.instance = new RestManager({
                baseURL: import.meta.env.VITE_API_BASE_URL,
                timeout: 30000,
                withCredentials: true,
                authContext,
                onTokenExpired: callbacks.onTokenExpired,
                onUnauthorized: callbacks.onUnauthorized,
                onNetworkError: callbacks.onNetworkError,
                callbacks: {
                    auth: {
                        onSuccess: (data, requestInfo) => {
                            console.log(`✅ Auth request successful: ${requestInfo.method} ${requestInfo.endpoint}`);
                            return data;
                        },
                        onError: (error, requestInfo) => {
                            console.error(`❌ Auth request failed: ${requestInfo.method} ${requestInfo.endpoint}`, error);
                            return error;
                        },
                        throwOnError: false
                    },
                    global: {
                        onError: (error, requestInfo) => {
                            if (error instanceof ApiError) {
                                console.error(`🚨 API Error [${error.apiCode}]:`, error.message);
                            }
                            return error;
                        },
                        throwOnError: false
                    }
                }
            });
        }
        
        return this.instance;
    }
    
    static async initializeOnce(restManager: RestManager): Promise<IPrivateUserModel | null> {
        if (this.isInitialized) {
            console.log('✅ Auth already initialized, skipping...');
            return null;
        }
        if (this.initPromise) {
            console.log('⏳ Auth initialization in progress, waiting...');
            return await this.initPromise;
        }
        
        this.initPromise = this.doInitialization(restManager);
        
        try {
            const result = await this.initPromise;
            this.isInitialized = true;
            return result;
        } finally {
            this.initPromise = null;
        }
    }
    
    private static async doInitialization(restManager: RestManager): Promise<IPrivateUserModel | null> {
        console.log('🚀 Starting auth initialization...');
        
        const storedToken = localStorage.getItem('access_token');
        if (!storedToken) {
            console.log('🔍 No stored token found');
            return null;
        }
        
        try {
            console.log('🔑 Found stored token, validating...');
            const userData = await restManager.get<IPrivateUserModel>('/users/@me');
            
            if (userData) {
                console.log('✅ Session restored from stored token');
                return userData;
            } else {
                throw new Error('No user data received');
            }
        } catch (error) {
            console.log('❌ Stored token is invalid, clearing session');
            localStorage.removeItem('access_token');
            return null;
        }
    }
    
    static reset() {
        console.log('🔄 Resetting AuthManager singleton');
        this.instance = null;
        this.isInitialized = false;
        this.initPromise = null;
    }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<IPrivateUserModel | null>(null);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const callbacks = {
        onAuthSuccess: (data: { accessToken: string; user: IPrivateUserModel }) => {
            console.log('✅ Auth success callback triggered');
            setUser(data.user);
            setAccessToken(data.accessToken);
            setPendingVerification(false);
        },
        onAuthFailure: () => {
            console.log('❌ Auth failure callback triggered');
            setUser(null);
            setAccessToken(null);
            setPendingVerification(false);
            localStorage.removeItem('access_token');
        },
        onTokenExpired: () => {
            console.log('🔒 Token expired, clearing auth state');
            setUser(null);
            setAccessToken(null);
            setPendingVerification(false);
            localStorage.removeItem('access_token');
        },
        onUnauthorized: () => {
            console.log('🚫 Unauthorized access, clearing auth state');
            setUser(null);
            setAccessToken(null);
            setPendingVerification(false);
            localStorage.removeItem('access_token');
        },
        onNetworkError: (error: Error) => {
            console.error('🌐 Network error:', error.message);
        }
    };

    // Get RestManager singleton
    const restManager = AuthManagerSingleton.getInstance(callbacks);

    useEffect(() => {
        let isMounted = true;
        
        const initializeAuth = async () => {
            try {
                setIsLoading(true);
                
                const userData = await AuthManagerSingleton.initializeOnce(restManager);
                
                // Only update state if component is still mounted
                if (isMounted) {
                    if (userData) {
                        setUser(userData);
                        setAccessToken(localStorage.getItem('access_token'));
                    }
                }
            } catch (error) {
                console.error('💥 Error initializing auth:', error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        initializeAuth();
        
        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array - only run once

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        setPendingVerification(false);
        
        try {
            console.log(`🔐 Attempting login for email: ${email}`);
            
            const loginData: ILoginUserRequestDTO = { email, password };
            const response = await restManager.login(loginData);
            
            if (response) {
                setUser(response.user);
                setAccessToken(response.accessToken);
                
                if (!response.user.isVerified) {
                    setPendingVerification(true);
                    console.log('📧 User needs email verification');
                    return false;
                }
                
                console.log('✅ Login successful');
                return true;
            }
            
            console.log('❌ Login failed - no response data');
            return false;
        } catch (error) {
            console.error('💥 Login error:', error);
            
            if (error instanceof ApiError && error.apiCode === ApiErrorCodes.EMAIL_NOT_VERIFIED) {
                setPendingVerification(true);
                return false;
            }
            
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [restManager]);

    const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; needsVerification?: boolean }> => {
        setIsLoading(true);
        
        try {
            console.log(`📝 Attempting registration for username: ${data.username}`);
            
            const registerData: IRegisterUserRequestDTO = {
                username: data.username,
                displayName: data.displayName,
                email: data.email,
                password: data.password
            };
            
            const response = await restManager.register(registerData);
            
            if (response) {
                setUser(response);
                setPendingVerification(!response.isVerified);
                
                console.log(`✅ Registration successful. Verification needed: ${!response.isVerified}`);
                return { 
                    success: true, 
                    needsVerification: !response.isVerified 
                };
            }
            
            console.log('❌ Registration failed - no response data');
            return { success: false };
        } catch (error) {
            console.error('💥 Registration error:', error);
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    }, [restManager]);

    const verifyEmail = useCallback(async (code: string): Promise<boolean> => {
        if (!user?.id) {
            console.error('❌ No user found for verification');
            return false;
        }
        
        setIsLoading(true);
        
        try {
            console.log('✉️ Attempting email verification');
            
            const verifyData: IVerifyEmailRequestDTO = {
                userId: user.id,
                code
            };
            
            const response = await restManager.verifyEmail(verifyData);
            
            if (response === null || response === undefined) {
                setUser(prev => prev ? { ...prev, isVerified: true } : null);
                setPendingVerification(false);
                console.log('✅ Email verification successful');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('💥 Email verification error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [user, restManager]);

    const resendEmailVerification = useCallback(async (): Promise<boolean> => {
        if (!user?.id) {
            console.error('❌ No user found for resending verification');
            return false;
        }
        
        setIsLoading(true);
        
        try {
            console.log('📧 Resending email verification');
            
            const resendData: IResendEmailVerificationRequestDTO = {
                userId: user.id
            };
            
            const response = await restManager.resendEmailVerification(resendData);
            
            if (response === null || response === undefined) {
                console.log('✅ Email verification resent successfully');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('💥 Resend verification error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [user, restManager]);

    const logout = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        
        try {
            console.log('🚪 Attempting logout');
            await restManager.logout();
            console.log('✅ Logout successful');
        } catch (error) {
            console.error('💥 Logout error:', error);
        } finally {
            setUser(null);
            setAccessToken(null);
            setPendingVerification(false);
            localStorage.removeItem('access_token');
            setIsLoading(false);
            
            AuthManagerSingleton.reset();
        }
    }, [restManager]);

    const refreshToken = useCallback(async (): Promise<boolean> => {
        try {
            console.log('🔄 Attempting token refresh');
            
            const response = await restManager.forceRefreshToken();
            
            if (response.accessToken) {
                setAccessToken(response.accessToken);
                if (response.user) {
                    setUser(response.user);
                }
                console.log('✅ Token refresh successful');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('💥 Token refresh error:', error);
            
            setUser(null);
            setAccessToken(null);
            setPendingVerification(false);
            localStorage.removeItem('access_token');
            
            return false;
        }
    }, [restManager]);

    const updateProfile = useCallback((data: Partial<IPrivateUserModel>): void => {
        if (user) {
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            console.log('👤 Profile updated locally:', Object.keys(data));
        }
    }, [user]);

    const uploadAvatar = useCallback(async (file: File): Promise<boolean> => {
        if (!user) {
            console.error('❌ No user found for avatar upload');
            return false;
        }
        
        setIsLoading(true);
        
        try {
            console.log(`📸 Uploading avatar: ${file.name} (${file.size} bytes)`);
            
            const formData = new FormData();
            formData.append('avatar', file);
            
            const response = await restManager.post<{ avatarUrl: string }>(
                '/users/@me/avatar', 
                formData, 
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            if (response?.avatarUrl) {
                setUser(prev => prev ? { ...prev, avatarUrl: response.avatarUrl } : null);
                console.log('✅ Avatar upload successful');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('💥 Avatar upload error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [user, restManager]);

    const clearAuth = useCallback((): void => {
        console.log('🧹 Clearing authentication state');
        setUser(null);
        setAccessToken(null);
        setPendingVerification(false);
        localStorage.removeItem('access_token');
        AuthManagerSingleton.reset();
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user && user.isVerified,
        pendingVerification,
        isLoading,
        login,
        register,
        verifyEmail,
        resendEmailVerification,
        logout,
        updateProfile,
        uploadAvatar,
        refreshToken,
        clearAuth,
        restManager
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
};

export const useRestManager = (): RestManager => {
    const { restManager } = useAuth();
    return restManager;
};