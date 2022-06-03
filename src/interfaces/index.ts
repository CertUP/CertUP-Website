import { SecretNetworkClient, Wallet } from 'secretjs';
import { classicNameResolver } from 'typescript';
import { LoginToken } from '../utils/loginPermit';

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
  LoginToken: LoginToken | undefined;
  updateClient: (
    client: SecretNetworkClient,
    wallet: Wallet,
    address: string,
    token: LoginToken,
  ) => void;
}

// export interface Project {
//   _id?: string;
//   owner: string;
//   project_name: string;
//   pub_description: string;
//   priv_description: string;
//   template: number;
//   // issue_d: number;
//   // issue_m: number;
//   // issue_y: number;
//   issue_date: Date | undefined;
//   issuer: string;
//   participants: Participant[];
// }

export class Project {
  _id?: string;
  owner: string;
  project_name: string;
  pub_description: string;
  priv_description: string;
  template: number;
  // issue_d: number;
  // issue_m: number;
  // issue_y: number;
  issue_date: Date | undefined;
  issuer: string;
  participants: Participant[];

  constructor(
    owner?: string,
    project_name?: string,
    pub_description?: string,
    priv_description?: string,
    template?: number,
    issue_date?: Date,
    issuer?: string,
    participants?: Participant[],
  ) {
    this.owner = owner || '';
    this.project_name = project_name || '';
    this.pub_description = pub_description || '';
    this.priv_description = priv_description || '';
    this.template = template || 0;
    this.issue_date = issue_date;
    this.issuer = issuer || '';
    this.participants = participants || [new Participant(), new Participant()];
  }
}

export class Participant {
  name: string;
  surname: string;
  // dob_d: number;
  // dob_m: number;
  // dob_y: number;
  dob: Date | undefined;
  cert_num: string;

  constructor(name?: string, surname?: string, dob?: Date, certNum?: string) {
    this.name = name || '';
    this.surname = surname || '';
    this.dob = dob;
    this.cert_num = certNum || '';
  }
}
