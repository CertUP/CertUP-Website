import axios from 'axios';
import { sleep } from './helpers';

export interface GenerateInput {
  logoData: string;
  companyName: string;
  certTitle: string;
  fullName: string;
  dob?: Date;
  certNum: string;
  issueDate: Date;
  expireDate?: Date;
  signer: string;
  signerTitle: string;
  line1: string;
  line3?: string;
  templateBg: number;
}

// export const fileToBase64 = async (input: File): string => {
//   const reader = new FileReader();
//   reader.onload = (base64) => {
//     return base64;
//   };

//   const base64 = await reader.readAsDataURL(input);
// };

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = function () {
      return resolve(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
  });
}

export function dataURLtoFile(dataurl: string, filename2?: string) {
  const filename = 'Previously Uploaded';
  const arr = dataurl.split(',');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
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
  console.log('generating with', input);
  const url = new URL(`/templates/generate/${id}`, process.env.REACT_APP_BACKEND).toString();

  const { data } = await axios.post(url, input);
  console.log(data);
  return data.data;
};

export const generateMultiple = async (id: string, input: GenerateInput[]) => {
  const temp = {
    certData: input,
  };

  const url = new URL(
    `/templates/generateMultiple/${id}`,
    process.env.REACT_APP_BACKEND,
  ).toString();

  const { data } = await axios.post(url, temp);
  console.log(data);
  return data.data;
};
