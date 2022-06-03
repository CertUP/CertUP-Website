/* eslint-disable @typescript-eslint/ban-types */
import { ReactElement, ReactNode, useState } from 'react';
import { useItem } from '../../contexts';
// import cn from 'classnames';
import styles from './styles.module.scss';
import logo from './keplrLogo.svg';
import { toast } from 'react-toastify';

import { useGlobalState } from '../../state';
import { EncryptionUtils, SecretNetworkClient, Wallet } from 'secretjs';
import { useWallet } from '../../contexts/WalletContext';
import { getErrorMessage, reportError } from '../../utils/helpers';
import getLoginPermit, { LoginToken } from '../../utils/loginPermit';

export interface KeplrWindow extends Window {
  keplr: any;
  getEnigmaUtils(_: string): EncryptionUtils;
  getOfflineSigner(): Wallet;
  getOfflineSignerOnlyAmino(_: string): Wallet;
  enable(_: string): Function;
  getAccounts(): Function;
}

// declare interface Date {
//   addHours(h: number): Date;
// }

// Date.prototype.addHours = function(h: number) {
//   this.setTime(this.getTime() + (h*60*60*1000));
//   return this;
// }

const addHours = (date: Date, hours: number): Date => {
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  return date;
};

declare let window: KeplrWindow;

const truncateAddress = (address: string) => {
  return `secret1...${address.substring(address.length - 7)}`;
};

export default function KeplrButton(): ReactElement {
  const { Address, updateClient } = useWallet();
  const [loading, setLoading] = useState(false);

  //const [secretJs, setSecretJs] = useGlobalState('secretJs');
  //const [acctAddr, setAcctAddr] = useGlobalState('walletAddress');
  //const [isSigner, setIsSigner] = useGlobalState('isSigner');

  const handleConnect = async () => {
    try {
      setLoading(true);
      if (!window.keplr || !window.getEnigmaUtils || !window.getOfflineSignerOnlyAmino) {
        toast.error('Keplr Extension Not Found');
        setLoading(false);
        return;
      }

      await window.keplr.enable(process.env.REACT_APP_CHAIN_ID);

      const keplrOfflineSigner: Wallet = window.getOfflineSignerOnlyAmino(
        process.env.REACT_APP_CHAIN_ID as string,
      );
      const [{ address: myAddress }] = await keplrOfflineSigner.getAccounts();

      const secretjs = await SecretNetworkClient.create({
        grpcWebUrl: process.env.REACT_APP_GRPC_URL as string,
        chainId: process.env.REACT_APP_CHAIN_ID as string,
        wallet: keplrOfflineSigner,
        walletAddress: myAddress,
        encryptionUtils: window.getEnigmaUtils(process.env.REACT_APP_CHAIN_ID as string),
      });

      const issueDate = new Date();
      const expDate = addHours(new Date(), 12);
      const token: LoginToken = await getLoginPermit(myAddress, issueDate, expDate);

      await updateClient(secretjs, keplrOfflineSigner, myAddress, token);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      reportError({ message: getErrorMessage(error) });
    }
  };

  //const { Items } = useItem();
  //console.log(Items);
  return loading ? (
    <button className={styles.keplrButton} style={{ cursor: 'wait' }}>
      <img src={logo} alt="Keplr Wallet" className={styles.keplrLogo} />
      <span>Connecting Keplr</span>
    </button>
  ) : Address ? (
    <button className={styles.keplrButton} style={{ cursor: 'default' }}>
      <img src={logo} alt="Keplr Wallet" className={styles.keplrLogo} />
      <span>{truncateAddress(Address)}</span>
    </button>
  ) : (
    <button className={styles.keplrButton} onClick={() => handleConnect()}>
      <img src={logo} alt="Keplr Wallet" className={styles.keplrLogo} />
      <span>Connect to Keplr!</span>
    </button>
  );
}
