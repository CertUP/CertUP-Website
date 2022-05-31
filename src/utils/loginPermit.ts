const permitName = 'CertUP-Login-Token';
import { KeplrWindow } from '../components/KeplrButton';

declare let window: KeplrWindow;

export interface LoginToken {
  permit: object;
  issued: Date;
  expires: Date;
}

export default async function getLoginPermit(
  address: string,
  issueDate: Date,
  expDate: Date,
): Promise<LoginToken> {
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

  const { signature } = await window.keplr.signAmino(
    process.env.REACT_APP_CHAIN_ID,
    address,
    unsignedPermit,
    {
      preferNoSetFee: true, // Fee must be 0, so hide it from the user
      preferNoSetMemo: true, // Memo must be empty, so hide it from the user
    },
  );

  return { permit: signature, issued: issueDate, expires: expDate };
}
