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
import useQuery, { PermitQuery, queryWithClient } from '../hooks/QueryHook';
import { migrateIssuer } from '../utils/backendHelper';
import { AxiosError } from 'axios';
import { ToastProps } from '../utils/toastHelper';

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
  RemainingCerts: number;
  IssuerProfile?: Issuer;
  LoadingRemainingCerts: boolean;
  ProcessingTx: boolean;
  VerifiedIssuer?: boolean;
  MigrationNeeded: boolean;
  DummyWallet?: DummyWallet;
  ShowLoginModal: string;
  toggleLoginModal: (state?: string) => void;
  updateClient: (props: UpdateClientProps) => void;
  setProcessingTx: (newState: boolean) => void;
  queryCredits: () => Promise<number | undefined>;
  clearToken: () => void;
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
  LoadingRemainingCerts: false,
  ProcessingTx: false,
  VerifiedIssuer: undefined,
  MigrationNeeded: false,
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
  clearToken: function (): void {
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

  const [VerifiedIssuer, setVerifiedIssuer] = useState<boolean | undefined>(
    contextDefaultValues.VerifiedIssuer,
  );
  const [MigrationNeeded, setMigrationNeeded] = useState<boolean>(
    contextDefaultValues.MigrationNeeded,
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

  const clearToken = () => {
    setLoginToken(undefined);
  };

  // query credits as soon as permit and querier are available
  useEffect(() => {
    if (!Querier || !QueryPermit) return;
    queryCredits(undefined, true);
  }, [QueryPermit, Querier]);

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

  const queryWrapper = async ({
    queryPermit = QueryPermit,
    contractAddress = process.env.REACT_APP_MANAGER_ADDR,
    codeHash = process.env.REACT_APP_MANAGER_HASH,
  }: {
    queryPermit?: PermitSignature;
    contractAddress?: string;
    codeHash?: string;
  }): Promise<IssuerDataResponse | void> => {
    if (!Querier) throw new Error('Querier unavailable for Issuer Status query');
    if (!queryPermit) throw new Error('Query Permit unavailable for Issuer Status query');

    const qMsg = {
      issuer_data: {
        viewer: {
          address: Address,
        },
      },
    };
    const query = new PermitQuery(qMsg, queryPermit);

    let response = (await Client?.query.compute.queryContract({
      contractAddress,
      codeHash,
      query,
    })) as IssuerDataResponse | string;

    // Parse error string into object
    if (typeof response === 'string' || response instanceof String)
      response = JSON.parse(response as string) as IssuerDataResponse;

    if (response?.parse_err || response?.generic_err) {
      if (response.generic_err?.msg.includes('not a verified issuer')) {
        //No issuer data to return
        return;
      } else if (
        response.generic_err?.msg.includes('Failed to verify signatures for the given permit')
      ) {
        await refreshQueryPermit();
        return await queryWrapper({ queryPermit });
      } else {
        const errorMsg =
          response?.parse_err?.msg ||
          response?.generic_err?.msg ||
          JSON.stringify(response, undefined, 2);
        throw new Error(errorMsg);
      }
    }

    return response;
  };

  const queryCredits = async (
    queryPermit = QueryPermit,
    force = false,
  ): Promise<number | undefined> => {
    if (!force && LoadingRemainingCerts) return;

    setLoadingRemainingCerts(true);

    let response: IssuerDataResponse | undefined;
    try {
      response = (await queryWrapper({})) || undefined;

      // No response means not an issuer
      if (!response && process.env.REACT_APP_OLD_MANAGER_ADDR) {
        console.trace('checking old contract');
        //check old contract for potential upgrade
        const oldResponse = await queryWrapper({
          contractAddress: process.env.REACT_APP_OLD_MANAGER_ADDR,
          codeHash: process.env.REACT_APP_OLD_MANAGER_HASH,
        });

        if (oldResponse) {
          console.log('Old Issuer Profile', oldResponse);
          if (oldResponse.issuer_data.issuer.migrated === false) {
            const toastRef = toast.loading('Migrating issuer profile to new contract...');
            try {
              const migrateResult = await migrateIssuer(Address);
              console.log(migrateResult);
              response = (await queryWrapper({})) || undefined;
              toast.update(
                toastRef,
                new ToastProps(`Successfully migrated your issuer profile.`, 'success'),
              );
            } catch (error: any) {
              setMigrationNeeded(true);
              console.error(error);
              toast.update(
                toastRef,
                new ToastProps(
                  `Error migrating. Please contact support.\n${
                    error.response.data ? JSON.stringify(error.response.data) : error.toString()
                  }`,
                  'error',
                ),
              );
            }
          } else if (oldResponse.issuer_data.issuer.migrated === true) {
            throw 'Error attempting to migrate: Issuer is already migrated. Please contact support.';
          }
        }
      }

      if (!response) {
        setLoadingRemainingCerts(false);
        setVerifiedIssuer(false);
        return;
      }

      const result = parseInt(response.issuer_data.issuer.remaining_certs || '0', 10);
      setIssuerProfile(response.issuer_data.issuer);
      setRemainingCerts(result);
      setVerifiedIssuer(true);
      setLoadingRemainingCerts(false);
      return result;

      // // Handle Errors
      // if (response?.parse_err || response?.generic_err) {
      //   if (response.generic_err?.msg.includes('not a verified issuer')) {
      //     // check old contract for potential upgrade
      //     // if (process.env.REACT_APP_OLD_MANAGER_ADDR) {
      //     //   let oldResponse = (await Client?.query.compute.queryContract({
      //     //     contractAddress: process.env.REACT_APP_OLD_MANAGER_ADDR,
      //     //     codeHash: process.env.REACT_APP_MANAGER_HASH,
      //     //     query: query,
      //     //   })) as IssuerDataResponse | string;

      //     //   // Parse error string into object
      //     //   if (typeof oldResponse === 'string' || oldResponse instanceof String)
      //     //     oldResponse = JSON.parse(oldResponse as string) as IssuerDataResponse;

      //       if (oldResponse?.parse_err || oldResponse?.generic_err) {
      //         if (oldResponse.generic_err?.msg.includes('not a verified issuer')) {
      //           setLoadingRemainingCerts(false);
      //           setVerifiedIssuer(false);
      //         } else {
      //           const errorMsg =
      //             response?.parse_err?.msg ||
      //             response?.generic_err?.msg ||
      //             JSON.stringify(response, undefined, 2);
      //           toast.error(errorMsg);
      //         }
      //       }
      //     } else {
      //       const errorMsg =
      //         response?.parse_err?.msg ||
      //         response?.generic_err?.msg ||
      //         JSON.stringify(response, undefined, 2);
      //       toast.error(errorMsg);
      //     }
      //     return;
      //   } else if (
      //     response.generic_err?.msg.includes('Failed to verify signatures for the given permit')
      //   ) {
      //     await refreshQueryPermit();
      //     return;
      //   } else {
      //     const errorMsg =
      //       response?.parse_err?.msg ||
      //       response?.generic_err?.msg ||
      //       JSON.stringify(response, undefined, 2);

      //     toast.error(errorMsg);
      //     // throw new Error(
      //     //   response?.parse_err?.msg ||
      //     //     response?.generic_err?.msg ||
      //     //     JSON.stringify(response, undefined, 2),
      //     // );
      //   }

      // setLoadingRemainingCerts(false);
      // } else {
      //   const result = parseInt(response.issuer_data.issuer.remaining_certs || '0', 10);
      //   setIssuerProfile(response.issuer_data.issuer);
      //   setRemainingCerts(result);
      //   setVerifiedIssuer(true);
      //   setLoadingRemainingCerts(false);
      //   return result;
      // }
    } catch (error: any) {
      console.error(error);
      if (
        error.toString().includes('Network Error') ||
        error.toString().includes('503') ||
        error.toString().includes('Response closed without headers')
      ) {
        toast.error(
          'Failed to load issuer status: Failed to query network. The node may be experiencing issues.',
        );
      } else {
        toast.error(`Failed to load issuer status: ${error.toString()}`);
      }
    } finally {
      setLoadingRemainingCerts(false);
    }
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
    clearToken,
    VerifiedIssuer,
    MigrationNeeded,
  };

  // add values to provider to reach them out from another component
  return <WalletContext.Provider value={values}>{children}</WalletContext.Provider>;
};

// created custom hook
export const useWallet = (): WalletContextState => useContext(WalletContext);
