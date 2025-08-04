export interface IRegisterUserRequestDTO {
    username: string;
    email: string;
    password: string;
    displayName: string;
}

export interface ILoginUserRequestDTO {
    email: string;
    password: string;
}

export interface IVerifyEmailRequestDTO {
    email: string;
    code: string;
}