import { UserAlreadyExistsException, UserNotFoundException } from '../responses';
import { ProjectionType, UpdateQuery, QueryOptions, FilterQuery } from 'mongoose';
import { LoggerDecorator } from '@/decorators';
import { LoggerInterface } from '@/lib/logger';
import { MongoErrorCode } from '@/types/enums';
import { DbUserModel } from '@/database';
import { IUser } from '@/types/entities';
import { Service } from 'typedi';
import { isNil } from 'lodash';

@Service()
export class UserService {
    constructor(
        @LoggerDecorator(__filename)
        private readonly logger: LoggerInterface
    ) {}

    public async create(
        data: Partial<IUser>,
        toObjectOptions: Record<string, unknown>
    ): Promise<IUser> {
        const identifier = `"${data.displayName || 'unknown'}" <${data.email || 'unknown@unknown'}>`;

        this.logger.info(`Creating new user => ${identifier}`);

        const document = new DbUserModel(data);

        try {
            const savedDocument = await document.save();

            this.logger.info(`User created successfully => ${identifier}`);

            return savedDocument.toObject(toObjectOptions);
        } catch (error) {
            if (
                !isNil(error) &&
                (error as any).code &&
                (error as any).code === MongoErrorCode.DUPLICATE_KEY
            ) {
                this.logger.error(`Duplicate key error while creating user => ${identifier}`);

                throw new UserAlreadyExistsException();
            }

            this.logger.error(`Error creating user => ${identifier}: ${error.message}`);

            throw error;
        }
    }

    public async findOne(
        filter: FilterQuery<IUser>,
        projection?: ProjectionType<IUser>,
        options?: QueryOptions
    ): Promise<IUser | null> {
        const identifier = Object.entries(filter)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');

        this.logger.info(`Getting a single user with filter => ${identifier}`);

        try {
            const document = await DbUserModel.findOne(filter, projection, options).lean();

            return document;
        } catch (error) {
            this.logger.error(`Error finding user => ${identifier}: ${error.message}`);

            throw error;
        }
    }

    public async findUsers(
        filter: FilterQuery<IUser>,
        projection?: ProjectionType<IUser>,
        options?: QueryOptions
    ): Promise<IUser[]> {
        const identifier = Object.entries(filter)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');

        this.logger.info(`Getting multiple users with filter => ${identifier}`);

        try {
            const documents = await DbUserModel.find(filter, projection, options).lean();

            return documents;
        } catch (error) {
            this.logger.error(`Error finding users => ${identifier}: ${error.message}`);

            throw error;
        }
    }

    public async update(
        query: FilterQuery<IUser>,
        data: UpdateQuery<IUser>,
        options?: QueryOptions
    ): Promise<IUser> {
        const identifier = Object.entries(query)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');

        try {
            const document = await DbUserModel.findOneAndUpdate(query, data, {
                runValidators: true,
                new: true,
                ...options
            }).lean();

            if (!document) {
                this.logger.warn(`User not found for update => ${identifier}`);

                throw new UserNotFoundException();
            }

            this.logger.info(`User updated successfully => ${identifier}`);

            return document;
        } catch (error) {
            if (error instanceof UserNotFoundException) throw error;
            if (
                !isNil(error) &&
                (error as any).code &&
                (error as any).code === MongoErrorCode.DUPLICATE_KEY
            ) {
                this.logger.error(`Duplicate key error updating user => ${identifier}`);

                throw new UserAlreadyExistsException();
            }

            this.logger.error(`Error updating user => ${identifier}: ${error.message}`);

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
        } catch (error) {
            if (error instanceof UserNotFoundException) throw error;

            this.logger.error(`Error deleting user => ${id}: ${error.message}`);

            throw error;
        }
    }

    public async findById(id: string, projection?: ProjectionType<IUser>): Promise<IUser | null> {
        this.logger.info(`Finding user by ID => ${id}`);

        try {
            const user = await this.findOne({ id }, projection);

            return user;
        } catch (error) {
            this.logger.error(`Error finding user by ID => ${id}: ${error.message}`);

            throw error;
        }
    }

    public async findByEmail(
        email: string,
        projection?: ProjectionType<IUser>
    ): Promise<IUser | null> {
        this.logger.info(`Finding user by email => ${email}`);

        try {
            const user = await this.findOne({ email }, projection);

            return user;
        } catch (error) {
            this.logger.error(`Error finding user by email => ${email}: ${error.message}`);

            throw error;
        }
    }

    public async findByUsername(
        username: string,
        projection?: ProjectionType<IUser>
    ): Promise<IUser | null> {
        this.logger.info(`Finding user by username => ${username}`);

        try {
            const user = await this.findOne({ username }, projection);

            return user;
        } catch (error) {
            this.logger.error(`Error finding user by username => ${username}: ${error.message}`);

            throw error;
        }
    }

    public async existsById(id: string): Promise<boolean> {
        try {
            const user = await this.findById(id, { _id: 1 });

            return !!user;
        } catch (error) {
            this.logger.error(`Error checking if user exists by ID => ${id}: ${error.message}`);

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
                { password: 0, verifications: 0, sessions: 0, passwordReset: 0 },
                { sort: { username: 1 }, limit: 20, ...options }
            );

            return users;
        } catch (error) {
            this.logger.error(`Error searching users with query => ${query}: ${error.message}`);

            throw error;
        }
    }

    public async updatePassword(userId: string, newPassword: string): Promise<IUser> {
        this.logger.info(`Updating password for user => ${userId}`);

        try {
            const updatedUser = await this.update({ id: userId }, { password: newPassword });

            return updatedUser;
        } catch (error) {
            this.logger.error(`Error updating password for user => ${userId}: ${error.message}`);

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
        } catch (error) {
            this.logger.error(`Error adding child to user => ${userId}: ${error.message}`);

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
        } catch (error) {
            this.logger.error(`Error removing child from user => ${userId}: ${error.message}`);

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
        } catch (error) {
            this.logger.error(`Error updating child for user => ${userId}: ${error.message}`);

            throw error;
        }
    }
}
