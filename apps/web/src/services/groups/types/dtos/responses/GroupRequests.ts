// ────────────────────────────────
// Group Management Requests
// ────────────────────────────────

export interface ICreateGroupRequestDTO {
    name: string;
    description: string;
    tags?: string[];
}

export interface IUpdateGroupRequestDTO {
    name?: string;
    description?: string;
    tags?: string[];
}

export interface ISearchGroupsRequestDTO {
    query: string;
    limit?: number;
    offset?: number;
}

export interface IGetPublicGroupsRequestDTO {
    limit?: number;
    cursor?: string;
}

// ────────────────────────────────
// Group Membership Requests
// ────────────────────────────────

export interface IJoinGroupRequestDTO {
    groupId: string;
}

export interface ILeaveGroupRequestDTO {
    groupId: string;
}

export interface IRemoveMemberRequestDTO {
    groupId: string;
    userId: string;
}

// ────────────────────────────────
// Group Message Requests
// ────────────────────────────────

export interface ICreateMessageRequestDTO {
    content: string;
    replyTo?: string;
}

export interface IUpdateMessageRequestDTO {
    content: string;
}

export interface IGetGroupMessagesRequestDTO {
    limit?: number;
    before?: string; // message ID for pagination
    after?: string; // message ID for pagination
}