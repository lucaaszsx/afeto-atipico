import {
    CannotLeaveAsGroupOwnerException,
    ReplyMessageNotFoundException,
    GroupAlreadyExistsException,
    AlreadyGroupMemberException,
    CannotRemoveOwnerException,
    NotMessageAuthorException,
    MessageNotFoundException,
    NotGroupMemberException,
    EntityNotFoundException,
    GroupNotFoundException,
    NotGroupOwnerException
} from '../responses';
import { DbGroupMessageModel } from '@/database/models/GroupMessageModel';
import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { IGroupMessage, IGroup, IUser } from '@/types/entities';
import { DbGroupModel } from '@/database/models/GroupModel';
import { LoggerDecorator } from '@/decorators';
import { LoggerInterface } from '@/lib/logger';
import { UserService } from './UserService';
import { Service } from 'typedi';

@Service()
export class GroupService {
    constructor(
        @LoggerDecorator(__filename)
        private readonly logger: LoggerInterface,
        private readonly userService: UserService
    ) {}

    // ────────────────────────────────
    // Group Management
    // ────────────────────────────────
    public async createGroup(data: Partial<IGroup>): Promise<IGroup> {
        this.logger.info(`Creating new group with name: ${data.name}`);

        try {
            const existingGroup = await this.findGroupByNameAndOwner(data.name, data.owner);

            if (existingGroup) {
                this.logger.warn(
                    `Group with name '${data.name}' already exists for owner '${data.owner}'`
                );

                throw new GroupAlreadyExistsException();
            }

            const owner = await this.userService.findOne({ id: data.owner });

            if (!owner) {
                this.logger.warn(`Owner with ID '${data.owner}' not found`);

                throw new EntityNotFoundException();
            }

            const group = new DbGroupModel(data);
            const savedGroup = await group.save();

            this.logger.info(`Group ${savedGroup.name} (${savedGroup.id}) created successfully`);

            return savedGroup.toObject();
        } catch (error) {
            this.logger.error(`Failed to create group: ${error.message}`);

            throw error;
        }
    }

    public async findGroup(filter: FilterQuery<IGroup>, projection?: any): Promise<IGroup | null> {
        try {
            const group = await DbGroupModel.findOne(filter, projection).lean();

            return group;
        } catch (error) {
            this.logger.error(`Error finding group: ${error.message}`);

            throw error;
        }
    }

    public async findGroups(
        filter: FilterQuery<IGroup>,
        projection?: any,
        options?: QueryOptions
    ): Promise<IGroup[]> {
        try {
            const groups = await DbGroupModel.find(filter, projection, options).lean();

            return groups;
        } catch (error) {
            this.logger.error(`Error finding groups: ${error.message}`);

            throw error;
        }
    }

    public async updateGroup(
        filter: FilterQuery<IGroup>,
        update: UpdateQuery<IGroup>
    ): Promise<IGroup> {
        try {
            const updatedGroup = await DbGroupModel.findOneAndUpdate(filter, update, {
                new: true,
                runValidators: true
            }).lean();

            if (!updatedGroup) throw new GroupNotFoundException();

            return updatedGroup;
        } catch (error) {
            this.logger.error(`Error updating group: ${error.message}`);

            throw error;
        }
    }

    public async deleteGroup(groupId: string, ownerId: string): Promise<boolean> {
        this.logger.info(`Deleting group ${groupId} by owner ${ownerId}`);

        try {
            const group = await this.findGroup({ id: groupId, owner: ownerId });

            if (!group) {
                this.logger.warn(
                    `Group '${groupId}' not found or user '${ownerId}' is not the owner`
                );

                throw new NotGroupOwnerException();
            }

            await DbGroupModel.deleteOne({ id: groupId });
            await DbGroupMessageModel.deleteMany({ groupId });

            this.logger.info(`Group '${groupId}' and all its messages deleted successfully`);

            return true;
        } catch (error) {
            this.logger.error(`Failed to delete group: ${error.message}`);

            throw error;
        }
    }

    private async findGroupByNameAndOwner(name: string, owner: string): Promise<IGroup | null> {
        return this.findGroup({ name, owner });
    }

    // ────────────────────────────────
    // Member Management
    // ────────────────────────────────
    public async joinGroup(groupId: string, userId: string): Promise<IGroup> {
        this.logger.info(`User ${userId} joining group ${groupId}`);

        try {
            const group = await this.findGroup({ id: groupId });

            if (!group) {
                this.logger.warn(`Group '${groupId}' not found`);

                throw new GroupNotFoundException();
            }

            const user = await this.userService.findOne({ id: userId });

            if (!user) {
                this.logger.warn(`User '${userId}' not found`);

                throw new EntityNotFoundException();
            }

            if (group.members.includes(userId)) {
                this.logger.warn(`User '${userId}' is already a member of group '${groupId}'`);

                throw new AlreadyGroupMemberException();
            }

            const updatedGroup = await this.updateGroup(
                { id: groupId },
                { $addToSet: { members: userId } }
            );

            this.logger.info(`User '${userId}' joined group '${groupId}' successfully`);

            return updatedGroup;
        } catch (error) {
            this.logger.error(`Failed to join group: ${error.message}`);

            throw error;
        }
    }

