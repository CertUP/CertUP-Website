export interface Template {
  id: string;
  name: string;
  enabled: boolean;
  restricted: boolean;
  allowed_issuers?: string[];
  value: string;
  backgrounds?: TemplateBackground[];
  layouts?: TemplateLayout[];
  features: TemplateFeatures;
}

export interface TemplateFeatures {
  company_name: boolean;
  logo: boolean;
  instructors: boolean;
  dob: boolean;
  expiration: boolean;
  line2: boolean;
  signer: boolean;
  signer_title: boolean;
}

interface TemplateBackground {
  id: number;
  value: string;
}

interface TemplateLayout {
  id: number;
  name: string;
  value: string;
}

export interface UploadResponse {
  hash: string;
  key: string;
}
