import {
    CannotLeaveAsGroupOwnerException,
    AlreadyGroupMemberException,
    CannotRemoveOwnerException,
    NotGroupMemberException,
    UserNotFoundException,
    GroupNotFoundException,
    NotGroupOwnerException
} from '../responses';
import { GroupService } from './GroupService';
import { IGroup, IUser } from '@/types/entities';
import { LoggerDecorator } from '@/decorators';
import { LoggerInterface } from '@/lib/logger';
import { UserService } from './UserService';
import { Service } from 'typedi';

@Service()
export class GroupMemberService {
    constructor(
        @LoggerDecorator(__filename)
        private readonly logger: LoggerInterface,
        private readonly userService: UserService,
        private readonly groupService: GroupService
    ) {}

    // ────────────────────────────────
    // Member Management
    // ────────────────────────────────
    public async joinGroup(groupId: string, userId: string): Promise<IGroup> {
        this.logger.info(`User ${userId} joining group ${groupId}`);

        try {
            const group = await this.groupService.findGroup({ id: groupId });

            if (!group) {
                this.logger.warn(`Group '${groupId}' not found`);

                throw new GroupNotFoundException();
            }

            const user = await this.userService.findOne({ id: userId });

            if (!user) {
                this.logger.warn(`User '${userId}' not found`);

                throw new UserNotFoundException();
            }

            if (group.members.includes(userId)) {
                this.logger.warn(`User '${userId}' is already a member of group '${groupId}'`);

                throw new AlreadyGroupMemberException();
            }

            const updatedGroup = await this.groupService.updateGroup(
                { id: groupId },
                { $addToSet: { members: userId } }
            );

            this.logger.info(`User '${userId}' joined group '${groupId}' successfully`);

            return updatedGroup;
        } catch (error) {
            this.logger.error(`Failed to join group: ${(error as Error).message}`);

            throw error;
        }
    }

    public async leaveGroup(groupId: string, userId: string): Promise<IGroup> {
        this.logger.info(`User ${userId} leaving group ${groupId}`);

        try {
            const group = await this.groupService.findGroup({ id: groupId });

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

            const updatedGroup = await this.groupService.updateGroup(
                { id: groupId },
                { $pull: { members: userId } }
            );

            this.logger.info(`User '${userId}' left group '${groupId}' successfully`);

            return updatedGroup;
        } catch (error) {
            this.logger.error(`Failed to leave group: ${(error as Error).message}`);

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
            const group = await this.groupService.findGroup({ id: groupId });

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

            const updatedGroup = await this.groupService.updateGroup(
                { id: groupId },
                { $pull: { members: userId } }
            );

            this.logger.info(
                `Member '${userId}' removed from group '${groupId}' successfully by owner`
            );

            return updatedGroup;
        } catch (error) {
            this.logger.error(`Failed to remove member from group: ${(error as Error).message}`);

            throw error;
        }
    }

    public async getGroupMembers(groupId: string, requesterId?: string): Promise<IUser[]> {
        this.logger.info(`Getting members for group ${groupId}`);

        try {
            const group = await this.groupService.findGroup({ id: groupId });

            if (!group) {
                this.logger.warn(`Group '${groupId}' not found`);

                throw new GroupNotFoundException();
            }

            const members = await this.userService.findUsers(
                { id: { $in: group.members } },
                undefined,
                { password: 0, verifications: 0, sessions: 0, passwordReset: 0 }
            );

            return members;
        } catch (error) {
            this.logger.error(`Failed to get group members: ${(error as Error).message}`);

            throw error;
        }
    }

    // ────────────────────────────────
    // Member Validation Methods
    // ────────────────────────────────
    public async isGroupMember(groupId: string, userId: string): Promise<boolean> {
        try {
            const group = await this.groupService.findGroup({ id: groupId, members: userId }, { id: 1 });

            return !!group;
        } catch (error) {
            this.logger.error(`Error checking group membership: ${(error as Error).message}`);

            return false;
        }
    }

    public async validateGroupMembership(groupId: string, userId: string): Promise<void> {
        const isMember = await this.isGroupMember(groupId, userId);
        
        if (!isMember) {
            this.logger.warn(`User '${userId}' is not a member of group '${groupId}'`);
            throw new NotGroupMemberException();
        }
    }

    public async validateGroupOwnership(groupId: string, userId: string): Promise<void> {
        const group = await this.groupService.findGroup({ id: groupId });
        
        if (!group) {
            this.logger.warn(`Group '${groupId}' not found`);
            throw new GroupNotFoundException();
        }
        
        if (group.owner !== userId) {
            this.logger.warn(`User '${userId}' is not the owner of group '${groupId}'`);
            throw new NotGroupOwnerException();
        }
    }
}