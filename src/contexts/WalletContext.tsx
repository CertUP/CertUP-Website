import { createContext, useState, useContext, ReactElement, ReactNode, useEffect } from 'react';
import { SecretNetworkClient, Wallet as SJSWallet } from 'secretjs';
import { LoginToken, getQueryPermit } from '../utils/loginPermit';

import { PermitSignature } from '../interfaces';
import { defaultFunction } from '../utils/helpers';

interface DummyWallet {
  wallet: SJSWallet;
  client: SecretNetworkClient;
  address: string;
}

interface UpdateClientProps {
  client?: SecretNetworkClient;
  wallet?: SJSWallet;
  address?: string;
  token?: LoginToken;
  permit?: PermitSignature;
  force?: boolean;
}

export interface WalletContextState {
  Client?: SecretNetworkClient;
  Querier?: SecretNetworkClient;
  ClientIsSigner: boolean;
  Wallet?: SJSWallet;
  Address: string;
  LoginToken?: LoginToken;
  QueryPermit?: PermitSignature;
  ProcessingTx: boolean;
  DummyWallet?: DummyWallet;
  ShowLoginModal: string;
  toggleLoginModal: (state?: string) => void;
  updateClient: (props: UpdateClientProps) => void;
  setProcessingTx: (newState: boolean) => void;
  clearToken: () => void;
  refreshQueryPermit: () => void;
}

interface Props {
  children: ReactNode;
}

// set default values for initializing
const contextDefaultValues: WalletContextState = {
  Client: undefined,
  Querier: undefined,
  ClientIsSigner: false,
  Wallet: undefined,
  Address: '',
  LoginToken: undefined,
  QueryPermit: undefined,
  ProcessingTx: false,
  DummyWallet: undefined,
  ShowLoginModal: '',
  toggleLoginModal: defaultFunction,
  updateClient: defaultFunction,
  setProcessingTx: defaultFunction,
  clearToken: defaultFunction,
  refreshQueryPermit: defaultFunction,
};

// created context with default values
const WalletContext = createContext<WalletContextState>(contextDefaultValues);

export const WalletProvider = ({ children }: Props): ReactElement => {
  // set default values
  const [Client, setClient] = useState<SecretNetworkClient | undefined>(
    contextDefaultValues.Client,
  );
  const [Querier, setQuerier] = useState<SecretNetworkClient | undefined>(
    contextDefaultValues.Querier,
  );
  const [ClientIsSigner, setClientIsSigner] = useState<boolean>(
    contextDefaultValues.ClientIsSigner,
  );
  const [Wallet, setWallet] = useState<SJSWallet | undefined>(contextDefaultValues.Wallet);
  const [Address, setAddress] = useState<string>(contextDefaultValues.Address);
  const [LoginToken, setLoginToken] = useState<LoginToken | undefined>(
    contextDefaultValues.LoginToken,
  );
  const [QueryPermit, setQueryPermit] = useState<PermitSignature | undefined>(
    contextDefaultValues.QueryPermit,
  );
  const [ProcessingTx, setProcessingTx] = useState<boolean>(contextDefaultValues.ProcessingTx);
  const [DummyWallet, setDummyWallet] = useState<DummyWallet>();
  const [ShowLoginModal, setShowLoginModal] = useState(contextDefaultValues.ShowLoginModal);

  const toggleLoginModal = (state?: string) => {
    if (state) setShowLoginModal(state);
    else setShowLoginModal(ShowLoginModal ? '' : 'true');
  };

  const updateClient = ({
    client,
    wallet,
    address,
    token,
    permit,
    force = false,
  }: UpdateClientProps) => {
    if (client || force) setClient(client);
    if (wallet || force) setWallet(wallet);
    if (address || force) setAddress(address || '');
    if (token || force) setLoginToken(token);
    if (permit || force) setQueryPermit(permit);
    if (wallet) setClientIsSigner(wallet ? true : false);
  };

  const clearToken = () => {
    setLoginToken(undefined);
  };

  useEffect(() => {
    getQuerier();
    getDummy();
  }, []);

  const refreshQueryPermit = async () => {
    const permit = await getQueryPermit(Address, true);
    setQueryPermit(permit);
    return permit;
  };

  const getQuerier = async () => {
    const querier = await SecretNetworkClient.create({
      grpcWebUrl: process.env.REACT_APP_GRPC_URL,
      chainId: process.env.REACT_APP_CHAIN_ID,
    });
    setQuerier(querier);
  };

  const getDummy = async () => {
    const dWallet = new SJSWallet('dont use this wallet');
    const dAddress = dWallet.address;
    const dClient = await SecretNetworkClient.create({
      grpcWebUrl: process.env.REACT_APP_GRPC_URL,
      chainId: process.env.REACT_APP_CHAIN_ID,
      wallet: dWallet,
      walletAddress: dAddress,
    });

    setDummyWallet({
      wallet: dWallet,
      client: dClient,
      address: dAddress,
    });
  };

  const values = {
    Client,
    Querier,
    ClientIsSigner,
    Wallet,
    Address,
    LoginToken,
    QueryPermit,
    ProcessingTx,
    DummyWallet,
    ShowLoginModal,
    toggleLoginModal,
    updateClient,
    setProcessingTx,
    clearToken,
    refreshQueryPermit,
  };

  // add values to provider to reach them out from another component
  return <WalletContext.Provider value={values}>{children}</WalletContext.Provider>;
};

// created custom hook
export const useWallet = (): WalletContextState => useContext(WalletContext);
