import {
    RegisterUserRequest,
    VerifyEmailRequest,
    LoginUserRequest
} from './requests/AuthRequests';
import { RegisterUserResponse, LoginUserResponse, RefreshResponse } from './responses/AuthResponses';
import { JsonController, Authorized, Body, Post, Req, Res } from 'routing-controllers';
import { ApiSuccessCodes, createApiResponse } from '../responses';
import {
    AuthenticationFailedException,
    EmailNotVerifiedException,
    UserNotFoundException
} from '../responses';
import { UserService, AuthService } from '../services';
import { VerificationContext } from '@/types/enums';
import type { ApiResponse } from '@/types/common';
import type { Request, Response } from 'express';
import { RequiredUser } from '@/decorators';
import { EnvConfig } from '@/config/env';
import { IUser } from '@/types/entities';
import { AuthUtils } from '@/lib/auth';
import { Service } from 'typedi';

@Service()
@JsonController('/auth')
export default class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService
    ) {}

    // Helper method to safely serialize user data for auth responses
    private serializeUserForAuth(user: IUser): any {
        return {
            id: user.id,
            username: user.username,
            email: user.email || '',
            displayName: user.displayName,
            avatarUrl: user.avatarUrl || '',
            bio: user.bio || '',
            status: user.status,
            isVerified: user.isVerified || false,
            children: (user.children || []).map(child => ({
                id: child.id,
                name: child.name,
                age: child.age,
                notes: child.notes || ''
            })),
            createdAt: user.createdAt || new Date(),
            updatedAt: user.updatedAt || new Date()
        };
    }

    @Post('/register')
    public async register(
        @Body() body: RegisterUserRequest,
        @Req() req: Request,
        @Res() res: Response
    ): Promise<ApiResponse<RegisterUserResponse>> {
        const user = await this.userService.create({
            username: body.username,
            email: body.email,
            password: body.password,
            displayName: body.displayName
        });
        const { accessToken, session } = AuthUtils.createSession(user.id, req.ip, req.headers['user-agent']);
        const updatedUser = await this.userService.update(
            { id: user.id },
            { $push: { sessions: session } }
        );
        
        AuthUtils.setRefreshTokenCookie(res, session.refreshToken);

        return createApiResponse<RegisterUserResponse>({
            path: req.path,
            apiCode: ApiSuccessCodes.CREATED,
            data: {
                user: this.serializeUserForAuth(updatedUser),
                accessToken
            }
        });
    }

    @Post('/login')
    public async login(
        @Body() body: LoginUserRequest,
        @Req() req: Request,
        @Res() res: Response
    ): Promise<ApiResponse<LoginUserResponse>> {
        const user = await this.userService.findByEmail(body.email, undefined, '+password');
        
        if (!user?.id || !(await AuthUtils.comparePassword(user.password, body.password))) throw new AuthenticationFailedException();

        const { accessToken, session } = AuthUtils.createSession(user.id, req.ip, req.headers['user-agent']);
        const updatedUser = await this.userService.update(
            { id: user.id },
            { $push: { sessions: session } }
        );

        AuthUtils.setRefreshTokenCookie(res, session.refreshToken);

        return createApiResponse<LoginUserResponse>({
            path: req.path,
            apiCode: ApiSuccessCodes.OK,
            data: {
                user: this.serializeUserForAuth(updatedUser),
                accessToken
            }
        });
    }

    @Authorized()
    @Post('/logout')
    public async logout(@Req() req: Request, @Res() res: Response): Promise<ApiResponse<null>> {
        const cookieRefreshToken = AuthUtils.getRefreshTokenCookie(req);
        let payload;

        try {
            payload = AuthUtils.verifyRefreshToken(cookieRefreshToken);

            await this.userService.update(
                { id: payload.userId },
                {
                    $pull: {
                        sessions: {
                            sessionId: payload.sessionId
                        }
                    }
                }
            );
        } finally {
            AuthUtils.clearRefreshToken(res);

            return createApiResponse<null>({
                path: req.path,
                apiCode: ApiSuccessCodes.NO_CONTENT
            });
        }
    }

    @Post('/refresh')
    public async refresh(
        @Req() req: Request,
        @Res() res: Response
    ): Promise<ApiResponse<RefreshResponse>> {
        const cookieRefreshToken = AuthUtils.getRefreshTokenCookie(req);
        let payload;
        console.log('REFRESH TOKEN GET: (/AUTH/REFRESH): ', { cookieRefreshToken });
        try {
            payload = AuthUtils.verifyRefreshToken(cookieRefreshToken);
        } catch (error) {
            AuthUtils.clearRefreshToken(res);
            throw error;
        }

        const newRefreshToken = AuthUtils.generateRefreshToken(payload.userId, payload.sessionId);
        const updatedUser = await this.userService.update(
            {
                'id': payload.userId,
                'sessions.sessionId': payload.sessionId
            },
            {
                $set: {
                    'sessions.$.refreshToken': newRefreshToken
                }
            }
        );

        if (!updatedUser) throw new UserNotFoundException();

        const newAccessToken = AuthUtils.generateAccessToken(payload.userId, payload.sessionId);

        AuthUtils.setRefreshTokenCookie(res, newRefreshToken);

        return createApiResponse<RefreshResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: { accessToken: newAccessToken }
        });
    }

    @Authorized()
    @Post('/verify-email')
    public async verifyEmail(
        @Body() body: VerifyEmailRequest,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<null>> {
        await this.authService.verifyEmail(user, body.code);

        return createApiResponse<null>({
            path: req.path,
            apiCode: ApiSuccessCodes.NO_CONTENT
        });
    }

    @Authorized()
    @Post('/resend-email-verification')
    public async resendEmailVerification(
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<null>> {
        if (user.isVerified) return createApiResponse<null>({
            path: req.path,
            apiCode: ApiSuccessCodes.NO_CONTENT
        });

        const verification = AuthUtils.createVerification(VerificationContext.EMAIL_CONFIRMATION);

        await this.authService.addVerificationCode(user.id, verification);
        await this.authService.dispatchVerificationCode(user, verification);

        return createApiResponse<null>({
            path: req.path,
            apiCode: ApiSuccessCodes.NO_CONTENT
        });
    }
}