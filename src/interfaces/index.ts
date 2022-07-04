import { SecretNetworkClient, Wallet } from 'secretjs';
import { Metadata } from 'secretjs/dist/extensions/snip721/types';
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
  QueryPermit: PermitSignature | undefined;
  RemainingCerts: number;
  Keplr: boolean;
  updateClient: (
    client: SecretNetworkClient,
    wallet: Wallet,
    address: string,
    token: LoginToken,
    permit: PermitSignature,
    keplr: boolean,
  ) => void;
  queryCredits: () => void;
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

interface PermitParams {
  permit_name: string;
  allowed_tokens: string[];
  chain_id: string;
  permissions: string[];
}

interface Permit {
  params: PermitParams;
  signature: PermitSignature;
}

export class Participant {
  name: string;
  surname: string;
  // dob_d: number;
  // dob_m: number;
  // dob_y: number;
  dob: Date | undefined;
  cert_num: string;
  claim_code: string | undefined;

  constructor(name?: string, surname?: string, dob?: Date, certNum?: string, claimCode?: string) {
    this.name = name || '';
    this.surname = surname || '';
    this.dob = dob;
    this.cert_num = certNum || '';
    this.claim_code = claimCode;
  }
}

export interface TendermintPubKey {
  type: string;
  value: string;
}

export interface PermitSignature {
  pub_key: TendermintPubKey;
  signature: string;
}

export interface BatchDossierResponse {
  batch_nft_dossier: _BatchDossiers;
}

export interface _BatchDossiers {
  nft_dossiers: NftDossier[];
}

export interface NftDossier {
  token_id: string;
  display_private_metadata_error: string | null;
  owner: string | null;
  private_metadata: Metadata;
  public_metadata: Metadata;
}
