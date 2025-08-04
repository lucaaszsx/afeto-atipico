import { IBaseModel } from './Base';

// ────────────────────────────────
// Group Models
// ────────────────────────────────

export interface IGroupModel extends IBaseModel {
    name: string;
    description: string;
    tags: string[];
    owner: string;
    members: string[];
}

export interface IGroupMessageModel extends IBaseModel {
    groupId: string;
    authorId: string;
    content: string;
    replyTo?: string;
}