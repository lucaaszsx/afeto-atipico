declare namespace NodeJS {
    interface ProcessEnv {
        // Environment
        NODE_ENV: 'prod' | 'dev';

        // Logging
        LOG_LEVEL: string;

        // Server
        SERVER_PORT: string;

        // Application
        APP_BASE_URL: string;
        APP_ROUTE_PREFIX: string;
        APP_DIR_CONTROLLERS: string;

        // CORS
        CORS_ORIGINS: string;
        CORS_METHODS: string;
        CORS_HEADERS: string;
        CORS_CREDENTIALS: string;

        // Rate limiting
        RATE_LIMIT_WINDOW: string;
        RATE_LIMIT_REQUESTS: string;

        // Database (MongoDB)
        MONGO_USERNAME: string;
        MONGO_PASSWORD: string;
        MONGO_HOST: string;
        MONGO_PARAMS: string;

        // Cloudflare R2 Connection
        R2_ACCESS_KEY_ID: string;
        R2_SECRET_ACCESS_KEY: string;
        R2_ACCOUNT_ID: string;
        R2_BUCKET_NAME: string;
        R2_ENDPOINT: string;
        R2_PUB_ENDPOINT: string;
        R2_REGION: string;

        // Gmail SMTP Connection
        SMTP_SERVICE: string;
        SMTP_NAME: string;
        SMTP_USER: string;
        SMTP_PASS: string;

        // HTTP Compression
        COMPRESSION_LEVEL: string;
        COMPRESSION_THRESHOLD: string;

        // JWT (Json Web Token) secrets for authentication
        JWT_ACCESS_TOKEN_SECRET: string;
        JWT_ACCESS_TOKEN_EXPIRES_IN: string;
        JWT_REFRESH_TOKEN_SECRET: string;
        JWT_REFRESH_TOKEN_EXPIRES_IN: string;
        JWT_REFRESH_TOKEN_COOKIE_NAME: string;

        // Password Reset
        PASS_RESET_BYTES: string;
        PASS_RESET_EXPIRES_IN: string;

        // Validation Code
        VALIDATION_CODE_SIZE: string;
        VALIDATION_CODE_EXPIRES_IN: string;
    }
}
