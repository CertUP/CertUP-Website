import { GenerateInput, RenderParticipant } from '../utils/backendHelper';
import { Addition, CertupMetadata } from './common/token.interface';

export type DataURI = string;

export interface ProjectProps {
  _id?: string;
  owner?: string;
  project_name?: string;
  lastPreview?: string;
  participants?: Participant[];
  certInfo?: CertInfo;
  renderProps?: RenderProps;
}

export interface RenderProps {
  template: string;
  templateBg: number;
  templateLayout: number;
  certTitle: string;
  line1Text: string;
  line3Text: string;
  displayDob: boolean;
  dateFormat: string;
  displayEmployer: boolean;
  employerText: string;
  companyName: string;
  companyLogoUri?: DataURI; //data URI
  signer: string;
  signerTitle: string;
  signerSignatureUri?: DataURI; //data URI
}

export const defaultRenderProps: RenderProps = {
  template: '2',
  templateBg: 1,
  templateLayout: 2,
  certTitle: '',
  line1Text: '',
  line3Text: '',
  dateFormat: 'en-US',
  displayDob: false,
  displayEmployer: false,
  employerText: '',
  companyName: '',
  signer: '',
  signerTitle: '',
};

interface BaseCertInfo {
  cert_name: string;
  pub_description: string;
  priv_description: string;
  additions: Addition[];
}

export interface CertInfo extends BaseCertInfo {
  issue_date: Date;
  expire_date?: Date;
}

export interface RemoteCertInfo extends BaseCertInfo {
  issue_date: string;
  expire_date?: string;
}

export const defaultCertInfo: CertInfo = {
  cert_name: '',
  pub_description: '',
  priv_description: '',
  issue_date: new Date(),
  additions: [],
};

export interface MintedProject {
  id: string;
  num_minted?: string;
  num_pending?: string;
  project_contents: PreloadedToken[];
}

export interface PreloadedToken {
  preload_data: ManagerPendingToken;
  claim_code: string;
  minted: boolean;
}

export interface ManagerPendingToken {
  name: string;
  date: string;
  cert_type: string;
  pub_metadata?: CertupMetadata;
  priv_metadata?: CertupMetadata;

  cert_num: string;

  issuer_addr: string;
  issuer_name?: string;
}

export default class Project {
  _id?: string;
  owner: string;
  project_name: string;
  lastPreview?: string;
  // template: string;
  // template_bg: number;
  // template_layout?: number;
  // cert_title: string;
  // cert_name: string;
  // pub_description: string;
  // priv_description: string;
  // line1Text: string;
  // line3Text: string;
  // issue_date?: Date;
  // expire_date?: Date;
  // company_name: string;
  // company_logo_file?: File;
  // company_logo_uri?: string;
  // signer: string;
  // signer_title: string;
  participants: Participant[];
  certInfo: CertInfo;
  renderProps: RenderProps;
  //getGenerateList: () => void;
  constructor(props?: ProjectProps) {
    this._id = props?._id;
    this.owner = props?.owner || '';
    this.project_name = props?.project_name || '';
    this.lastPreview = props?.lastPreview;
    this.participants = props?.participants || [];
    this.certInfo = props?.certInfo || defaultCertInfo;
    this.renderProps = props?.renderProps || defaultRenderProps;
    // this.pub_description = props?.pub_description || '';
    // this.priv_description = props?.priv_description || '';
    // this.template = props?.template || '1';
    // this.template_bg = props?.template_bg || 1;
    // this.template_layout = props?.template_bg || 1;
    // this.issue_date = props?.issue_date;
    // this.expire_date = props?.expire_date;
    // this.signer = props?.signer || '';
    // this.signer_title = props?.signer_title || '';
    // this.participants = props?.participants || [new Participant(), new Participant()];
    // this.expire_date = props?.expire_date;

    // this.cert_title = props?.cert_title || '';
    // this.cert_name = props?.cert_name || '';
    // this.line1Text = props?.line1Text || '';
    // this.line3Text = props?.line3Text || '';
    // this.company_name = props?.company_name || '';
    // this.company_logo_file = props?.company_logo_file;
    // this.company_logo_uri = props?.company_logo_uri;
  }
}

// export interface RemoteProject extends Project {
//   company_logo?: string;
// }

export class Participant {
  name: string;
  surname: string;
  dob?: Date;
  cert_num: string;
  claim_code?: string;
  claimed?: boolean;

  constructor(
    name?: string,
    surname?: string,
    dob?: Date,
    certNum?: string,
    claimCode?: string,
    claimed?: boolean,
  ) {
    this.name = name || '';
    this.surname = surname || '';
    this.dob = dob;
    this.cert_num = certNum || '';
    this.claim_code = claimCode;
    this.claimed = claimed;
  }
}

export const participantToRender = (participant?: Participant): RenderParticipant => {
  if (!participant) participant = new Participant('John', 'Doe', new Date('1/1/1970'), 'CERT123');
  return {
    ...participant,
    dob: participant.dob ? participant.dob.toLocaleDateString() : '',
  };
};

export const ProjectToCertList = (project: Project): GenerateInput[] => {
  const generateList: GenerateInput[] = [];
  for (let i = 0; i < project.participants?.length; i++) {
    const participant = project.participants[i];
    const input: GenerateInput = {
      // logoData: project.renderProps.company_logo_uri as string,
      // fullName: `${participant.name} ${participant.surname}`,
      // dob: participant.dob ? participant.dob.toDateString() : 'XX-XX-XXXX',
      // certNum: participant?.cert_num as string,
      // companyName: project.renderProps.company_name as string,
      // issueDate: project.certInfo.issue_date ? project.certInfo.issue_date.toDateString() : undefined,
      // expireDate: project.certInfo.expire_date ? project.certInfo.expire_date.toDateString() : undefined,
      // certTitle: project.renderProps.cert_title as string,
      // signer: project.renderProps.signer as string,
      // signerTitle: project.renderProps.signerTitle as string,
      // line1: project.renderProps.line1Text as string,
      // line3: project.renderProps.line3Text,
      // templateBg: project.renderProps.templateBg,
      renderProps: project.renderProps,
      certInfo: project.certInfo,
      participant: participantToRender(participant),
    };
    generateList.push(input);
  }
  return generateList;
};
