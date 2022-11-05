import { Extension, Metadata } from 'secretjs/dist/extensions/snip721/types';

export interface CertupMetadata {
  extension: CertupExtension;
}

export interface CertupExtension extends Extension {
  certificate: CertificateInfo;
  certified_individual?: CertifiedIndividual;
  //certified_items: Items[];
  issuing_organizations?: IssuingOrg[];
  issuing_individuals?: IssuingIndividual[];
  additions?: Addition[];
}

export interface CertificateInfo {
  name?: string;
  cert_type?: string;
  issue_date?: string;
  expire_date?: string;
  cert_number: string;
  issuer_id?: string;
}

export interface CertifiedIndividual {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth?: string;
  id?: string;
}

export interface IssuingOrg {
  name: string;
  address?: string;
  url?: string;
}

export interface IssuingIndividual {
  name: string;
  company?: string;
  title?: string;
}

export interface Addition {
  addition_type?: string;
  value?: string;
  details?: string;
  individual?: IssuingIndividual;
  organization?: IssuingOrg;
}
