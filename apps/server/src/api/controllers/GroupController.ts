/**
 * @file GroupController.ts
 * @description Controller for group management operations
 * @author Lucas
 * @license MIT
 */

import {
    CreateGroupRequest,
    UpdateGroupRequest,
    SearchGroupsRequest
} from './requests/GroupRequests';
import {
    CreateGroupResponse,
    GetGroupResponse,
    UpdateGroupResponse,
    DeleteGroupResponse,
    GetUserGroupsResponse,
    SearchGroupsResponse,
    GetPublicGroupsResponse
} from './responses/GroupResponses';
import {
    JsonController,
    Authorized,
    Body,
    Delete,
    Post,
    Put,
    Get,
    Req,
    Param,
    QueryParams
} from 'routing-controllers';
import { createApiResponse, ApiSuccessCodes } from '../responses';
import { GroupService } from '../services';
import type { ApiResponse } from '@/types/common';
import type { Request } from 'express';
import { Service } from 'typedi';
import { GroupNotFoundException } from '../responses';
import { RequiredUser } from '@/decorators';
import { IUser, IGroup } from '@/types/entities';

@Service()
@JsonController('/groups')
export default class GroupController {
    constructor(private readonly groupService: GroupService) {}

    // Helper method to safely serialize group data
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

    // ────────────────────────────────
    // Group Management
    // ────────────────────────────────
    
    @Post('/')
    @Authorized()
    public async createGroup(
        @Body() body: CreateGroupRequest,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<CreateGroupResponse>> {
        const group = await this.groupService.createGroup({
            name: body.name,
            description: body.description,
            tags: body.tags || [],
            owner: user.id,
            members: [user.id] // Owner is automatically a member
        });

        return createApiResponse<CreateGroupResponse>({
            apiCode: ApiSuccessCodes.CREATED,
            data: this.serializeGroup(group),
            path: req.path
        });
    }

    @Get('/:groupId')
    @Authorized()
    public async getGroup(
        @Param('groupId') groupId: string,
        @Req() req: Request
    ): Promise<ApiResponse<GetGroupResponse>> {
        const group = await this.groupService.findGroupById(groupId);
        
        if (!group) throw new GroupNotFoundException();
        
        return createApiResponse<GetGroupResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: this.serializeGroup(group),
            path: req.path
        });
    }

    @Put('/:groupId')
    @Authorized()
    public async updateGroup(
        @Param('groupId') groupId: string,
        @Body() body: UpdateGroupRequest,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<UpdateGroupResponse>> {
        const updateData: Record<string, any> = {};
        
        if (body.name) updateData.name = body.name;
        if (body.description) updateData.description = body.description;
        if (body.tags) updateData.tags = body.tags;

        const group = await this.groupService.updateGroup(
            { id: groupId, owner: user.id },
            updateData
        );

        return createApiResponse<UpdateGroupResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: this.serializeGroup(group),
            path: req.path
        });
    }

    @Delete('/:groupId')
    @Authorized()
    public async deleteGroup(
        @Param('groupId') groupId: string,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<DeleteGroupResponse>> {
        await this.groupService.deleteGroup(groupId, user.id);

        return createApiResponse<DeleteGroupResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: { success: true },
            path: req.path
        });
    }

    @Get('/')
    public async getPublicGroups(
        @QueryParams() query: { limit?: string; cursor?: string },
        @Req() req: Request
    ): Promise<ApiResponse<GetPublicGroupsResponse>> {
        const limit = Math.min(query.limit ? parseInt(query.limit, 10) : 20, 100); // Max 100
        const skip = query.cursor ? parseInt(query.cursor, 10) : 0;

        const groups = await this.groupService.getAllPublicGroups({
            limit: limit + 1, // Get one extra to check if there are more
            skip
        });

        const hasMore = groups.length > limit;
        const responseGroups = hasMore ? groups.slice(0, limit) : groups;
        const nextCursor = hasMore ? (skip + limit).toString() : undefined;

        return createApiResponse<GetPublicGroupsResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: {
                groups: responseGroups.map(group => this.serializeGroup(group)),
                hasMore,
                nextCursor
            },
            path: req.path
        });
    }

    @Get('/search')
    public async searchGroups(
        @QueryParams() query: SearchGroupsRequest,
        @Req() req: Request
    ): Promise<ApiResponse<SearchGroupsResponse>> {
        const limit = Math.min(query.limit ? parseInt(query.limit, 10) : 20, 100); // Max 100
        const offset = Math.max(query.offset ? parseInt(query.offset, 10) : 0, 0); // Min 0

        const groups = await this.groupService.searchGroups(query.query, {
            limit: limit + 1, // Get one extra to check if there are more
            skip: offset
        });

        const hasMore = groups.length > limit;
        const responseGroups = hasMore ? groups.slice(0, limit) : groups;

        return createApiResponse<SearchGroupsResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: {
                groups: responseGroups.map(group => this.serializeGroup(group)),
                total: responseGroups.length,
                hasMore
            },
            path: req.path
        });
    }

    @Get('/user/@me')
    @Authorized()
    public async getUserGroups(
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<GetUserGroupsResponse>> {
        const groups = await this.groupService.getUserGroups(user.id);

        return createApiResponse<GetUserGroupsResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: {
                groups: groups.map(group => this.serializeGroup(group))
            },
            path: req.path
        });
    }
}