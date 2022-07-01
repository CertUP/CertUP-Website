/* eslint-disable @typescript-eslint/ban-types */
import { ReactElement, ReactNode, useState, useEffect } from 'react';
import { useItem } from '../../contexts';
// import cn from 'classnames';
import styles from './styles.module.scss';
import logo from './keplrLogo.svg';
import { toast } from 'react-toastify';

import { Web3Auth } from '@web3auth/web3auth';
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from '@web3auth/base';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';

import { useGlobalState } from '../../state';
import { EncryptionUtils, SecretNetworkClient, Wallet } from 'secretjs';
import { useWallet } from '../../contexts/WalletContext';
import { getErrorMessage, reportError } from '../../utils/helpers';
import getPermits, { getPermits2, LoginToken } from '../../utils/loginPermit';

const clientId =
  'BKEPAeSD171HLib_Xzk3Ry3nbWG_5S59sL30y1u1XWV8rDOoJo7p3fey06gX3Zg1xnIP-9m_kzG1QRePd8dOPp8'; // get from https://dashboard.web3auth.io

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

export default function Web3AuthButton(): ReactElement {
  const { Address, updateClient } = useWallet();
  const [loading, setLoading] = useState(false);
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  const init = async () => {
    try {
      // const web3auth2 = new Web3Auth({
      //   clientId,
      //   chainConfig: {
      //     chainNamespace: CHAIN_NAMESPACES.OTHER,
      //   },
      // });
      const web3auth2 = new Web3Auth({
        clientId,
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.OTHER,
          // chainId: '0x1',
          // rpcTarget: 'https://rpc.ankr.com/eth', // This is the mainnet RPC we have added, please pass on your own endpoint while creating an app
        },
      });
      const openloginAdapter = new OpenloginAdapter({
        adapterSettings: {
          network: 'testnet',
          clientId:
            'BDZVMzdANUiO-oXksHJCXgXxuJLgRhGVSEjoDdVIV4iJ0PiQZwSZuHwJzCHIKJsiN5hrUK_twMPQ6rQ_wgSFcsU',
          uxMode: 'popup',
        },
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.OTHER,
          blockExplorer: 'https://secretnodes.com',
          chainId: process.env.REACT_APP_CHAIN_ID as string,
          displayName: 'Secret testnet',
          rpcTarget: 'https://api.devnet.solana.com',
          ticker: 'SCRT',
          tickerName: 'Secret',
        },
      });
      // it will add/update  the openloginAdapter in to web3auth class
      web3auth2.configureAdapter(openloginAdapter);
      await web3auth2.initModal();
      setWeb3auth(web3auth2);

      console.log('Web3Auth Initialized');
      setInitializing(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const login = async () => {
    try {
      if (!web3auth) {
        console.log('web3auth not initialized yet');
        return;
      }
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
    } catch (error) {
      console.error(error);
    }
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');
      return;
    }
    const user = await web3auth.getUserInfo();
    console.log(user);
  };

  const getPrivKey = async () => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');
      return;
    }
    const privateKey = await web3auth.provider?.request({
      method: 'private_key',
    });

    return privateKey;
  };

  const handleConnect2 = async () => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');
      return;
    }

    try {
      setLoading(true);
      console.log('handling login');
      await login();

      console.log('getting user info');
      await getUserInfo();

      setLoading(false);

      const privateKey = await getPrivKey();

      const snWallet = new Wallet(privateKey as string);
      console.log('Address', snWallet.address);

      const client = await SecretNetworkClient.create({
        grpcWebUrl: process.env.REACT_APP_GRPC_URL as string,
        chainId: process.env.REACT_APP_CHAIN_ID as string,
        wallet: snWallet,
        walletAddress: snWallet.address,
      });
      const issueDate = new Date();
      const expDate = addHours(new Date(), 12);
      const { loginPermit: token, queryPermit: permit } = await getPermits2(
        snWallet.address,
        issueDate,
        expDate,
        snWallet,
      );
      console.log('Permits', token, permit);

      await updateClient(client, snWallet, snWallet.address, token, permit);

      setLoading(false);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  //const { Items } = useItem();
  //console.log(Items);
  return loading || initializing ? (
    <button className={styles.keplrButton} style={{ cursor: 'wait' }}>
      <span>{initializing ? 'Please wait...' : 'Processing...'}</span>
    </button>
  ) : Address ? (
    <button className={styles.keplrButton} style={{ cursor: 'default' }}>
      <span>{truncateAddress(Address)}</span>
    </button>
  ) : (
    <button className={styles.keplrButton} onClick={() => handleConnect2()}>
      <span>Social Login</span>
    </button>
  );
}
