/**
 * @file AuthRequests.ts
 * @description Request validation classes for Authentication endpoints
 * @author Lucas
 * @license MIT
 */

import {
    IsOptionalArrayOf,
    IsRequiredString,
    IsOptionalString,
    IsRequiredEmail,
    IsOptionalEmail,
    IsOptionalEnum
} from './decorators';
import { UserConstraints } from '@/config/constants';
import { UserStatus } from '@/types/enums';
import { EnvConfig } from '@/config/env';

const { identifyFields, securityFields, profileFields } = UserConstraints;
const { size: vCodeSize } = EnvConfig.VerificationCode;

export class RegisterUserRequest {
    @IsRequiredString(
        identifyFields.username.minLength,
        identifyFields.username.maxLength,
        identifyFields.username.pattern
    )
    username!: string;

    @IsRequiredEmail()
    email!: string;

    @IsRequiredString(securityFields.password.minLength, securityFields.password.maxLength)
    password!: string;

    @IsRequiredString(
        identifyFields.displayName.minLength,
        identifyFields.displayName.maxLength,
        identifyFields.displayName.pattern
    )
    displayName!: string;
}

export class LoginUserRequest {
    @IsRequiredEmail()
    email!: string;

    @IsRequiredString(securityFields.password.minLength, securityFields.password.maxLength)
    password!: string;
}

export class VerifyEmailRequest {
    @IsRequiredString(vCodeSize, vCodeSize)
    code!: string;
}