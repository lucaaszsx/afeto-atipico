import {
    GroupAlreadyExistsException,
    UserNotFoundException,
    GroupNotFoundException,
    NotGroupOwnerException
} from '../responses';
import { DbGroupMessageModel } from '@/database/models/GroupMessageModel';
import { FilterQuery, UpdateQuery, QueryOptions, ProjectionType } from 'mongoose';
import { IGroup } from '@/types/entities';
import { DbGroupModel } from '@/database/models/GroupModel';
import { MongoErrorCode } from '@/types/enums';
import { LoggerDecorator } from '@/decorators';
import { LoggerInterface } from '@/lib/logger';
import { UserService } from './UserService';
import { Service } from 'typedi';

const isNil = (value: any): value is null | undefined => value === null || value === undefined;

@Service()
export class GroupService {
    constructor(
        @LoggerDecorator(__filename)
        private readonly logger: LoggerInterface,
        private readonly userService: UserService
    ) {}

    // ────────────────────────────────
    // Group CRUD Operations
    // ────────────────────────────────
    public async createGroup(data: Partial<IGroup>): Promise<IGroup> {
        this.logger.info(`Creating new group with name: ${data.name}`);

        try {
            const existingGroup = await this.findGroupByNameAndOwner(data.name!, data.owner!);

            if (existingGroup) {
                this.logger.warn(
                    `Group with name '${data.name}' already exists for owner '${data.owner}'`
                );

                throw new GroupAlreadyExistsException();
            }

            const owner = await this.userService.findOne({ id: data.owner });

            if (!owner) {
                this.logger.warn(`Owner with ID '${data.owner}' not found`);

                throw new UserNotFoundException();
            }

            const document = new DbGroupModel(data);
            const savedDocument = await document.save();

            this.logger.info(`Group ${savedDocument.name} (${savedDocument.id}) created successfully`);

            return savedDocument.toObject();
        } catch (error) {
            if (error instanceof GroupAlreadyExistsException || error instanceof UserNotFoundException) {
                throw error;
            }

            if (
                !isNil(error) &&
                (error as any).code &&
                (error as any).code === MongoErrorCode.DUPLICATE_KEY
            ) {
                this.logger.error(`Duplicate key error while creating group => ${data.name}`);

                throw new GroupAlreadyExistsException();
            }

            this.logger.error(`Failed to create group: ${(error as Error).message}`);

            throw error;
        }
    }

    public async findGroup(
        filter: FilterQuery<IGroup>,
        projection?: ProjectionType<IGroup>,
        options?: QueryOptions
    ): Promise<IGroup | null> {
        const identifier = Object.entries(filter)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');

        this.logger.info(`Finding group with filter => ${identifier}`);

        try {
            const document = await DbGroupModel.findOne(filter, projection, options).lean();

            return document;
        } catch (error) {
            this.logger.error(`Error finding group => ${identifier}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async findGroups(
        filter: FilterQuery<IGroup>,
        projection?: ProjectionType<IGroup>,
        options?: QueryOptions
    ): Promise<IGroup[]> {
        const identifier = Object.entries(filter)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');

        this.logger.info(`Finding groups with filter => ${identifier}`);

        try {
            const documents = await DbGroupModel.find(filter, projection, options).lean();

            return documents;
        } catch (error) {
            this.logger.error(`Error finding groups => ${identifier}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async updateGroup(
        filter: FilterQuery<IGroup>,
        update: UpdateQuery<IGroup>,
        options: QueryOptions = {}
    ): Promise<IGroup> {
        const identifier = Object.entries(filter)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');

        this.logger.info(`Updating group with filter => ${identifier}`);

        try {
            const document = await DbGroupModel.findOneAndUpdate(filter, update, {
                new: true,
                runValidators: true,
                ...options
            }).lean();

            if (!document) {
                this.logger.warn(`Group not found for update => ${identifier}`);

                throw new GroupNotFoundException();
            }

            this.logger.info(`Group updated successfully => ${identifier}`);

            return document;
        } catch (error) {
            if (error instanceof GroupNotFoundException) throw error;

            if (
                !isNil(error) &&
                (error as any).code &&
                (error as any).code === MongoErrorCode.DUPLICATE_KEY
            ) {
                this.logger.error(`Duplicate key error updating group => ${identifier}`);

                throw new GroupAlreadyExistsException();
            }

            this.logger.error(`Error updating group => ${identifier}: ${(error as Error).message}`);

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
            await DbGroupMessageModel.deleteMany({ group: groupId });

            this.logger.info(`Group '${groupId}' and all its messages deleted successfully`);

            return true;
        } catch (error) {
            this.logger.error(`Failed to delete group: ${(error as Error).message}`);

            throw error;
        }
    }

    public async findGroupById(
        id: string,
        projection?: ProjectionType<IGroup>
    ): Promise<IGroup | null> {
        this.logger.info(`Finding group by ID => ${id}`);

        try {
            return await this.findGroup({ id }, projection);
        } catch (error) {
            this.logger.error(`Error finding group by ID => ${id}: ${(error as Error).message}`);

            throw error;
        }
    }

    private async findGroupByNameAndOwner(name: string, owner: string): Promise<IGroup | null> {
        return this.findGroup({ name, owner });
    }

    // ────────────────────────────────
    // Group Query Operations
    // ────────────────────────────────
    public async getAllPublicGroups(options?: QueryOptions): Promise<IGroup[]> {
        this.logger.info('Getting all public groups');

        try {
            const groups = await this.findGroups(
                {},
                undefined,
                { sort: { updatedAt: -1 }, ...options }
            );

            return groups;
        } catch (error) {
            this.logger.error(`Failed to get public groups: ${(error as Error).message}`);

            throw error;
        }
    }

    public async searchGroups(query: string, options?: QueryOptions): Promise<IGroup[]> {
        this.logger.info(`Searching groups with query => ${query}`);

        try {
            const searchFilter = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { tags: { $in: [new RegExp(query, 'i')] } }
                ]
            };
            const groups = await this.findGroups(
                searchFilter,
                undefined,
                {
                    sort: { updatedAt: -1 },
                    ...options
                }
            );

            return groups;
        } catch (error) {
            this.logger.error(`Failed to search groups: ${(error as Error).message}`);

            throw error;
        }
    }

    public async getUserGroups(userId: string): Promise<IGroup[]> {
        this.logger.info(`Getting groups for user ${userId}`);

        try {
            const groups = await this.findGroups(
                { members: userId },
                undefined,
                {
                    sort: { updatedAt: -1 }
                }
            );

            return groups;
        } catch (error) {
            this.logger.error(`Failed to get user groups: ${(error as Error).message}`);

            throw error;
        }
    }

    public async existsById(id: string): Promise<boolean> {
        try {
            const group = await this.findGroupById(id, { id: 1 });

            return !!group;
        } catch (error) {
            this.logger.error(`Error checking if group exists by ID => ${id}: ${(error as Error).message}`);

            return false;
        }
    }

    public async getGroupOwner(groupId: string): Promise<string | null> {
        try {
            const group = await this.findGroup({ id: groupId }, { owner: 1 });

            return group?.owner || null;
        } catch (error) {
            this.logger.error(`Error getting group owner: ${(error as Error).message}`);

            return null;
        }
    }
}