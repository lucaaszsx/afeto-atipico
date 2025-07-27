import { GetUserResponse } from './responses/UserResponses';
import {
    JsonController,
    Authorized,
    OnNull,
    Body,
    Delete,
    Post,
    Put,
    Get,
    Req,
    Res
} from 'routing-controllers';
import { createApiResponse, ApiSuccessCodes } from '../responses';
import type { ApiResponse } from '@/types/common';
import type { Request, Response } from 'express';
import { UserService } from '../services';
import { AuthUtils } from '@/lib/auth';
import { Service } from 'typedi';

@Service()
@JsonController('/users')
export default class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/@me')
    @Authorized()
    public async me(@Req() req: Request): Promise<ApiResponse<GetUserResponse | null>> {
        const { userId } = req.user || {};
        let user = null;

        if (userId) user = await this.userService.findOne({ id: userId });

        return createApiResponse<GetUserResponse | null>({
            apiCode: ApiSuccessCodes.OK,
            data: user.toObject({ groups: ['private'] }),
            path: req.path
        });
    }

    // @Put('/:userId')
    // @OnNull(() => new EntityNotFoundException())
    // @ResponseSchema(UpdateUserResponse)
    // public async update() {}

    // @Put('/:userId/password')
    // @OnNull(() => new EntityNotFoundException())
    // @ResponseSchema(UpdateUserPasswordResponse)
    // public async updatePassword() {}

    // @Delete('/:userId')
    // @OnNull(() => new EntityNotFoundException())
    // @ResponseSchema(DeleteUserResponse)
    // public async delete() {}

    // @Put('/:userId/childs/:childId')
    // @ResponseSchema(AddChildResponse)
    // public async addChild() {}

    // @Delete('/:userId/childs/:childId')
    // @ResponseSchema(DeleteChildResponse)
    // public async deleteChild() {}
}
