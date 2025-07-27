import { IsOptional, IsString, IsDate } from 'class-validator';
import { Transform, Exclude, Expose } from 'class-transformer';
import { IGroupMessage } from '@/types/entities';
import { ApiBaseModel } from './ApiBaseModel';
import { Service } from 'typedi';

@Service()
@Exclude()
export class ApiGroupMessageModel extends ApiBaseModel implements IGroupMessage {
    @IsString()
    @Expose()
    groupId: string;

    @IsString()
    @Expose()
    authorId: string;

    @IsString()
    @Expose()
    content: string;

    @IsOptional()
    @IsString()
    @Expose()
    replyTo?: string;

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : new Date()))
    @Expose()
    createdAt: Date;

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : new Date()))
    @Expose()
    updatedAt: Date;

    constructor(data: IGroupMessage = {} as IGroupMessage) {
        super(data);
    }
}
