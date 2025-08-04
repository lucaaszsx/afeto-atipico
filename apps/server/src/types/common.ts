import { ApiSuccessCodes, ApiErrorCodes } from '@/api/responses/ApiCodes';

export interface IBaseEntity {
    id: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IBasePublicEntity extends Pick<IBaseEntity, 'id' | 'createdAt'> {
    createdAt: Date;
}

export type ApiResponse<T = Record<string, unknown>> =
    | {
          readonly success: true;
          readonly statusCode: number;
          readonly apiCode: ApiSuccessCodes;
          readonly data: T;
          readonly error: null;
          readonly path: string;
          readonly timestamp: string;
      }
    | {
          readonly success: false;
          readonly statusCode: number;
          readonly apiCode: ApiErrorCodes;
          readonly data: null;
          readonly error: { readonly message: string };
          readonly path: string;
          readonly timestamp: string;
      };