    public async leaveGroup(groupId: string, userId: string): Promise<IGroup> {
        this.logger.info(`User ${userId} leaving group ${groupId}`);

        try {
            const group = await this.findGroup({ id: groupId });

            if (!group) {
                this.logger.warn(`Group '${groupId}' not found`);

                throw new GroupNotFoundException();
            }

            if (group.owner === userId) {
                this.logger.warn(`Owner '${userId}' cannot leave group '${groupId}'`);

                throw new CannotLeaveAsGroupOwnerException();
            }

            if (!group.members.includes(userId)) {
                this.logger.warn(`User '${userId}' is not a member of group '${groupId}'`);

                throw new NotGroupMemberException();
            }

            const updatedGroup = await this.updateGroup(
                { id: groupId },
                { $pull: { members: userId } }
            );

            this.logger.info(`User '${userId}' left group '${groupId}' successfully`);

            return updatedGroup;
        } catch (error) {
            this.logger.error(`Failed to leave group: ${error.message}`);

            throw error;
        }
    }

    public async removeMember(
        groupId: string,
        userId: string,
        requesterId: string
    ): Promise<IGroup> {
        this.logger.info(`Removing member ${userId} from group ${groupId} by ${requesterId}`);

        try {
            const group = await this.findGroup({ id: groupId });

            if (!group) {
                this.logger.warn(`Group '${groupId}' not found`);

                throw new GroupNotFoundException();
            }
            if (group.owner !== requesterId) {
                this.logger.warn(`User '${requesterId}' is not the owner of group '${groupId}'`);

                throw new NotGroupOwnerException();
            }
            if (group.owner === userId) {
                this.logger.warn(`Cannot remove owner '${userId}' from group '${groupId}'`);

                throw new CannotRemoveOwnerException();
            }
            if (!group.members.includes(userId)) {
                this.logger.warn(`User '${userId}' is not a member of group '${groupId}'`);

                throw new NotGroupMemberException();
            }

            const updatedGroup = await this.updateGroup(
                { id: groupId },
                { $pull: { members: userId } }
            );

            this.logger.info(
                `Member '${userId}' removed from group '${groupId}' successfully by owner`
            );

            return updatedGroup;
        } catch (error) {
            this.logger.error(`Failed to remove member from group: ${error.message}`);

            throw error;
        }
    }

    public async getGroupMembers(groupId: string, requesterId?: string): Promise<IUser[]> {
        this.logger.info(`Getting members for group ${groupId}`);

        try {
            const group = await this.findGroup({ id: groupId });

            if (!group) {
                this.logger.warn(`Group '${groupId}' not found`);

                throw new GroupNotFoundException();
            }

            const members = await this.userService.findUsers(
                { id: { $in: group.members } },
                { password: 0, verifications: 0, sessions: 0, passwordReset: 0 }
            );

            return members;
        } catch (error) {
            this.logger.error(`Failed to get group members: ${error.message}`);

            throw error;
        }
    }

    // ────────────────────────────────
    // Message Management
    // ────────────────────────────────
    public async createMessage(data: Partial<IGroupMessage>): Promise<IGroupMessage> {
        this.logger.info(`Creating message in group ${data.groupId} by ${data.authorId}`);

        try {
            const group = await this.findGroup({ id: data.groupId });

            if (!group) {
                this.logger.warn(`Group '${data.groupId}' not found`);

                throw new GroupNotFoundException();
            }
            if (!group.members.includes(data.authorId)) {
                this.logger.warn(
                    `User '${data.authorId}' is not a member of group '${data.groupId}'`
                );

                throw new NotGroupMemberException();
            }

            if (data.replyTo) {
                const replyMessage = await this.findMessage({
                    id: data.replyTo,
                    groupId: data.groupId
                });

                if (!replyMessage) {
                    this.logger.warn(
                        `Reply message '${data.replyTo}' not found in group '${data.groupId}'`
                    );

                    throw new ReplyMessageNotFoundException();
                }
            }

            const message = new DbGroupMessageModel(data);
            const savedMessage = await message.save();

            this.logger.info(
                `Message '${savedMessage.id}' created successfully in group '${data.groupId}'`
            );

            return savedMessage.toObject();
        } catch (error) {
            this.logger.error(`Failed to create message: ${error.message}`);

            throw error;
        }
    }

