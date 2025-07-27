/**
 * @file utils.ts
 * @description Utility definitions and helpers for Cloudflare R2 operations,
 *              including folder structure, default constraints, and stream conversion.
 * @author Lucas
 * @license MIT
 */

import { Readable } from 'node:stream';

/**
 * Enum representing the base folders used for storing different types of files in R2.
 */
export enum FolderTypes {
    /**
     * Folder for storing user avatar images.
     */
    UserAvatars = 'avatars',

    /**
     * Folder for storing media files uploaded to groups.
     */
    GroupMedia = 'attachments',

    /**
     * Folder for storing temporary files.
     */
    TempFiles = 'temp'
}

/**
 * Constant definitions.
 */
export const Constraints = {
    /**
     * Default MIME type used when none is provided.
     */
    DEFAULT_CONTENT_TYPE: 'application/octet-stream'
} as const;

/**
 * Converts a readable stream into a Buffer.
 *
 * @param stream - The readable stream to be consumed.
 * @returns A promise that resolves to a Buffer containing the full stream data.
 */
export const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
    const chunks: Uint8Array[] = [];

    for await (const chunk of stream) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }

    return Buffer.concat(chunks);
};
