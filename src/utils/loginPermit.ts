import { KeplrWindow } from '../components/KeplrButton';

export const permitName = 'CertUP-Query-Permit';
export const allowedTokens = [process.env.REACT_APP_CONTRACT_ADDR];
export const permissions = ['owner'];

declare let window: KeplrWindow;

export interface LoginToken {
  permit: object;
  issued: Date;
  expires: Date;
}

export interface GetPermitResponse {
  loginPermit: LoginToken;
  queryPermit: object;
}

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

export default async function getPermits(
  address: string,
  issueDate: Date,
  expDate: Date,
): Promise<GetPermitResponse> {
  const unsignedPermit = {
    chain_id: process.env.REACT_APP_CHAIN_ID,
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

  const unsignedPermit2 = {
    chain_id: process.env.REACT_APP_CHAIN_ID,
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
    process.env.REACT_APP_CHAIN_ID,
    address,
    unsignedPermit,
    {
      preferNoSetFee: true, // Fee must be 0, so hide it from the user
      preferNoSetMemo: true, // Memo must be empty, so hide it from the user
    },
  );

  await new Promise((r) => setTimeout(r, 100));

  const { signature: signature2 } = await window.keplr.signAmino(
    process.env.REACT_APP_CHAIN_ID,
    address,
    unsignedPermit2,
    {
      preferNoSetFee: true, // Fee must be 0, so hide it from the user
      preferNoSetMemo: true, // Memo must be empty, so hide it from the user
    },
  );

  //return { loginPermit: signature, queryPermit: signature2, issued: issueDate, expires: expDate };
  return {
    loginPermit: { permit: signature, issued: issueDate, expires: expDate },
    queryPermit: signature2,
  };
}
