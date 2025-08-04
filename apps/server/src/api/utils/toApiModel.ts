import { ClassTransformOptions } from 'class-transformer';
import { ApiBaseModel } from '../models';

export function toApiModel<T extends ApiBaseModel>(
    cls: new (data: Record<string, any>) => T,
    plain: Record<string, any> | Record<string, any>[],
    options: ClassTransformOptions = {}
): Record<string, any> | Record<string, any>[] | null {
    if (!plain) return null;
    if (Array.isArray(plain)) return plain.map(item => new cls(item).transform(options));

    return new cls(plain).transform(options);
}