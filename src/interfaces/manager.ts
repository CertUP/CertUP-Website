import { QueryResponse } from '.';
import { CertupMetadata } from './token';

export interface NewIssuer {
  /// Name of the organization
  name?: string;
  /// Website URL of the organization
  website?: string;
  /// URL of the issuer's logo
  logo_img_url?: string;
}

export interface Issuer extends NewIssuer {
  /// ID of Issuer
  id: string;
  /// If the issuer has been verified by CertUP
  verified: boolean;
  /// Name of the organization verified by CertUP
  verified_name?: string;
  /// # of cert unique to this organization. Starts at 0 and iterates
  cert_num: string;
  /// # of remaining certs the issuer has purchased
  remaining_certs: string;
  migrated: boolean;
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
  issuer_data: {
    issuer: Issuer;
  };
}

export interface GetIssuerResponse extends QueryResponse {
  get_issuer: PubIssuerData;
}

export interface CertPriceResponse extends QueryResponse {
  display_cost: {
    cost_data: Payment;
  };
}

interface Payment {
  contract: {
    /// contract's code hash string
    code_hash: string;
    /// contract's address
    address: string;
  };
  amount: string;
}

export interface PubIssuerData {
  id: string;
  name?: string;
  website?: string;
  logo_img_url?: string;
  verified: boolean;
  verified_name?: string;
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

export interface ListProjectsResponse extends QueryResponse {
  list_projects?: {
    data_list: ExportProject[];
  };
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

export interface MintOverview {
  minted_certs: string;
  pending_certs: string;
}
