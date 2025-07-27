/**
 * @file R2Service.ts
 * @description Provides a wrapper around Cloudflare R2 storage using AWS S3-compatible API.
 *              Supports uploading, downloading, deleting, listing, and checking object existence.
 * @author Lucas
 * @license MIT
 */

import {
    ListObjectsV2Command,
    DeleteObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    GetObjectCommand,
    S3Client
} from '@aws-sdk/client-s3';
import { FolderTypes, Constraints, streamToBuffer } from './utils';
import { extension as mimeToExtension } from 'mime-types';
import { LoggerDecorator } from '@/decorators';
import { LoggerInterface } from '@/lib/logger';
import { EnvConfig } from '@/config/env';
import { Readable } from 'node:stream';
import { Service } from 'typedi';
import { extname } from 'path';

/**
 * @class R2Service
 * @description Wrapper around Cloudflare R2 storage operations.
 */
@Service()
export class R2Service {
    public client: S3Client;

    constructor(
        @LoggerDecorator(__filename)
        private logger: LoggerInterface
    ) {
        this.client = new S3Client({
            region: EnvConfig.R2.region,
            endpoint: EnvConfig.R2.endpoint,
            credentials: {
                secretAccessKey: EnvConfig.R2.secretAccessKey,
                accessKeyId: EnvConfig.R2.accessKeyId
            }
        });
    }

    /**
     * Builds the object key using folder, file name, and optional content type.
     * Adds file extension based on MIME type if missing.
     *
     * @param fileName - The name of the file.
     * @param contentType - Optional MIME type to determine the extension.
     * @param folder - The target folder in the bucket.
     * @returns The constructed object key.
     */
    constructKey(
        folder: FolderTypes,
        fileName: string,
        contentType: string = Constraints.DEFAULT_CONTENT_TYPE
    ): string {
        const currentExt = extname(fileName);
        let finalName = fileName;

        if (!currentExt && contentType) {
            const extension = mimeToExtension(contentType);

            if (extension) finalName += `.${extension}`;
        }

        return folder ? `${folder}/${finalName}` : finalName;
    }

    /**
     * Returns the full public URL for a given object key.
     *
     * @param key - The object key.
     * @returns The full public URL.
     */
    getObjectUrl(key: string): string {
        return `${EnvConfig.R2.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }

    /**
     * Uploads an object stream to Cloudflare R2 with a specified key and content type.
     *
     * @param stream - The readable stream containing the file data.
     * @param folder - The target folder in the bucket.
     * @param fileName - The name of the file.
     * @param contentType - The MIME type of the file.
     * @returns The key if upload is successful, or undefined on failure.
     */
    async uploadObject(
        stream: Readable,
        folder: FolderTypes,
        fileName: string,
        contentType: string = Constraints.DEFAULT_CONTENT_TYPE
    ): Promise<string | null> {
        const key = this.constructKey(folder, fileName, contentType);

        try {
            const command = new PutObjectCommand({
                Bucket: EnvConfig.R2.bucketName,
                Key: key,
                Body: stream,
                ContentType: contentType
            });

            await this.client.send(command);

            return key;
        } catch (error: any) {
            this.logger.error(
                `Failed to upload object '${key}' (${contentType}) to Cloudflare R2 service:`,
                error
            );

            return null;
        }
    }

    /**
     * Downloads an object from Cloudflare R2 and returns it as a Buffer.
     *
     * @param key - The object key to download.
     * @returns Buffer with file contents, or undefined on error.
     */
    async downloadObject(key: string): Promise<Buffer | null> {
        try {
            const command = new GetObjectCommand({
                Bucket: EnvConfig.R2.bucketName,
                Key: key
            });

            const response = await this.client.send(command);

            if (!response.Body || typeof response.Body.pipe !== 'function') {
                this.logger.error(`Invalid object stream for key: ${key}`);

                return null;
            }

            return await streamToBuffer(response.Body as Readable);
        } catch (error) {
            this.logger.error(`Failed to download object '${key}':`, error);

            return null;
        }
    }

    /**
     * Deletes an object from Cloudflare R2 by its key.
     *
     * @param key - The object key to delete.
     * @returns True if deleted successfully, false otherwise.
     */
    async deleteObject(key: string): Promise<boolean> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: EnvConfig.R2.bucketName,
                Key: key
            });

            await this.client.send(command);

            return true;
        } catch (error) {
            this.logger.error(`Failed to delete object '${key}':`, error);

            return false;
        }
    }

    /**
     * Lists all object keys in the specified prefix folder.
     *
     * @param prefix - Optional prefix to filter the listed objects.
     * @returns Array of object keys, or an empty array on failure.
     */
    async listObjects(prefix?: string): Promise<string[]> {
        try {
            const command = new ListObjectsV2Command({
                Bucket: EnvConfig.R2.bucketName,
                Prefix: prefix
            });

            const response = await this.client.send(command);

            if (!response.Contents?.length) return [];

            return response.Contents.map((item) => item.Key).filter(
                (key): key is string => typeof key === 'string'
            );
        } catch (error) {
            this.logger.error(`Failed to list objects with prefix '${prefix}':`, error);

            return [];
        }
    }

    /**
     * Checks whether an object exists in Cloudflare R2.
     *
     * @param key - The object key to check.
     * @returns True if the object exists, false otherwise.
     */
    async objectExists(key: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: EnvConfig.R2.bucketName,
                Key: key
            });

            await this.client.send(command);

            return true;
        } catch (error: any) {
            if (error?.$metadata?.httpStatusCode !== 404) {
                this.logger.warn(`Error checking object existence for key '${key}':`, error);
            }

            return false;
        }
    }
}
