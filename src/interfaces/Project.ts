import { GenerateInput } from '../utils/backendHelper';

export interface ProjectProps {
  _id?: string;
  owner?: string;
  project_name?: string;
  template?: string;
  template_bg?: number;
  template_layout?: number;
  cert_title?: string;
  cert_name?: string;
  pub_description?: string;
  priv_description?: string;
  line1Text?: string;
  line3Text?: string;
  issue_date?: Date;
  expire_date?: Date;
  company_name?: string;
  company_logo_file?: File;
  company_logo_uri?: string;
  signer?: string;
  signer_title?: string;
  participants?: Participant[];
}

export default class Project {
  _id?: string;
  owner: string;
  project_name: string;
  template: string;
  template_bg: number;
  template_layout?: number;
  cert_title: string;
  cert_name: string;
  pub_description: string;
  priv_description: string;
  line1Text: string;
  line3Text: string;
  issue_date?: Date;
  expire_date?: Date;
  company_name: string;
  company_logo_file?: File;
  company_logo_uri?: string;
  signer: string;
  signer_title: string;
  participants: Participant[];
  //getGenerateList: () => void;
  constructor(props?: ProjectProps) {
    this._id = props?._id;
    this.owner = props?.owner || '';
    this.project_name = props?.project_name || '';
    this.pub_description = props?.pub_description || '';
    this.priv_description = props?.priv_description || '';
    this.template = props?.template || '1';
    this.template_bg = props?.template_bg || 1;
    this.template_layout = props?.template_bg || 1;
    this.issue_date = props?.issue_date;
    this.expire_date = props?.expire_date;
    this.signer = props?.signer || '';
    this.signer_title = props?.signer_title || '';
    this.participants = props?.participants || [new Participant(), new Participant()];
    this.expire_date = props?.expire_date;

    this.cert_title = props?.cert_title || '';
    this.cert_name = props?.cert_name || '';
    this.line1Text = props?.line1Text || '';
    this.line3Text = props?.line3Text || '';
    this.company_name = props?.company_name || '';
    this.company_logo_file = props?.company_logo_file;
    this.company_logo_uri = props?.company_logo_uri;
  }
}

export interface RemoteProject extends Project {
  company_logo?: string;
}

export class Participant {
  name: string;
  surname: string;
  // dob_d: number;
  // dob_m: number;
  // dob_y: number;
  dob?: Date;
  cert_num: string;
  claim_code?: string;

  constructor(name?: string, surname?: string, dob?: Date, certNum?: string, claimCode?: string) {
    this.name = name || '';
    this.surname = surname || '';
    this.dob = dob;
    this.cert_num = certNum || '';
    this.claim_code = claimCode;
  }
}

export const ProjectToCertList = (project: Project): GenerateInput[] => {
  const generateList: GenerateInput[] = [];
  for (let i = 0; i < project.participants?.length; i++) {
    const participant = project.participants[i];
    const input: GenerateInput = {
      logoData: project.company_logo_uri as string,
      fullName: `${participant.name} ${participant.surname}`,
      dob: participant.dob ? participant.dob.toDateString() : 'XX-XX-XXXX',
      certNum: participant?.cert_num as string,
      companyName: project.company_name as string,
      issueDate: project.issue_date ? project.issue_date.toDateString() : undefined,
      expireDate: project.expire_date ? project.expire_date.toDateString() : undefined,
      certTitle: project.cert_title as string,
      signer: project.signer as string,
      signerTitle: project.signer_title as string,
      line1: project.line1Text as string,
      line3: project.line3Text,
      templateBg: (project.template_bg as number) + 1,
    };
    generateList.push(input);
  }
  return generateList;
};
