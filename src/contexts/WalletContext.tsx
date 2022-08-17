import { createContext, useState, useContext, ReactElement, ReactNode, useEffect } from 'react';
import { PermitSignature, RemainingCertsResponse, WalletContextState } from '../interfaces';
import { SecretNetworkClient, Wallet } from 'secretjs';
import {
  LoginToken,
  permissions,
  allowedTokens,
  permitName,
  getQueryPermit,
} from '../utils/loginPermit';

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
  LoadingRemainingCerts: true,
  ProcessingTx: false,
  VerifiedIssuer: true,
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
    console.log('updating', token, permit);
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
    console.log('getting querier');
    const querier = await SecretNetworkClient.create({
      grpcWebUrl: process.env.REACT_APP_GRPC_URL,
      chainId: process.env.REACT_APP_CHAIN_ID,
    });
    setQuerier(querier);
  };

  const queryCredits = async (queryPermit = QueryPermit): Promise<number | undefined> => {
    if (!queryPermit) return;
    setLoadingRemainingCerts(true);

    const query = {
      with_permit: {
        query: {
          remaining_certs: {
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

    const response: RemainingCertsResponse | undefined = await Client?.query.compute.queryContract({
      contractAddress: process.env.REACT_APP_MANAGER_ADDR as string,
      codeHash: process.env.REACT_APP_MANAGER_HASH as string,
      query: query,
    });
    console.log('Remaining Certs Query Responseeeee', response);

    if (response?.parse_err || response?.generic_err) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      if (response.generic_err?.msg === 'You are not a verified issuer.') setVerifiedIssuer(false);
      if (response.generic_err?.msg === 'Failed to verify signatures for the given permit') {
        await refreshQueryPermit();
        return;
      }

      setLoadingRemainingCerts(false);
      throw new Error(
        response?.parse_err?.msg ||
          response?.generic_err?.msg ||
          JSON.stringify(response, undefined, 2),
      );
    }
    const result = parseInt(response?.remaining_certs?.certs || '0', 10);
    setRemainingCerts(result);
    setLoadingRemainingCerts(false);
    return result;
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
