import {
    InternalErrorException,
    AccessTokenMissingException,
    AccessTokenExpiredException,
    InvalidAccessTokenException
} from '@/api/responses';
import { LoggerInterface, Logger } from '@/lib/logger';
import { Action } from 'routing-controllers';
import { AuthUtils } from '@/lib/auth';

const logger: LoggerInterface = new Logger(__filename);

export const authorizationChecker = async (action: Action, roles: string[]): Promise<boolean> => {
    const token = action.request.headers['authorization']?.split(' ').at(1);
    const payload = AuthUtils.verifyAccessToken(token);
    
    if (
        typeof payload !== 'object' ||
        typeof payload.userId !== 'string' ||
        typeof payload.sessionId !== 'string'
    ) {
        logger.error(
            `The payload obtained does not follow the required patterns (IP ${action.request.ip}):`,
            payload
        );
        throw new InternalErrorException();
    }

    logger.info(`Authorized user '${payload.userId}' from IP: ${action.request.ip}`);

    action.request.user = payload;
    
    return true;
};