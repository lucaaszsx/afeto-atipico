import { Exclude, Expose, Type } from 'class-transformer';
import { UserStatus } from '@/types/enums';
import { Child } from './Child';

@Exclude()
export class PublicUser {
    @Expose()
    id!: string;
    
    @Expose()
    username!: string;

    @Expose()
    displayName!: string;

    @Expose()
    bio?: string;

    @Expose()
    avatarUrl?: string;

    @Expose()
    status!: UserStatus;

    @Expose()
    isVerified!: boolean;

    @Expose()
    @Type(() => Child)
    children!: Child[];

    @Expose()
    createdAt!: Date;
    
    @Expose()
    updatedAt!: Date;
}