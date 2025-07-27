import IPrivateUserModel from '../../models/users'

export interface IRegisterUserResponseDTO extends IPrivateUserModel {}

export interface ILoginUserResponseDTO {
    user: IPrivateUserModel;
    accessToken: string;
}