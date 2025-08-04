import {
    UsernameAlreadyExistsException,
    EmailAlreadyExistsException,
    UserNotFoundException
} from '../responses';
import { MongooseError, ProjectionType, UpdateQuery, QueryOptions, FilterQuery } from 'mongoose';
import { EventDispatcherDecorator, LoggerDecorator } from '@/decorators';
import { ClassTransformOptions } from 'class-transformer';
import { EventDispatcher } from 'event-dispatch';
import { LoggerInterface } from '@/lib/logger';
import { MongoErrorCode } from '@/types/enums';
import { WSEventType } from '@/websocket';
import { DbUserModel } from '@/database';
import { IUser } from '@/types/entities';
import { Service } from 'typedi';

@Service()
export class UserService {
    constructor(
        @EventDispatcherDecorator()
        private readonly eventDispatcher: EventDispatcher,
        @LoggerDecorator(__filename)
        private readonly logger: LoggerInterface
    ) {}
    
    private handleDuplicateKeyError(identifier: string, error: any): void {
        const duplicatedKey = Object.keys(error.keyPattern ?? {}).find(() => true);
        
        this.logger.error(`Duplicate key '${duplicatedKey || 'unknown'}' error while creating user => ${identifier}`);

        switch (duplicatedKey)  {
            case 'username':
                throw new UsernameAlreadyExistsException();
                
            case 'email':
                throw new EmailAlreadyExistsException();
        }
    }

    // Fix the logging to handle complex filter objects safely
    private formatFilterForLogging(filter: FilterQuery<IUser>): string {
        try {
            return Object.entries(filter)
                .map(([k, v]) => {
                    if (typeof v === 'object' && v !== null) {
                        // Handle MongoDB operators like $in, $regex, etc.
                        if ('$in' in v && Array.isArray(v.$in)) return `${k}=[${v.$in.join(',')}]`;
                        if ('$regex' in v) return `${k}=/${v.$regex}/${v.$options || ''}`;
                        // For other complex objects, use JSON.stringify safely
                        return `${k}=${JSON.stringify(v)}`;
                    }
                    return `${k}=${v}`;
                })
                .join('; ');
        } catch (error) {
            // Fallback if JSON.stringify fails
            return 'complex_filter';
        }
    }

