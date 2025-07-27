import { IGroupMessage } from '@/types/entities';
import { Schema, model } from 'mongoose';
import { GroupMessageConstraints } from '@/config/constants';
import { ClassTransformOptions } from 'class-transformer';
import { SnowflakeGenerator } from '@/lib/snowflake';
import { ApiGroupMessageModel } from '@/api/models';

const { contentFields } = GroupMessageConstraints;

export const GroupMessageSchema: Schema<IGroupMessage> = new Schema<IGroupMessage>({
    id: {
        type: String,
        unique: true,
        default: () => SnowflakeGenerator.generate(),
        immutable: true,
        index: true
    },
    groupId: {
        type: String,
        required: true,
        ref: 'Group',
        index: true
    },
    authorId: {
        type: String,
        required: true,
        ref: 'User',
        index: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: contentFields.minLength,
        maxlength: contentFields.maxLength
    },
    replyTo: {
        type: String,
        ref: 'GroupMessage',
        default: undefined
    }
});

GroupMessageSchema.index({ groupId: 1, createdAt: -1 });
GroupMessageSchema.index({ authorId: 1, createdAt: -1 });
GroupMessageSchema.index({ replyTo: 1 });

export const DbGroupMessageModel = model<IGroupMessage>(
    'GroupMessage',
    GroupMessageSchema,
    'groupMessages'
);
