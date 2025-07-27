/**
 * @file ApiCodeHTTPMap.ts
 * @description Maps internal API codes to corresponding HTTP status codes.
 * Ensures centralized control of status code logic.
 *
 * @created 2025-07-14
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes, ApiSuccessCodes } from './ApiCodes';
import { StatusCodes } from 'http-status-codes';

export const ApiCodeHTTPMap: Record<number, StatusCodes> = {
    // ────────────────────────────────
    // Success Codes
    // ────────────────────────────────

    // General Success
    [ApiSuccessCodes.OK]: StatusCodes.OK,
    [ApiSuccessCodes.CREATED]: StatusCodes.CREATED,
    [ApiSuccessCodes.ACCEPTED]: StatusCodes.ACCEPTED,
    [ApiSuccessCodes.NO_CONTENT]: StatusCodes.NO_CONTENT,

    // ────────────────────────────────
    // Error Codes
    // ────────────────────────────────

    // General / Server Errors
    [ApiErrorCodes.INTERNAL_SERVER_ERROR]: StatusCodes.INTERNAL_SERVER_ERROR,
    [ApiErrorCodes.TOO_MANY_REQUESTS]: StatusCodes.TOO_MANY_REQUESTS,
    [ApiErrorCodes.SERVICE_UNAVAILABLE]: StatusCodes.SERVICE_UNAVAILABLE,
    [ApiErrorCodes.NOT_IMPLEMENTED]: StatusCodes.NOT_IMPLEMENTED,
    [ApiErrorCodes.BAD_GATEWAY]: StatusCodes.BAD_GATEWAY,
    [ApiErrorCodes.NOT_FOUND]: StatusCodes.NOT_FOUND,

    // Authentication & Authorization
    [ApiErrorCodes.AUTHENTICATION_FAILED]: StatusCodes.UNAUTHORIZED,
    [ApiErrorCodes.FORBIDDEN]: StatusCodes.FORBIDDEN,
    [ApiErrorCodes.INVALID_CODE]: StatusCodes.BAD_REQUEST,
    [ApiErrorCodes.CODE_MISSING]: StatusCodes.BAD_REQUEST,
    [ApiErrorCodes.CODE_EXPIRED]: StatusCodes.GONE,
    [ApiErrorCodes.CODE_ALREADY_USED]: StatusCodes.CONFLICT,
    [ApiErrorCodes.EMAIL_NOT_VERIFIED]: StatusCodes.FORBIDDEN,
    [ApiErrorCodes.REFRESH_TOKEN_MISSING]: StatusCodes.UNAUTHORIZED,
    [ApiErrorCodes.INVALID_REFRESH_TOKEN]: StatusCodes.UNAUTHORIZED,
    [ApiErrorCodes.REFRESH_TOKEN_EXPIRED]: StatusCodes.UNAUTHORIZED,
    [ApiErrorCodes.ACCESS_TOKEN_MISSING]: StatusCodes.UNAUTHORIZED,
    [ApiErrorCodes.INVALID_ACCESS_TOKEN]: StatusCodes.UNAUTHORIZED,
    [ApiErrorCodes.ACCESS_TOKEN_EXPIRED]: StatusCodes.UNAUTHORIZED,

    // Entity-related Errors
    [ApiErrorCodes.ENTITY_NOT_FOUND]: StatusCodes.NOT_FOUND,
    [ApiErrorCodes.ENTITY_ALREADY_EXISTS]: StatusCodes.CONFLICT,

    // Validation Errors
    [ApiErrorCodes.VALIDATION_FAILED]: StatusCodes.BAD_REQUEST,

    // File Upload / Media Errors
    [ApiErrorCodes.FILE_TOO_LARGE]: StatusCodes.PAYLOAD_TOO_LARGE,
    [ApiErrorCodes.UNSUPPORTED_FILE_TYPE]: StatusCodes.UNSUPPORTED_MEDIA_TYPE,
    [ApiErrorCodes.FILE_UPLOAD_FAILED]: StatusCodes.INTERNAL_SERVER_ERROR,
    [ApiErrorCodes.FILE_NOT_FOUND]: StatusCodes.NOT_FOUND,

    // External / Communication
    [ApiErrorCodes.EMAIL_CANNOT_BE_SENT]: StatusCodes.INTERNAL_SERVER_ERROR,

    // Cryptographic / Security Errors
    [ApiErrorCodes.HASHING_ERROR]: StatusCodes.INTERNAL_SERVER_ERROR,

    // Group & Messaging Errors
    [ApiErrorCodes.GROUP_NOT_FOUND]: StatusCodes.NOT_FOUND,
    [ApiErrorCodes.GROUP_ALREADY_EXISTS]: StatusCodes.CONFLICT,
    [ApiErrorCodes.NOT_GROUP_OWNER]: StatusCodes.FORBIDDEN,
    [ApiErrorCodes.CANNOT_LEAVE_AS_GROUP_OWNER]: StatusCodes.FORBIDDEN,
    [ApiErrorCodes.ALREADY_GROUP_MEMBER]: StatusCodes.CONFLICT,
    [ApiErrorCodes.NOT_GROUP_MEMBER]: StatusCodes.FORBIDDEN,
    [ApiErrorCodes.CANNOT_REMOVE_OWNER]: StatusCodes.FORBIDDEN,
    [ApiErrorCodes.MESSAGE_NOT_FOUND]: StatusCodes.NOT_FOUND,
    [ApiErrorCodes.NOT_MESSAGE_AUTHOR]: StatusCodes.FORBIDDEN,
    [ApiErrorCodes.REPLY_MESSAGE_NOT_FOUND]: StatusCodes.NOT_FOUND,

    // User Management Errors
    [ApiErrorCodes.USER_ALREADY_EXISTS]: StatusCodes.CONFLICT,
    [ApiErrorCodes.USER_NOT_FOUND]: StatusCodes.NOT_FOUND
};
