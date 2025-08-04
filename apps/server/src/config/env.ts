/**
 * @fileoverview Centralized runtime configuration using validated environment variables.
 * Ensures consistent setup for server, database, rate limiting, Cors, and JWT settings.
 *
 * @author Lucas
 * @license MIT
 * @created 2025-07-14
 */

import { config as envSetup } from 'dotenv';
import { join } from 'node:path';

/** Load environment variables */
envSetup();

/**
 * Represents the type of environment variable.
 * Used to specify the expected data type for configuration values.
 */
enum EnvType {
    /**
    * A floating-point number (e.g., 3.14)
    Float,*/

    /** A boolean value (true or false) */
    Bool,

    /** An integer number (e.g., 42) */
    Int,

    /** A string of characters (e.g., "example") */
    Str
}

/**
 * Retrieves an environment variable and ensures it's defined.
 *
 * @param key - The name of the environment variable.
 * @param type - The type of the variable to perform the appropriate conversion.
 *
 * @throws {Error} If the environment variable is missing.
 *
 * @returns The value of the environment variable.
 */
function getEnvVariable(key: string, type: EnvType | undefined = EnvType.Str): any {
    const value = process.env[key];

    if (!value) {
        const err = new Error(`Missing required environment variable: ${key}`);
        Error.captureStackTrace?.(err, getEnvVariable);

        throw err;
    }
    if (value === 'none') return '';

    const parsedValue =
        type === EnvType.Str
            ? value
            : type === EnvType.Int
              ? parseInt(value, 10)
              : type === EnvType.Bool
                ? Boolean(value)
                : null;

    if (
        (type === EnvType.Int && !Number.isInteger(parsedValue)) ||
        (type === EnvType.Bool && typeof parsedValue !== 'boolean') ||
        !parsedValue
    ) {
        const err = new Error(
            `Unable to convert value of key '${key}' to: ${type === EnvType.Int ? 'int' : type === EnvType.Bool ? 'bool' : type === EnvType.Str ? 'str' : 'unknown'}`
        );
        Error.captureStackTrace?.(err, getEnvVariable);

        throw err;
    }

    return parsedValue;
}

/**
 * Converts a list in string format obtained from the environment configuration file to a js array
 *
 * @param entry - The string value
 */
function parseEnvArray(entry: string): string[] {
    return entry.split(',').map((part) => part.trim());
}

/**
 * Gets a environment directory path variable
 *
 * @param path - The environment path value
 */
function getEnvPath(path: string): string {
    return join(
        process.cwd(),
        Environment.node === 'prod' ? path.replace('src/', 'dist/').slice(0, -3) + '.js' : path
    );
}

/**
 * Options for environment config
 */
interface EnvironmentInterface {
    /**
     * Node environment type
     */
    readonly node: 'prod' | 'dev';
}

/**
 * Options for logging config
 */
interface LoggingInterface {
    /**
     * Logging output level
     */
    readonly level: 'debug' | 'info';
}

/**
 * Options for application config
 */
interface ApplicationInterface {
    /**
     * API base URL
     */
    readonly baseUrl: string;

    /**
     * API route prefix
     */
    readonly routePrefix: string;

    /**
     * Application directories
     */
    readonly dirs: {
        readonly controllers: string;
        readonly subscribers: string;
    };
}

/**
 * Options for rate limit config
 */
interface RateLimitInterface {
    /**
     * The time in milliseconds where the number of requests per window can be sent
     */
    readonly windowMs: number;
    /**
     * The number of requests that can be sent per window
     */
    readonly max: number;
}

/**
 * Options for HTTP server config
 */
interface ServerInterface {
    /**
     * The port on which the server should run
     */
    readonly port: number;
}

/**
 * Options for Cors config
 */
interface CorsInterface {
    /**
     * The origin(s) from which API calls are allowed
     */
    readonly origins: string[];

    /**
     * The methods that are valid within the API
     */
    readonly methods: string[];

    /**
     * The headers allowed by the API
     */
    readonly headers: string[];

    /**
     * If the credentials option is active
     */
    readonly credentials: boolean;
}

/**
 * Options for database config
 */
interface DatabaseInterface {
    /**
     * The username that should be used to connect to the database.
     */
    readonly username: string;

    /**
     * The password that should be used to connect to the database.
     */
    readonly password: string;

    /**
     * The host that should be used to initiate the connection to the database.
     */
    readonly host: string;

    /**
     * The parameters used to connect to the database.
     */
    readonly params: string;

    /**
     * The name of the database
     */
    readonly dbName: 'prod' | 'dev';
}

/**
 * Options for HTTP compression config
 */
interface CompressionInterface {
    /**
     * Gzip compression level.
     * 0 (no compression) to 9 (maximum compression). Defaults to 6.
     */
    readonly level: number;

    /**
     * Minimum response size (in bytes) required to trigger compression.
     */
    readonly threshold: number;
}

/**
 * Options for JWT config
 */
interface JWTInterface {
    /**
     * The secret key that should be used in the access token
     */
    readonly accessTokenSecret: string;

    /**
     * The secret key that should be used in the refresh token
     */
    readonly refreshTokenSecret: string;

    /**
     * The time it takes for each access token to expire
     */
    readonly accessTokenExpiresIn: string;

    /**
     * The time it takes for each refresh token to expire
     */
    readonly refreshTokenExpiresIn: string;

