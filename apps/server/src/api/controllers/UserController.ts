import {
    UpdateProfileRequest,
    AddChildRequest
} from './requests/UserRequests';
import {
    GetUserResponse,
    UpdateProfileResponse,
    AddChildResponse,
    RemoveChildResponse
} from './responses/UserResponses';
import {
    JsonController,
    Authorized,
    Body,
    Delete,
    Post,
    Put,
    Get,
    Req,
    Param
} from 'routing-controllers';
import { createApiResponse, ApiSuccessCodes } from '../responses';
import type { ApiResponse } from '@/types/common';
import type { Request } from 'express';
import { RequiredUser } from '@/decorators';
import { UserService } from '../services';
import { IUser } from '@/types/entities';
import { Service } from 'typedi';

@Service()
@JsonController('/users')
export default class UserController {
    constructor(private readonly userService: UserService) {}

    // Helper method to safely serialize user data
    private serializeUser(user: IUser): any {
        return {
            id: user.id,
            username: user.username,
            email: user.email || '',
            displayName: user.displayName,
            avatarUrl: user.avatarUrl || '',
            bio: user.bio || '',
            status: user.status,
            isVerified: user.isVerified || false,
            children: (user.children || []).map(child => ({
                id: child.id,
                name: child.name,
                age: child.age,
                notes: child.notes || ''
            })),
            createdAt: user.createdAt || new Date(),
            updatedAt: user.updatedAt || new Date()
        };
    }

    @Get('/@me')
    @Authorized()
    public async me(
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<GetUserResponse>> {
        return createApiResponse<GetUserResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: this.serializeUser(user),
            path: req.path
        });
    }

    @Put('/@me')
    @Authorized()
    public async updateProfile(
        @Body() body: UpdateProfileRequest,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<UpdateProfileResponse>> {
        const updateData: any = {};
        
        if (body.username !== undefined) updateData.username = body.username;
        if (body.displayName !== undefined) updateData.displayName = body.displayName;
        if (body.bio !== undefined) updateData.bio = body.bio;

        const updatedUser = await this.userService.update(
            { id: user.id },
            updateData
        );

        return createApiResponse<UpdateProfileResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: this.serializeUser(updatedUser),
            path: req.path
        });
    }

    @Post('/@me/children')
    @Authorized()
    public async addChild(
        @Body() body: AddChildRequest,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<AddChildResponse>> {
        const updatedUser = await this.userService.addChild(user.id, {
            name: body.name,
            age: body.age,
            notes: body.notes
        });

        return createApiResponse<AddChildResponse>({
            apiCode: ApiSuccessCodes.CREATED,
            data: this.serializeUser(updatedUser),
            path: req.path
        });
    }

    @Delete('/@me/children/:childId')
    @Authorized()
    public async removeChild(
        @Param('childId') childId: string,
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<RemoveChildResponse>> {
        const updatedUser = await this.userService.removeChild(user.id, childId);

        return createApiResponse<RemoveChildResponse>({
            apiCode: ApiSuccessCodes.OK,
            data: this.serializeUser(updatedUser),
            path: req.path
        });
    }

    @Delete('/@me')
    @Authorized()
    public async deleteAccount(
        @Req() req: Request,
        @RequiredUser() user: IUser
    ): Promise<ApiResponse<null>> {
        await this.userService.delete(user.id);

        return createApiResponse<null>({
            apiCode: ApiSuccessCodes.NO_CONTENT,
            path: req.path
        });
    }
}