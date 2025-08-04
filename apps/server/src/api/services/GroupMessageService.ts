import {
    ReplyMessageNotFoundException,
    NotMessageAuthorException,
    MessageNotFoundException,
    NotGroupMemberException,
    GroupNotFoundException
} from '../responses';
import { DbGroupMessageModel } from '@/database/models/GroupMessageModel';
import { FilterQuery, UpdateQuery, QueryOptions, ProjectionType } from 'mongoose';
import { GroupMemberService } from './GroupMemberService';
import { IGroupMessage } from '@/types/entities';
import { LoggerDecorator } from '@/decorators';
import { LoggerInterface } from '@/lib/logger';
import { GroupService } from './GroupService';
import { UserService } from './UserService';
import { Service } from 'typedi';

@Service()
export class GroupMessageService {
    constructor(
        @LoggerDecorator(__filename)
        private readonly logger: LoggerInterface,
        private readonly userService: UserService,
        private readonly groupService: GroupService
    ) {}

    // ────────────────────────────────
    // Helper Methods for Population
    // ────────────────────────────────
    public async getGroupById(groupId: string): Promise<any> {
        return await this.groupService.findGroup({ id: groupId });
    }

    public async getAuthorById(authorId: string): Promise<any> {
        return await this.userService.findOne(
            { id: authorId },
            undefined,
            { password: 0, verifications: 0, sessions: 0, passwordReset: 0 }
        );
    }

    // ────────────────────────────────
    // Message Management
    // ────────────────────────────────
    public async createMessage(data: Partial<IGroupMessage>): Promise<IGroupMessage> {
        this.logger.info(`Creating message in group ${data.group} by ${data.author}`);

        try {
            const group = await this.groupService.findGroup({ id: data.group });

            if (!group) {
                this.logger.warn(`Group '${data.group}' not found`);

                throw new GroupNotFoundException();
            }
            if (!group.members.includes(data.author!)) {
                this.logger.warn(
                    `User '${data.author}' is not a member of group '${data.group}'`
                );

                throw new NotGroupMemberException();
            }

            if (data.replyTo) {
                const replyMessage = await this.findMessage({
                    id: data.replyTo,
                    group: data.group
                });

                if (!replyMessage) {
                    this.logger.warn(
                        `Reply message '${data.replyTo}' not found in group '${data.group}'`
                    );

                    throw new ReplyMessageNotFoundException();
                }
            }

            const document = new DbGroupMessageModel(data);
            const savedDocument = await document.save();

            this.logger.info(
                `Message '${savedDocument.id}' created successfully in group '${data.group}'`
            );

            return savedDocument.toObject();
        } catch (error) {
            this.logger.error(`Failed to create message: ${(error as Error).message}`);

            throw error;
        }
    }

