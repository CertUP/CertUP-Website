import { SecretNetworkClient, Wallet } from 'secretjs';
export interface Item {
  id: string;
  value: string;
}

export type Items = Item[];

export interface ItemContextState {
  Items: Items;
  addItem: (newItem: Item) => void;
  removeItem: (id: string) => void;
  removeAll: () => void;
  updateItem: (id: string, data: Item) => void;
}

export interface WalletContextState {
  Client: SecretNetworkClient | undefined;
  ClientIsSigner: boolean;
  Wallet: Wallet | undefined;
  Address: string;
  updateClient: (client: SecretNetworkClient, wallet: Wallet, address: string) => void;
}
