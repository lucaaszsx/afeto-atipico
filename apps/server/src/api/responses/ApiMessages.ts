/**
 * @file ApiMessages.ts
 * @description Maps internal API error codes to user-friendly error messages.
 * Supports dynamic formatting with optional parameters.
 *
 * @created 2025-07-14
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from './ApiCodes';

type MessageFormatter = (...params: (string | number)[]) => string;

export const ApiErrorMessages: Record<ApiErrorCodes, MessageFormatter> = {
    // ────────────────────────────────
    // General / Server Errors
    // ────────────────────────────────
    [ApiErrorCodes.INTERNAL_SERVER_ERROR]:
        'Internal server error encountered during request processing',
    [ApiErrorCodes.TOO_MANY_REQUESTS]: 'Rate limit exceeded due to excessive request frequency',
    [ApiErrorCodes.SERVICE_UNAVAILABLE]:
        'Service is currently unavailable due to maintenance or overload',
    [ApiErrorCodes.NOT_IMPLEMENTED]:
        'Requested functionality is not available in the current version',
    [ApiErrorCodes.BAD_GATEWAY]: 'Failed to establish a valid response from the upstream server',
    [ApiErrorCodes.NOT_FOUND]: 'Requested endpoint does not exist on this server',

    // ────────────────────────────────
    // Authentication & Authorization
    // ────────────────────────────────
    [ApiErrorCodes.AUTHENTICATION_FAILED]: 'The credentials provided are invalid or do not match',
    [ApiErrorCodes.FORBIDDEN]: 'Access denied due to insufficient permissions',
    [ApiErrorCodes.INVALID_CODE]: 'Provided code is invalid or does not match the expected format',
    [ApiErrorCodes.CODE_MISSING]:
        'Verification code is required but was not provided in the request',
    [ApiErrorCodes.CODE_EXPIRED]: 'Verification code has expired and is no longer valid',
    [ApiErrorCodes.CODE_ALREADY_USED]:
        'Verification code has already been used and cannot be reused',
    [ApiErrorCodes.EMAIL_NOT_VERIFIED]: 'Email address not verified',
    [ApiErrorCodes.REFRESH_TOKEN_MISSING]: 'No refresh token provided in the request',
    [ApiErrorCodes.INVALID_REFRESH_TOKEN]: 'Refresh token is malformed or invalid',
    [ApiErrorCodes.REFRESH_TOKEN_EXPIRED]: 'Refresh token has expired and is no longer valid',
    [ApiErrorCodes.ACCESS_TOKEN_MISSING]: 'No access token provided in the request',
    [ApiErrorCodes.INVALID_ACCESS_TOKEN]: 'Access token is malformed or invalid',
    [ApiErrorCodes.ACCESS_TOKEN_EXPIRED]: 'Access token has expired and is no longer valid',

    // ────────────────────────────────
    // Validation Errors
    // ────────────────────────────────
    [ApiErrorCodes.VALIDATION_FAILED]: 'Input validation failed for one or more fields',

    // ────────────────────────────────
    // File Upload / Media Errors
    // ────────────────────────────────
    [ApiErrorCodes.FILE_TOO_LARGE]: 'Uploaded file size exceeds configured maximum threshold',
    [ApiErrorCodes.UNSUPPORTED_FILE_TYPE]: 'File format is not supported by the system',
    [ApiErrorCodes.FILE_UPLOAD_FAILED]: 'Error occurred during file upload operation',
    [ApiErrorCodes.FILE_NOT_FOUND]: 'Requested file resource is missing or inaccessible',

    // ────────────────────────────────
    // External Communication Errors (2500–2599)
    // ────────────────────────────────
    [ApiErrorCodes.EMAIL_CANNOT_BE_SENT]:
        'Email dispatch failed due to transport or configuration error',

    // ────────────────────────────────
    // Cryptographic / Security Errors
    // ────────────────────────────────
    [ApiErrorCodes.HASHING_ERROR]: 'Cryptographic hashing process failed during execution',

    // ────────────────────────────────
    // Group & Messaging Errors
    // ────────────────────────────────
    [ApiErrorCodes.GROUP_NOT_FOUND]: 'The requested group does not exist',
    [ApiErrorCodes.GROUP_ALREADY_EXISTS]: 'A group with the same name already exists for this user',
    [ApiErrorCodes.NOT_GROUP_OWNER]: 'Only the group owner is authorized to perform this action',
    [ApiErrorCodes.CANNOT_LEAVE_AS_GROUP_OWNER]:
        'Group owner must transfer ownership before leaving the group',
    [ApiErrorCodes.ALREADY_GROUP_MEMBER]: 'You are already a member of this group',
    [ApiErrorCodes.NOT_GROUP_MEMBER]: 'You must be a member of this group to perform this action',
    [ApiErrorCodes.CANNOT_REMOVE_OWNER]: 'You cannot remove the group owner from the group',
    [ApiErrorCodes.MESSAGE_NOT_FOUND]: 'The target message was not found in this group',
    [ApiErrorCodes.NOT_MESSAGE_AUTHOR]: 'Only the author of the message can modify or delete it',
    [ApiErrorCodes.REPLY_MESSAGE_NOT_FOUND]:
        'The message you are trying to reply to does not exist',

    // User Management Errors
    [ApiErrorCodes.USER_ALREADY_EXISTS]: 'A user with the provided credentials already exists',
    [ApiErrorCodes.USER_NOT_FOUND]: 'The requested user was not found'
};
