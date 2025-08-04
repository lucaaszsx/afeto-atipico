import { IGroupMessage } from '@/types/entities';
import { Schema, model } from 'mongoose';
import { GroupMessageConstraints } from '@/config/constants';
import { SnowflakeGenerator } from '@/lib/snowflake';

const { contentFields } = GroupMessageConstraints;

export const GroupMessageSchema: Schema<IGroupMessage> = new Schema<IGroupMessage>(
    {
        id: {
            type: String,
            unique: true,
            default: () => SnowflakeGenerator.generate(),
            immutable: true,
            index: true
        },
        group: {
            type: String,
            required: true,
            ref: 'Group',
            index: true
        },
        author: {
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
    },
    {
        timestamps: true
    }
);

// Clean toObject transform to prevent circular references
GroupMessageSchema.set('toObject', {
    transform: function (doc: any, ret: any, options: any = {}) {
        // Remove Mongoose internal properties
        delete ret._id;
        delete ret.__v;
        
        return ret;
    }
});

GroupMessageSchema.index({ group: 1, createdAt: -1 });
GroupMessageSchema.index({ author: 1, createdAt: -1 });
GroupMessageSchema.index({ replyTo: 1 });

export const DbGroupMessageModel = model<IGroupMessage>(
    'GroupMessage',
    GroupMessageSchema,
    'groupMessages'
);