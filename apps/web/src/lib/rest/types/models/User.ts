import { UserStatus } from '../enums';
import { IBaseModel } from './Base';

// ────────────────────────────────
// User Models
// ────────────────────────────────

export interface IChildModel {
    id: string;
    name: string;
    age: number;
    notes?: string;
}

export interface IPublicUserModel extends Base {
    username: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    status: UserStatus;
    isVerified: boolean;
    children: IChildModel[];
}

export interface IPrivateUserModel extends IPublicUserModel {
    email: string;
}