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
