import { Permission } from 'secretjs';
import { PermitSignature } from '../interfaces';
import { addHours } from './helpers';

export const permitName = 'CertUP-Query-Permit';
export const allowedTokens: string[] = [
  process.env.REACT_APP_NFT_ADDR as string,
  process.env.REACT_APP_MANAGER_ADDR as string,
];
export const permissions: Permission[] = ['owner', 'balance'];

export interface LoginToken {
  permit: PermitSignature;
  issued: Date;
  expires: Date;
}

export interface GetPermitResponse {
  loginPermit: LoginToken;
  queryPermit: PermitSignature;
}

const queryPermitString = `Certup-Query-Permit-v1-${process.env.REACT_APP_NFT_ADDR}-${process.env.REACT_APP_MANAGER_ADDR}`;
const loginPermitString = `Certup-Login-Token-v1`;

const getQueryString = (address: string) => {
  return `${queryPermitString}-${address}`;
};

const getLoginString = (address: string) => {
  return `${loginPermitString}-${address}`;
};

// export default async function getLoginPermit(
//   address: string,
//   issueDate: Date,
//   expDate: Date,
// ): Promise<LoginToken> {
//   const unsignedPermit = {
//     chain_id: process.env.REACT_APP_CHAIN_ID,
//     account_number: '0', // Must be 0
//     sequence: '0', // Must be 0
//     fee: {
//       amount: [{ denom: 'uscrt', amount: '0' }], // Must be 0 uscrt
//       gas: '1', // Must be 1
//     },
//     msgs: [
//       {
//         type: 'query_permit', // Must be "query_permit"
//         value: {
//           permit_name: permitName,
//           allowed_tokens: allowedTokens,
//           permissions: permissions,
//         },
//       },
//       {
//         type: 'CertUP-Login-Token',
//         value: {
//           issued: issueDate,
//           expires: expDate,
//         },
//       },
//     ],
//     memo: '', // Must be empty
//   };

//   const {signature} = await window.keplr.signAmino(
//     process.env.REACT_APP_CHAIN_ID,
//     address,
//     unsignedPermit,
//     {
//       preferNoSetFee: true, // Fee must be 0, so hide it from the user
//       preferNoSetMemo: true, // Memo must be empty, so hide it from the user
//     },
//   );

//   return { permit: signature, issued: issueDate, expires: expDate };
// }

export function getCachedQueryPermit(address: string): PermitSignature | undefined {
  const cachedPermit = localStorage.getItem(getQueryString(address));
  return cachedPermit ? JSON.parse(cachedPermit) : undefined;
}

export function getCachedLoginToken(address: string): LoginToken | undefined {
  const cachedToken = localStorage.getItem(getLoginString(address));
  return cachedToken ? JSON.parse(cachedToken) : undefined;
}

export async function getLoginToken(
  address: string,
  issueDate?: Date,
  expDate?: Date,
  refresh = false,
): Promise<LoginToken> {
  if (!window.keplr || !window.getEnigmaUtils || !window.getOfflineSignerOnlyAmino) {
    throw new Error('Keplr Extension Not Found');
  }

  let cachedToken = getCachedLoginToken(address);
  if (cachedToken) {
    //console.log('found cached token', cachedToken);
    if (!cachedToken.expires || new Date(cachedToken.expires) < new Date()) cachedToken = undefined;
  }
  if (!refresh && cachedToken) return cachedToken;

  if (!issueDate) issueDate = new Date();
  if (!expDate) expDate = addHours(new Date(), 12);

  const unsignedToken = {
    chain_id: process.env.REACT_APP_CHAIN_ID as string,
    account_number: '0', // Must be 0
    sequence: '0', // Must be 0
    fee: {
      amount: [{ denom: 'uscrt', amount: '0' }], // Must be 0 uscrt
      gas: '1', // Must be 1
    },
    msgs: [
      {
        type: 'CertUP-Login-Token',
        value: {
          issued: issueDate,
          expires: expDate,
        },
      },
    ],
    memo: '', // Must be empty
  };

  const { signature } = await window.keplr.signAmino(
    process.env.REACT_APP_CHAIN_ID as string,
    address,
    unsignedToken,
    {
      preferNoSetFee: true, // Fee must be 0, so hide it from the user
      preferNoSetMemo: true, // Memo must be empty, so hide it from the user
    },
  );
  const loginToken = { permit: signature, issued: issueDate, expires: expDate };
  localStorage.setItem(getLoginString(address), JSON.stringify(loginToken));
  return loginToken;
}