    public async findMessage(
        filter: FilterQuery<IGroupMessage>,
        projection?: any
    ): Promise<IGroupMessage | null> {
        try {
            const message = await DbGroupMessageModel.findOne(filter, projection).lean();

            return message;
        } catch (error) {
            this.logger.error(`Error finding message: ${error.message}`);

            throw error;
        }
    }

    public async findMessages(
        filter: FilterQuery<IGroupMessage>,
        projection?: any,
        options?: QueryOptions
    ): Promise<IGroupMessage[]> {
        try {
            const messages = await DbGroupMessageModel.find(filter, projection, options).lean();

            return messages;
        } catch (error) {
            this.logger.error(`Error finding messages: ${error.message}`);

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
            const group = await this.findGroup({ id: groupId });

            if (!group) {
                this.logger.warn(`Group '${groupId}' not found`);

                throw new GroupNotFoundException();
            }
            if (!group.members.includes(requesterId)) {
                this.logger.warn(`User '${requesterId}' is not a member of group '${groupId}'`);

                throw new NotGroupMemberException();
            }

            const messages = await this.findMessages({ groupId }, null, {
                sort: { createdAt: -1 },
                limit: 50,
                ...options
            });

            return messages;
        } catch (error) {
            this.logger.error(`Failed to get group messages: ${error.message}`);

            throw error;
        }
    }

    public async updateMessage(
        messageId: string,
        groupId: string,
        authorId: string,
        update: UpdateQuery<IGroupMessage>
    ): Promise<IGroupMessage> {
        try {
            const message = await this.findMessage({ id: messageId, groupId, authorId });

            if (!message) {
                this.logger.warn(
                    `Message '${messageId}' not found or user '${authorId}' is not the author`
                );

                throw new NotMessageAuthorException();
            }

            const updatedMessage = await DbGroupMessageModel.findOneAndUpdate(
                { id: messageId, groupId, authorId },
                update,
                { new: true, runValidators: true }
            ).lean();

            if (!updatedMessage) throw new MessageNotFoundException();

            return updatedMessage;
        } catch (error) {
            this.logger.error(`Error updating message: ${error.message}`);

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
            const group = await this.findGroup({ id: groupId });

            if (!group) {
                this.logger.warn(`Group '${groupId}' not found`);

                throw new GroupNotFoundException();
            }

            const message = await this.findMessage({ id: messageId, groupId });

            if (!message) {
                this.logger.warn(`Message '${messageId}' not found in group '${groupId}'`);

                throw new MessageNotFoundException();
            }

            if (message.authorId !== requesterId && group.owner !== requesterId) {
                this.logger.warn(`User '${requesterId}' cannot delete message '${messageId}'`);

                throw new NotMessageAuthorException();
            }

            await DbGroupMessageModel.deleteOne({ id: messageId, groupId });

            this.logger.info(`Message '${messageId}' deleted successfully from group '${groupId}'`);

            return true;
        } catch (error) {
            this.logger.error(`Failed to delete message: ${error.message}`);

            throw error;
        }
    }

    // ────────────────────────────────
    // Helper Methods
    // ────────────────────────────────
    public async getAllPublicGroups(options?: QueryOptions): Promise<IGroup[]> {
        try {
            const groups = await this.findGroups({}, null, { sort: { updatedAt: -1 }, ...options });
            return groups;
        } catch (error) {
            this.logger.error(`Failed to get public groups: ${error.message}`);
            throw error;
        }
    }

    public async searchGroups(query: string, options?: QueryOptions): Promise<IGroup[]> {
        try {
            const searchFilter = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { tags: { $in: [new RegExp(query, 'i')] } }
                ]
            };
            const groups = await this.findGroups(searchFilter, null, {
                sort: { updatedAt: -1 },
                ...options
            });

            return groups;
        } catch (error) {
            this.logger.error(`Failed to search groups: ${error.message}`);

            throw error;
        }
    }

    public async getUserGroups(userId: string): Promise<IGroup[]> {
        try {
            const groups = await this.findGroups({ members: userId }, null, {
                sort: { updatedAt: -1 }
            });

            return groups;
        } catch (error) {
            this.logger.error(`Failed to get user groups: ${error.message}`);

            throw error;
        }
    }

    public async isGroupMember(groupId: string, userId: string): Promise<boolean> {
        try {
            const group = await this.findGroup({ id: groupId, members: userId });

            return !!group;
        } catch (error) {
            this.logger.error(`Error checking group membership: ${error.message}`);

            return false;
        }
    }

    public async getGroupOwner(groupId: string): Promise<string | null> {
        try {
            const group = await this.findGroup({ id: groupId }, { owner: 1 });

            return group?.owner || null;
        } catch (error) {
            this.logger.error(`Error getting group owner: ${error.message}`);

            return null;
        }
    }
}
