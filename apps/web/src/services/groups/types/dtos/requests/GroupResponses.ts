import { IGroupModel, IGroupMessageModel, IPublicUserModel } from '@/lib/rest';

// ────────────────────────────────
// Group Management Responses
// ────────────────────────────────

export interface ICreateGroupResponseDTO extends IGroupModel {}

export interface IGetGroupResponseDTO extends IGroupModel {}

export interface IUpdateGroupResponseDTO extends IGroupModel {}

export interface IDeleteGroupResponseDTO {
    success: boolean;
}

export interface IGetPublicGroupsResponseDTO {
    groups: IGroupModel[];
    hasMore: boolean;
    nextCursor?: string;
}

export interface ISearchGroupsResponseDTO {
    groups: IGroupModel[];
    total: number;
    hasMore: boolean;
}

// ────────────────────────────────
// Group Membership Responses
// ────────────────────────────────

export interface IJoinGroupResponseDTO extends IGroupModel {}

export interface ILeaveGroupResponseDTO extends IGroupModel {}

export interface IRemoveMemberResponseDTO extends IGroupModel {}

export interface IGetGroupMembersResponseDTO {
    members: IPublicUserModel[];
}

export interface IGetUserGroupsResponseDTO {
    groups: IGroupModel[];
}

// ────────────────────────────────
// Group Message Responses
// ────────────────────────────────

export interface ICreateMessageResponseDTO extends IGroupMessageModel {}

export interface IGetMessageResponseDTO extends IGroupMessageModel {}

export interface IUpdateMessageResponseDTO extends IGroupMessageModel {}

export interface IDeleteMessageResponseDTO {
    success: boolean;
}

export interface IGetGroupMessagesResponseDTO {
    messages: IGroupMessageModel[];
    hasMore: boolean;
    nextCursor?: string;
}

// ────────────────────────────────
// Extended/Combined Response Types
// ────────────────────────────────

export interface IGroupWithMembersInfoResponseDTO extends IGroupModel {
    memberDetails: IPublicUserModel[];
}