// export const fileToBase64 = async (input: File): string => {
//   const reader = new FileReader();
//   reader.onload = (base64) => {
//     return base64;
//   };
//   const base64 = await reader.readAsDataURL(input);
// };

// function fileToBase64(file: File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const fileReader = new FileReader();
//     fileReader.onload = function () {
//       return resolve(fileReader.result as string);
//     };
//     fileReader.readAsDataURL(file);
//   });
// }

import axios from 'axios';
import { createDecipheriv } from 'browser-crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

const ipfsMirrors = [
  'ipfs.trivium.network',
  'infura-ipfs.io',
  'dweb.link',
  'ipfs.fleek.co',
  'cloudflare-ipfs.com',
  'gateway.pinata.cloud',
  'cf-ipfs.com',
  'ipfs.io',
  'gateway.ipfs.io',
  'nftstorage.link',
  'storry.tv',
];

export const ipfsDownload = async (url: string) => {
  if (!url.includes('ipfs.io')) return await download(url);
  let final;

  for (let i = 0; i < ipfsMirrors.length; i++) {
    const mirror = ipfsMirrors[i];
    console.log('trying ', mirror);
    const newUrl = url.replace('ipfs.io', mirror);
    try {
      const response = await download(newUrl, 8000);
      console.log(response);
      if (response.data) {
        final = response.data;
        break;
      }
    } catch (error: any) {
      null; //just continue
    }
  }

  if (final) return final;
  else throw new Error('Unable to download file from IPFS.');
};

export const ipfsDownloadSimul = async (url: string) => {
  if (!url.includes('ipfs.io')) return await download(url);

  const promises = [];
  for (let i = 0; i < ipfsMirrors.length; i++) {
    const mirror = ipfsMirrors[i];

    const newUrl = url.replace('ipfs.io', mirror);
    try {
      const promise = download(newUrl, 10000);
      promises.push(promise);
      // console.log(response);
      // if (response.data) {
      //   final = response.data;
      //   break;
      // }
    } catch (error: any) {
      null; //just continue
    }
  }

  const result = await Promise.any(promises);
  console.log(result);
  const final = result.data;

  if (final) return final;
  else throw new Error('Unable to download file from IPFS.');
};

const download = async (url: string, timeout = 10000) => {
  return await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: timeout,
  });
};

export const decryptFile = (input: Uint8Array, key: string) => {
  try {
    //console.log("key is ", key);
    const dataBuffer = Buffer.from(input);
    const data32 = dataBuffer.toString('utf-8').substring(0, 32);
    const cipherKey = Buffer.from(key);
    const ivSize = dataBuffer.readUInt8(0);
    const iv = dataBuffer.slice(1, ivSize + 1);
    const authTag = dataBuffer.slice(ivSize + 1, ivSize + 17);
    const decipher = createDecipheriv(ALGORITHM, cipherKey, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(dataBuffer.slice(ivSize + 17)), decipher.final()]);
  } catch (error: any) {
    if (error.toString().includes('invalid key length')) return input;
    else throw error;
  }
};

export const fileToDataURI = async (file: File | undefined, type: string): Promise<string> => {
  if (!file) return '';
  const arrayBuffer = await file.arrayBuffer();
  return arrayBufferToDataURI(arrayBuffer, type);

  const base64Image = Buffer.from(arrayBuffer).toString('base64');
  const dataURI = `data:${type};base64,${base64Image}`;
  return dataURI;
};

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

  return new File([u8arr], filename2 || filename, { type: mime });
}

export const arrayBufferToDataURI = (
  imageBuffer: ArrayBuffer | undefined,
  type: string,
): string => {
  if (!imageBuffer) return ''; //todo show broken image placeholder

  const base64Image = Buffer.from(imageBuffer).toString('base64');
  const dataURI = `data:${type};base64,${base64Image}`;
  return dataURI;
};
