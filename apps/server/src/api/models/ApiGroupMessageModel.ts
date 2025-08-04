import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { IUser, IGroup, IGroupMessage } from '@/types/entities';
import { ApiGroupModel } from './ApiGroupModel';
import { ApiUserModel } from './ApiUserModel';
import { ApiBaseModel } from './ApiBaseModel';
import { Service } from 'typedi';

@Service()
@Exclude()
export class ApiGroupMessageModel extends ApiBaseModel implements Omit<IGroupMessage, 'author' | 'group'> {
    @Expose()
    @ValidateNested()
    @Type(() => ApiGroupModel)
    group!: IGroup;

    @Expose()
    @ValidateNested()
    @Type(() => ApiUserModel)
    author!: IUser;

    @IsString()
    @Expose()
    content!: string;

    @IsOptional()
    @IsString()
    @Expose()
    replyTo?: string;

    constructor(data: Partial<IGroupMessage & { group: IGroup; author: IUser }> = {}) {
        super(data);
        Object.assign(this, data);
    }
}