    public async create(
        data: Partial<IUser>,
        transformOptions?: ClassTransformOptions
    ): Promise<IUser> {
        const identifier = `"${data.displayName || 'unknown'}" <${data.email || 'unknown@unknown'}>`;

        this.logger.info(`Creating new user => ${identifier}`);

        const document = new DbUserModel(data);

        try {
            const savedDocument = await document.save();

            this.logger.info(`User created successfully => ${identifier}`);

            return transformOptions && savedDocument
                ? savedDocument.toObject()
                : savedDocument;
        } catch (error: unknown) {
            if (
                error &&
                typeof error === 'object' &&
                'code' in error &&
                (error as any).code === MongoErrorCode.DUPLICATE_KEY
            ) this.handleDuplicateKeyError(identifier, error);

            this.logger.error(`Error creating user => ${identifier}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async findOne(
        filter: FilterQuery<IUser>,
        transformOptions?: ClassTransformOptions,
        projection?: ProjectionType<IUser>,
        options?: QueryOptions
    ): Promise<IUser | null> {
        const identifier = this.formatFilterForLogging(filter);

        this.logger.info(`Getting a single user with filter => ${identifier}`);

        try {
            const document = await DbUserModel.findOne(filter, projection, options);

            return transformOptions && document
                ? document.toObject()
                : document;
        } catch (error: unknown) {
            this.logger.error(`Error finding user => ${identifier}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async findUsers(
        filter: FilterQuery<IUser>,
        transformOptions?: ClassTransformOptions,
        projection?: ProjectionType<IUser>,
        options?: QueryOptions
    ): Promise<IUser[]> {
        const identifier = this.formatFilterForLogging(filter);

        this.logger.info(`Getting multiple users with filter => ${identifier}`);

        try {
            const documents = await DbUserModel.find(filter, projection, options);

            return transformOptions && documents.length > 0
                ? documents.map(doc => doc.toObject())
                : documents;
        } catch (error: unknown) {
            this.logger.error(`Error finding users => ${identifier}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async update(
        query: FilterQuery<IUser>,
        data: UpdateQuery<IUser>,
        transformOptions?: ClassTransformOptions,
        options: QueryOptions = {}
    ): Promise<IUser> {
        const identifier = this.formatFilterForLogging(query);

        try {
            const document = await DbUserModel.findOneAndUpdate(query, data, {
                runValidators: true,
                returnDocument: 'after',
                ...options
            });

            if (!document) {
                this.logger.warn(`User not found for update => ${identifier}`);

                throw new UserNotFoundException();
            }

            this.logger.info(`User updated successfully => ${identifier}`);
            
            this.eventDispatcher.dispatch(WSEventType.USER_UPDATE, document);
            
            return transformOptions
                ? document.toObject()
                : document;
        } catch (error: unknown) {
            if (error instanceof UserNotFoundException) throw error;
            if (
                error &&
                typeof error === 'object' &&
                'code' in error &&
                (error as any).code === MongoErrorCode.DUPLICATE_KEY
            ) this.handleDuplicateKeyError(identifier, error);

            this.logger.error(`Error updating user => ${identifier}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async delete(id: string): Promise<boolean> {
        this.logger.info(`Deleting user => ${id}`);

        try {
            const result = await DbUserModel.deleteOne({ id });

            if (result.deletedCount === 0) {
                this.logger.warn(`User not found for deletion => ${id}`);

                throw new UserNotFoundException();
            }

            this.logger.info(`User deleted successfully => ${id}`);

            return true;
        } catch (error: unknown) {
            if (error instanceof UserNotFoundException) throw error;

            this.logger.error(`Error deleting user => ${id}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async findById(
        id: string,
        transformOptions?: ClassTransformOptions,
        projection?: ProjectionType<IUser>
    ): Promise<IUser | null> {
        this.logger.info(`Finding user by ID => ${id}`);

        try {
            return await this.findOne({ id }, transformOptions, projection);
        } catch (error: unknown) {
            this.logger.error(`Error finding user by ID => ${id}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async findByEmail(
        email: string,
        transformOptions?: ClassTransformOptions,
        projection?: ProjectionType<IUser>
    ): Promise<IUser | null> {
        this.logger.info(`Finding user by email => ${email}`);

        try {
            return await this.findOne({ email }, transformOptions, projection);
        } catch (error: unknown) {
            this.logger.error(`Error finding user by email => ${email}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async findByUsername(
        username: string,
        transformOptions?: ClassTransformOptions,
        projection?: ProjectionType<IUser>
    ): Promise<IUser | null> {
        this.logger.info(`Finding user by username => ${username}`);

        try {
            return await this.findOne({ username }, transformOptions, projection);
        } catch (error: unknown) {
            this.logger.error(`Error finding user by username => ${username}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async existsById(id: string): Promise<boolean> {
        try {
            const user = await this.findById(id, undefined, { id: 1 });

            return !!user;
        } catch (error: unknown) {
            this.logger.error(`Error checking if user exists by ID => ${id}: ${(error as Error).message}`);

            return false;
        }
    }

    public async searchUsers(query: string, options?: QueryOptions): Promise<IUser[]> {
        this.logger.info(`Searching users with query => ${query}`);

        try {
            const searchFilter = {
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { displayName: { $regex: query, $options: 'i' } }
                ]
            };
            const users = await this.findUsers(
                searchFilter,
                undefined,
                { password: 0, verifications: 0, sessions: 0, passwordReset: 0 },
                { sort: { username: 1 }, limit: 20, ...options }
            );

            return users;
        } catch (error: unknown) {
            this.logger.error(`Error searching users with query => ${query}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async updatePassword(userId: string, newPassword: string): Promise<IUser> {
        this.logger.info(`Updating password for user => ${userId}`);

        try {
            const updatedUser = await this.update({ id: userId }, { password: newPassword });

            return updatedUser;
        } catch (error: unknown) {
            this.logger.error(`Error updating password for user => ${userId}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async addChild(userId: string, childData: any): Promise<IUser> {
        this.logger.info(`Adding child to user => ${userId}`);

        try {
            const updatedUser = await this.update(
                { id: userId },
                { $push: { children: childData } }
            );

            return updatedUser;
        } catch (error: unknown) {
            this.logger.error(`Error adding child to user => ${userId}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async removeChild(userId: string, childId: string): Promise<IUser> {
        this.logger.info(`Removing child ${childId} from user => ${userId}`);

        try {
            const updatedUser = await this.update(
                { id: userId },
                { $pull: { children: { id: childId } } }
            );

            return updatedUser;
        } catch (error: unknown) {
            this.logger.error(`Error removing child from user => ${userId}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async updateChild(userId: string, childId: string, childData: any): Promise<IUser> {
        this.logger.info(`Updating child ${childId} for user => ${userId}`);

        try {
            const updatedUser = await this.update(
                {
                    'id': userId,
                    'children.id': childId
                },
                {
                    $set: {
                        'children.$.name': childData.name,
                        'children.$.age': childData.age,
                        'children.$.notes': childData.notes
                    }
                }
            );

            return updatedUser;
        } catch (error: unknown) {
            this.logger.error(`Error updating child for user => ${userId}: ${(error as Error).message}`);

            throw error;
        }
    }

    public async findMany(filter: FilterQuery<IUser>): Promise<IUser[]> {
        return this.findUsers(filter);
    }
}