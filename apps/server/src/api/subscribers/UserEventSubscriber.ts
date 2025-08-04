import { EventSubscriber, On } from 'event-dispatch';
import { WSEventEmitter, WSEventType, WSUserData } from '@/websocket';
import { Container, Service } from 'typedi';

@EventSubscriber()
@Service()
export class UserEventSubscriber {
    private wsEventEmitter: WSEventEmitter;
    
    constructor() {
        this.wsEventEmitter = Container.get(WSEventEmitter);
    }
    
    @On(WSEventType.USER_UPDATE)
    public onUserUpdate(user: WSUserData): void {
        this.wsEventEmitter.emitUserUpdate(user);
    }
}