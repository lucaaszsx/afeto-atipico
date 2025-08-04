/**
 * @file GroupRequests.ts
 * @description Request validation classes for Group endpoints
 * @author Lucas
 * @license MIT
 */

import {
    IsOptionalStringArray,
    IsRequiredString,
    IsOptionalString
} from './decorators';
import { GroupMessageConstraints, GroupConstraints } from '@/config/constants';

const { nameFields, descriptionFields, tagsFields } = GroupConstraints;
const { contentFields } = GroupMessageConstraints;

export class CreateGroupRequest {
    @IsRequiredString(
        nameFields.minLength,
        nameFields.maxLength,
        nameFields.pattern
    )
    name!: string;

    @IsRequiredString(
        descriptionFields.minLength,
        descriptionFields.maxLength
    )
    description!: string;

    @IsOptionalStringArray(
        undefined, // minItems
        tagsFields.maxCount,
        tagsFields.minLength,
        tagsFields.maxLength,
        tagsFields.pattern
    )
    tags?: string[];
}

export class UpdateGroupRequest {
    @IsOptionalString(
        nameFields.minLength,
        nameFields.maxLength,
        nameFields.pattern
    )
    name?: string;

    @IsOptionalString(
        descriptionFields.minLength,
        descriptionFields.maxLength
    )
    description?: string;

    @IsOptionalStringArray(
        undefined, // minItems
        tagsFields.maxCount,
        tagsFields.minLength,
        tagsFields.maxLength,
        tagsFields.pattern
    )
    tags?: string[];
}

export class JoinGroupRequest {
    @IsRequiredString()
    groupId!: string;
}

export class LeaveGroupRequest {
    @IsRequiredString()
    groupId!: string;
}

export class RemoveMemberRequest {
    @IsRequiredString()
    groupId!: string;

    @IsRequiredString()
    userId!: string;
}

export class CreateMessageRequest {
    @IsRequiredString(
        contentFields.minLength,
        contentFields.maxLength
    )
    content!: string;

    @IsOptionalString()
    replyTo?: string;
}

export class UpdateMessageRequest {
    @IsRequiredString(
        contentFields.minLength,
        contentFields.maxLength
    )
    content!: string;
}

export class SearchGroupsRequest {
    @IsRequiredString(1, 100)
    query!: string;

    @IsOptionalString()
    limit?: string;

    @IsOptionalString()
    offset?: string;
}

export class GetGroupMessagesRequest {
    @IsOptionalString()
    limit?: string;

    @IsOptionalString()
    before?: string; // message ID for pagination

    @IsOptionalString()
    after?: string; // message ID for pagination

    @IsOptionalString()
    offset?: string;
}