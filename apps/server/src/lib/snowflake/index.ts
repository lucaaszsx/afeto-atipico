/**
 * @file index.ts
 * @description Twitter Snowflake ID generator with automatic initialization and persistent state
 * @author Lucas
 * @license MIT
 */

import path from 'node:path';
import fs from 'node:fs';

const STATE_FILE = path.join(__dirname, '.snowflake-state.json');
const EPOCH = 1735700400000n; // January 1st, 2025
const MAX_SEQUENCE = 0xfffn; // 4095 (12 bits)
const TIMESTAMP_BITS = 41n;
const SEQUENCE_BITS = 12n;

interface SnowflakeState {
    readonly lastTimestamp: string;
    readonly sequence: string;
    readonly machineId: string;
}

interface SnowflakeInfo {
    readonly timestamp: number;
    readonly sequence: number;
    readonly machineId: number;
    readonly generatedAt: Date;
    readonly age: number;
}

/**
 * Snowflake ID generator with automatic initialization
 */
export class SnowflakeGenerator {
    private static lastTimestamp: bigint = 0n;
    private static sequence: bigint = 0n;
    private static machineId: bigint;
    private static initialized: boolean = false;
    private static saveCounter: number = 0;
    private static readonly SAVE_INTERVAL = 1000; // Save state every 1000 IDs

    /**
     * Automatically initializes the generator on first use
     * @private
     */
    private static ensureInitialized(): void {
        if (this.initialized) return;

        this.machineId = this.generateMachineId();
        this.loadState();
        this.setupGracefulShutdown();
        this.initialized = true;
    }

    /**
     * Generates a new unique Snowflake ID
     * @returns The generated Snowflake ID as a string
     * @throws Error when clock moves backwards or sequence overflow occurs
     */
    public static generate(): string {
        this.ensureInitialized();

        let timestamp = BigInt(Date.now());

        // Handle clock regression
        if (timestamp < this.lastTimestamp)
            throw new Error(
                `Clock moved backwards. Rejecting requests until ${this.lastTimestamp}`
            );

        // Same millisecond - increment sequence
        if (timestamp === this.lastTimestamp) {
            this.sequence = (this.sequence + 1n) & MAX_SEQUENCE;

            // Sequence overflow - wait for next millisecond
            if (this.sequence === 0n) timestamp = this.waitNextMillis(this.lastTimestamp);
        } else this.sequence = 0n;

        this.lastTimestamp = timestamp;

        // Periodic state saving for performance
        if (++this.saveCounter >= this.SAVE_INTERVAL) {
            this.saveState();
            this.saveCounter = 0;
        }

        // Build Snowflake: [timestamp:41][machineId:10][sequence:12]
        const adjustedTimestamp = timestamp - EPOCH;
        const snowflake =
            (adjustedTimestamp << (SEQUENCE_BITS + 10n)) |
            (this.machineId << SEQUENCE_BITS) |
            this.sequence;

        return snowflake.toString();
    }

    /**
     * Parses a Snowflake ID and extracts its components
     * @param id - The Snowflake ID as a string
     * @returns Object containing all extracted components and metadata
     */
    public static parseId(id: string): SnowflakeInfo {
        const snowflake = BigInt(id);

        const sequence = Number(snowflake & MAX_SEQUENCE);
        const machineId = Number((snowflake >> SEQUENCE_BITS) & 0x3ffn);
        const timestamp = Number((snowflake >> (SEQUENCE_BITS + 10n)) + EPOCH);

        return {
            timestamp,
            sequence,
            machineId,
            generatedAt: new Date(timestamp),
            age: Date.now() - timestamp
        };
    }

    /**
     * Forces immediate state save (useful before shutdown)
     */
    public static flush(): void {
        if (this.initialized) this.saveState();
    }

    /**
     * Generates a unique machine ID based on process and system characteristics
     * @returns 10-bit machine identifier
     * @private
     */
    private static generateMachineId(): bigint {
        // Use process ID and hostname hash for uniqueness
        const pid = BigInt(process.pid);
        const hostname = require('os').hostname();
        const hostHash = this.simpleHash(hostname);

        // Combine PID and hostname hash to create 10-bit machine ID
        return (pid ^ BigInt(hostHash)) & 0x3ffn;
    }

    /**
     * Simple hash function for string input
     * @param str - Input string to hash
     * @returns Hash value
     * @private
     */
    private static simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Loads the generator state from persistent storage
     * @private
     */
    private static loadState(): void {
        try {
            if (!fs.existsSync(STATE_FILE)) return;

            const data: SnowflakeState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));

            // Only restore state if it's from the same machine
            if (BigInt(data.machineId) === this.machineId) {
                this.lastTimestamp = BigInt(data.lastTimestamp);
                this.sequence = BigInt(data.sequence);
            }
        } catch (error) {
            // Silent fallback - start fresh on any error
            this.lastTimestamp = 0n;
            this.sequence = 0n;
        }
    }

    /**
     * Saves the current generator state to persistent storage
     * @private
     */
    private static saveState(): void {
        try {
            const stateDir = path.dirname(STATE_FILE);
            if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });

            const data: SnowflakeState = {
                lastTimestamp: this.lastTimestamp.toString(),
                sequence: this.sequence.toString(),
                machineId: this.machineId.toString()
            };

            // Atomic write using temporary file
            const tempFile = `${STATE_FILE}.tmp`;
            fs.writeFileSync(tempFile, JSON.stringify(data));
            fs.renameSync(tempFile, STATE_FILE);
        } catch (error) {
            // Silent failure - state saving is not critical for functionality
        }
    }

    /**
     * Waits for the next millisecond when sequence is exhausted
     * @param lastTimestamp - The previous timestamp as bigint
     * @returns bigint - The next valid timestamp
     * @private
     */
    private static waitNextMillis(lastTimestamp: bigint): bigint {
        let timestamp = BigInt(Date.now());
        while (timestamp <= lastTimestamp) timestamp = BigInt(Date.now());
        return timestamp;
    }

    /**
     * Sets up graceful shutdown handlers to preserve state on process termination
     * @returns void
     * @private
     */
    private static setupGracefulShutdown(): void {
        const shutdown = (): void => {
            this.saveState();
        };

        process.once('SIGINT', shutdown);
        process.once('SIGTERM', shutdown);
        process.once('beforeExit', shutdown);
    }
}
