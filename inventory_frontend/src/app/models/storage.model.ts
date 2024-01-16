

export interface StorageModel {
    storageId : string ;
    storageName :string; 
    type:Storage_Types;
    address:string,
    isDeleted:'0' | '1';
}

export type Storage_Types = "shop" | "inventory";

export const Storage_Types = {
    shop: "admin" as Storage_Types,
    inventory: "cashier" as Storage_Types,
};