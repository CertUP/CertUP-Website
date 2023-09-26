import { toast } from 'react-toastify';
import { Issuer, IssuerData, ProjectToken } from '../interfaces/manager';
import Project, { Participant, CertInfo, RenderProps } from '../interfaces/Project';
import { CertupExtension } from '../interfaces/common/token.interface';
import * as XLSX from 'xlsx';
import { UploadResponse } from '../pages/Mint';

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

export const numDaysBetween = function (d1: Date, d2: Date) {
  const diff = Math.abs(d1.getTime() - d2.getTime());
  return diff / (1000 * 60 * 60 * 24);
};

export const addHours = (date: Date, hours: number): Date => {
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  return date;
};

export const getPickerFormat = (format: string) => {
  switch (format) {
    case 'nl':
      return 'y/M/d';
      break;
    case 'en-GB':
      return 'd/M/y';
      break;
    default:
      return 'M/d/y';
      break;
  }
};

export const participantToExtensions = (
  participant: Participant,
  certInfo: CertInfo,
  renderProps: RenderProps,
  issuerProfile: Issuer,
  hashPair?: UploadResponse,
) => {
  const pubMeta: CertupExtension = {
    certificate: { cert_number: participant.cert_num },
    description: certInfo.pub_description,
    protected_attributes: [],
  };

  const privMeta: CertupExtension = {
    description: certInfo.priv_description,
    certificate: {
      name: certInfo.cert_name,
      cert_type: renderProps.certTitle,
      issue_date: certInfo?.issue_date.toISOString() as string,
      cert_number: participant.cert_num,
    },
    certified_individual: {
      first_name: participant.name,
      last_name: participant.surname,
      date_of_birth: participant.dob?.toISOString(),
    },
    issuing_organizations: [
      // {
      //   name: renderProps.companyName,
      //   //url: 'https://cfi.org',
      // },
    ],
    issuing_individuals: [
      {
        name: renderProps.signer,
        company: renderProps.companyName,
        title: renderProps.signerTitle,
      },
    ],
    // additions: [
    //   {
    //     type: 'Course',
    //     name: 'Introduction to Finance',
    //     value: '89.4',
    //   },
    //   {
    //     type: 'Instructor',
    //     name: 'Jane Smith',
    //   },
    // ],
    additions: certInfo.additions,
    attributes: [
      {
        trait_type: 'Certificate Number',
        value: participant.cert_num,
      },
      {
        trait_type: 'Certificate Name',
        value: certInfo.cert_name,
      },
      {
        trait_type: 'Issue Date',
        value: certInfo.issue_date.toDateString(),
      },
    ],
    media: hashPair
      ? [
          {
            file_type: 'image/png',
            extension: 'png',
            authentication: {
              key: hashPair.key,
            },
            url: `https://ipfs.io/ipfs/${hashPair.hash}`,
          },
        ]
      : undefined,
    protected_attributes: [],
  };

  if (issuerProfile.name)
    privMeta.issuing_organizations?.push({
      name: issuerProfile.name,
      url: issuerProfile.website,
    });
  else if (renderProps.companyName)
    privMeta.issuing_organizations?.push({
      name: renderProps.companyName,
    });

  return { pubMeta, privMeta };
};

export const projectToPreload = (
  project: Project,
  issuerProfile: Issuer,
  hashes?: UploadResponse[],
): ProjectToken[] => {
  const response: ProjectToken[] = [];

  for (let i = 0; i < project.participants.length; i++) {
    const participant: Participant = project.participants[i];

    const { pubMeta, privMeta } = participantToExtensions(
      participant,
      project.certInfo,
      project.renderProps,
      issuerProfile,
      hashes && hashes.length ? hashes[i] : undefined,
    );

    const token: ProjectToken = {
      claim_code: participant.claim_code || 'Not Yet Generated',
      minted: false,
      preload_data: {
        cert_num: participant.cert_num,
        name: `${participant.name} ${participant.surname}`,
        date: project.certInfo.issue_date?.toLocaleDateString(),
        cert_type: project.renderProps.certTitle,
        issuer_id: 'aaa', // todo
        pub_metadata: { extension: pubMeta },
        priv_metadata: { extension: privMeta },
      },
    };

    response.push(token);
  }

  return response;
};

export const participantsToWorksheet = (participants: Participant[], projectName: string) => {
  const modified = participants.map((p: Participant) => {
    return {
      name: p.name,
      surname: p.surname,
      dob: p.dob,
      cert_num: p.cert_num,
      claim_code: p.claim_code || 'Not yet Generated',
      claimed: p.claimed || 'False',
    };
  });
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(modified);
  console.log(worksheet);
  worksheet['!cols'] = [];
  //worksheet['!cols'][0] = { hidden: true };
  worksheet['!cols'][0] = { wch: 20 };
  worksheet['!cols'][1] = { wch: 20 };
  worksheet['!cols'][2] = { wch: 15 };
  worksheet['!cols'][3] = { wch: 15 };
  worksheet['!cols'][4] = { wch: 75 };
  worksheet['!cols'][5] = { wch: 15 };
  XLSX.utils.sheet_add_aoa(worksheet, [['Name', 'Surname', 'Date of Birth', 'Cert Number', 'Claim Code', 'Claimed']], {
    origin: 'A1',
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Project');
  XLSX.writeFile(workbook, `CertUP Project Review - ${projectName}.xlsx`);
};

export async function suggestTestnet() {
  if (!window.keplr) throw new Error('Keplr wallet extension not found.');

  await window.keplr.experimentalSuggestChain({
    chainId: 'pulsar-3',
    chainName: 'Secret Testnet',
    rpc: 'https://rpc.pulsar3.scrttestnet.com',
    rest: 'https://api.pulsar3.scrttestnet.com',
    bip44: {
      coinType: 529,
    },
    coinType: 529,
    stakeCurrency: {
      coinDenom: 'SCRT',
      coinMinimalDenom: 'uscrt',
      coinDecimals: 6,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'secret',
      bech32PrefixAccPub: 'secretpub',
      bech32PrefixValAddr: 'secretvaloper',
      bech32PrefixValPub: 'secretvaloperpub',
      bech32PrefixConsAddr: 'secretvalcons',
      bech32PrefixConsPub: 'secretvalconspub',
    },
    currencies: [
      {
        coinDenom: 'SCRT',
        coinMinimalDenom: 'uscrt',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'SCRT',
        coinMinimalDenom: 'uscrt',
        coinDecimals: 6,
      },
    ],
    gasPriceStep: {
      low: 0.1,
      average: 0.25,
      high: 0.4,
    },
    features: ['secretwasm', 'ibc-go', 'ibc-transfer'],
  });
}

export const hashString = (input: string): number => {
  let hash = 0,
    i,
    chr;
  if (input.length === 0) return hash;
  for (i = 0; i < input.length; i++) {
    chr = input.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export const defaultFunction = (): void => {
  throw new Error('Function not implemented.');
};
