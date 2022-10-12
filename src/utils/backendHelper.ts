import axios from 'axios';
import { CertInfo, Participant, RenderProps } from '../interfaces/Project';
import { sleep } from './helpers';

export class GenerateInput {
  renderProps: RenderProps;
  certInfo: CertInfo;
  participant: RenderParticipant;

  constructor({
    renderProps,
    certInfo,
    participant,
  }: {
    renderProps: RenderProps;
    certInfo: CertInfo;
    participant?: RenderParticipant;
  }) {
    this.renderProps = renderProps;
    this.certInfo = certInfo;
    this.participant = participant || {
      name: 'John',
      surname: 'Doe',
      dob: new Date('01/01/1970').toISOString(),
      cert_num: 'CERT123',
    };
  }
}

export interface RenderParticipant {
  name: string;
  surname: string;
  dob: string;
  cert_num: string;
}

interface PendingRender {
  id: string;
  layoutId: number;
  input: GenerateInput;
  time: Date;
}

let pendingRender: PendingRender | undefined = undefined;
let waiting = false;

interface GIProps {
  id: string;
  layoutId: number;
  input: GenerateInput;
}

interface ClaimCertProps {
  claim_code: string;
  address: string;
}

export const generateWithWait = async ({ id, layoutId, input }: GIProps) => {
  //update pending render queue with latest request
  const time = new Date();
  pendingRender = { id, layoutId, input, time };

  // skip if already waiting on a render
  if (waiting) return false;
  console.log('Rendering', pendingRender);

  //otherwise continue and make sure no others will render simulataniously
  waiting = true;

  let wait = true;
  while (wait) {
    const lastTime = pendingRender.time;
    await sleep(3000);
    if (lastTime === pendingRender.time) wait = false;
  }
  waiting = false;

  const result = await generateImage({
    id: pendingRender?.id as string,
    layoutId: pendingRender?.layoutId,
    input: pendingRender?.input as GenerateInput,
  });
  pendingRender = undefined;
  return result;
};

export const generateImage = async ({ id, layoutId, input }: GIProps) => {
  // const url = new URL(`/templates/generate/${id}`, process.env.REACT_APP_BACKEND).toString();
  // const { data } = await axios.post(url, input);
  const previewInput = new GenerateInput({
    renderProps: input.renderProps,
    certInfo: input.certInfo,
  });
  const data: string[] = await generateMultiple({
    id,
    layoutId,
    input: [input, previewInput],
    upload: false,
  });

  return data;
};

interface GMProps {
  id: string;
  layoutId?: number;
  input: GenerateInput[];
  upload?: boolean;
}

export const generateMultiple = async ({ id, layoutId = 1, input, upload = false }: GMProps) => {
  const temp = {
    certData: input,
    upload,
    layoutId,
  };

  const url = new URL(
    `/templates/generateMultiple/${id}`,
    process.env.REACT_APP_BACKEND,
  ).toString();

  const { data } = await axios.post(url, temp);
  return data.data;
};

export const claimCert = async (props: ClaimCertProps) => {
  const url = new URL(`/claim`, process.env.REACT_APP_BACKEND).toString();

  const { data } = await axios.post(url, props);
  return data.data;
};
