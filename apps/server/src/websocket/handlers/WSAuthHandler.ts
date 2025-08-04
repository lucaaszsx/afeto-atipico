import { WebSocketConnection } from '../WebSocketConnection';
import { WSConnectionManager } from '../WSConnectionManager';
import { UserService, GroupService } from '@/api/services';
import { WSEventType, WSReadyData, WSGroupData, WSUserData } from '../types';
import { IPrivateUser } from '@/types/entities';
import { AuthUtils } from '@/lib/auth';
import { Logger } from '@/lib/logger';
import { Container } from 'typedi';

export class WSAuthHandler {
    private logger = new Logger(__filename);
    private userService = Container.get(UserService);
    private groupService = Container.get(GroupService);

    constructor(private connectionManager: WSConnectionManager) {}

    public async handleIdentify(connection: WebSocketConnection, data: any): Promise<void> {
        try {
            const { token } = data;
            if (!token) {
                connection.close(4001);
                return;
            }

            const payload = AuthUtils.verifyAccessToken(token);
            
            if (
                typeof payload !== 'object' ||
                typeof payload.userId !== 'string' ||
                typeof payload.sessionId !== 'string'
            ) {
                connection.close(4001);
                return;
            }

            const user = await this.userService.findOne({ id: payload.userId });
            if (!user) {
                connection.close(4001);
                return;
            }

            this.connectionManager.authenticateConnection(connection.id, user);

            const userGroups = await this.groupService.getUserGroups(user.id);
            const groupIds = userGroups.map(group => group.id);

            groupIds.forEach(groupId => {
                this.connectionManager.subscribeToGroup(connection.id, groupId);
            });

            const publicUserData: WSUserData = {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
                status: user.status
            };

            this.connectionManager.cacheUserData(user.id, publicUserData);

            const privateUser: IPrivateUser = {
                id: user.id,
                createdAt: user.createdAt || new Date(),
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
                status: user.status,
                isVerified: user.isVerified,
                children: user.children
            };

            const readyData: WSReadyData = {
                user: privateUser,
                groups: [],
                session_id: payload.sessionId,
                total_groups: groupIds.length
            };

            connection.sendEvent(WSEventType.READY, readyData);

            this.loadGroupsGradually(connection, userGroups);
            
            this.logger.info(`Gateway authentication successful for user: ${user.id}, loading ${groupIds.length} groups`);
        } catch (error) {
            this.logger.error('Gateway authentication failed:', error);
            connection.close(4001);
        }
    }

    private async loadGroupsGradually(connection: WebSocketConnection, userGroups: any[]): Promise<void> {
        const BATCH_SIZE = 3;
        const DELAY_MS = 200;

        for (let i = 0; i < userGroups.length; i += BATCH_SIZE) {
            if (!connection.isAlive() || connection.socket.readyState !== 1) {
                this.logger.debug(`Connection ${connection.id} closed during group loading`);
                return;
            }

            const batch = userGroups.slice(i, i + BATCH_SIZE);
            const groupsData: WSGroupData[] = [];

            for (const group of batch) {
                try {
                    const members = await this.userService.findMany({ 
                        id: { $in: group.members } 
                    });
                    
                    const memberData: WSUserData[] = members.map((member: any) => ({
                        id: member.id,
                        username: member.username,
                        displayName: member.displayName,
                        avatarUrl: member.avatarUrl,
                        bio: member.bio,
                        status: member.status
                    }));

                    groupsData.push({
                        id: group.id,
                        name: group.name,
                        description: group.description,
                        owner: group.owner,
                        members: memberData,
                        tags: group.tags,
                        created_at: group.created_at,
                        updated_at: group.updated_at
                    });
                } catch (error) {
                    this.logger.error(`Error loading group ${group.id}:`, error);
                }
            }

            if (groupsData.length > 0) {
                connection.sendEvent(WSEventType.GROUPS_SYNC, {
                    groups: groupsData,
                    batch_index: Math.floor(i / BATCH_SIZE),
                    is_final: i + BATCH_SIZE >= userGroups.length
                });

                this.logger.debug(`Sent batch ${Math.floor(i / BATCH_SIZE) + 1} with ${groupsData.length} groups to ${connection.id}`);
            }

            if (i + BATCH_SIZE < userGroups.length) await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }

        this.logger.info(`Finished loading all groups for connection ${connection.id}`);
    }
}