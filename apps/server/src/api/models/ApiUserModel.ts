import {
    ValidateNested,
    IsOptional,
    IsBoolean,
    IsString,
    IsEmail,
    IsArray,
    IsEnum,
    IsUUID,
    IsDate,
    IsInt
} from 'class-validator';
import {
    IRefreshTokenSession,
    IUserVerification,
    ITokenWithExpiry,
    IChild,
    IUser
} from '@/types/entities';
import { VerificationContext, UserStatus } from '@/types/enums';
import { Transform, Exclude, Expose, Type } from 'class-transformer';
import { hydrateEntity } from '../utils/hydration';
import { ApiBaseModel } from './ApiBaseModel';
import { Service } from 'typedi';

@Service()
@Exclude()
export class ApiTokenWithExpiryModel implements ITokenWithExpiry {
    @IsString()
    token: string;

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : new Date()))
    expiresAt: Date;

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : new Date()))
    createdAt: Date;

    constructor(data: ITokenWithExpiry = {} as ITokenWithExpiry) {
        hydrateEntity(this, data);
    }
}

@Service()
@Exclude()
export class ApiVerificationCodeModel implements IUserVerification {
    @IsString()
    code: string;

    @IsEnum(VerificationContext)
    context: VerificationContext;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => Boolean(value))
    used?: boolean;

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : new Date()))
    expiresAt: Date;

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : new Date()))
    createdAt: Date;

    constructor(data: IUserVerification = {} as IUserVerification) {
        hydrateEntity(this, data);
    }
}

@Service()
@Exclude()
export class ApiRefreshTokenSessionModel implements IRefreshTokenSession {
    @IsUUID(4)
    sessionId: string;

    @IsString()
    refreshToken: string;

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : new Date()))
    createdAt: Date;

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : new Date()))
    expiresAt: Date;

    @IsOptional()
    @IsString()
    ip?: string;

    @IsOptional()
    @IsString()
    userAgent?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => Boolean(value))
    isRevoked?: boolean;

    @IsOptional()
    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : undefined))
    revokedAt?: Date;

    constructor(data: IRefreshTokenSession = {} as IRefreshTokenSession) {
        hydrateEntity(this, data);
    }
}
@Service()
@Expose()
export class ApiChildModel implements IChild {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsInt()
    @Transform(({ value }) => parseInt(value, 10))
    age: number;

    @IsOptional()
    @IsString()
    notes?: string;

    constructor(data: IChild = {} as IChild) {
        hydrateEntity(this, data);
    }
}

@Service()
@Exclude()
export class ApiUserModel extends ApiBaseModel implements IUser {
    @IsString()
    @Expose()
    username: string;

    @IsEmail()
    @Expose({ groups: ['private'] })
    email: string;

    @IsString()
    @Exclude({ toPlainOnly: true })
    password: string;

    @IsString()
    @Expose()
    displayName: string;

    @IsOptional()
    @IsString()
    @Expose()
    avatarUrl?: string;

    @IsOptional()
    @IsString()
    @Expose()
    bio?: string;

    @IsEnum(UserStatus)
    @Expose()
    status: UserStatus;

    @IsOptional()
    @Type(() => ApiTokenWithExpiryModel)
    @Exclude({ toPlainOnly: true })
    passwordReset?: ApiTokenWithExpiryModel;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ApiVerificationCodeModel)
    @Exclude({ toPlainOnly: true })
    verifications?: ApiVerificationCodeModel[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ApiRefreshTokenSessionModel)
    @Exclude({ toPlainOnly: true })
    sessions?: ApiRefreshTokenSessionModel[];

    @IsBoolean()
    @Transform(({ value }) => Boolean(value))
    @Expose()
    isVerified: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ApiChildModel)
    @Expose()
    children: ApiChildModel[];

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : new Date()))
    @Expose()
    createdAt: Date;

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : new Date()))
    updatedAt: Date;

    constructor(data: IUser = {} as IUser) {
        super(data);
    }
}
