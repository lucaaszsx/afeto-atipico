import {
    GroupService,
    AuthService,
    UserService,
    services
} from '@/services';
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { RestManager } from '@/lib/rest';

interface AppContextType {
    restManager: RestManager;
    authService: AuthService;
    userService: UserService;
    groupService: GroupService;
}

const { restManager, authService, userService, groupService } = services;
const AppContext = createContext<AppContextType>({
    restManager,
    authService,
    userService,
    groupService
});

export function AppProvider({ children }: { children: React.ReactNode }) {
    return (
        <AppContext.Provider value={{
            restManager,
            authService,
            userService,
            groupService
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}

// Hook that automatically re-renders when auth state changes
export function useAuth() {
    const { authService } = useApp();
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    
    useEffect(() => {
        // Subscribe to auth changes
        const unsubscribe = authService.subscribe(() => forceUpdate({})); // Force re-render
        
        return unsubscribe;
    }, [authService]);
    
    return {
        user: authService.getCurrentUser(),
        isAuthenticated: authService.isAuthenticated,
        isPendingVerification: authService.isPendingVerification,
        isLoggingIn: authService.isLoggingIn,
        isRegistering: authService.isRegistering,
        isLoggingOut: authService.isLoggingOut,
        isVerifyingEmail: authService.isVerifyingEmail,
        isRefreshingToken: authService.isRefreshingToken,
        isLoading: authService.isLoading,
        authService
    };
}