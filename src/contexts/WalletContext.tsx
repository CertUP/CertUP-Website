import { createContext, useState, useContext, ReactElement, ReactNode, useEffect } from 'react';
import {
  IssuerData,
  IssuerDataResponse,
  PermitSignature,
  RemainingCertsResponse,
} from '../interfaces';
import { SecretNetworkClient, Wallet } from 'secretjs';
import {
  LoginToken,
  permissions,
  allowedTokens,
  permitName,
  getQueryPermit,
} from '../utils/loginPermit';
import useQuery from '../hooks/QueryHook';

import { toast } from 'react-toastify';

export interface WalletContextState {
  Client?: SecretNetworkClient;
  Querier: SecretNetworkClient | undefined;
  ClientIsSigner: boolean;
  Wallet: Wallet | undefined;
  Address: string;
  LoginToken: LoginToken | undefined;
  QueryPermit: PermitSignature | undefined;
  RemainingCerts: number;
  IssuerProfile?: IssuerData;
  LoadingRemainingCerts: boolean;
  ProcessingTx: boolean;
  VerifiedIssuer: boolean;
  updateClient: (
    client?: SecretNetworkClient,
    wallet?: Wallet,
    address?: string,
    token?: LoginToken,
    permit?: PermitSignature,
  ) => void;
  setProcessingTx: (newState: boolean) => void;
  queryCredits: () => void;
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
  updateClient: function (): void {
    throw new Error('Function not implemented.');
  },
  queryCredits: function (): void {
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
  const [Wallet, setWallet] = useState<Wallet | undefined>(contextDefaultValues.Wallet);
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

  const [IssuerProfile, setIssuerProfile] = useState<IssuerData | undefined>(
    contextDefaultValues.IssuerProfile,
  );

  const [ProcessingTx, setProcessingTx] = useState<boolean>(contextDefaultValues.ProcessingTx);

  const [VerifiedIssuer, setVerifiedIssuer] = useState<boolean>(
    contextDefaultValues.VerifiedIssuer,
  );

  const updateClient = (
    client: SecretNetworkClient | undefined,
    wallet: Wallet | undefined,
    address = '',
    token: LoginToken | undefined,
    permit: PermitSignature | undefined,
  ) => {
    setClient(client);
    setWallet(wallet);
    setAddress(address);
    setLoginToken(token);
    setQueryPermit(permit);
    setClientIsSigner(wallet ? true : false);
  };

  useEffect(() => {
    queryCredits();
  }, [QueryPermit]);

  useEffect(() => {
    getQuerier();
  }, []);

  const refreshQueryPermit = async () => {
    const permit = await getQueryPermit(Address, true);
    setQueryPermit(permit);
    return permit;
  };

  const getQuerier = async () => {
    console.log('Getting Querier');
    const querier = await SecretNetworkClient.create({
      grpcWebUrl: process.env.REACT_APP_GRPC_URL,
      chainId: process.env.REACT_APP_CHAIN_ID,
    });
    setQuerier(querier);
  };

  const queryCredits = async (queryPermit = QueryPermit): Promise<number | undefined> => {
    if (!queryPermit) return;
    setLoadingRemainingCerts(true);

    console.log('Updating Remaining Certs...');

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

    try {
      const response = (await Client?.query.compute.queryContract({
        contractAddress: process.env.REACT_APP_MANAGER_ADDR as string,
        codeHash: process.env.REACT_APP_MANAGER_HASH as string,
        query: query,
      })) as IssuerDataResponse;

      console.log('Remaining Certs Query Response', response);

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
        const result = parseInt(response.issuer_data.certs_remaining || '0', 10);
        setIssuerProfile(response.issuer_data);
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
