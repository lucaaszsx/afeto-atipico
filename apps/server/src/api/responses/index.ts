/**
 * @file index.ts
 * @description Central export hub for all exception classes and API response utilities for simplified imports across the application layer. Includes custom exceptions, API response formatters, codes, and HTTP mappings.
 * @author Lucas
 * @license MIT
 */

/** Exceptions */

// Base
export { BaseException } from './exceptions/Base';

// ────────────────────────────────
// Auth
// ────────────────────────────────
export { AuthenticationFailedException } from './exceptions/auth/misc/AuthenticationFailed';

export { RefreshTokenMissingException } from './exceptions/auth/tokens/RefreshTokenMissing';
export { InvalidRefreshTokenException } from './exceptions/auth/tokens/InvalidRefreshToken';
export { RefreshTokenExpiredException } from './exceptions/auth/tokens/RefreshTokenExpired';
export { AccessTokenMissingException } from './exceptions/auth/tokens/AccessTokenMissing';
export { InvalidAccessTokenException } from './exceptions/auth/tokens/InvalidAccessToken';
export { AccessTokenExpiredException } from './exceptions/auth/tokens/AccessTokenExpired';

export { InvalidCodeException } from './exceptions/auth/verification/InvalidCode';
export { CodeAlreadyUsedException } from './exceptions/auth/verification/CodeAlreadyUsed';
export { CodeExpiredException } from './exceptions/auth/verification/CodeExpired';
export { CodeMissingException } from './exceptions/auth/verification/CodeMissing';

// ────────────────────────────────
// Domain
// ────────────────────────────────
export { NotFoundException } from './exceptions/domain/NotFound';

// ────────────────────────────────
// External Services
// ────────────────────────────────
export { EmailCannotBeSentException } from './exceptions/external/EmailCannotBeSent';

// ────────────────────────────────
// Groups
// ────────────────────────────────
export { GroupNotFoundException } from './exceptions/groups/GroupNotFound';
export { GroupAlreadyExistsException } from './exceptions/groups/GroupAlreadyExists';
export { NotGroupOwnerException } from './exceptions/groups/NotGroupOwner';
export { CannotLeaveAsGroupOwnerException } from './exceptions/groups/CannotLeaveAsGroupOwner';

export { AlreadyGroupMemberException } from './exceptions/groups/members/AlreadyGroupMember';
export { NotGroupMemberException } from './exceptions/groups/members/NotGroupMember';
export { CannotRemoveOwnerException } from './exceptions/groups/members/CannotRemoveOwner';

export { MessageNotFoundException } from './exceptions/groups/messages/MessageNotFound';
export { NotMessageAuthorException } from './exceptions/groups/messages/NotMessageAuthor';
export { ReplyMessageNotFoundException } from './exceptions/groups/messages/ReplyMessageNotFound';

// ────────────────────────────────
// Users
// ────────────────────────────────
export { UserAlreadyExistsException } from './exceptions/users/UserAlreadyExists';
export { UserNotFoundException } from './exceptions/users/UserNotFound';
export { EmailAlreadyExistsException } from './exceptions/users/EmailAlreadyExists';
export { EmailNotVerifiedException } from './exceptions/users/EmailNotVerified';
export { UsernameAlreadyExistsException } from './exceptions/users/UsernameAlreadyExists';

// ────────────────────────────────
// Infrastructure / Internal
// ────────────────────────────────
export { HashingException } from './exceptions/infra/Hashing';
export { InternalErrorException } from './exceptions/infra/InternalError';

// ────────────────────────────────
// Rate Limiting / Preventions
// ────────────────────────────────
export { TooManyRequestsException } from './exceptions/preventions/TooManyRequests';

/** API Response Utilities */
export * from './ApiCodeHTTPMap';
export * from './ApiMessages';
export * from './ApiResponse';
export * from './ApiCodes';