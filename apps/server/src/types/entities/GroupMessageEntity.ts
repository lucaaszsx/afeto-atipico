import { IBaseEntity } from '../common';

export interface IGroupMessage extends IBaseEntity {
    group: string; // group ID
    author: string; // user ID
    content: string;
    replyTo?: string; // message ID
}
