import {
    IRefreshTokenSession,
    IUserVerification,
    ITokenWithExpiry,
    IChild,
    IUser
} from '@/types/entities';
import { VerificationContext, UserStatus } from '@/types/enums';
import { CallbackError, Schema, model } from 'mongoose';
import { UserConstraints } from '@/config/constants';
import { HashingException } from '@/api/responses';
import { SnowflakeGenerator } from '@/lib/snowflake';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const { identifyFields, securityFields, profileFields } = UserConstraints;

export const TokenWithExpirySchema: Schema<ITokenWithExpiry> = new Schema<ITokenWithExpiry>({
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, required: true }
});

export const UserVerificationSchema: Schema<IUserVerification> = new Schema<IUserVerification>({
    code: { type: String, required: true },
    context: {
        type: String,
        enum: Object.values(VerificationContext),
        required: true
    },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, required: true }
});

export const RefreshTokenSessionSchema: Schema<IRefreshTokenSession> =
    new Schema<IRefreshTokenSession>({
        sessionId: { type: String, required: true },
        refreshToken: { type: String, required: true },
        createdAt: { type: Date, required: true },
        expiresAt: { type: Date, required: true },
        ip: { type: String },
        userAgent: { type: String },
        isRevoked: { type: Boolean, default: false },
        revokedAt: { type: Date, default: null }
    });

export const ChildSchema: Schema<IChild> = new Schema<IChild>({
    id: {
        type: String,
        default: uuidv4
    },
    name: {
        type: String,
        required: true,
        minlength: profileFields.child.name.minLength,
        maxlength: profileFields.child.name.maxLength,
        match: profileFields.child.name.pattern
    },
    age: {
        type: Number,
        required: true,
        min: 0,
        max: profileFields.child.age.max
    },
    notes: {
        type: String,
        maxlength: profileFields.child.notes.maxLength
    }
});

export const UserSchema: Schema<IUser> = new Schema<IUser>({
    id: {
        type: String,
        unique: true,
        default: () => SnowflakeGenerator.generate(),
        immutable: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
        minlength: identifyFields.username.minLength,
        maxlength: identifyFields.username.maxLength,
        match: identifyFields.username.pattern
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
        maxlength: identifyFields.email.maxLength
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: securityFields.password.minLength,
        maxlength: securityFields.password.maxLength
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
        minlength: identifyFields.displayName.minLength,
        maxlength: identifyFields.displayName.maxLength,
        match: identifyFields.displayName.pattern
    },
    avatarUrl: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        maxlength: profileFields.bio.maxLength,
        default: profileFields.bio.default
    },
    status: {
        type: String,
        enum: Object.values(UserStatus),
        required: true,
        default: UserStatus.OFFLINE
    },
    passwordReset: {
        type: TokenWithExpirySchema,
        default: undefined
    },
    verifications: {
        type: [UserVerificationSchema],
        default: []
    },
    sessions: {
        type: [RefreshTokenSessionSchema],
        default: []
    },
    isVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    children: {
        type: [ChildSchema],
        default: []
    }
});

// Clean toObject transform to prevent circular references
UserSchema.set('toObject', {
    transform: function (doc: any, ret: any, options: any = {}) {
        // Remove Mongoose internal properties
        delete ret._id;
        delete ret.__v;
        
        return ret;
    }
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch (error) {
        next(new HashingException());
    }
});

export const DbUserModel = model<IUser>('User', UserSchema, 'users');