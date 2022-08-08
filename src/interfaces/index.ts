import { SecretNetworkClient, Wallet } from 'secretjs';
import { Extension, Metadata } from 'secretjs/dist/extensions/snip721/types';
import { classicNameResolver } from 'typescript';
import { LoginToken } from '../utils/loginPermit';

export * as Project from './Project';

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

export interface PreloadData {
  name: string;
  date: string;
  cert_type: string;
  pub_metadata: any;
  priv_metadata: any;
}

export interface WalletContextState {
  Client: SecretNetworkClient | undefined;
  Querier: SecretNetworkClient | undefined;
  ClientIsSigner: boolean;
  Wallet: Wallet | undefined;
  Address: string;
  LoginToken: LoginToken | undefined;
  QueryPermit: PermitSignature | undefined;
  RemainingCerts: number;
  ProcessingTx: boolean;
  updateClient: (
    client: SecretNetworkClient,
    wallet: Wallet,
    address: string,
    token: LoginToken,
    permit: PermitSignature,
  ) => void;
  setProcessingTx: (newState: boolean) => void;
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
//   issue_date?: Date;
//   issuer: string;
//   participants: Participant[];
// }

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

export interface TendermintPubKey {
  type: string;
  value: string;
}

export interface PermitSignature {
  pub_key: TendermintPubKey;
  signature: string;
}

export interface DossierResponse {
  nft_dossier: NftDossier;
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
  private_metadata: CertupMetadata;
  public_metadata: CertupMetadata;
}

export interface CertupExtension extends Extension {
  certificate: CertMetadata;
}

export interface CertMetadata {
  name: string;
  cert_type: string | null;
  issue_date: string;
  expire_date: string | null;
  cert_number: string;
}

export interface CertupMetadata extends Metadata {
  extension: CertupExtension;
}

export interface RemainingCertsResponse {
  remaining_certs?: {
    certs: string;
  };
  parse_error?: object;
  generic_error?: object;
}
