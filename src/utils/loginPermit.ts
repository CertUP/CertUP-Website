import { Permission, Wallet } from 'secretjs';
import { KeplrWindow } from '../components/KeplrButton';
import { PermitSignature } from '../interfaces';

export const permitName = 'CertUP-Query-Permit';
export const allowedTokens: string[] = [process.env.REACT_APP_CONTRACT_ADDR as string];
export const permissions: Permission[] = ['owner'];

declare let window: KeplrWindow;

export interface LoginToken {
  permit: PermitSignature;
  issued: Date;
  expires: Date;
}

export interface GetPermitResponse {
  loginPermit: LoginToken;
  queryPermit: PermitSignature;
}

function buildPermits(issueDate: Date, expDate: Date) {
  const loginPermit = {
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
          issued: issueDate.toISOString(),
          expires: expDate.toISOString(),
        },
      },
    ],
    memo: '', // Must be empty
  };
  console.log('Login Unsigned:', JSON.stringify(loginPermit, undefined, 2));

  const queryPermit = {
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

  return { loginPermit, queryPermit };
}

export default async function getPermits(
  address: string,
  issueDate: Date,
  expDate: Date,
): Promise<GetPermitResponse> {
  const { loginPermit, queryPermit } = buildPermits(issueDate, expDate);

  const { signature } = await window.keplr.signAmino(
    process.env.REACT_APP_CHAIN_ID,
    address,
    loginPermit,
    {
      preferNoSetFee: true, // Fee must be 0, so hide it from the user
      preferNoSetMemo: true, // Memo must be empty, so hide it from the user
    },
  );

  await new Promise((r) => setTimeout(r, 100));

  const { signature: signature2 } = await window.keplr.signAmino(
    process.env.REACT_APP_CHAIN_ID,
    address,
    queryPermit,
    {
      preferNoSetFee: true, // Fee must be 0, so hide it from the user
      preferNoSetMemo: true, // Memo must be empty, so hide it from the user
    },
  );

  return {
    loginPermit: { permit: signature, issued: issueDate, expires: expDate },
    queryPermit: signature2,
  };
}

// get permits using wallet
export async function getPermits2(
  address: string,
  issueDate: Date,
  expDate: Date,
  wallet: Wallet,
): Promise<GetPermitResponse> {
  const { loginPermit, queryPermit } = buildPermits(issueDate, expDate);

  const { signature, signed } = await wallet.signAmino(address, loginPermit);
  console.log('Sig:', signature, signed);

  await new Promise((r) => setTimeout(r, 100));

  const { signature: signature2 } = await wallet.signAmino(address, queryPermit);

  return {
    loginPermit: { permit: signature, issued: issueDate, expires: expDate },
    queryPermit: signature2,
  };
}
