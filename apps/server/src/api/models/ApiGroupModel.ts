import { ValidateNested, IsOptional, IsString, IsArray, IsDate } from 'class-validator';
import { Transform, Exclude, Expose } from 'class-transformer';
import { ApiBaseModel } from './ApiBaseModel';
import { IGroup } from '@/types/entities';
import { Service } from 'typedi';

@Service()
@Exclude()
export class ApiGroupModel extends ApiBaseModel implements IGroup {
    @IsString()
    @Expose()
    name: string;

    @IsString()
    @Expose()
    description: string;

    @IsArray()
    @IsString({ each: true })
    @Expose()
    tags: string[];

    @IsString()
    @Expose()
    owner: string;

    @IsArray()
    @IsString({ each: true })
    @Expose()
    members: string[];

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : new Date()))
    @Expose()
    createdAt: Date;

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : new Date()))
    @Expose()
    updatedAt: Date;

    constructor(data: IGroup = {} as IGroup) {
        super(data);
    }
}
