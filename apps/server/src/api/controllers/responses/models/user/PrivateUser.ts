import { Exclude, Expose, Type } from 'class-transformer';
import { PublicUser } from './PublicUser';

@Exclude()
export class PrivateUser extends PublicUser {
    @Expose()
    email!: string;
}