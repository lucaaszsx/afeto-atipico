/**
 * @file GroupService.ts
 * @description Client-side service for group management and messaging operations
 * @author Lucas
 * @license MIT
 */

import {
    ICreateGroupRequestDTO,
    IUpdateGroupRequestDTO,
    ISearchGroupsRequestDTO,
    IGetPublicGroupsRequestDTO,
    IJoinGroupRequestDTO,
    ILeaveGroupRequestDTO,
    IRemoveMemberRequestDTO,
    ICreateMessageRequestDTO,
    IUpdateMessageRequestDTO,
    IGetGroupMessagesRequestDTO
} from './types/dtos/requests/GroupRequests';
import {
    ICreateGroupResponseDTO,
    IGetGroupResponseDTO,
    IUpdateGroupResponseDTO,
    IDeleteGroupResponseDTO,
    IGetPublicGroupsResponseDTO,
    ISearchGroupsResponseDTO,
    IJoinGroupResponseDTO,
    ILeaveGroupResponseDTO,
    IRemoveMemberResponseDTO,
    IGetGroupMembersResponseDTO,
    IGetUserGroupsResponseDTO,
    ICreateMessageResponseDTO,
    IGetMessageResponseDTO,
    IUpdateMessageResponseDTO,
    IDeleteMessageResponseDTO,
    IGetGroupMessagesResponseDTO
} from './types/dtos/responses/GroupResponses';
import { LoggerInterface, Logger } from '@/lib/logger';
import { RestManager, ApiRoutes } from '@/lib/rest';
import { BaseService } from '../base';

export class GroupService extends BaseService {
    private logger: LoggerInterface = new Logger(this.constructor.name);

    constructor(restManager: RestManager) {
        super(restManager);
    }

    // ────────────────────────────────
    // Group Management Methods
    // ────────────────────────────────

    /**
     * Creates a new group
     */
    public async createGroup(data: ICreateGroupRequestDTO) {
        this.logger.debug('Creating new group', { name: data.name });
        
        return this.post<ICreateGroupResponseDTO>(
            ApiRoutes.groups(),
            data,
            undefined,
            'createGroup'
        );
    }

    /**
     * Gets a specific group by ID
     */
    public async getGroup(groupId: string) {
        this.logger.debug('Fetching group', { groupId });
        
        return this.get<IGetGroupResponseDTO>(
            ApiRoutes.group(groupId),
            undefined,
            `getGroup:${groupId}`
        );
    }

    /**
     * Updates a group
     */
    public async updateGroup(groupId: string, data: IUpdateGroupRequestDTO) {
        this.logger.debug('Updating group', { groupId, data });
        
        return this.put<IUpdateGroupResponseDTO>(
            ApiRoutes.group(groupId),
            data,
            undefined,
            `updateGroup:${groupId}`
        );
    }

    /**
     * Deletes a group
     */
    public async deleteGroup(groupId: string) {
        this.logger.debug('Deleting group', { groupId });
        
        return this.delete<IDeleteGroupResponseDTO>(
            ApiRoutes.group(groupId),
            undefined,
            `deleteGroup:${groupId}`
        );
    }

    /**
     * Gets public groups with pagination
     */
    public async getPublicGroups(params?: IGetPublicGroupsRequestDTO) {
        this.logger.debug('Fetching public groups', { params });
        
        const queryParams: Record<string, string> = {};
        
        if (params?.limit) queryParams.limit = params.limit.toString();
        if (params?.cursor) queryParams.cursor = params.cursor;
        
        return this.get<IGetPublicGroupsResponseDTO>(
            ApiRoutes.groups(),
            { params: queryParams },
            'getPublicGroups'
        );
    }

    /**
     * Searches for groups
     */
    public async searchGroups(data: ISearchGroupsRequestDTO) {
        this.logger.debug('Searching groups', { query: data.query });
        
        const queryParams: Record<string, string> = {
            query: data.query
        };
        
        if (data.limit) queryParams.limit = data.limit.toString();
        if (data.offset) queryParams.offset = data.offset.toString();
        
        return this.get<ISearchGroupsResponseDTO>(
            ApiRoutes.groupsSearch(),
            { params: queryParams },
            'searchGroups'
        );
    }

    // ────────────────────────────────
    // Group Membership Methods
    // ────────────────────────────────

    /**
     * Joins a group
     */
    public async joinGroup(groupId: string) {
        this.logger.debug('Joining group', { groupId });
        
        return this.post<IJoinGroupResponseDTO>(
            ApiRoutes.groupJoin(groupId),
            undefined,
            undefined,
            `joinGroup:${groupId}`
        );
    }

    /**
     * Leaves a group
     */
    public async leaveGroup(groupId: string) {
        this.logger.debug('Leaving group', { groupId });
        
        return this.post<ILeaveGroupResponseDTO>(
            ApiRoutes.groupLeave(groupId),
            undefined,
            undefined,
            `leaveGroup:${groupId}`
        );
    }

    /**
     * Removes a member from a group (owner only)
     */
    public async removeMember(groupId: string, userId: string) {
        this.logger.debug('Removing member from group', { groupId, userId });
        
        return this.delete<IRemoveMemberResponseDTO>(
            ApiRoutes.groupMember(groupId, userId),
            undefined,
            `removeMember:${groupId}:${userId}`
        );
    }

    /**
     * Gets group members
     */
    public async getGroupMembers(groupId: string) {
        this.logger.debug('Fetching group members', { groupId });
        
        return this.get<IGetGroupMembersResponseDTO>(
            ApiRoutes.groupMembers(groupId),
            undefined,
            `getGroupMembers:${groupId}`
        );
    }

