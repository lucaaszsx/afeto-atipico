import { WSGatewayPayload, WSConnection, WSOpcode } from './types';
import { IPublicUser } from '../types/entities';
import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';

export class WebSocketConnection implements WSConnection {
    public readonly id: string;
    public socket: WebSocket;
    public user?: IPublicUser;
    public subscribedGroups: Set<string>;
    public isAuthenticated: boolean;
    public lastHeartbeat: Date;
    private sequenceNumber: number = 0;

    constructor(socket: WebSocket) {
        this.id = uuidv4();
        this.socket = socket;
        this.subscribedGroups = new Set();
        this.isAuthenticated = false;
        this.lastHeartbeat = new Date();
    }

    public send(payload: WSGatewayPayload): boolean {
        if (this.socket.readyState !== WebSocket.OPEN) return false;
        
        try {
            if (payload.op === WSOpcode.DISPATCH) payload.s = ++this.sequenceNumber;
            
            this.socket.send(JSON.stringify(payload));
            
            return true;
        } catch (error) {
            return false;
        }
    }

    public sendEvent(eventType: string, data: any): boolean {
        return this.send({
            op: WSOpcode.DISPATCH,
            t: eventType,
            d: data
        });
    }

    public sendHeartbeatAck(): boolean {
        return this.send({ op: WSOpcode.HEARTBEAT_ACK });
    }

    public subscribeToGroup(groupId: string): void {
        this.subscribedGroups.add(groupId);
    }

    public unsubscribeFromGroup(groupId: string): void {
        this.subscribedGroups.delete(groupId);
    }

    public isSubscribedToGroup(groupId: string): boolean {
        return this.subscribedGroups.has(groupId);
    }

    public updateHeartbeat(): void {
        this.lastHeartbeat = new Date();
    }

    public close(code: number = 1000): void {
        if (this.socket.readyState === WebSocket.OPEN) this.socket.close(code);
    }

    public isAlive(): boolean {
        const now = new Date();
        const timeSinceHeartbeat = now.getTime() - this.lastHeartbeat.getTime();
        
        return timeSinceHeartbeat < 60000;
    }
}