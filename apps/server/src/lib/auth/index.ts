import {
    RefreshTokenMissingException,
    InvalidRefreshTokenException,
    RefreshTokenExpiredException,
    AccessTokenMissingException,
    InvalidAccessTokenException,
    AccessTokenExpiredException
} from '@/api/responses';
import { IRefreshTokenSession, ITokenWithExpiry, IUserVerification } from '@/types/entities';
import { randomBytes, createHash, randomInt } from 'node:crypto';
import jwt, { TokenExpiredError, JsonWebTokenError, SignOptions } from 'jsonwebtoken';
import { VerificationContext } from '@/types/enums';
import { Request, Response } from 'express';
import { EnvConfig } from '@/config/env';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import ms from 'ms';

export interface TokenPayload {
    userId: string;
    sessionId: string;
}

export interface AuthSession {
    session: IRefreshTokenSession;
    accessToken: string;
}

export class AuthUtils {
    private static readonly ACCESS_TOKEN_SECRET = EnvConfig.JWT.accessTokenSecret;
    private static readonly REFRESH_TOKEN_SECRET = EnvConfig.JWT.refreshTokenSecret;
    private static readonly ACCESS_TOKEN_EXPIRES_IN = EnvConfig.JWT.accessTokenExpiresIn;
    private static readonly REFRESH_TOKEN_EXPIRES_IN = EnvConfig.JWT.refreshTokenExpiresIn;
    private static readonly REFRESH_TOKEN_COOKIE_NAME = EnvConfig.JWT.refreshTokenCookieName;

    private static getPayload(userId: string, sessionId: string): TokenPayload {
        return { userId, sessionId };
    }

    static generateAccessToken(userId: string, sessionId: string): string {
        return jwt.sign(this.getPayload(userId, sessionId), this.ACCESS_TOKEN_SECRET, {
            expiresIn: this.ACCESS_TOKEN_EXPIRES_IN as any
        });
    }

    static generateRefreshToken(userId: string, sessionId: string): string {
        return jwt.sign(this.getPayload(userId, sessionId), this.REFRESH_TOKEN_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRES_IN as any
        });
    }

    static verifyAccessToken(token: string | undefined): TokenPayload {
        if (!token) throw new AccessTokenMissingException();

        try {
            return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as TokenPayload;
        } catch (error) {
            if (error instanceof TokenExpiredError) throw new AccessTokenExpiredException();
            else if (error instanceof JsonWebTokenError) throw new InvalidAccessTokenException();
            else throw error;
        }
    }

    static verifyRefreshToken(token: string | undefined): TokenPayload {
        if (!token) throw new RefreshTokenMissingException();

        try {
            return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as TokenPayload;
        } catch (error) {
            if (error instanceof TokenExpiredError) throw new RefreshTokenExpiredException();
            else if (error instanceof JsonWebTokenError) throw new InvalidRefreshTokenException();
            else throw error;
        }
    }

    static setRefreshTokenCookie(res: Response, refreshToken: string): void {
        const msValue = ms(this.REFRESH_TOKEN_EXPIRES_IN as any);
        if (typeof msValue === 'number') {
            res.cookie(this.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
                httpOnly: true,
                secure: EnvConfig.Environment.node === 'prod',
                sameSite: 'lax',
                maxAge: msValue,
                path: '/'
            });
        }
    }

    static getRefreshTokenCookie(req: Request): string | undefined {
        return req.cookies?.[this.REFRESH_TOKEN_COOKIE_NAME];
    }

    static clearRefreshToken(res: Response): void {
        res.clearCookie(this.REFRESH_TOKEN_COOKIE_NAME);
    }

    static hashPassToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }
    
    static async comparePassword(original: string, input: string): Promise<boolean> {
        return bcrypt.compare(input, original);
    }

    static comparePassResetTokens(original: string, input: string): boolean {
        return original === this.hashPassToken(input);
    }

    static createSession(
        userId: string,
        ip?: string,
        userAgent?: string[] | string | undefined
    ): AuthSession {
        userAgent = Array.isArray(userAgent) ? userAgent.join('; ') : userAgent || 'unknown';

        const sessionId = uuidv4();
        const refreshToken = this.generateRefreshToken(userId, sessionId);
        const accessToken = this.generateAccessToken(userId, sessionId);

        const msValue = ms(this.REFRESH_TOKEN_EXPIRES_IN as any);
        const expiresAt = typeof msValue === 'number' ? new Date(Date.now() + msValue) : new Date(Date.now() + 86400000);

        return {
            session: {
                sessionId,
                refreshToken,
                createdAt: new Date(),
                expiresAt,
                ip,
                userAgent,
                isRevoked: false
            },
            accessToken
        };
    }

    static createVerification(context: VerificationContext): IUserVerification {
        const { expiresIn, size } = EnvConfig.VerificationCode;
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + expiresIn);
        const code = randomInt(Math.pow(10, size - 1), Math.pow(10, size)).toString();

        return { code, context, createdAt, expiresAt };
    }

    static createPassReset(): ITokenWithExpiry & { tokenHash: string } {
        const { expiresIn, bytes } = EnvConfig.PasswordReset;
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + expiresIn);
        const token = randomBytes(bytes).toString('hex');
        const tokenHash = this.hashPassToken(token);

        return { token, tokenHash, createdAt, expiresAt };
    }
}