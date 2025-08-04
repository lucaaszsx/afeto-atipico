import { WSEventEmitter, WSGroupData } from '@/websocket';
import { EventSubscriber, On } from 'event-dispatch';
import { WSEventType } from '@/websocket';
import { Service } from 'typedi';

@EventSubscriber()
@Service()
export class GroupEventSubscriber {
    constructor(private readonly wsEventEmitter: WSEventEmitter) {}
    
    @On(WSEventType.GROUP_UPDATE)
    public onGroupUpdate(group: WSGroupData): void {
        this.wsEventEmitter.emitGroupUpdate(group);
    }
    
    @On(WSEventType.GROUP_MEMBER_ADD)
    public onGroupMemberAdd(groupId: string, memberData: any): void {
        this.wsEventEmitter.emitGroupMemberAdd(groupId, memberData);
    }
    
    @On(WSEventType.GROUP_MEMBER_REMOVE)
    public onGroupMemberRemove(groupId: string, userId: string): void {
        this.wsEventEmitter.emitGroupMemberRemove(groupId, userId);
    }
}