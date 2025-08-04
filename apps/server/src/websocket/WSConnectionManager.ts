import { WebSocketConnection } from './WebSocketConnection';
import { LoggerInterface, Logger } from '@/lib/logger';
import { WSGatewayPayload, WSUserData } from './types';
import { IUser, IPublicUser } from '@/types/entities';

export class WSConnectionManager {
    private connections: Map<string, WebSocketConnection> = new Map();
    private userConnections: Map<string, Set<string>> = new Map();
    private groupSubscriptions: Map<string, Set<string>> = new Map();
    private userDataCache: Map<string, WSUserData> = new Map();
    private logger = new Logger(__filename);

    public addConnection(connection: WebSocketConnection): void {
        this.connections.set(connection.id, connection);
        this.logger.debug(`Connection added: ${connection.id}`);
    }

    public removeConnection(connectionId: string): void {
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        if (connection.user) {
            const userConns = this.userConnections.get(connection.user.id);
            if (userConns) {
                userConns.delete(connectionId);
                if (userConns.size === 0) {
                    this.userConnections.delete(connection.user.id);
                    this.userDataCache.delete(connection.user.id);
                }
            }
        }

        connection.subscribedGroups.forEach(groupId => {
            const subscribers = this.groupSubscriptions.get(groupId);
            if (subscribers) {
                subscribers.delete(connectionId);
                if (subscribers.size === 0) this.groupSubscriptions.delete(groupId);
            }
        });

        this.connections.delete(connectionId);
        this.logger.debug(`Connection removed: ${connectionId}`);
    }

    public authenticateConnection(connectionId: string, user: IUser): void {
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        const publicUser: IPublicUser = {
            id: user.id,
            createdAt: user.createdAt || new Date(),
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            status: user.status,
            isVerified: user.isVerified,
            children: user.children
        };

        connection.user = publicUser;
        connection.isAuthenticated = true;

        if (!this.userConnections.has(user.id)) this.userConnections.set(user.id, new Set());
        this.userConnections.get(user.id)!.add(connectionId);

        this.logger.info(`Connection authenticated: ${connectionId} for user ${user.id}`);
    }

    public subscribeToGroup(connectionId: string, groupId: string): void {
        const connection = this.connections.get(connectionId);
        if (!connection || !connection.isAuthenticated) return;

        connection.subscribeToGroup(groupId);

        if (!this.groupSubscriptions.has(groupId)) this.groupSubscriptions.set(groupId, new Set());
        this.groupSubscriptions.get(groupId)!.add(connectionId);

        this.logger.debug(`Connection ${connectionId} subscribed to group ${groupId}`);
    }

    public unsubscribeFromGroup(connectionId: string, groupId: string): void {
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        connection.unsubscribeFromGroup(groupId);

        const subscribers = this.groupSubscriptions.get(groupId);
        if (subscribers) {
            subscribers.delete(connectionId);
            if (subscribers.size === 0) this.groupSubscriptions.delete(groupId);
        }

        this.logger.debug(`Connection ${connectionId} unsubscribed from group ${groupId}`);
    }

    public cacheUserData(userId: string, userData: WSUserData): void {
        this.userDataCache.set(userId, userData);
    }

    public getCachedUserData(userId: string): WSUserData | undefined {
        return this.userDataCache.get(userId);
    }

    public broadcastToGroupSubscribers(
        groupId: string, 
        payload: WSGatewayPayload, 
        excludeUserIds: string[] = []
    ): void {
        const subscribers = this.groupSubscriptions.get(groupId);
        if (!subscribers) return;

        let sentCount = 0;
        subscribers.forEach(connId => {
            const connection = this.connections.get(connId);
            if (!connection || !connection.isAuthenticated) return;
            
            if (connection.user && excludeUserIds.includes(connection.user.id)) return;
            
            if (connection.send(payload)) sentCount++;
        });

        this.logger.debug(`Broadcasted to ${sentCount} subscribers in group ${groupId}`);
    }

    public broadcastToMultipleGroups(
        groupIds: string[], 
        payload: WSGatewayPayload, 
        excludeUserIds: string[] = []
    ): void {
        const notifiedConnections = new Set<string>();
        
        groupIds.forEach(groupId => {
            const subscribers = this.groupSubscriptions.get(groupId);
            if (!subscribers) return;

            subscribers.forEach(connId => {
                if (notifiedConnections.has(connId)) return;
                
                const connection = this.connections.get(connId);
                if (!connection || !connection.isAuthenticated) return;
                
                if (connection.user && excludeUserIds.includes(connection.user.id)) return;
                
                if (connection.send(payload)) notifiedConnections.add(connId);
            });
        });

        this.logger.debug(`Broadcasted to ${notifiedConnections.size} unique connections across ${groupIds.length} groups`);
    }

    public sendToUser(userId: string, payload: WSGatewayPayload): void {
        const userConns = this.userConnections.get(userId);
        if (!userConns) return;

        let sentCount = 0;
        userConns.forEach(connId => {
            const connection = this.connections.get(connId);
            if (connection && connection.send(payload)) sentCount++;
        });

        this.logger.debug(`Sent to ${sentCount} connections for user ${userId}`);
    }

    public getUserGroupIds(userId: string): string[] {
        const userConns = this.userConnections.get(userId);
        if (!userConns) return [];

        const groupIds = new Set<string>();
        userConns.forEach(connId => {
            const connection = this.connections.get(connId);
            if (connection) {
                connection.subscribedGroups.forEach(groupId => groupIds.add(groupId));
            }
        });

        return Array.from(groupIds);
    }

    public getConnection(connectionId: string): WebSocketConnection | undefined {
        return this.connections.get(connectionId);
    }

    public cleanupDeadConnections(): void {
        const deadConnections: string[] = [];
        
        this.connections.forEach((connection, id) => {
            if (!connection.isAlive()) {
                deadConnections.push(id);
                connection.close(4000);
            }
        });

        deadConnections.forEach(id => this.removeConnection(id));
        
        if (deadConnections.length > 0) {
            this.logger.info(`Cleaned up ${deadConnections.length} dead connections`);
        }
    }

    public getStats(): { total: number; authenticated: number; groups: number; cachedUsers: number } {
        const authenticated = Array.from(this.connections.values())
            .filter(conn => conn.isAuthenticated).length;
        
        return {
            total: this.connections.size,
            authenticated,
            groups: this.groupSubscriptions.size,
            cachedUsers: this.userDataCache.size
        };
    }
}