    /**
     * Name of the cookie where the refresh token value is stored in the browser
     */
    readonly refreshTokenCookieName: string;
}

/**
 * Options for Cloudflare R2 configuration
 */
interface R2Interface {
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
    readonly accountId: string;
    readonly bucketName: string;
    readonly endpoint: string;
    readonly publicEndpoint: string;
    readonly region: string;
}

/**
 * Options for SMTP (email) configuration
 */
interface SMTPInterface {
    readonly service: string;
    readonly name: string;
    readonly user: string;
    readonly pass: string;
}

/**
 * Options for password reset token configuration
 */
interface PasswordResetInterface {
    readonly bytes: number;
    readonly expiresIn: number;
}

/**
 * Options for user verification code configuration
 */
interface VerificationCodeInterface {
    readonly size: number;
    readonly expiresIn: number;
}

/**
 * Environment configuration
 */
const Environment: EnvironmentInterface = {
    node: getEnvVariable('NODE_ENV')
};

/**
 * Logging configuration
 */
const Logging: LoggingInterface = {
    level: getEnvVariable('LOG_LEVEL')
};

/**
 * Application configuration
 */
const Application: ApplicationInterface = {
    baseUrl: getEnvVariable('APP_BASE_URL'),
    routePrefix: getEnvVariable('APP_ROUTE_PREFIX'),
    dirs: {
        controllers: getEnvPath(getEnvVariable('APP_DIR_CONTROLLERS')),
        subscribers: getEnvPath(getEnvVariable('APP_DIR_SUBSCRIBERS'))
    }
};

/**
 * Server configuration
 */
const Server: ServerInterface = {
    port: getEnvVariable('SERVER_PORT', EnvType.Int)
};

/**
 * Cors configuration
 */
const Cors: CorsInterface = {
    origins: parseEnvArray(getEnvVariable('CORS_ORIGINS')),
    methods: parseEnvArray(getEnvVariable('CORS_METHODS')),
    headers: parseEnvArray(getEnvVariable('CORS_HEADERS')),
    credentials: getEnvVariable('CORS_CREDENTIALS', EnvType.Bool)
};

/**
 * Rate limiting configuration for incoming requests
 */
const RateLimit: RateLimitInterface = {
    windowMs: getEnvVariable('RATE_LIMIT_WINDOW', EnvType.Int),
    max: getEnvVariable('RATE_LIMIT_REQUESTS', EnvType.Int)
};

/**
 * Database configuration
 */
const Database: DatabaseInterface = {
    username: getEnvVariable('MONGO_USERNAME'),
    password: getEnvVariable('MONGO_PASSWORD'),
    host: getEnvVariable('MONGO_HOST'),
    params: getEnvVariable('MONGO_PARAMS'),
    dbName: Environment.node
};

/**
 * HTTP compression configuration
 */
const Compression: CompressionInterface = {
    level: getEnvVariable('COMPRESSION_LEVEL', EnvType.Int),
    threshold: getEnvVariable('COMPRESSION_THRESHOLD', EnvType.Int)
};

/**
 * JWT configuration
 */
const JWT: JWTInterface = {
    accessTokenSecret: getEnvVariable('JWT_ACCESS_TOKEN_SECRET'),
    accessTokenExpiresIn: getEnvVariable('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    refreshTokenSecret: getEnvVariable('JWT_REFRESH_TOKEN_SECRET'),
    refreshTokenExpiresIn: getEnvVariable('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    refreshTokenCookieName: getEnvVariable('JWT_REFRESH_TOKEN_COOKIE_NAME')
};

/**
 * Cloudflare R2 storage configuration
 */
const R2: R2Interface = {
    accessKeyId: getEnvVariable('R2_ACCESS_KEY_ID'),
    secretAccessKey: getEnvVariable('R2_SECRET_ACCESS_KEY'),
    accountId: getEnvVariable('R2_ACCOUNT_ID'),
    bucketName: getEnvVariable('R2_BUCKET_NAME'),
    endpoint: getEnvVariable('R2_ENDPOINT'),
    publicEndpoint: getEnvVariable('R2_PUB_ENDPOINT'),
    region: getEnvVariable('R2_REGION')
};

/**
 * SMTP (email service) configuration
 */
const SMTP: SMTPInterface = {
    service: getEnvVariable('SMTP_SERVICE'),
    name: getEnvVariable('SMTP_NAME'),
    user: getEnvVariable('SMTP_USER'),
    pass: getEnvVariable('SMTP_PASS')
};

/**
 * Password reset configuration
 */
const PasswordReset: PasswordResetInterface = {
    bytes: getEnvVariable('PASS_RESET_BYTES', EnvType.Int),
    expiresIn: getEnvVariable('PASS_RESET_EXPIRES_IN', EnvType.Int)
};

/**
 * Email verification code configuration
 */
const VerificationCode: VerificationCodeInterface = {
    size: getEnvVariable('VALIDATION_CODE_SIZE', EnvType.Int),
    expiresIn: getEnvVariable('VALIDATION_CODE_EXPIRES_IN', EnvType.Int)
};

/**
 * Exports all configurations
 */
export const EnvConfig = {
    Environment,
    Logging,
    Application,
    Server,
    Cors,
    RateLimit,
    Database,
    Compression,
    JWT,
    R2,
    SMTP,
    PasswordReset,
    VerificationCode
};