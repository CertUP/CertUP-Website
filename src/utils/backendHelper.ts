import axios from 'axios';
import { CertInfo, RenderProps } from '../interfaces/Project';
import { sleep } from './helpers';

export interface GenerateInput {
  renderProps: RenderProps;
  certInfo: CertInfo;
  participant: RenderParticipant;
  // logoData: string;
  // companyName: string;
  // certTitle: string;
  // fullName: string;
  // dob?: string;
  // certNum: string;
  // issueDate?: string;
  // expireDate?: string;
  // signer: string;
  // signerTitle: string;
  // line1: string;
  // line3?: string;
  // templateBg: number;
  // upload?: boolean;
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

export const generateWithWait = async ({ id, layoutId, input }: GIProps) => {
  //update pending render queue with latest request
  const time = new Date();
  pendingRender = { id, layoutId, input, time };

  // skip if already waiting on a render
  if (waiting) return false;
  console.log('Rendering', pendingRender)

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
  console.log('Generating With', input);
  // const url = new URL(`/templates/generate/${id}`, process.env.REACT_APP_BACKEND).toString();
  // const { data } = await axios.post(url, input);
  const data = await generateMultiple({ id, layoutId, input: [input], upload: false });
  return data[0];
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
