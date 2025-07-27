const ApiRoutes = {
    // ────────────────────────────────
    // Auth Routes
    // ────────────────────────────────
    register: () => '/auth/register',
    login: () => '/auth/login',
    verifyEmail: () => '/auth/verify-email',
    resendEmailVerification: () => '/auth/resend-email-verification',
    logout: () => '/auth/logout',
    refreshToken: () => '/auth/refresh',
    forgotPassword: () => '/auth/forgot-password',
    resetPassword: () => '/auth/reset-password',
    
    // ────────────────────────────────
    // User Routes
    // ────────────────────────────────
    user: (userId?: string) => `/users/${userId ?? '@me'}`,
    userGroups: () => `/users/@me/groups`,
    
    // ────────────────────────────────
    // Group Routes
    // ────────────────────────────────
    group: (groupId: string) => `/groups${groupId ? `/${groupId}` : ''}`,
    groupMembers: (groupId: string) => `/groups/${groupId}/members`,
    groupMember: (groupId: string, userId: string) => `/groups/${groupId}/members/${userId}`,
    groupMessages: (groupId: string) => `/groups/${groupId}/messages`,
    groupMessage: (groupId: string, messageId: string) => `/groups/${groupId}/message/${messageId}`,
    
    // ────────────────────────────────
    // Report Routes
    // ────────────────────────────────
    reports: () => '/reports',
    report: (reportId: string) => `/reports/${reportId}`
} as const;

export default ApiRoutes;