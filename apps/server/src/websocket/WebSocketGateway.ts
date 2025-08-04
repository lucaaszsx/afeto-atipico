import { 
    WSGatewayPayload, 
    WSMessageData,
    WSTypingData,
    WSGroupData,
    WSUserData,
    WSGroupMemberData,
    WSPresenceData,
    WSEventType,
    WSOpcode
} from './types';
import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { WebSocketConnection } from './WebSocketConnection';
import { WSConnectionManager } from './WSConnectionManager';
import { WSAuthHandler } from './handlers/WSAuthHandler';
import { LoggerInterface, Logger } from '@/lib/logger';
import { Container } from 'typedi';
import { Server } from 'http';

export class WebSocketGateway {
    private wss: WSServer;
    private connectionManager: WSConnectionManager;
    private authHandler: WSAuthHandler;
    private logger: LoggerInterface = new Logger(__filename);
    private heartbeatInterval?: NodeJS.Timeout;

    constructor(server: Server) {
        this.connectionManager = new WSConnectionManager();
        this.authHandler = new WSAuthHandler(this.connectionManager);

        this.wss = new WSServer({
            server,
            path: '/gateway'
        });

        this.setupEventHandlers();
        this.startHeartbeatCheck();
        
        this.logger.info('WebSocket Gateway initialized on /gateway');
    }

    private setupEventHandlers(): void {
        this.wss.on('connection', (socket: WebSocket, request) => {
            const connection = new WebSocketConnection(socket);
            
            this.connectionManager.addConnection(connection);

            this.logger.info(`New gateway connection: ${connection.id} from ${request.socket.remoteAddress}`);

            socket.on('message', async (data: Buffer) => {
                try {
                    const payload: WSGatewayPayload = JSON.parse(data.toString());
                    await this.handlePayload(connection, payload);
                } catch (error) {
                    this.logger.error(`Invalid payload from ${connection.id}:`, error);
                    connection.close(4000);
                }
            });

            socket.on('close', (code, reason) => {
                this.connectionManager.removeConnection(connection.id);
                this.logger.info(`Gateway connection closed: ${connection.id} (${code}: ${reason})`);
            });

            socket.on('error', (error) => {
                this.logger.error(`Gateway connection error ${connection.id}:`, error);
                this.connectionManager.removeConnection(connection.id);
            });
        });
    }

    private async handlePayload(connection: WebSocketConnection, payload: WSGatewayPayload): Promise<void> {
        switch (payload.op) {
            case WSOpcode.HEARTBEAT:
                connection.updateHeartbeat();
                connection.sendHeartbeatAck();
                break;

            case WSOpcode.IDENTIFY:
                await this.authHandler.handleIdentify(connection, payload.d);
                break;

            default:
                this.logger.warn(`Unknown opcode ${payload.op} from ${connection.id}`);
                connection.close(4001);
        }
    }

    private startHeartbeatCheck(): void {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        
        this.heartbeatInterval = setInterval(() => {
            this.connectionManager.cleanupDeadConnections();
        }, 30000);
    }

    public broadcastMessageCreate(groupId: string, messageData: WSMessageData): void {
        this.connectionManager.broadcastToGroupSubscribers(groupId, {
            op: WSOpcode.DISPATCH,
            t: WSEventType.MESSAGE_CREATE,
            d: messageData
        });
    }

    public broadcastMessageUpdate(groupId: string, messageData: WSMessageData): void {
        this.connectionManager.broadcastToGroupSubscribers(groupId, {
            op: WSOpcode.DISPATCH,
            t: WSEventType.MESSAGE_UPDATE,
            d: messageData
        });
    }

    public broadcastMessageDelete(groupId: string, messageId: string): void {
        this.connectionManager.broadcastToGroupSubscribers(groupId, {
            op: WSOpcode.DISPATCH,
            t: WSEventType.MESSAGE_DELETE,
            d: { id: messageId, group_id: groupId }
        });
    }

    public broadcastGroupCreate(groupData: WSGroupData): void {
        const memberIds = groupData.members.map(member => member.id);
        memberIds.forEach(memberId => {
            this.connectionManager.sendToUser(memberId, {
                op: WSOpcode.DISPATCH,
                t: WSEventType.GROUP_CREATE,
                d: groupData
            });
        });
    }

    public broadcastGroupUpdate(groupData: WSGroupData): void {
        this.connectionManager.broadcastToGroupSubscribers(groupData.id, {
            op: WSOpcode.DISPATCH,
            t: WSEventType.GROUP_UPDATE,
            d: groupData
        });
    }

    public broadcastGroupDelete(groupId: string): void {
        this.connectionManager.broadcastToGroupSubscribers(groupId, {
            op: WSOpcode.DISPATCH,
            t: WSEventType.GROUP_DELETE,
            d: { id: groupId }
        });
    }

    public broadcastGroupMemberAdd(groupId: string, memberData: WSGroupMemberData): void {
        this.connectionManager.broadcastToGroupSubscribers(groupId, {
            op: WSOpcode.DISPATCH,
            t: WSEventType.GROUP_MEMBER_ADD,
            d: memberData
        });

        this.connectionManager.sendToUser(memberData.user.id, {
            op: WSOpcode.DISPATCH,
            t: WSEventType.GROUP_CREATE,
            d: { 
                id: groupId,
                members: [memberData.user]
            }
        });
    }

    public broadcastGroupMemberRemove(groupId: string, userId: string): void {
        this.connectionManager.broadcastToGroupSubscribers(groupId, {
            op: WSOpcode.DISPATCH,
            t: WSEventType.GROUP_MEMBER_REMOVE,
            d: { group_id: groupId, user_id: userId }
        }, [userId]);

        this.connectionManager.sendToUser(userId, {
            op: WSOpcode.DISPATCH,
            t: WSEventType.GROUP_DELETE,
            d: { id: groupId }
        });
    }

    public broadcastGroupMemberUpdate(groupId: string, memberData: WSGroupMemberData): void {
        this.connectionManager.broadcastToGroupSubscribers(groupId, {
            op: WSOpcode.DISPATCH,
            t: WSEventType.GROUP_MEMBER_UPDATE,
            d: memberData
        });
    }

    public broadcastUserUpdate(userData: WSUserData): void {
        this.connectionManager.cacheUserData(userData.id, userData);
        
        const userGroupIds = this.connectionManager.getUserGroupIds(userData.id);
        
        this.connectionManager.broadcastToMultipleGroups(userGroupIds, {
            op: WSOpcode.DISPATCH,
            t: WSEventType.USER_UPDATE,
            d: userData
        });
    }

    public broadcastUserPresenceUpdate(presenceData: WSPresenceData): void {
        const userGroupIds = this.connectionManager.getUserGroupIds(presenceData.user_id);
        
        this.connectionManager.broadcastToMultipleGroups(userGroupIds, {
            op: WSOpcode.DISPATCH,
            t: WSEventType.USER_PRESENCE_UPDATE,
            d: presenceData
        }, [presenceData.user_id]);
    }

    public broadcastTypingStart(groupId: string, typingData: WSTypingData): void {
        this.connectionManager.broadcastToGroupSubscribers(groupId, {
            op: WSOpcode.DISPATCH,
            t: WSEventType.TYPING_START,
            d: typingData
        }, [typingData.user_id]);
    }

    public getConnectionManager(): WSConnectionManager {
        return this.connectionManager;
    }

    public close(): void {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        
        this.wss.close();
        this.logger.info('WebSocket Gateway closed');
    }
}