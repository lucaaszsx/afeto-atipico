/**
 * @fileoverview Centralized API response codes used for internal application logic.
 * These are NOT HTTP status codes, but internal identifiers used in the API responses.
 *
 * Success codes start from 1000+
 * Error codes start from 2000+, categorized by domain (e.g., Auth, Validation, DB, etc.)
 *
 * @created 2025-07-14
 * @author Lucas
 * @license MIT
 */

/**
 * @enum ApiSuccessCodes
 * @description Internal API success codes. All codes must be >= 1000.
 */
export enum ApiSuccessCodes {
    // ────────────────────────────────
    // General Success (1000–1099)
    // ────────────────────────────────
    OK = 1000,
    CREATED = 1001,
    ACCEPTED = 1002,
    NO_CONTENT = 1003
}

/**
 * @enum ApiErrorCodes
 * @description Internal API error codes. All codes must be >= 2000.
 */
export enum ApiErrorCodes {
    // ────────────────────────────────
    // General / Server Errors (2000–2099)
    // ────────────────────────────────
    INTERNAL_SERVER_ERROR = 2000,
    TOO_MANY_REQUESTS = 2001,
    SERVICE_UNAVAILABLE = 2002,
    NOT_IMPLEMENTED = 2003,
    BAD_GATEWAY = 2004,
    NOT_FOUND = 2005,

    // ────────────────────────────────
    // Authentication & Authorization (2100–2199)
    // ────────────────────────────────
    AUTHENTICATION_FAILED = 2100,
    FORBIDDEN = 2101,
    CODE_MISSING = 2105,
    INVALID_CODE = 2106,
    CODE_EXPIRED = 2107,
    CODE_ALREADY_USED = 2108,
    EMAIL_NOT_VERIFIED = 2109,
    REFRESH_TOKEN_MISSING = 2110,
    INVALID_REFRESH_TOKEN = 2111,
    REFRESH_TOKEN_EXPIRED = 2112,
    ACCESS_TOKEN_MISSING = 2113,
    INVALID_ACCESS_TOKEN = 2114,
    ACCESS_TOKEN_EXPIRED = 2115,

    // ────────────────────────────────
    // Validation Errors (2200–2299)
    // ────────────────────────────────
    VALIDATION_FAILED = 2200,

    // ────────────────────────────────
    // File Upload / Media Errors (2300–2399)
    // ────────────────────────────────
    FILE_TOO_LARGE = 2300,
    UNSUPPORTED_FILE_TYPE = 2301,
    FILE_UPLOAD_FAILED = 2302,
    FILE_NOT_FOUND = 2303,

    // ────────────────────────────────
    // External Communication Errors (2400–2499)
    // ────────────────────────────────
    EMAIL_CANNOT_BE_SENT = 2400,

    // ────────────────────────────────
    // Cryptographic / Security Errors (2500–2599)
    // ────────────────────────────────
    HASHING_ERROR = 2500,

    // ────────────────────────────────
    // Group & Messaging Errors (2600–2699)
    // ────────────────────────────────
    GROUP_NOT_FOUND = 2600,
    GROUP_ALREADY_EXISTS = 2601,
    NOT_GROUP_OWNER = 2602,
    CANNOT_LEAVE_AS_GROUP_OWNER = 2603,
    ALREADY_GROUP_MEMBER = 2604,
    NOT_GROUP_MEMBER = 2605,
    CANNOT_REMOVE_OWNER = 2606,
    MESSAGE_NOT_FOUND = 2607,
    NOT_MESSAGE_AUTHOR = 2608,
    REPLY_MESSAGE_NOT_FOUND = 2609,

    // ────────────────────────────────
    // User Management Errors (2700–2799)
    // ────────────────────────────────
    USER_ALREADY_EXISTS = 2700,
    USER_NOT_FOUND = 2701
}
