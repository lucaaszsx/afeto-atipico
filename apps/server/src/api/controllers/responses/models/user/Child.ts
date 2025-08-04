/**
 * @file Child.ts
 * @description Response model for child information (used inside user models)
 * @author Lucas
 * @license MIT
 */

import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class Child {
    @Expose()
    id!: string;

    @Expose()
    name!: string;

    @Expose()
    age!: number;

    @Expose()
    notes?: string;
}