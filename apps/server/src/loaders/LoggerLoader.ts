/**
 * @file LoggerLoader.ts
 * @description Configures the Winston logger and loads it into the microframework context. Applies different formatting for development and production environments. Enhances error visibility and stack trace formatting for better debugging and observability. Executed during the application boot process as a MicroframeworkLoader component.
 * @author Lucas
 * @license MIT
 */

import { MicroframeworkSettings, MicroframeworkLoader } from 'microframework-w3tec';
import { transports, configure, format } from 'winston';
import { EnvConfig } from '@/config/env';
import { Logger } from '@/lib/logger';

export const LoggerLoader: MicroframeworkLoader = async (
    settings?: MicroframeworkSettings
): void => {
    /**
     * Custom log format used in development for colorized, readable output.
     */
    const devFormat = format.combine(
        format.splat(),
        format.errors({ stack: true }),
        format.colorize({ all: true }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, stack, ...rest }) => {
            const restStr =
                Object.keys(rest).length > 0 ? `\n${JSON.stringify(rest, null, 4)}` : '';
            const stackStr = stack ? `\n${stack}` : '';

            return `${timestamp} - [${level}]: ${message}${stackStr}${restStr}`;
        })
    );

    /**
     * Log format used in production for structured JSON output.
     */
    const prodFormat = format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
    );

    configure({
        transports: [
            new transports.Console({
                level: EnvConfig.Logging.level,
                handleExceptions: true,
                format: EnvConfig.Environment.node === 'dev' ? devFormat : prodFormat
            })
        ],
        exitOnError: false // Do not exit on handled exceptions
    });

    const logger: Logger = new Logger(__filename);

    logger.info('Winston logger initialized');
};
