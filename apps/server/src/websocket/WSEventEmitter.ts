import { 
    WSMessageData, 
    WSGroupData, 
    WSTypingData, 
    WSUserData, 
    WSGroupMemberData,
    WSPresenceData,
    WSGroupsSyncData
} from './types';
import { WebSocketGateway } from './WebSocketGateway';
import { LoggerInterface, Logger } from '@/lib/logger';
import { Container, Service } from 'typedi';

@Service()
export class WSEventEmitter {
    private logger: LoggerInterface = new Logger(__filename);

    private getGateway(): WebSocketGateway | null {
        try {
            return Container.get('websocket.gateway');
        } catch {
            return null;
        }
    }

    public emitMessageCreate(groupId: string, messageData: WSMessageData): void {
        const gateway = this.getGateway();
        
        if (gateway) {
            gateway.broadcastMessageCreate(groupId, messageData);
            this.logger.debug(`Emitted MESSAGE_CREATE for group ${groupId}`);
        }
    }

    public emitMessageUpdate(groupId: string, messageData: WSMessageData): void {
        const gateway = this.getGateway();
        
        if (gateway) {
            gateway.broadcastMessageUpdate(groupId, messageData);
            this.logger.debug(`Emitted MESSAGE_UPDATE for group ${groupId}`);
        }
    }

    public emitMessageDelete(groupId: string, messageId: string): void {
        const gateway = this.getGateway();
        
        if (gateway) {
            gateway.broadcastMessageDelete(groupId, messageId);
            this.logger.debug(`Emitted MESSAGE_DELETE for group ${groupId}`);
        }
    }

    public emitGroupCreate(groupData: WSGroupData): void {
        const gateway = this.getGateway();
        
        if (gateway) {
            gateway.broadcastGroupCreate(groupData);
            this.logger.debug(`Emitted GROUP_CREATE for group ${groupData.id}`);
        }
    }

    public emitGroupUpdate(groupData: WSGroupData): void {
        const gateway = this.getGateway();
        
        if (gateway) {
            gateway.broadcastGroupUpdate(groupData);
            this.logger.debug(`Emitted GROUP_UPDATE for group ${groupData.id}`);
        }
    }

    public emitGroupDelete(groupId: string): void {
        const gateway = this.getGateway();
        
        if (gateway) {
            gateway.broadcastGroupDelete(groupId);
            this.logger.debug(`Emitted GROUP_DELETE for group ${groupId}`);
        }
    }

    public emitGroupMemberAdd(groupId: string, memberData: WSGroupMemberData): void {
        const gateway = this.getGateway();
        
        if (gateway) {
            gateway.broadcastGroupMemberAdd(groupId, memberData);
            this.logger.debug(`Emitted GROUP_MEMBER_ADD for group ${groupId}`);
        }
    }

    public emitGroupMemberRemove(groupId: string, userId: string): void {
        const gateway = this.getGateway();
        
        if (gateway) {
            gateway.broadcastGroupMemberRemove(groupId, userId);
            this.logger.debug(`Emitted GROUP_MEMBER_REMOVE for group ${groupId}`);
        }
    }

    public emitGroupMemberUpdate(groupId: string, memberData: WSGroupMemberData): void {
        const gateway = this.getGateway();
        
        if (gateway) {
            gateway.broadcastGroupMemberUpdate(groupId, memberData);
            this.logger.debug(`Emitted GROUP_MEMBER_UPDATE for group ${groupId}`);
        }
    }

    public emitUserUpdate(userData: WSUserData): void {
        const gateway = this.getGateway();
        
        if (gateway) {
            gateway.broadcastUserUpdate(userData);
            this.logger.debug(`Emitted USER_UPDATE for user ${userData.id}`);
        }
    }

    public emitUserPresenceUpdate(presenceData: WSPresenceData): void {
        const gateway = this.getGateway();
        
        if (gateway) {
            gateway.broadcastUserPresenceUpdate(presenceData);
            this.logger.debug(`Emitted USER_PRESENCE_UPDATE for user ${presenceData.user_id}`);
        }
    }

    public emitGroupsSync(connectionId: string, syncData: WSGroupsSyncData): void {
        const gateway = this.getGateway();
        
        if (gateway) {
            const connection = gateway.getConnectionManager().getConnection(connectionId);
            if (connection) {
                connection.sendEvent('GROUPS_SYNC', syncData);
                this.logger.debug(`Emitted GROUPS_SYNC batch ${syncData.batch_index} to ${connectionId}`);
            }
        }
    }
}