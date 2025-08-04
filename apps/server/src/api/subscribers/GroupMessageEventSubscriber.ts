import { WSEventEmitter, WSMessageData } from '@/websocket';
import { EventSubscriber, On } from 'event-dispatch';
import { WSEventType } from '@/websocket';
import { Service } from 'typedi';

@EventSubscriber()
@Service()
export class GroupMessageEventSubscriber {
    constructor(private readonly wsEventEmitter: WSEventEmitter) {}
    
    @On(WSEventType.MESSAGE_CREATE)
    public onMessageCreate(groupId: string, message: WSMessageData): void {
        this.wsEventEmitter.emitMessageCreate(groupId, message);
    }
    
    @On(WSEventType.MESSAGE_UPDATE)
    public onMessageUpdate(groupId: string, message: WSMessageData): void {
        this.wsEventEmitter.emitMessageUpdate(groupId, message);
    }
    
    @On(WSEventType.MESSAGE_DELETE)
    public onMessageDelete(groupId: string, messageId: string): void {
        this.wsEventEmitter.emitMessageDelete(groupId, messageId);
    }
}