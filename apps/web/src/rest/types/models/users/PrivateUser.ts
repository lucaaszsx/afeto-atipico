import IPublicUserModel from './PublicUser';

/**
 * Private User model (extends PublicUser)
 */
export default interface IPrivateUserModel extends IPublicUserModel {
    email: string;
}