export default async function getPermits(
  address: string,
  issueDate: Date,
  expDate: Date,
): Promise<GetPermitResponse> {
  if (!window.keplr || !window.getEnigmaUtils || !window.getOfflineSignerOnlyAmino) {
    throw new Error('Keplr Extension Not Found');
  }

  // Begin LOGIN TOKEN
  const cachedToken: string | null = localStorage.getItem(getLoginString(address));
  let finalToken: LoginToken | undefined;

  if (cachedToken) {
    //console.log('found cached token', cachedToken);
    finalToken = JSON.parse(cachedToken);
    if (!finalToken?.expires || new Date(finalToken.expires) < new Date()) finalToken = undefined;
  }
  if (!finalToken) {
    const unsignedPermit = {
      chain_id: process.env.REACT_APP_CHAIN_ID as string,
      account_number: '0', // Must be 0
      sequence: '0', // Must be 0
      fee: {
        amount: [{ denom: 'uscrt', amount: '0' }], // Must be 0 uscrt
        gas: '1', // Must be 1
      },
      msgs: [
        {
          type: 'CertUP-Login-Token',
          value: {
            issued: issueDate,
            expires: expDate,
          },
        },
      ],
      memo: '', // Must be empty
    };

    const { signature } = await window.keplr.signAmino(
      process.env.REACT_APP_CHAIN_ID as string,
      address,
      unsignedPermit,
      {
        preferNoSetFee: true, // Fee must be 0, so hide it from the user
        preferNoSetMemo: true, // Memo must be empty, so hide it from the user
      },
    );
    finalToken = { permit: signature, issued: issueDate, expires: expDate };
    localStorage.setItem(getLoginString(address), JSON.stringify(finalToken));
    //console.log(`Certup-Login-Token-v1-${address}`, JSON.stringify(finalToken, undefined, 2));
  }

  // Wait for Keplr window to close
  await new Promise((r) => setTimeout(r, 150));
  const finalPermit = await getQueryPermit(address);
  //return { loginPermit: signature, queryPermit: signature2, issued: issueDate, expires: expDate };
  return {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    // eslint-disable-next-line prettier/prettier
    loginPermit: finalToken,
    queryPermit: finalPermit,
  };
}

export const getQueryPermit = async (
  address: string,
  refresh = false,
): Promise<PermitSignature> => {
  if (!window.keplr || !window.getEnigmaUtils || !window.getOfflineSignerOnlyAmino) {
    throw new Error('Keplr Extension Not Found');
  }

  const cachedPermit = getCachedQueryPermit(address);

  if (!refresh && cachedPermit) return cachedPermit;

  const unsignedQueryPermit = {
    chain_id: process.env.REACT_APP_CHAIN_ID as string,
    account_number: '0', // Must be 0
    sequence: '0', // Must be 0
    fee: {
      amount: [{ denom: 'uscrt', amount: '0' }], // Must be 0 uscrt
      gas: '1', // Must be 1
    },
    msgs: [
      {
        type: 'query_permit', // Must be "query_permit"
        value: {
          permit_name: permitName,
          allowed_tokens: allowedTokens,
          permissions: permissions,
        },
      },
    ],
    memo: '', // Must be empty
  };

  const { signature } = await window.keplr.signAmino(
    process.env.REACT_APP_CHAIN_ID as string,
    address,
    unsignedQueryPermit,
    {
      preferNoSetFee: true, // Fee must be 0, so hide it from the user
      preferNoSetMemo: true, // Memo must be empty, so hide it from the user
    },
  );

  localStorage.setItem(getQueryString(address), JSON.stringify(signature));
  return signature;
};
