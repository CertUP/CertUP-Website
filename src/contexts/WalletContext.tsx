import { createContext, useState, useContext, ReactElement, ReactNode, useEffect } from 'react';
import { PermitSignature, RemainingCertsResponse, WalletContextState } from '../interfaces';
import { SecretNetworkClient, Wallet } from 'secretjs';
import { LoginToken, permissions, allowedTokens, permitName } from '../utils/loginPermit';

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
  QueryPermit: undefined,
  RemainingCerts: 0,
  ProcessingTx: false,
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
  const [ProcessingTx, setProcessingTx] = useState<boolean>(contextDefaultValues.ProcessingTx);

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

  const queryCredits = async (): Promise<number | undefined> => {
    if (!QueryPermit) return;

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
          signature: QueryPermit,
        },
      },
    };

    const response: RemainingCertsResponse | undefined = await Client?.query.compute.queryContract({
      contractAddress: process.env.REACT_APP_MANAGER_ADDR as string,
      codeHash: process.env.REACT_APP_MANAGER_HASH as string,
      query: query,
    });
    if (response?.parse_error || response?.generic_error)
      throw new Error((response?.parse_error || response?.generic_error || '').toString());
    console.log('Remaining Certs Query Response', response);
    const result = parseInt(response?.remaining_certs?.certs || '0', 10);
    setRemainingCerts(result);
    return result;
  };

  const values = {
    Client,
    ClientIsSigner,
    Wallet,
    Address,
    LoginToken,
    QueryPermit,
    RemainingCerts,
    ProcessingTx,
    updateClient,
    queryCredits,
    setProcessingTx,
  };

  // add values to provider to reach them out from another component
  return <WalletContext.Provider value={values}>{children}</WalletContext.Provider>;
};

// created custom hook
export const useWallet = (): WalletContextState => useContext(WalletContext);
