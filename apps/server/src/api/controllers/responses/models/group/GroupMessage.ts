import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class GroupMessage {
    @Expose()
    id!: string;

    @Expose()
    groupId!: string;

    @Expose()
    authorId!: string;

    @Expose()
    content!: string;

    @Expose()
    replyTo?: string;

    @Expose()
    createdAt!: string;
}