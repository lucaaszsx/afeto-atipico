import { UserService } from '@/api/services/UserService';
import { Action } from 'routing-controllers';
import { IUser } from '@/types/entities';
import { Container } from 'typedi';

export async function currentUserChecker(action: Action): Promise<IUser | undefined> {
    const payload = action.request.user;
    
    if (
        typeof payload === 'object' &&
        typeof payload.userId === 'string'
    ) {
        const userService = Container.get(UserService);
        const user = await userService.findById(payload.userId);
        
        return user || undefined;
    }

    return undefined;
}