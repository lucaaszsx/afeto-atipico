import { IPrivateUserModel } from '@/lib/rest';

export interface IRegisterUserResponseDTO extends IPrivateUserModel {}

export interface ILoginUserResponseDTO {
    user: IPrivateUserModel;
    accessToken: string;
}

export interface IRefreshTokenResponseDTO {
    accessToken: string;
}