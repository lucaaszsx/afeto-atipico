import { IPublicUser, IPrivateUser, IGroup, IGroupMessage } from '@/types/entities';
import { UserStatus } from '@/types/enums';
import { WebSocket } from 'ws';

export interface WSConnection {
    id: string;
    socket: WebSocket;
    user?: IPublicUser;
    subscribedGroups: Set<string>;
    isAuthenticated: boolean;
    lastHeartbeat: Date;
}

export interface WSGatewayPayload {
    op: number; // Opcode
    d?: any;    // Data
    s?: number; // Sequence number
    t?: string; // Event type
}

// Opcodes
export enum WSOpcode {
    DISPATCH = 0,           // Server -> Client: Event dispatch
    HEARTBEAT = 1,          // Client -> Server: Heartbeat
    IDENTIFY = 2,           // Client -> Server: Authentication
    HEARTBEAT_ACK = 11      // Server -> Client: Heartbeat acknowledgment
}

// Event types for notifications
export enum WSEventType {
    READY = 'READY',
    GROUPS_SYNC = 'GROUPS_SYNC',
    MESSAGE_CREATE = 'MESSAGE_CREATE',
    MESSAGE_UPDATE = 'MESSAGE_UPDATE', 
    MESSAGE_DELETE = 'MESSAGE_DELETE',
    GROUP_UPDATE = 'GROUP_UPDATE',
    GROUP_CREATE = 'GROUP_CREATE',
    GROUP_DELETE = 'GROUP_DELETE',
    GROUP_MEMBER_ADD = 'GROUP_MEMBER_ADD',
    GROUP_MEMBER_REMOVE = 'GROUP_MEMBER_REMOVE',
    GROUP_MEMBER_UPDATE = 'GROUP_MEMBER_UPDATE',
    USER_UPDATE = 'USER_UPDATE',
    USER_PRESENCE_UPDATE = 'USER_PRESENCE_UPDATE',
    TYPING_START = 'TYPING_START'
}

export interface WSUserData {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
    status: UserStatus;
}

export interface WSReadyData {
    user: IPrivateUser;
    groups: WSGroupData[]; // Will be empty - groups sent via GROUPS_SYNC
    session_id: string;
    total_groups: number; // Total number of groups to expect
}

export interface WSGroupsSyncData {
    groups: WSGroupData[];
    batch_index: number;
    is_final: boolean; // True if this is the last batch
}

export interface WSGroupData {
    id: string;
    name: string;
    description: string;
    owner: string;
    members: WSUserData[];
    tags: string[];
    created_at: Date;
    updated_at: Date;
}

export interface WSMessageData {
    id: string;
    group_id: string;
    author: WSUserData;
    content: string;
    reply_to?: string;
    created_at: Date;
    updated_at?: Date;
}

export interface WSTypingData {
    user_id: string;
    group_id: string;
    timestamp: Date;
}

export interface WSGroupMemberData {
    group_id: string;
    user: WSUserData;
}

export interface WSPresenceData {
    user_id: string;
    status: UserStatus;
    last_seen?: Date;
}
