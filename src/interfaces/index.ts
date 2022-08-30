import { ArrayLog, JsonLog, SecretNetworkClient, TxContent, TxResultCode, Wallet } from 'secretjs';
import { Extension, Metadata } from 'secretjs/dist/extensions/snip721/types';
import { Tx } from 'secretjs';
import { classicNameResolver } from 'typescript';
import { LoginToken } from '../utils/loginPermit';
import { CertupExtension, CertupMetadata } from './token';

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

export interface IssuerData {
  id: string;
  name?: string;
  website?: string;
  logo_img_url?: string;
  verified: boolean;
  verified_name?: string;
  certs_issued: string;
  certs_remaining: string;
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
  private_metadata_is_public: boolean;
  public_metadata: CertupMetadata;
  token_approvals: any[];
  token_code_approvals: any[];
}

export interface PreLoad {
  name: string;
  date: string;
  cert_type: string;
  pub_metadata: CertupMetadata;
  priv_metadata: CertupMetadata;
}

export interface PendingToken extends PreLoad {
  cert_num: string;
  issuer_id: string;
  issuer_name?: string;
}

export interface RemainingCertsResponse extends QueryResponse {
  remaining_certs?: {
    certs: string;
  };
}

export interface IssuerDataResponse extends QueryResponse {
  issuer_data: IssuerData;
}

export interface ProjectDataResponse extends QueryResponse {
  project_contents: {
    data_list: ProjectToken[];
  };
}

export interface ProjectToken {
  preload_data: PendingToken;
  claim_code: string;
  minted: boolean;
}

export interface QueryResponse {
  parse_err?: ErrorResponse;
  generic_err?: ErrorResponse;
}

export interface ListProjectsResponse extends QueryResponse {
  list_projects?: LPSub;
}

interface LPSub {
  data_list: ExportProject[];
}

export interface ExportProject {
  /// Unique ID of the project
  project_id: string;
  project: ProjectOverview;
}

interface ProjectOverview {
  pending_certs: string;
  minted_certs: string;
}

interface ErrorResponse {
  msg: string;
}

export enum ComputeResultCode {
  // ErrInstantiateFailed error for rust instantiate contract failure
  ErrInstantiateFailed = 2, // "instantiate contract failed")

  // ErrExecuteFailed error for rust execution contract failure
  ErrExecuteFailed = 3, // "execute contract failed")

  // ErrQueryFailed error for rust smart query contract failure
  ErrQueryFailed = 4, // "query contract failed")

  // ErrMigrationFailed error for rust execution contract failure
  ErrMigrationFailed = 5, // "migrate contract failed")

  // ErrAccountExists error for a contract account that already exists
  ErrAccountExists = 6, // "contract account already exists")

  // ErrGasLimit error for out of gas
  ErrGasLimit = 7, // "insufficient gas")

  // ErrInvalidGenesis error for invalid genesis file syntax
  ErrInvalidGenesis = 8, // "invalid genesis")

  // ErrNotFound error for an entry not found in the store
  ErrNotFound = 9, // "not found")

  // ErrInvalidMsg error when we cannot process the error returned from the contract
  ErrInvalidMsg = 10, // "invalid CosmosMsg from the contract")

  // ErrEmpty error for empty content
  ErrEmpty = 11, // "empty")

  // ErrLimit error for content that exceeds a limit
  ErrLimit = 12, // "exceeds limit")

  // ErrInvalid error for content that is invalid in this context
  ErrInvalid = 13, // "invalid")

  // ErrDuplicate error for content that exsists
  ErrDuplicate = 14, // "duplicate")

  // ErrCreateFailed error for wasm code that has already been uploaded or failed
  ErrCreateFailed = 15, // "create contract failed")

  // ErrSigFailed error for wasm code that has already been uploaded or failed
  ErrSigFailed = 16, // "parse signature failed")
  /** Success is returned if the transaction executed successfuly */
  Success = 0,
}

export type ComputeTx = {
  readonly height: number;
  /** Transaction hash (might be used as transaction ID). Guaranteed to be non-empty upper-case hex */
  readonly transactionHash: string;
  /** Transaction execution error code. 0 on success. See {@link TxResultCode}. */
  readonly code: TxResultCode | ComputeResultCode;
  // /** Transaction execution error codespace. Empty or compute */
  // readonly codespace: string;
  /**
   * If code != 0, rawLog contains the error.
   *
   * If code = 0 you'll probably want to use `jsonLog` or `arrayLog`. Values are not decrypted.
   */
  readonly rawLog: string;
  /** If code = 0, `jsonLog = JSON.parse(rawLow)`. Values are decrypted if possible. */
  readonly jsonLog?: any;
  /** If code = 0, `arrayLog` is a flattened `jsonLog`. Values are decrypted if possible. */
  readonly arrayLog?: ArrayLog;
  /** Return value (if there's any) for each input message */
  readonly data: Array<Uint8Array>;
  /**
   * Decoded transaction input.
   */
  readonly tx: TxContent;
  /**
   * Raw transaction bytes stored in Tendermint.
   *
   * If you hash this, you get the transaction hash (= transaction ID):
   *
   * ```js
   * import { sha256 } from "@noble/hashes/sha256";
   * import { toHex } from "@cosmjs/encoding";
   *
   * const transactionHash = toHex(sha256(indexTx.tx)).toUpperCase();
   * ```
   */
  readonly txBytes: Uint8Array;
  readonly gasUsed: number;
  readonly gasWanted: number;
};
