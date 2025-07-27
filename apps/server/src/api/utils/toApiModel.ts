import { ClassTransformOptions } from 'class-transformer';
import { ApiBaseModel } from '../models';

export function toApiModel<T extends ApiBaseModel>(
    cls: new (data: Record<string, any>) => T,
    plain: Record<string, any>,
    options: ClassTransformOptions = {}
): Record<string, any> | any[] {
    return new cls(plain).transform(options);
}
