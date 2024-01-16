

export interface User {
    userId : string ;
    fullName :string; 
    userName: string;
    password:string;
    phone:string;
    email:string;
    joinDate:string
    type:User_Types;
    token:string
}

export type User_Types = "admin" | "cashier";

export const User_Types = {
    admin: "admin" as User_Types,
    cashier: "cashier" as User_Types,
};