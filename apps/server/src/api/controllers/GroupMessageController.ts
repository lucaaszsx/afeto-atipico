/**
 * @file GroupMessageController.ts
 * @description Controller responsible for managing group messages.
 * Supports message creation, retrieval, update, and deletion scoped to a specific group using groupId in the route path. Includes pagination and member access checks where applicable. 
 * @author Lucas
 * @license MIT
 */

import {
    CreateMessageRequest,
    UpdateMessageRequest,   
    GetGroupMessagesRequest
} from './requests/GroupRequests';
import {
    CreateMessageResponse,
    GetMessageResponse,
    UpdateMessageResponse,
    DeleteMessageResponse,
    GetGroupMessagesResponse
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
import { NotGroupMemberException } from '../responses/exceptions/groups/members/NotGroupMember';
import { GroupMessageService, GroupMemberService } from '../services';
import type { ApiResponse } from '@/types/common';
import type { Request } from 'express';
import { Service } from 'typedi';
import { RequiredUser } from '@/decorators';
import { IUser, IGroupMessage } from '@/types/entities';

@Service()
@JsonController('/groups/:groupId/messages')
export default class GroupMessageController {
    constructor(
        private readonly groupMessageService: GroupMessageService,
        private readonly groupMemberService: GroupMemberService
    ) {}

    // Helper method to safely serialize message data with populated group and author
    private serializeMessage(message: IGroupMessage, group?: any, author?: any): any {
        return {
            id: message.id,
            group: group ? {
                id: group.id,
                name: group.name,
                description: group.description,
                tags: group.tags || [],
                owner: group.owner,
                members: group.members || [],
                createdAt: group.createdAt || new Date(),
                updatedAt: group.updatedAt || new Date()
            } : message.group,
            author: author ? {
                id: author.id,
                username: author.username,
                displayName: author.displayName,
                avatarUrl: author.avatarUrl || '',
                bio: author.bio || '',
                status: author.status,
                isVerified: author.isVerified || false,
                createdAt: author.createdAt || new Date(),
                updatedAt: author.updatedAt || new Date()
            } : message.author,
            content: message.content,
            replyTo: message.replyTo || null,
            createdAt: message.createdAt || new Date(),
            updatedAt: message.updatedAt || new Date()
        };
    }

    // ────────────────────────────────
    // Message Management
    // ────────────────────────────────

    @Post('/')
    @Authorized()
    public async createMessage(
        @Param('groupId') groupId: string,
        @Body() body: CreateMessageRequest,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<CreateMessageResponse>> {
        const message = await this.groupMessageService.createMessage({
            group: groupId,
            author: user.id,
            content: body.content,
            replyTo: body.replyTo
        });

        // Get populated data for response
        const [group, author] = await Promise.all([
            this.groupMessageService.getGroupById(message.group),
            this.groupMessageService.getAuthorById(message.author)
        ]);

        return createApiResponse<CreateMessageResponse>({
            apiCode: ApiSuccessCodes.CREATED,
            data: this.serializeMessage(message, group, author),
            path: req.path
        });
    }

    @Get('/')
    @Authorized()
    public async getGroupMessages(
        @Param('groupId') groupId: string,
        @QueryParams() query: GetGroupMessagesRequest,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<GetGroupMessagesResponse>> {
        const limit = Math.min(query.limit ? parseInt(query.limit, 10) : 50, 100);

        // Build MongoDB query options properly
        const options: Record<string, any> = {
            limit: limit + 1  // Always fetch one extra to check if there are more
        };

        // Handle cursor-based pagination with chronological order (oldest first, newest last)
        if (query.before) {
            // For "before" cursor: get messages older than the cursor, sorted oldest first
            options.sort = { createdAt: 1 };
            options.filter = { createdAt: { $lt: new Date(query.before) } };
        } else if (query.after) {
            // For "after" cursor: get messages newer than the cursor, sorted oldest first
            options.sort = { createdAt: 1 };
            options.filter = { createdAt: { $gt: new Date(query.after) } };
        } else {
            // Default: get messages in chronological order (oldest first)
            options.sort = { createdAt: 1 };
            if (query.offset) options.skip = Math.max(parseInt(query.offset.toString(), 10), 0);
        }

        // Get messages with the constructed options
        const messages = await this.groupMessageService.getGroupMessagesWithPagination(
            groupId, 
            user.id, 
            options
        );

        // Check if there are more messages
        const hasMore = messages.length > limit;
        const responseMessages = hasMore ? messages.slice(0, limit) : messages;

        // Generate next cursor for pagination (use the last message's timestamp)
        const nextCursor = hasMore && responseMessages.length > 0 && responseMessages[responseMessages.length - 1].createdAt
            ? responseMessages[responseMessages.length - 1].createdAt!.toISOString()
            : undefined;

        return createApiResponse<GetGroupMessagesResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: {
                messages: responseMessages.map(message => this.serializeMessage(message, message.groupData, message.authorData)),
                hasMore,
                nextCursor
            },
            path: req.path
        });
    }

    @Get('/:messageId')
    @Authorized()
    public async getMessage(
        @Param('groupId') groupId: string,
        @Param('messageId') messageId: string,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<GetMessageResponse>> {
        const isMember = await this.groupMemberService.isGroupMember(groupId, user.id);
        if (!isMember) throw new NotGroupMemberException();

        const messageData = await this.groupMessageService.findMessageWithFullPopulation({
            id: messageId,
            group: groupId
        });

        if (!messageData) throw new Error('Message not found');

        return createApiResponse<GetMessageResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: this.serializeMessage(messageData.message, messageData.group, messageData.author),
            path: req.path
        });
    }

    @Put('/:messageId')
    @Authorized()
    public async updateMessage(
        @Param('groupId') groupId: string,
        @Param('messageId') messageId: string,
        @Body() body: UpdateMessageRequest,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<UpdateMessageResponse>> {
        const message = await this.groupMessageService.updateMessage(
            messageId,
            groupId,
            user.id,
            { content: body.content }
        );

        return createApiResponse<UpdateMessageResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: this.serializeMessage(message),
            path: req.path
        });
    }

    @Delete('/:messageId')
    @Authorized()
    public async deleteMessage(
        @Param('groupId') groupId: string,
        @Param('messageId') messageId: string,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<DeleteMessageResponse>> {
        await this.groupMessageService.deleteMessage(messageId, groupId, user.id);

        return createApiResponse<DeleteMessageResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: { success: true },
            path: req.path
        });
    }
}