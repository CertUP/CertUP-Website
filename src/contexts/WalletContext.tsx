import { createContext, useState, useContext, ReactElement, ReactNode } from 'react';
import { WalletContextState } from '../interfaces';
import { SecretNetworkClient, Wallet } from 'secretjs';
import { LoginToken } from '../utils/loginPermit';

interface Props {
  children: ReactNode;
}

// set default values for initializing
const contextDefaultValues: WalletContextState = {
  Client: undefined,
  ClientIsSigner: false,
  Wallet: undefined,
  Address: '',
  LoginToken: undefined,
  updateClient: function (): void {
    throw new Error('Function not implemented.');
  },
};

// created context with default values
const WalletContext = createContext<WalletContextState>(contextDefaultValues);

export const WalletProvider = ({ children }: Props): ReactElement => {
  // set default values
  const [Client, setClient] = useState<SecretNetworkClient | undefined>(
    contextDefaultValues.Client,
  );
  const [ClientIsSigner, setClientIsSigner] = useState<boolean>(
    contextDefaultValues.ClientIsSigner,
  );
  const [Wallet, setWallet] = useState<Wallet | undefined>(contextDefaultValues.Wallet);
  const [Address, setAddress] = useState<string>(contextDefaultValues.Address);
  const [LoginToken, setLoginToken] = useState<LoginToken | undefined>(
    contextDefaultValues.LoginToken,
  );

  const updateClient = (
    client: SecretNetworkClient | undefined,
    wallet: Wallet | undefined,
    address = '',
    token: LoginToken | undefined,
  ) => {
    setClient(client);
    setWallet(wallet);
    setAddress(address);
    setLoginToken(token);
    setClientIsSigner(wallet ? true : false);
  };

  const values = {
    Client,
    ClientIsSigner,
    Wallet,
    Address,
    LoginToken,
    updateClient,
  };

  // add values to provider to reach them out from another component
  return <WalletContext.Provider value={values}>{children}</WalletContext.Provider>;
};

// created custom hook
export const useWallet = () => useContext(WalletContext);
