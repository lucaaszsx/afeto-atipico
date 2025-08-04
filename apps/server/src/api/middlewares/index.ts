/**
 * @file index.ts
 * @description Centralizes and re-exports all middleware modules for streamlined import across the application. Simplifies middleware registration and promotes organized structure and maintainability.
 * @author Lucas
 * @license MIT
 */

export { default as ErrorHandlerMiddleware } from './ErrorHandlerMiddleware';
export { default as LoggerMiddleware } from './LoggerMiddleware';
export { default as NotFoundMiddleware } from './NotFoundMiddleware';
export { default as RateLimitMiddleware } from './RateLimitMiddleware';
export { default as XSSCleanMiddleware } from './XSSCleanMiddleware';
export { default as SecurityMiddleware } from './SecurityMiddleware';
export { default as SecurityHSTSMiddleware } from './SecurityHSTSMiddleware';
export { default as CompressionMiddleware } from './CompressionMiddleware';
export { default as CookieParserMiddleware } from './CookieParserMiddleware';
export { default as URLEncodedMiddleware } from './URLEncodedMiddleware';
export { default as CorsMiddleware } from './CorsMiddleware';