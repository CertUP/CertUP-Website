import { createContext, useState, useContext, ReactElement, ReactNode, useEffect } from 'react';
import { SecretNetworkClient, Wallet as SJSWallet } from 'secretjs';
import {
  LoginToken,
  permissions,
  allowedTokens,
  permitName,
  getQueryPermit,
} from '../utils/loginPermit';

import { toast } from 'react-toastify';
import { PermitSignature } from '../interfaces';
import { Issuer, IssuerData, IssuerDataResponse } from '../interfaces/manager';

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
  Querier: SecretNetworkClient | undefined;
  ClientIsSigner: boolean;
  Wallet: SJSWallet | undefined;
  Address: string;
  LoginToken: LoginToken | undefined;
  QueryPermit: PermitSignature | undefined;
  RemainingCerts: number;
  IssuerProfile?: Issuer;
  LoadingRemainingCerts: boolean;
  ProcessingTx: boolean;
  VerifiedIssuer: boolean;
  DummyWallet?: DummyWallet;
  ShowLoginModal: string;
  toggleLoginModal: (state?: string) => void;
  updateClient: (props: UpdateClientProps) => void;
  setProcessingTx: (newState: boolean) => void;
  queryCredits: () => Promise<number | undefined>;
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
  RemainingCerts: 0,
  IssuerProfile: undefined,
  LoadingRemainingCerts: true,
  ProcessingTx: false,
  VerifiedIssuer: false,
  DummyWallet: undefined,
  ShowLoginModal: '',
  toggleLoginModal: function (): void {
    throw new Error('Function not implemented.');
  },
  updateClient: function (): void {
    throw new Error('Function not implemented.');
  },
  queryCredits: async function (): Promise<number | undefined> {
    throw new Error('Function not implemented.');
  },
  setProcessingTx: function (): void {
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
  const [RemainingCerts, setRemainingCerts] = useState<number>(contextDefaultValues.RemainingCerts);
  const [LoadingRemainingCerts, setLoadingRemainingCerts] = useState<boolean>(
    contextDefaultValues.LoadingRemainingCerts,
  );

  const [IssuerProfile, setIssuerProfile] = useState<Issuer | undefined>(
    contextDefaultValues.IssuerProfile,
  );

  const [ProcessingTx, setProcessingTx] = useState<boolean>(contextDefaultValues.ProcessingTx);

  const [VerifiedIssuer, setVerifiedIssuer] = useState<boolean>(
    contextDefaultValues.VerifiedIssuer,
  );

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

  useEffect(() => {
    queryCredits();
  }, [QueryPermit]);

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

  const queryCredits = async (queryPermit = QueryPermit): Promise<number | undefined> => {
    if (!queryPermit) return;
    setLoadingRemainingCerts(true);

    const query = {
      with_permit: {
        query: {
          issuer_data: {
            viewer: {
              address: Address,
            },
          },
        },
        permit: {
          params: {
            permit_name: permitName,
            allowed_tokens: allowedTokens,
            chain_id: process.env.REACT_APP_CHAIN_ID,
            permissions: permissions,
          },
          signature: queryPermit,
        },
      },
    };

    // wtf secret.js
    let response: IssuerDataResponse | string | undefined;
    try {
      response = (await Client?.query.compute.queryContract({
        contractAddress: process.env.REACT_APP_MANAGER_ADDR as string,
        codeHash: process.env.REACT_APP_MANAGER_HASH as string,
        query: query,
      })) as IssuerDataResponse | string;

      if (typeof response === 'string' || response instanceof String)
        response = JSON.parse(response as string) as IssuerDataResponse;

      if (response?.parse_err || response?.generic_err) {
        if (response.generic_err?.msg.includes('not a verified issuer')) {
          setLoadingRemainingCerts(false);
          setVerifiedIssuer(false);
          return;
        } else if (
          response.generic_err?.msg.includes('Failed to verify signatures for the given permit')
        ) {
          await refreshQueryPermit();
          return;
        } else {
          const errorMsg =
            response?.parse_err?.msg ||
            response?.generic_err?.msg ||
            JSON.stringify(response, undefined, 2);

          toast.error(errorMsg);
          // throw new Error(
          //   response?.parse_err?.msg ||
          //     response?.generic_err?.msg ||
          //     JSON.stringify(response, undefined, 2),
          // );
        }

        setLoadingRemainingCerts(false);
      } else {
        const result = parseInt(response.issuer_data.issuer.remaining_certs || '0', 10);
        setIssuerProfile(response.issuer_data.issuer);
        setRemainingCerts(result);
        setVerifiedIssuer(true);
        setLoadingRemainingCerts(false);
        return result;
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.toString());
    }

    setLoadingRemainingCerts(false);
  };

  const values = {
    Client,
    Querier,
    ClientIsSigner,
    Wallet,
    Address,
    LoginToken,
    QueryPermit,
    RemainingCerts,
    IssuerProfile,
    LoadingRemainingCerts,
    ProcessingTx,
    DummyWallet,
    ShowLoginModal,
    toggleLoginModal,
    updateClient,
    queryCredits,
    setProcessingTx,
    VerifiedIssuer,
  };

  // add values to provider to reach them out from another component
  return <WalletContext.Provider value={values}>{children}</WalletContext.Provider>;
};

// created custom hook
export const useWallet = (): WalletContextState => useContext(WalletContext);
