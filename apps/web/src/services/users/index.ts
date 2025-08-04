import {
    IUpdateProfileRequestDTO,
    IAddChildRequestDTO
} from './types/dtos/requests/UserRequests';
import {
    IGetUserResponseDTO,
    IUpdateProfileResponseDTO
} from './types/dtos/responses/UserResponses';
import { RestManager, ApiRoutes } from '@/lib/rest';
import { BaseService } from '../base';

export class UserService extends BaseService {
    constructor(restManager: RestManager) {
        super(restManager);
    }
    
    // User methods
    public async getCurrentUser() {
        const { authProvider } = this.restManager;
        const result = await this.get<IGetUserResponseDTO>(
            ApiRoutes.user(),
            undefined,
            'getCurrentUser'
        );
        
        if (authProvider && result.data) authProvider.setCurrentUser(result.data);
        
        return result;
    }

    public async updateProfile(data: IUpdateProfileRequestDTO) {
        const result = await this.put<IUpdateProfileResponseDTO>(
            ApiRoutes.user(),
            data,
            undefined,
            'updateProfile'
        );
        
        const { authProvider } = this.restManager;
        if (authProvider && result.data) authProvider.setCurrentUser(result.data);
        
        return result;
    }

    public async addChild(data: IAddChildRequestDTO) {
        const result = await this.post<IUpdateProfileResponseDTO>(
            ApiRoutes.userChildren(),
            data,
            undefined,
            'addChild'
        );
        
        const { authProvider } = this.restManager;
        if (authProvider && result.data) authProvider.setCurrentUser(result.data);
        
        return result;
    }

    public async removeChild(childId: string) {
        const result = await this.delete<IUpdateProfileResponseDTO>(
            ApiRoutes.userChildren(childId),
            undefined,
            undefined,
            'removeChild'
        );
        
        const { authProvider } = this.restManager;
        if (authProvider && result.data) authProvider.setCurrentUser(result.data);
        
        return result;
    }

    public async deleteAccount() {
        return this.delete<void>(
            ApiRoutes.user(),
            undefined,
            undefined,
            'deleteAccount'
        );
    }
    
    // Specific methods to check loading for specific operations
    public get isGettingCurrentUser(): boolean {
        return this.isOperationLoading('getCurrentUser');
    }

    public get isUpdatingProfile(): boolean {
        return this.isOperationLoading('updateProfile');
    }

    public get isAddingChild(): boolean {
        return this.isOperationLoading('addChild');
    }

    public get isRemovingChild(): boolean {
        return this.isOperationLoading('removeChild');
    }

    public get isDeletingAccount(): boolean {
        return this.isOperationLoading('deleteAccount');
    }
}