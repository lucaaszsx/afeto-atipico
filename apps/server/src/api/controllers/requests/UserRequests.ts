/**
 * @file UserRequests.ts
 * @description Request validation classes for User endpoints
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
import { ApiChildModel } from '@/api/models/ApiUserModel';
import { UserStatus } from '@/types/enums';
import { EnvConfig } from '@/config/env';

const { identifyFields, securityFields, profileFields } = UserConstraints;

// export class UpdateUserRequest {
//     @IsOptionalString(
//         identifyFields.username.minLength,
//         identifyFields.username.maxLength,
//         identifyFields.username.pattern
//     )
//     username?: string;

//     @IsOptionalEmail()
//     @IsOptionalString(
//         identifyFields.email.minLength,
//         identifyFields.email.maxLength
//     )
//     email?: string;

//     @IsOptionalString(
//         identifyFields.displayName.minLength,
//         identifyFields.displayName.maxLength,
//         identifyFields.displayName.pattern
//     )
//     displayName?: string;

//     @IsOptionalString(0, profileFields.bio.maxLength)
//     bio?: string;

//     @IsOptionalEnum(UserStatus)
//     status?: UserStatus;

//     @IsOptionalArrayOf(() => ApiChildModel)
//     children?: ApiChildModel[];
// }

// export class UpdateUserPasswordRequest {
//     @IsRequiredString(
//         securityFields.password.minLength,
//         securityFields.password.maxLength
//     )
//     currentPassword: string;

//     @IsRequiredString(
//         securityFields.password.minLength,
//         securityFields.password.maxLength
//     )
//     newPassword: string;
// }

// export class VerifyUserRequest {
//     @IsRequiredString(
//         EnvConfig.ValidationCode.size,
//         EnvConfig.ValidationCode.size
//     )
//     code: string;
// }

// export class AddChildRequest {
//     @IsOptionalArrayOf(() => ApiChildModel)
//     child: ApiChildModel;
// }
