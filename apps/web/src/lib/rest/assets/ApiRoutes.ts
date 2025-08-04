export const ApiRoutes = {
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
    user: () => `/users/@me`,
    userChildren: (childId: string) => `/users/@me/children${childId ? '/' + childId : ''}`,

    // ────────────────────────────────
    // Group Routes
    // ────────────────────────────────

    // Group Management
    groups: () => '/groups',
    group: (groupId: string) => `/groups/${groupId}`,
    groupsSearch: () => '/groups/search',

    // Group Membership (reorganizado)
    groupMembers: (groupId: string) => `/groups/${groupId}/members`,
    groupMember: (groupId: string, userId: string) => `/groups/${groupId}/members/${userId}`,
    groupJoin: (groupId: string) => `/groups/${groupId}/members/join`,
    groupLeave: (groupId: string) => `/groups/${groupId}/members/leave`,

    // User's Groups
    userGroups: () => '/groups/user/@me',

    // Group Messages
    groupMessages: (groupId: string) => `/groups/${groupId}/messages`,
    groupMessage: (groupId: string, messageId: string) => `/groups/${groupId}/messages/${messageId}`,

    // ────────────────────────────────
    // Report Routes
    // ────────────────────────────────
    reports: () => '/reports',
    report: (reportId: string) => `/reports/${reportId}`
} as const;