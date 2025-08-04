export interface IUpdateProfileRequestDTO {
    username?: string;
    displayName?: string;
    bio?: string;
}

export interface IAddChildRequestDTO {
    name: string;
    age: number;
    notes?: string;
}