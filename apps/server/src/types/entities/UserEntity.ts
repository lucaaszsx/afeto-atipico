import { VerificationContext, UserStatus } from '../enums';
import { IBasePublicEntity, IBaseEntity } from '../common';

export interface ITokenWithExpiry {
    token: string;
    expiresAt: Date;
    createdAt: Date;
}

export interface IUserVerification {
    code: string;
    context: VerificationContext;
    used?: boolean;
    expiresAt: Date;
    createdAt: Date;
}

export interface IRefreshTokenSession {
    sessionId: string;
    refreshToken: string;
    createdAt: Date;
    expiresAt: Date;
    ip?: string;
    userAgent?: string;
    isRevoked: boolean;
    revokedAt?: Date;
}

export interface IChild {
    id: string;
    name: string;
    age: number;
    notes?: string;
}

export interface IUser extends IBaseEntity {
    username: string;
    email?: string;
    password: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
    status: UserStatus;
    passwordReset?: ITokenWithExpiry;
    verifications?: IUserVerification[];
    sessions?: IRefreshTokenSession[];
    isVerified: boolean;
    children: IChild[];
}

type SensitiveUserFields = 'password' | 'passwordReset' | 'verification' | 'sessions';

export type IPublicUser = IBasePublicEntity & Omit<IUser, SensitiveUserFields>;

export type IPrivateUser = IPublicUser & Pick<IUser, 'email'>;
