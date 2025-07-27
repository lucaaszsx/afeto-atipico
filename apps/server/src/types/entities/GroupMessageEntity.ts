import { IBaseEntity } from '../common';

export interface IGroupMessage extends IBaseEntity {
    groupId: string; // group ID
    authorId: string; // user ID
    content: string;
    replyTo?: string; // message ID
}