    /**
     * Gets current user's groups
     */
    public async getUserGroups() {
        this.logger.debug('Fetching user groups');
        
        return this.get<IGetUserGroupsResponseDTO>(
            ApiRoutes.userGroups(),
            undefined,
            'getUserGroups'
        );
    }

    // ────────────────────────────────
    // Group Message Methods
    // ────────────────────────────────

    /**
     * Creates a new message in a group
     */
    public async createMessage(groupId: string, data: ICreateMessageRequestDTO) {
        this.logger.debug('Creating message in group', { groupId, content: data.content });
        
        return this.post<ICreateMessageResponseDTO>(
            ApiRoutes.groupMessages(groupId),
            data,
            undefined,
            `createMessage:${groupId}`
        );
    }

    /**
     * Gets messages from a group with pagination
     */
    public async getGroupMessages(groupId: string, params?: IGetGroupMessagesRequestDTO) {
        this.logger.debug('Fetching group messages', { groupId, params });
        
        const queryParams: Record<string, string> = {};
        
        if (params?.limit) queryParams.limit = params.limit.toString();
        if (params?.before) queryParams.before = params.before;
        if (params?.after) queryParams.after = params.after;
        
        return this.get<IGetGroupMessagesResponseDTO>(
            ApiRoutes.groupMessages(groupId),
            { params: queryParams },
            `getGroupMessages:${groupId}`
        );
    }

    /**
     * Gets a specific message
     */
    public async getMessage(groupId: string, messageId: string) {
        this.logger.debug('Fetching message', { groupId, messageId });
        
        return this.get<IGetMessageResponseDTO>(
            ApiRoutes.groupMessage(groupId, messageId),
            undefined,
            `getMessage:${groupId}:${messageId}`
        );
    }

    /**
     * Updates a message
     */
    public async updateMessage(groupId: string, messageId: string, data: IUpdateMessageRequestDTO) {
        this.logger.debug('Updating message', { groupId, messageId, content: data.content });
        
        return this.put<IUpdateMessageResponseDTO>(
            ApiRoutes.groupMessage(groupId, messageId),
            data,
            undefined,
            `updateMessage:${groupId}:${messageId}`
        );
    }

    /**
     * Deletes a message
     */
    public async deleteMessage(groupId: string, messageId: string) {
        this.logger.debug('Deleting message', { groupId, messageId });
        
        return this.delete<IDeleteMessageResponseDTO>(
            ApiRoutes.groupMessage(groupId, messageId),
            undefined,
            `deleteMessage:${groupId}:${messageId}`
        );
    }

    // ────────────────────────────────
    // Utility Methods & Loading States
    // ────────────────────────────────

    // Group Management Loading States
    public get isCreatingGroup(): boolean {
        return this.isOperationLoading('createGroup');
    }

    public isGettingGroup(groupId: string): boolean {
        return this.isOperationLoading(`getGroup:${groupId}`);
    }

    public isUpdatingGroup(groupId: string): boolean {
        return this.isOperationLoading(`updateGroup:${groupId}`);
    }

    public isDeletingGroup(groupId: string): boolean {
        return this.isOperationLoading(`deleteGroup:${groupId}`);
    }

    public get isGettingPublicGroups(): boolean {
        return this.isOperationLoading('getPublicGroups');
    }

    public get isSearchingGroups(): boolean {
        return this.isOperationLoading('searchGroups');
    }

    // Group Membership Loading States
    public isJoiningGroup(groupId: string): boolean {
        return this.isOperationLoading(`joinGroup:${groupId}`);
    }

    public isLeavingGroup(groupId: string): boolean {
        return this.isOperationLoading(`leaveGroup:${groupId}`);
    }

    public isRemovingMember(groupId: string, userId: string): boolean {
        return this.isOperationLoading(`removeMember:${groupId}:${userId}`);
    }

    public isGettingGroupMembers(groupId: string): boolean {
        return this.isOperationLoading(`getGroupMembers:${groupId}`);
    }

    public get isGettingUserGroups(): boolean {
        return this.isOperationLoading('getUserGroups');
    }

    // Group Message Loading States
    public isCreatingMessage(groupId: string): boolean {
        return this.isOperationLoading(`createMessage:${groupId}`);
    }

    public isGettingGroupMessages(groupId: string): boolean {
        return this.isOperationLoading(`getGroupMessages:${groupId}`);
    }

    public isGettingMessage(groupId: string, messageId: string): boolean {
        return this.isOperationLoading(`getMessage:${groupId}:${messageId}`);
    }

    public isUpdatingMessage(groupId: string, messageId: string): boolean {
        return this.isOperationLoading(`updateMessage:${groupId}:${messageId}`);
    }

    public isDeletingMessage(groupId: string, messageId: string): boolean {
        return this.isOperationLoading(`deleteMessage:${groupId}:${messageId}`);
    }

    // Batch Operations Helpers
    public isGroupOperationLoading(groupId: string): boolean {
        return this.isGettingGroup(groupId) ||
               this.isUpdatingGroup(groupId) ||
               this.isDeletingGroup(groupId) ||
               this.isJoiningGroup(groupId) ||
               this.isLeavingGroup(groupId) ||
               this.isGettingGroupMembers(groupId) ||
               this.isCreatingMessage(groupId) ||
               this.isGettingGroupMessages(groupId);
    }

    public isMessageOperationLoading(groupId: string, messageId: string): boolean {
        return this.isGettingMessage(groupId, messageId) ||
               this.isUpdatingMessage(groupId, messageId) ||
               this.isDeletingMessage(groupId, messageId);
    }
}