import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class Group {
    @Expose()
    id!: string;

    @Expose()
    name!: string;

    @Expose()
    description!: string;

    @Expose()
    tags!: string[];

    @Expose()
    owner!: string;

    @Expose()
    members!: string[];

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;
}