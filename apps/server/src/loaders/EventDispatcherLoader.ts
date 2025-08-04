/**
 * @file EventDispatcherLoader.ts
 * @description Loads all event subscribers into the microframework context using glob pattern matching. Automatically imports subscriber files to avoid manual imports during application boot process.
 * @author Lucas
 * @license MIT
 */

import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { EnvConfig } from '@/config/env';
import { Logger } from '@/lib/logger';
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

function findSubscriberFiles(pattern: string): string[] {
    const files: string[] = [];
    
    // Extract base directory from the processed pattern
    const baseDir = pattern.split('**')[0];
    
    // Determine if we're in development or production based on the pattern
    const isDev = pattern.includes('/src/');
    const targetExtension = isDev ? '.ts' : '.js';
    
    function searchDirectory(dir: string): void {
        try {
            const items = readdirSync(dir);
            
            for (const item of items) {
                const fullPath = join(dir, item);
                const stat = statSync(fullPath);
                
                if (stat.isDirectory()) {
                    searchDirectory(fullPath);
                } else if (stat.isFile() && 
                          item.includes('Subscriber') && 
                          item.endsWith(targetExtension)) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Directory doesn't exist or is not accessible
        }
    }
    
    if (baseDir) searchDirectory(baseDir);
    
    return files;
}

export const EventDispatcherLoader: MicroframeworkLoader = async (
    settings?: MicroframeworkSettings
): Promise<void> => {
    const logger: Logger = new Logger(__filename);
    const subscribersPattern = EnvConfig.Application.dirs.subscribers;
    
    logger.debug(`Looking for subscribers with pattern: ${subscribersPattern}`);
    
    try {
        const files: string[] = findSubscriberFiles(subscribersPattern);
        
        await Promise.all(
            files.map(async (file: string): Promise<void> => {
                try {
                    await import(file);
                    logger.debug(`Loaded subscriber: ${file}`);
                } catch (error) {
                    logger.error(`Failed to load subscriber ${file}:`, error);
                }
            })
        );

        logger.info(`Event subscribers loaded. Found ${files.length} files.`);
    } catch (error) {
        logger.error('Failed to load event subscribers:', error);
        logger.info('Event subscribers loading skipped.');
    }
};