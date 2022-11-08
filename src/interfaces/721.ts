import { CertupMetadata } from './common/token.interface';

export interface DossierResponse {
  nft_dossier: NftDossier;
}

export interface BatchDossierResponse {
  batch_nft_dossier: _BatchDossiers;
}

export interface _BatchDossiers {
  nft_dossiers: BatchNftDossier[];
}

export interface NftDossier {
  display_private_metadata_error: string | null;
  owner: string | null;
  private_metadata: CertupMetadata;
  private_metadata_is_public: boolean;
  public_metadata: CertupMetadata;
  token_approvals: any[];
  token_code_approvals: any[];
}

export interface BatchNftDossier extends NftDossier {
  token_id: string;
}

export interface TokenApprovalsResponse {
  token_approvals: TokenApprovals;
}

export interface TokenApprovals {
  owner_is_public: boolean;
  public_ownership_expiration: Snip721Expiration;
  private_metadata_is_public: boolean;
  private_metadata_is_public_expiration: Snip721Expiration;
  token_approvals: Snip721Approval[];
}

export interface Snip721Approval {
  address: string;
  view_owner_expiration: Snip721Expiration;
  view_private_metadata_expiration: Snip721Expiration;
  transfer_expiration: Snip721Expiration;
}

export enum Snip721Expiration {
  'never',
  TimeExpiration,
  HeightExpiration,
}

export interface TimeExpiration {
  at_time: number;
}

export interface HeightExpiration {
  at_height: number;
}
