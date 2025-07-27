import {
    CodeAlreadyUsedException,
    InternalErrorException,
    UserNotFoundException,
    CodeExpiredException,
    InvalidCodeException
} from '../responses';
import { IUserVerification, ITokenWithExpiry, IUser } from '@/types/entities';
import { VerificationContext } from '@/types/enums';
import { MailerService } from '@/external/mailer';
import { LoggerDecorator } from '@/decorators';
import { LoggerInterface } from '@/lib/logger';
import { UserService } from './UserService';
import { Service } from 'typedi';
import bcrypt from 'bcryptjs';

@Service()
export class AuthService {
    constructor(
        @LoggerDecorator(__filename)
        private readonly logger: LoggerInterface,
        private readonly userService: UserService,
        private readonly mailerService: MailerService
    ) {}

    public async dispatchVerificationCode(
        user: IUser,
        verification: IUserVerification
    ): Promise<any> {
        const expiration = Math.ceil(
            (verification.expiresAt.getTime() - verification.createdAt.getTime()) / (1000 * 60)
        );

        this.logger.info(`Dispatching verification code to user ${user.id}`);

        try {
            return await this.mailerService.dispatchVerificationCode({
                to: user.email,
                name: user.displayName,
                code: verification.code,
                expiration
            });
        } catch (error) {
            this.logger.error(
                `Failed to dispatch verification code to user ${user.id}: ${error.message}`
            );

            throw error;
        }
    }

    public async verifyEmail(userId: string, code: string): Promise<boolean> {
        this.logger.info(`Starting email verification attempt for user => ${userId}`);

        const user = await this.userService.findById(userId, { verifications: 1, isVerified: 1 });

        if (!user) {
            this.logger.warn(`User with identifier '${userId}' not found`);

            throw new UserNotFoundException();
        }
        if (user.isVerified) {
            this.logger.info(`User '${userId}' is already verified`);

            return true;
        }

        const verification = user.verifications?.find(
            (v) => v && v.code === code && v.context === VerificationContext.EMAIL_CONFIRMATION
        );

        if (!verification || !verification.code) {
            this.logger.warn(`Verification code provided for user '${userId}' is invalid`);

            throw new InvalidCodeException();
        }
        if (new Date() > verification.expiresAt) {
            this.logger.warn(`Verification code provided for user '${userId}' has expired`);

            throw new CodeExpiredException();
        }
        if (verification.used) {
            this.logger.warn(
                `Verification code provided for user '${userId}' has already been used previously`
            );

            throw new CodeAlreadyUsedException();
        }

        await this.userService.update(
            {
                'id': userId,
                'verifications.code': code
            },
            {
                $set: {
                    'verifications.$.used': true,
                    'isVerified': true
                }
            }
        );

        this.logger.info(`User '${userId}' has been successfully verified`);

        return true;
    }

    public async resetPassword(token: string, newPassword: string): Promise<boolean> {
        this.logger.info(`Attempting password reset with token`);

        const user = await this.userService.findOne(
            {
                'passwordReset.token': token,
                'passwordReset.expiresAt': { $gt: new Date() }
            },
            { passwordReset: 1 }
        );

        if (!user || !user.passwordReset) {
            this.logger.warn(`Invalid or expired password reset token`);

            throw new InvalidCodeException();
        }

        try {
            await this.userService.update(
                { id: user.id },
                {
                    password: newPassword,
                    $unset: { passwordReset: 1 }
                }
            );

            this.logger.info(`Password reset successfully for user ${user.id}`);

            return true;
        } catch (error) {
            this.logger.error(`Error resetting password: ${error.message}`);

            throw error;
        }
    }

    public async setPasswordResetToken(
        email: string,
        resetToken: ITokenWithExpiry
    ): Promise<IUser> {
        this.logger.info(`Setting password reset token for email => ${email}`);

        const user = await this.userService.findByEmail(email);

        if (!user) {
            this.logger.warn(`User with email '${email}' not found!`);
            throw new UserNotFoundException();
        }

        const updatedUser = await this.userService.update(
            { id: user.id },
            { passwordReset: resetToken }
        );

        this.logger.info(`Password reset token set for user ${user.id}`);

        return updatedUser;
    }

    public async addVerificationCode(
        userId: string,
        verification: IUserVerification
    ): Promise<IUser> {
        this.logger.info(`Adding verification code for user => ${userId}`);

        const user = await this.userService.findById(userId);

        if (!user) {
            this.logger.warn(`User with identifier '${userId}' not found!`);

            throw new UserNotFoundException();
        }

        const updatedUser = await this.userService.update(
            { id: userId },
            { $push: { verifications: verification } }
        );

        this.logger.info(`Verification code added for user ${userId}`);

        return updatedUser;
    }

    public async revokeAllSessions(userId: string): Promise<void> {
        this.logger.info(`Revoking all sessions for user => ${userId}`);

        try {
            await this.userService.update(
                { id: userId },
                {
                    $set: {
                        'sessions.$[].isRevoked': true,
                        'sessions.$[].revokedAt': new Date()
                    }
                }
            );

            this.logger.info(`All sessions revoked for user ${userId}`);
        } catch (error) {
            this.logger.error(`Error revoking sessions for user ${userId}: ${error.message}`);

            throw error;
        }
    }

    public async isUserVerified(userId: string): Promise<boolean> {
        const user = await this.userService.findById(userId, { isVerified: 1 });

        if (!user) {
            throw new UserNotFoundException();
        }

        return user.isVerified;
    }
}
