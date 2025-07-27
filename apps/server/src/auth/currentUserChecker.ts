import { Action } from 'routing-controllers';
import { TokenPayload } from '@/lib/auth';

export function currentUserChecker(action: Action): Promise<TokenPayload | undefined> {
    const user = action.request.user;

    if (
        typeof user === 'object' &&
        typeof user.userId === 'string' &&
        typeof user.sessionId === 'string'
    )
        return Promise.resolve(user as TokenPayload);

    return Promise.resolve(undefined);
}
