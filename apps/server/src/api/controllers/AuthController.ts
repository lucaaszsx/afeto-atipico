import {
    ResendEmailVerificationRequest,
    RegisterUserRequest,
    VerifyEmailRequest,
    LoginUserRequest
} from './requests/AuthRequests';
import { RegisterUserResponse, LoginUserResponse, RefreshResponse } from './requests/AuthResponses';
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
import { EnvConfig } from '@/config/env';
import { AuthUtils } from '@/lib/auth';
import { Service } from 'typedi';
import bcrypt from 'bcryptjs';
import ms from 'ms';

@Service()
@JsonController('/auth')
export default class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService
    ) {}

    @Post('/register')
    public async register(
        @Body() body: RegisterUserRequest,
        @Req() req: Request
    ): Promise<ApiResponse<RegisterUserResponse>> {
        const verification = AuthUtils.createVerification(VerificationContext.EMAIL_CONFIRMATION);
        const user = await this.userService.create({
            username: body.username,
            email: body.email,
            password: body.password,
            displayName: body.displayName,
            verifications: [verification]
        });

        await this.authService.dispatchVerificationCode(user, verification);

        return createApiResponse<RegisterUserResponse>({
            path: req.path,
            apiCode: ApiSuccessCodes.CREATED,
            data: user.toObject({ groups: ['private'] })
        });
    }

    @Post('/login')
    public async login(
        @Body() body: LoginUserRequest,
        @Req() req: Request,
        @Res() res: Response
    ): Promise<ApiResponse<LoginUserResponse>> {
        const user = await this.userService.findByEmail(body.email, '+password');

        if (!user?.id) {
            throw new AuthenticationFailedException();
        }

        const isPasswordValid = await this.authService.validatePassword(user.id, body.password);
        if (!isPasswordValid) {
            throw new AuthenticationFailedException();
        }

        const isVerified = await this.authService.isUserVerified(user.id);
        if (!isVerified) {
            throw new EmailNotVerifiedException();
        }

        const { accessToken, session } = AuthUtils.createSession(
            user.id,
            req.ip,
            req.headers['user-agent']
        );
        const updatedUser = await this.userService.update(
            { id: user.id },
            { $push: { sessions: session } }
        );

        AuthUtils.setRefreshTokenCookie(res, session.refreshToken);

        return createApiResponse<LoginUserResponse>({
            path: req.path,
            apiCode: ApiSuccessCodes.OK,
            data: {
                user: updatedUser.toObject({ groups: ['private'] }),
                accessToken
            }
        });
    }

    @Post('/logout')
    @Authorized()
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

    @Post('/verify-email')
    public async verifyEmail(
        @Body() body: VerifyEmailRequest,
        @Req() req: Request
    ): Promise<ApiResponse<null>> {
        await this.authService.verifyEmail(body.userId, body.code);

        return createApiResponse<null>({
            path: req.path,
            apiCode: ApiSuccessCodes.NO_CONTENT
        });
    }

    @Post('/resend-email-verification')
    public async resendEmailVerification(
        @Body() body: ResendEmailVerificationRequest,
        @Req() req: Request
    ): Promise<ApiResponse<null>> {
        const user = await this.userService.findById(body.userId);

        if (!user?.id) throw new UserNotFoundException();

        const isVerified = await this.authService.isUserVerified(user.id);
        if (isVerified) {
            return createApiResponse({
                path: req.path,
                apiCode: ApiSuccessCodes.OK
            });
        }

        const verification = AuthUtils.createVerification(VerificationContext.EMAIL_CONFIRMATION);

        await this.authService.addVerificationCode(user.id, verification);
        await this.authService.dispatchVerificationCode(user, verification);

        return createApiResponse<null>({
            path: req.path,
            apiCode: ApiSuccessCodes.NO_CONTENT
        });
    }
}
