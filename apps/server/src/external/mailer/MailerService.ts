/**
 * @file MailerService.ts
 * @description
 * Defines the MailerService class responsible for handling email delivery through SMTP.
 * Supports templated messages such as verification codes and password reset emails.
 * Utilizes Nodemailer for email transport and logger integration for error tracking.
 *
 * @author Lucas
 * @license MIT
 */

import {
    createTransport as createTransporter,
    SentMessageInfo,
    SendMailOptions,
    Transporter
} from 'nodemailer';
import { EmailCannotBeSentException } from '@/api/responses';
import { LoggerDecorator } from '@/decorators';
import { LoggerInterface } from '@/lib/logger';
import { EnvConfig } from '@/config/env';
import { Service } from 'typedi';
import VerificationCodeTemplate from './templates/CodeVerification.json';
import PasswordChangedTemplate from './templates/PasswordChanged.json';
import PasswordResetTemplate from './templates/PasswordReset.json';

/**
 * Options for sending the template with a verification code to a user
 */
interface VerificationCodeOptions {
    to: string;
    displayName: string;
    expiration: string;
    code: string;
}

/**
 * Options for sending the template with password reset instructions to a user
 */
interface PasswordResetOptions {
    to: string;
    displayName: string;
    expiration: string;
    resetUrl: string;
}

/**
 * Options for sending an email notification about a password reset performed on an account
 */
interface PasswordChangedOptions {
    to: string;
    name: string;
    email: string;
    timestamp: string;
    ip: string;
    device: string;
}

interface EmailTemplate {
    subject: string;
    html: string;
    [key: string]: string;
}

@Service()
export class MailerService {
    private transporter: Transporter;

    constructor(
        @LoggerDecorator(__filename)
        private readonly logger: LoggerInterface
    ) {
        this.transporter = createTransporter(
            {
                service: EnvConfig.SMTP.service,
                auth: {
                    user: EnvConfig.SMTP.user,
                    pass: EnvConfig.SMTP.pass
                }
            },
            { from: `"${EnvConfig.SMTP.name}" <${EnvConfig.SMTP.user}>` }
        );
    }

    /**
     * Returns the current year
     *
     * @readonly
     */
    private get currentYear() {
        return new Date().getFullYear().toString();
    }

    /**
     * Replaces placeholders in the given template with actual values from the replacements object.
     *
     * @param template - An object representing the template with placeholders in the form `{{key}}`.
     * @param replacements - An object containing values to replace the template placeholders.
     * @returns The transformed template with placeholders replaced by actual values.
     */
    private transformTemplate<T extends Record<string, string>>(
        template: EmailTemplate,
        replacements: T
    ): EmailTemplate {
        return Object.entries(template).reduce((acc, [key, value]) => {
            acc[key as keyof EmailTemplate] = value.replace(/{{(.*?)}}/g, (_, placeholderKey) => {
                const replacementValue = replacements[placeholderKey.trim()];

                if (!replacementValue) this.logger.warn(`Replacement '${placeholderKey}' not defined`);

                return replacementValue ?? '<unknown replacement>';
            });

            return acc;
        }, {} as EmailTemplate);
    }

    /**
     * Sends an email using the configured transporter.
     *
     * @param options - Email options excluding the `from` field, which is set automatically.
     * @returns A promise that resolves to `true` if the message was sent successfully, otherwise `false`.
     */
    private async dispatchEmail(options: Omit<SendMailOptions, 'from'>): Promise<SentMessageInfo> {
        this.logger.info(`Attempting to send email to => ${options.to}`);

        try {
            const response = await this.transporter.sendMail(options);

            this.logger.info(`Email sent to user => ${options.to}`);

            return response;
        } catch (error) {
            this.logger.error(
                `Error while trying to send email to '${options.to || 'unknown'}':`,
                error
            );

            throw new EmailCannotBeSentException();
        }
    }

    /**
     * Sends a verification code email using a predefined template.
     *
     * @param options - The verification details, including recipient email, displayName, code, and expiration.
     * @returns A promise that resolves to `true` if the email was sent successfully, otherwise `false`.
     */
    public async dispatchVerificationCode({
        to,
        ...options
    }: VerificationCodeOptions): Promise<SentMessageInfo> {
        const { subject, html } = this.transformTemplate(VerificationCodeTemplate as EmailTemplate, {
            ...options,
            year: this.currentYear
        });

        return this.dispatchEmail({ to, subject, html });
    }

    /**
     * Sends a password reset email using a predefined template.
     *
     * @param options - The password reset details, including recipient email, displayName, and reset URL.
     * @returns A promise that resolves to `true` if the email was sent successfully, otherwise `false`.
     */
    public async dispatchPasswordReset({
        to,
        ...options
    }: PasswordResetOptions): Promise<SentMessageInfo> {
        const { subject, html } = this.transformTemplate(PasswordResetTemplate as EmailTemplate, {
            ...options,
            year: this.currentYear
        });

        return this.dispatchEmail({ to, subject, html });
    }

    /**
     * Sends a password changed confirmation email using a predefined template.
     *
     * @param options - The details of the password change, including recipient info and context.
     * @returns A promise that resolves to the result of the email dispatch.
     */
    public async notifyPasswordChange({
        to,
        ...options
    }: PasswordChangedOptions): Promise<SentMessageInfo> {
        const { subject, html } = this.transformTemplate(PasswordChangedTemplate as EmailTemplate, {
            ...options,
            supportUrl: 'unknown',
            year: this.currentYear
        });

        return this.dispatchEmail({ to, subject, html });
    }
}