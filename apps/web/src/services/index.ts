import { RestManager } from '@/lib/rest';
import { GroupService } from './groups';
import { UserService } from './users';
import { AuthService } from './auth';

let authService: AuthService;
let restManager: RestManager;
let userService: UserService;
let groupService: GroupService;

const initializeServices = () => {
    restManager = new RestManager({
        baseURL: import.meta.env.VITE_API_BASE_URL
    });
    
    authService = new AuthService(restManager);
    userService = new UserService(restManager);
    groupService = new GroupService(restManager);
    
    return {
        restManager,
        authService,
        userService,
        groupService
    };
};

export const services = initializeServices();

export { AuthService, UserService };