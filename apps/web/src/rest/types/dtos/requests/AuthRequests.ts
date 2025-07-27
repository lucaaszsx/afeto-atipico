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
    userId: string;
    code: string;
}

export interface IResendEmailVerificationRequestDTO {
    userId: string;
}