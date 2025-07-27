import { UserStatus } from '../enums';
import IChildModel from './Child';

/**
 * Public User model
 */
export default interface IPublicUserModel {
    username: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    status: UserStatus;
    isVerified: boolean;
    children: IChildModel[];
}