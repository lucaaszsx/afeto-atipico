import { GroupConstraints } from '@/config/constants';
import { SnowflakeGenerator } from '@/lib/snowflake';
import { IGroup } from '@/types/entities';
import { Schema, model } from 'mongoose';

const { nameFields, descriptionFields, tagsFields } = GroupConstraints;

export const GroupSchema: Schema<IGroup> = new Schema<IGroup>({
    id: {
        type: String,
        unique: true,
        default: () => SnowflakeGenerator.generate(),
        immutable: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        index: true,
        minlength: nameFields.minLength,
        maxlength: nameFields.maxLength,
        match: nameFields.pattern
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: descriptionFields.minLength,
        maxlength: descriptionFields.maxLength
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: function (tags: string[]) {
                return (
                    tags.length <= tagsFields.maxCount &&
                    tags.every(
                        (tag) =>
                            tag.length >= tagsFields.minLength &&
                            tag.length <= tagsFields.maxLength &&
                            tagsFields.pattern.test(tag)
                    )
                );
            },
            message: 'Invalid tags format or count'
        }
    },
    owner: {
        type: String,
        required: true,
        ref: 'User',
        index: true
    },
    members: {
        type: [String],
        default: [],
        ref: 'User'
    }
});

// Clean toObject transform to prevent circular references
GroupSchema.set('toObject', {
    transform: function (doc: any, ret: any, options: any = {}) {
        // Remove Mongoose internal properties
        delete ret._id;
        delete ret.__v;
        
        return ret;
    }
});

GroupSchema.index({ owner: 1, name: 1 });
GroupSchema.index({ members: 1 });
GroupSchema.index({ tags: 1 });

GroupSchema.pre('save', function (next) {
    if (this.isNew && !this.members.includes(this.owner)) this.members.unshift(this.owner);

    next();
});

GroupSchema.pre('validate', function (next) {
    this.tags = this.tags.map((tag) => tag.toLowerCase().trim());
    this.tags = [...new Set(this.tags)];
    next();
});

export const DbGroupModel = model<IGroup>('Group', GroupSchema, 'groups');