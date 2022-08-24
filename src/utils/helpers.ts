import { toast } from 'react-toastify';

export const changeThisFunction = () => {
  return 'change me'; // TODO: CHANGE HERE
};

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export const reportError = ({ message }: { message: string }) => {
  console.error(message);
  toast.error(message);
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getSizeInBytes = (obj: any) => {
  let str = null;
  if (typeof obj === 'string') {
    // If obj is a string, then use it
    str = obj;
  } else {
    // Else, make obj into a string
    str = JSON.stringify(obj);
  }
  // Get the length of the Uint8Array
  const bytes = new TextEncoder().encode(str).length;
  return bytes;
};

export const logSizeInBytes = (description: string, obj: any) => {
  const bytes = getSizeInBytes(obj);
  console.log(`${description} is approximately ${bytes} B`);
};

export const logSizeInKilobytes = (description: string, obj: any) => {
  const bytes = getSizeInBytes(obj);
  const kb = (bytes / 1000).toFixed(2);
  console.log(`${description} is approximately ${kb} kB`);
};


export const numDaysBetween = function(d1: Date, d2: Date) {
  var diff = Math.abs(d1.getTime() - d2.getTime());
  return diff / (1000 * 60 * 60 * 24);
};