    public async findMessage(
        filter: FilterQuery<IGroupMessage>,
        projection?: ProjectionType<IGroupMessage>,
        options?: QueryOptions
    ): Promise<IGroupMessage | null> {
        const identifier = Object.entries(filter)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');

        this.logger.info(`Finding message with filter => ${identifier}`);

        try {
            const document = await DbGroupMessageModel.findOne(filter, projection, options).lean();

            return document;
        } catch (error) {
            this.logger.error(`Error finding message => ${identifier}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async findMessages(
        filter: FilterQuery<IGroupMessage>,
        projection?: ProjectionType<IGroupMessage>,
        options?: QueryOptions
    ): Promise<IGroupMessage[]> {
        const identifier = Object.entries(filter)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');

        this.logger.info(`Finding messages with filter => ${identifier}`);

        try {
            const documents = await DbGroupMessageModel.find(filter, projection, options).lean();

            return documents;
        } catch (error) {
            this.logger.error(`Error finding messages => ${identifier}: ${(error as Error).message}`);

            throw error;
        }
    }

    // Find single message with populated data (3 queries total)
    public async findMessageWithPopulation(
        filter: FilterQuery<IGroupMessage>,
        projection?: ProjectionType<IGroupMessage>,
        options?: QueryOptions
    ): Promise<IGroupMessage | null> {
        const identifier = Object.entries(filter)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');

        this.logger.info(`Finding message with population => ${identifier}`);

        try {
            // Query 1: Find the message
            const message = await DbGroupMessageModel.findOne(filter, projection, options).lean();
            if (!message) return null;

            // Queries 2 & 3: Fetch group and author in parallel
            const [group, author] = await Promise.all([
                this.groupService.findGroup({ id: message.group }),
                this.userService.findOne({ id: message.author })
            ]);

            // Combine data
            return {
                ...message,
                group: group?.id || message.group,
                author: author?.id || message.author
            };
        } catch (error) {
            this.logger.error(`Error finding message with population => ${identifier}: ${(error as Error).message}`);
            throw error;
        }
    }

    // New method: Find single message with FULL population data
    public async findMessageWithFullPopulation(
        filter: FilterQuery<IGroupMessage>,
        projection?: ProjectionType<IGroupMessage>,
        options?: QueryOptions
    ): Promise<{ message: IGroupMessage; group: any; author: any } | null> {
        const identifier = Object.entries(filter)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');

        this.logger.info(`Finding message with full population => ${identifier}`);

        try {
            // Query 1: Find the message
            const message = await DbGroupMessageModel.findOne(filter, projection, options).lean();
            if (!message) return null;

            // Queries 2 & 3: Fetch group and author in parallel
            const [group, author] = await Promise.all([
                this.groupService.findGroup({ id: message.group }),
                this.userService.findOne(
                    { id: message.author },
                    undefined,
                    { password: 0, verifications: 0, sessions: 0, passwordReset: 0 }
                )
            ]);

            return {
                message,
                group,
                author
            };
        } catch (error) {
            this.logger.error(`Error finding message with full population => ${identifier}: ${(error as Error).message}`);
            throw error;
        }
    }

    // Find multiple messages with populated data (3 queries total)
    public async findMessagesWithPopulation(
        filter: FilterQuery<IGroupMessage>,
        projection?: ProjectionType<IGroupMessage>,
        options?: QueryOptions
    ): Promise<IGroupMessage[]> {
        const identifier = Object.entries(filter)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');

        this.logger.info(`Finding messages with population => ${identifier}`);

        try {
            // Query 1: Find all messages
            const messages = await DbGroupMessageModel.find(filter, projection, options).lean();
            if (!messages.length) return [];

            // Extract unique IDs to fetch once
            const groupIds = [...new Set(messages.map(msg => msg.group))];
            const authorIds = [...new Set(messages.map(msg => msg.author))];

            // Queries 2 & 3: Fetch all groups and users at once
            const [groups, authors] = await Promise.all([
                this.groupService.findGroups({ id: { $in: groupIds } }),
                this.userService.findUsers(
                    { id: { $in: authorIds } },
                    undefined,
                    { password: 0, verifications: 0, sessions: 0, passwordReset: 0 }
                )
            ]);

            // Create maps for O(1) lookup
            const groupMap = new Map(groups.map(g => [g.id, g]));
            const authorMap = new Map(authors.map(a => [a.id, a]));

            // Combine data (in-memory operation, very fast)
            return messages.map(message => ({
                ...message,
                group: groupMap.get(message.group)?.id || message.group,
                author: authorMap.get(message.author)?.id || message.author
            }));
        } catch (error) {
            this.logger.error(`Error finding messages with population => ${identifier}: ${(error as Error).message}`);
            throw error;
        }
    }
 
    /**
     * Get group messages with proper pagination support
     * Handles cursor-based pagination with consistent ordering
     */
    public async getGroupMessagesWithPagination(
        groupId: string,
        requesterId: string,
        options: {
            limit?: number;
            sort?: Record<string, 1 | -1>;
            skip?: number;
            filter?: Record<string, any>;
        } = {}
    ): Promise<any[]> {
        this.logger.info(`Getting messages with pagination for group ${groupId} by ${requesterId}`);
    
        try {
            const group = await this.groupService.findGroup({ id: groupId });
    
            if (!group) {
                this.logger.warn(`Group '${groupId}' not found`);
                throw new GroupNotFoundException();
            }
            if (!group.members.includes(requesterId)) {
                this.logger.warn(`User '${requesterId}' is not a member of group '${groupId}'`);
                throw new NotGroupMemberException();
            }
    
            // Build the query filter
            const queryFilter: FilterQuery<IGroupMessage> = {
                group: groupId,
                ...options.filter
            };
    
            // Build query options with chronological order (oldest first)
            const queryOptions: QueryOptions = {
                sort: options.sort || { createdAt: 1 }, // Default to chronological order
                limit: options.limit || 50
            };
    
            if (options.skip) queryOptions.skip = options.skip;
    
            // Query 1: Find all messages with the constructed filter and options
            const messages = await DbGroupMessageModel.find(
                queryFilter,
                undefined,
                queryOptions
            ).lean();
    
            if (!messages.length) return [];
    
            // Extract unique author IDs
            const authorIds = [...new Set(messages.map(msg => msg.author))];
    
            // Query 2: Fetch all authors at once
            const authors = await this.userService.findUsers(
                { id: { $in: authorIds } },
                undefined,
                { password: 0, verifications: 0, sessions: 0, passwordReset: 0 }
            );
    
            // Create maps for O(1) lookup
            const authorMap = new Map(authors.map(a => [a.id, a]));
    
            // Combine data with full objects
            return messages.map(message => ({
                ...message,
                groupData: group,        // Full group object
                authorData: authorMap.get(message.author) // Full author object
            }));
        } catch (error) {
            this.logger.error(`Failed to get group messages with pagination: ${(error as Error).message}`);
            throw error;
        }
    }

    // Find multiple messages with FULL population data
    public async getGroupMessagesWithPopulation(
        groupId: string,
        requesterId: string,
        options?: QueryOptions
    ): Promise<any[]> {
        this.logger.info(`Getting messages with full population for group ${groupId} by ${requesterId}`);
    
        try {
            const group = await this.groupService.findGroup({ id: groupId });
    
            if (!group) {
                this.logger.warn(`Group '${groupId}' not found`);
                throw new GroupNotFoundException();
            }
            if (!group.members.includes(requesterId)) {
                this.logger.warn(`User '${requesterId}' is not a member of group '${groupId}'`);
                throw new NotGroupMemberException();
            }
    
            // Query 1: Find all messages
            const messages = await DbGroupMessageModel.find(
                { group: groupId },
                undefined,
                {
                    sort: { createdAt: 1 },
                    limit: 50,
                    ...options
                }
            ).lean();
    
            if (!messages.length) return [];
    
            // Extract unique author IDs
            const authorIds = [...new Set(messages.map(msg => msg.author))];
    
            // Query 2: Fetch all authors at once
            const authors = await this.userService.findUsers(
                { id: { $in: authorIds } },
                undefined,
                { password: 0, verifications: 0, sessions: 0, passwordReset: 0 }
            );
    
            // Create maps for O(1) lookup
            const authorMap = new Map(authors.map(a => [a.id, a]));
    
            // Combine data with full objects
            return messages.map(message => ({
                ...message,
                groupData: group,        // Full group object
                authorData: authorMap.get(message.author) // Full author object
            }));
        } catch (error) {
            this.logger.error(`Failed to get group messages with population: ${(error as Error).message}`);
            throw error;
        }
    }

    public async getGroupMessages(
        groupId: string,
        requesterId: string,
        options?: QueryOptions
    ): Promise<IGroupMessage[]> {
        this.logger.info(`Getting messages for group ${groupId} by ${requesterId}`);
    
        try {
            const group = await this.groupService.findGroup({ id: groupId });
    
            if (!group) {
                this.logger.warn(`Group '${groupId}' not found`);
                throw new GroupNotFoundException();
            }
            if (!group.members.includes(requesterId)) {
                this.logger.warn(`User '${requesterId}' is not a member of group '${groupId}'`);
                throw new NotGroupMemberException();
            }
    
            const messages = await this.findMessagesWithPopulation(
                { group: groupId },
                undefined,
                {
                    sort: { createdAt: 1 },
                    limit: 50,
                    ...options
                }
            );
    
            return messages;
        } catch (error) {
            this.logger.error(`Failed to get group messages: ${(error as Error).message}`);
            throw error;
        }
    }

    public async updateMessage(
        messageId: string,
        groupId: string,
        authorId: string,
        update: UpdateQuery<IGroupMessage>
    ): Promise<IGroupMessage> {
        this.logger.info(`Updating message ${messageId} in group ${groupId} by ${authorId}`);

        try {
            const message = await this.findMessage({ id: messageId, group: groupId, author: authorId });

            if (!message) {
                this.logger.warn(
                    `Message '${messageId}' not found or user '${authorId}' is not the author`
                );
                throw new NotMessageAuthorException();
            }

            const updatedDocument = await DbGroupMessageModel.findOneAndUpdate(
                { id: messageId, group: groupId, author: authorId },
                update,
                { new: true, runValidators: true }
            ).lean();

            if (!updatedDocument) throw new MessageNotFoundException();

            this.logger.info(`Message '${messageId}' updated successfully`);

            return updatedDocument;
        } catch (error) {
            this.logger.error(`Error updating message: ${(error as Error).message}`);
            throw error;
        }
    }

    public async deleteMessage(
        messageId: string,
        groupId: string,
        requesterId: string
    ): Promise<boolean> {
        this.logger.info(`Deleting message ${messageId} from group ${groupId} by ${requesterId}`);

        try {
            const group = await this.groupService.findGroup({ id: groupId });

            if (!group) {
                this.logger.warn(`Group '${groupId}' not found`);
                throw new GroupNotFoundException();
            }

            const message = await this.findMessage({ id: messageId, group: groupId });

            if (!message) {
                this.logger.warn(`Message '${messageId}' not found in group '${groupId}'`);
                throw new MessageNotFoundException();
            }

            if (message.author !== requesterId && group.owner !== requesterId) {
                this.logger.warn(`User '${requesterId}' cannot delete message '${messageId}'`);
                throw new NotMessageAuthorException();
            }

            await DbGroupMessageModel.deleteOne({ id: messageId, group: groupId });

            this.logger.info(`Message '${messageId}' deleted successfully from group '${groupId}'`);

            return true;
        } catch (error) {
            this.logger.error(`Failed to delete message: ${(error as Error).message}`);
            throw error;
        }
    }

    // ────────────────────────────────
    // Message Validation Methods
    // ────────────────────────────────
    public async validateMessageAuthor(messageId: string, groupId: string, authorId: string): Promise<void> {
        const message = await this.findMessage({ id: messageId, group: groupId });

        if (!message) {
            this.logger.warn(`Message '${messageId}' not found in group '${groupId}'`);
            throw new MessageNotFoundException();
        }

        if (message.author !== authorId) {
            this.logger.warn(`User '${authorId}' is not the author of message '${messageId}'`);
            throw new NotMessageAuthorException();
        }
    }

    public async canDeleteMessage(messageId: string, groupId: string, requesterId: string): Promise<boolean> {
        try {
            const [group, message] = await Promise.all([
                this.groupService.findGroup({ id: groupId }),
                this.findMessage({ id: messageId, group: groupId })
            ]);

            if (!group || !message) {
                return false;
            }

            // Can delete if user is the author or group owner
            return message.author === requesterId || group.owner === requesterId;
        } catch (error) {
            this.logger.error(`Error checking delete permission: ${(error as Error).message}`);
            return false;
        }
    }
}