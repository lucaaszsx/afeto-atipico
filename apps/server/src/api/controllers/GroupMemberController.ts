/**
 * @file GroupMemberController.ts
 * @description Controller responsible for managing group membership operations.
 * Handles join, leave, removal, and listing of members within a specific group context via route scoping by groupId.
 * @author Lucas
 * @license MIT
 */

import {
    JoinGroupRequest,
    LeaveGroupRequest,
    RemoveMemberRequest
} from './requests/GroupRequests';
import {
    JoinGroupResponse,
    LeaveGroupResponse,
    RemoveMemberResponse,
    GetGroupMembersResponse
} from './responses/GroupResponses';
import {
    JsonController,
    Authorized,
    Body,
    Delete,
    Post,
    Get,
    Req,
    Param
} from 'routing-controllers';
import { createApiResponse, ApiSuccessCodes } from '../responses';
import { GroupMemberService } from '../services';
import type { ApiResponse } from '@/types/common';
import type { Request } from 'express';
import { Service } from 'typedi';
import { RequiredUser } from '@/decorators';
import { IUser, IGroup } from '@/types/entities';

@Service()
@JsonController('/groups/:groupId/members')
export default class GroupMemberController {
    constructor(private readonly groupMemberService: GroupMemberService) {}

    // Helper methods to safely serialize data
    private serializeGroup(group: IGroup): any {
        return {
            id: group.id,
            name: group.name,
            description: group.description,
            tags: group.tags || [],
            owner: group.owner,
            members: group.members || [],
            createdAt: group.createdAt || new Date(),
            updatedAt: group.updatedAt || new Date()
        };
    }

    private serializeUser(user: IUser): any {
        return {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl || '',
            bio: user.bio || '',
            status: user.status,
            createdAt: user.createdAt || new Date(),
            updatedAt: user.updatedAt || new Date(),
            isVerified: user.isVerified || false,
            children: (user.children || []).map(child => ({
                id: child.id,
                name: child.name,
                age: child.age,
                notes: child.notes || ''
            }))
        };
    }

    // ────────────────────────────────
    // Member Management
    // ────────────────────────────────

    @Post('/join')
    @Authorized()
    public async joinGroup(
        @Param('groupId') groupId: string,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<JoinGroupResponse>> {
        const group = await this.groupMemberService.joinGroup(groupId, user.id);

        return createApiResponse<JoinGroupResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: this.serializeGroup(group),
            path: req.path
        });
    }

    @Post('/leave')
    @Authorized()
    public async leaveGroup(
        @Param('groupId') groupId: string,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<LeaveGroupResponse>> {
        const group = await this.groupMemberService.leaveGroup(groupId, user.id);

        return createApiResponse<LeaveGroupResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: this.serializeGroup(group),
            path: req.path
        });
    }

    @Delete('/:userId')
    @Authorized()
    public async removeMember(
        @Param('groupId') groupId: string,
        @Param('userId') targetUserId: string,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<RemoveMemberResponse>> {
        const group = await this.groupMemberService.removeMember(groupId, targetUserId, user.id);

        return createApiResponse<RemoveMemberResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: this.serializeGroup(group),
            path: req.path
        });
    }

    @Get('/')
    @Authorized()
    public async getGroupMembers(
        @Param('groupId') groupId: string,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<GetGroupMembersResponse>> {
        const members = await this.groupMemberService.getGroupMembers(groupId, user.id);

        return createApiResponse<GetGroupMembersResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: {
                members: members.map(member => this.serializeUser(member))
            },
            path: req.path
        });
    }
}