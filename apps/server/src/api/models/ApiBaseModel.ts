import { ClassTransformOptions, instanceToPlain, Exclude, Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { hydrateEntity } from '../utils/hydration';
import { IBaseEntity } from '@/types/common';

@Exclude()
export abstract class ApiBaseModel implements IBaseEntity {
    @Expose()
    @IsString()
    @IsNotEmpty()
    public id: string;

    @Expose()
    @Type(() => Date)
    public createdAt: Date;

    @Expose()
    @Type(() => Date)
    public updatedAt: Date;

    constructor(data?: IBaseEntity) {
        this.createdAt = new Date();
        this.updatedAt = new Date();

        hydrateEntity(this, data);
    }

    public transform(options?: ClassTransformOptions): Record<string, any> | any[] {
        return instanceToPlain(this, options);
    }
}
