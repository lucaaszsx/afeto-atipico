import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { WebSocketGateway, WSEventEmitter } from '@/websocket';
import { Logger } from '@/lib/logger';
import { Container } from 'typedi';

export const WebSocketLoader: MicroframeworkLoader = async (settings?: MicroframeworkSettings) => {
    if (!settings) return;

    const logger = new Logger(__filename);

    settings.onShutdown(() => {
        const gateway = Container.get<WebSocketGateway>('websocket.gateway');
        gateway.close();
        logger.info('WebSocket Gateway shutdown completed');
    });

    const server = await settings.getData('server');
    const gateway = new WebSocketGateway(server);
    const eventEmitter = new WSEventEmitter();

    Container.set('websocket.gateway', gateway);
    Container.set('websocket.events', eventEmitter);

    logger.info('WebSocket Gateway loaded successfully');
};