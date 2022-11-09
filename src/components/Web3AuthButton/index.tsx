/* eslint-disable @typescript-eslint/ban-types */
import { ReactElement, ReactNode, useState } from 'react';
// import cn from 'classnames';
import styles from './styles.module.scss';
import logo from './keplrLogo.svg';
import { toast } from 'react-toastify';

import { Web3Auth } from '@web3auth/web3auth';
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from '@web3auth/base';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';

import { EncryptionUtils, SecretNetworkClient, Wallet } from 'secretjs';
import { useWallet } from '../../contexts/WalletContext';
import { getErrorMessage, reportError } from '../../utils/helpers';
import getPermits, { LoginToken } from '../../utils/loginPermit';

const clientId =
  'BDZVMzdANUiO-oXksHJCXgXxuJLgRhGVSEjoDdVIV4iJ0PiQZwSZuHwJzCHIKJsiN5hrUK_twMPQ6rQ_wgSFcsU'; // get from https://dashboard.web3auth.io
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

const truncateAddress = (address: string) => {
  return `secret1...${address.substring(address.length - 7)}`;
};

export default function Web3AuthButton(): ReactElement {
  const { Address, updateClient } = useWallet();
  const [loading, setLoading] = useState(false);
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);

  // const handleConnect = async () => {
  //   try {
  //     setLoading(true);
  //     if (!window.keplr || !window.getEnigmaUtils || !window.getOfflineSignerOnlyAmino) {
  //       toast.error('Keplr Extension Not Found');
  //       setLoading(false);
  //       return;
  //     }

  //     await window.keplr.enable(process.env.REACT_APP_CHAIN_ID);

  //     const keplrOfflineSigner: Wallet = window.getOfflineSignerOnlyAmino(
  //       process.env.REACT_APP_CHAIN_ID as string,
  //     );
  //     const [{ address: myAddress }] = await keplrOfflineSigner.getAccounts();

  //     const secretjs = await SecretNetworkClient.create({
  //       grpcWebUrl: process.env.REACT_APP_GRPC_URL as string,
  //       chainId: process.env.REACT_APP_CHAIN_ID as string,
  //       wallet: keplrOfflineSigner,
  //       walletAddress: myAddress,
  //       encryptionUtils: window.getEnigmaUtils(process.env.REACT_APP_CHAIN_ID as string),
  //     });

  //     const issueDate = new Date();
  //     const expDate = addHours(new Date(), 12);
  //     const { loginPermit: token, queryPermit: permit } = await getPermits(
  //       myAddress,
  //       issueDate,
  //       expDate,
  //     );
  //     console.log('Permits', token, permit);
  //     await updateClient(secretjs, keplrOfflineSigner, myAddress, token, permit);
  //     setLoading(false);
  //   } catch (error) {
  //     setLoading(false);
  //     reportError({ message: getErrorMessage(error) });
  //   }
  // };

  const handleConnect2 = async () => {
    try {
      const web3auth = new Web3Auth({
        clientId,
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.OTHER,
          chainId: process.env.REACT_APP_CHAIN_ID,
        },
      });

      const openloginAdapter = new OpenloginAdapter({
        adapterSettings: {
          network: 'testnet',
          clientId:
            'BDZVMzdANUiO-oXksHJCXgXxuJLgRhGVSEjoDdVIV4iJ0PiQZwSZuHwJzCHIKJsiN5hrUK_twMPQ6rQ_wgSFcsU',
          uxMode: 'popup',
        },

        // chainConfig:{
        //   //chainNamespace: web3auth.namespace,
        //   blockExplorer: "https://secretnodes.com",
        //   chainId: process.env.REACT_APP_CHAIN_ID as string,
        //   displayName: "Secret testnet",
        //   //rpcTarget: "https://api.devnet.solana.com",
        //   ticker: "SCRT",
        //   tickerName: "Secret",
        // },
      });
      // it will add/update  the openloginAdapter in to web3auth class
      // web3auth.configureAdapter(openloginAdapter);

      setWeb3auth(web3auth);

      await web3auth.initModal();

      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);

      const user = await web3auth.getUserInfo();
      console.log(user);

      const privateKey = await web3auth?.provider?.request({
        method: 'private_key',
      });

      console.log('PKey', privateKey);

      const snWallet = new Wallet(privateKey as string);
      console.log('Address', snWallet.address);
    } catch (error) {
      console.error(error);
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
    <button className={styles.keplrButton} onClick={() => handleConnect2()}>
      <img src={logo} alt="Keplr Wallet" className={styles.keplrLogo} />
      <span>Login</span>
    </button>
  );
}
