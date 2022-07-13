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

const fileToDataURI = async (file: File | undefined, type: string): Promise<string> => {
  if (!file) return '';
  const arrayBuffer = await file.arrayBuffer();
  return arrayBufferToDataURI(arrayBuffer, type);

  const base64Image = Buffer.from(arrayBuffer).toString('base64');
  const dataURI = `data:${type};base64,${base64Image}`;
  return dataURI;
};

function dataURLtoFile(dataurl: string, filename2?: string) {
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

const arrayBufferToDataURI = (imageBuffer: ArrayBuffer | undefined, type: string): string => {
  if (!imageBuffer) return ''; //todo show broken image placeholder

  const base64Image = Buffer.from(imageBuffer).toString('base64');
  const dataURI = `data:${type};base64,${base64Image}`;
  return dataURI;
};

export { fileToDataURI, dataURLtoFile, arrayBufferToDataURI };
