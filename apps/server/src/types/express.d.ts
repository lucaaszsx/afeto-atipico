import { TokenPayload } from '@/lib/auth';

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}
