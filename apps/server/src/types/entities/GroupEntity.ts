import { IBaseEntity } from '../common';

export interface IGroup extends IBaseEntity {
    name: string;
    description: string;
    tags: string[];
    owner: string;
    members: string[]; // users IDs
}
