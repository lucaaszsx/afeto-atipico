/**
 * @file GroupResponses.ts
 * @description Response DTO classes for Group endpoints
 * @author Lucas
 * @license MIT
 */

import { Exclude, Expose, Type } from 'class-transformer';
import { GroupMessage, Group } from './models/group';
import { PublicUser } from './models/user';

@Exclude()
export class GroupWithMembersInfo extends Group {
    @Type(() => PublicUser)
    @Expose()
    memberDetails!: PublicUser[];
}

export class CreateGroupResponse extends Group {}

export class GetGroupResponse extends Group {}

export class UpdateGroupResponse extends Group {}

export class JoinGroupResponse extends Group {}

export class LeaveGroupResponse extends Group {}

export class RemoveMemberResponse extends Group {}

@Exclude()
export class DeleteGroupResponse {
    @Expose()
    success!: boolean;
}

@Exclude()
export class GetGroupMembersResponse {
    @Type(() => PublicUser)
    @Expose()
    members!: PublicUser[];
}

// ────────────────────────────────────────────────────────────────
// Message Responses
// ────────────────────────────────────────────────────────────────

@Exclude()
export class CreateMessageResponse extends GroupMessage {
    @Type(() => Group)
    @Expose()
    group!: Group;

    @Type(() => PublicUser)
    @Expose()
    author!: PublicUser;
}

@Exclude()
export class GetMessageResponse extends GroupMessage {
    @Type(() => Group)
    @Expose()
    group!: Group;

    @Type(() => PublicUser)
    @Expose()
    author!: PublicUser;
}

@Exclude()
export class UpdateMessageResponse extends GroupMessage {
    @Type(() => Group)
    @Expose()
    group!: Group;

    @Type(() => PublicUser)
    @Expose()
    author!: PublicUser;
}

@Exclude()
export class DeleteMessageResponse {
    @Expose()
    success!: boolean;
}

@Exclude()
export class GetGroupMessagesResponse {
    @Type(() => GetMessageResponse)
    @Expose()
    messages!: GetMessageResponse[];

    @Expose()
    hasMore!: boolean;

    @Expose()
    nextCursor?: string;
}

@Exclude()
export class GetUserGroupsResponse {
    @Type(() => Group)
    @Expose()
    groups!: Group[];
}

@Exclude()
export class SearchGroupsResponse {
    @Type(() => Group)
    @Expose()
    groups!: Group[];

    @Expose()
    total!: number;

    @Expose()
    hasMore!: boolean;
}

@Exclude()
export class GetPublicGroupsResponse {
    @Type(() => Group)
    @Expose()
    groups!: Group[];

    @Expose()
    hasMore!: boolean;

    @Expose()
    nextCursor?: string;
}