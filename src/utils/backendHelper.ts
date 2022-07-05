import axios from 'axios';
import { sleep } from './helpers';

export interface GenerateInput {
  logoData: string;
  companyName: string;
  certType: string;
  fullName: string;
  issueDate: Date;
  expireDate?: Date;
  signer?: string;
}

export const bufferToDataURI = (imageBuffer: ArrayBuffer | undefined, type: string): string => {
  if (!imageBuffer) return '';
  const base64Image = Buffer.from(imageBuffer).toString('base64');
  const dataURI = `data:${type};base64,${base64Image}`;
  return dataURI;
};

interface PendingRender {
  id: string;
  input: GenerateInput;
  time: Date;
}

let pendingRender: PendingRender | undefined = undefined;
let waiting = false;

export const generateWithWait = async (id: string, input: GenerateInput) => {
  const time = new Date();
  pendingRender = { id, input, time };

  if (waiting) return false;
  waiting = true;

  let wait = true;
  while (wait) {
    //pendingRender = { id, input, time };
    const lastTime = pendingRender.time;
    await sleep(3000);
    if (lastTime === pendingRender.time) wait = false;
  }
  waiting = false;

  const result = await generateImage(
    pendingRender?.id as string,
    pendingRender?.input as GenerateInput,
  );
  pendingRender = undefined;
  return result;
};

export const generateImage = async (id: string, input: GenerateInput) => {
  const temp = {
    certName: 'Certificate of Completion',
    fullName: input.fullName,
    issueDate: new Date().toDateString(),
    expireDate: new Date().toDateString(),
    logoData: input.logoData,
    companyName: 'Trivium Node',
  };
  const params = new URLSearchParams();
  params.append('fullName', input.fullName);
  params.append('logoData', input.logoData);

  const url = new URL(`/templates/${id}`, process.env.REACT_APP_BACKEND).toString();

  const { data } = await axios.post(url, input);
  console.log(data);
  return data.data;
};
