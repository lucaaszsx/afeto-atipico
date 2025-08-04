/**
 * @file UserRequests.ts
 * @description Request validation classes for User endpoints
 * @author Lucas
 * @license MIT
 */

import {
    IsRequiredString,
    IsOptionalString,
    IsRequiredInt
} from './decorators';
import { UserConstraints } from '@/config/constants';

const { identifyFields, profileFields } = UserConstraints;

export class UpdateProfileRequest {
    @IsOptionalString(
        identifyFields.username.minLength,
        identifyFields.username.maxLength,
        identifyFields.username.pattern
    )
    username?: string;

    @IsOptionalString(
        identifyFields.displayName.minLength,
        identifyFields.displayName.maxLength,
        identifyFields.displayName.pattern
    )
    displayName?: string;

    @IsOptionalString(
        undefined, // Remove minLength reference since it doesn't exist
        profileFields.bio.maxLength
    )
    bio?: string;
}

export class AddChildRequest {
    @IsRequiredString(
        profileFields.child.name.minLength,
        profileFields.child.name.maxLength,
        profileFields.child.name.pattern
    )
    name!: string;

    @IsRequiredInt(0, profileFields.child.age.max)
    age!: number;

    @IsOptionalString(undefined, profileFields.child.notes.maxLength)
    notes?: string;
}