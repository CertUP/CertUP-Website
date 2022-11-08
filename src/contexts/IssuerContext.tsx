import { createContext, useState, useContext, ReactElement, ReactNode, useEffect } from 'react';

import { toast } from 'react-toastify';
import { Issuer, IssuerDataResponse } from '../interfaces/manager';
import { IssuerDataQueryMsg } from '../utils/queries';
import { queryManagerContract, queryOldManagerContract } from '../utils/queryWrapper';
import { useWallet } from './WalletContext';

export interface IssuerContextState {
  RemainingCerts: number;
  IssuerProfile?: Issuer;
  LoadingRemainingCerts: boolean;
  VerifiedIssuer?: boolean;
  refreshIssuer: () => Promise<number | undefined>;
}

interface Props {
  children: ReactNode;
}

// set default values for initializing
const contextDefaultValues: IssuerContextState = {
  RemainingCerts: 0,
  IssuerProfile: undefined,
  LoadingRemainingCerts: false,
  VerifiedIssuer: undefined,
  refreshIssuer: async function (): Promise<number | undefined> {
    throw new Error('Function not implemented.');
  },
};

// created context with default values
const IssuerContext = createContext<IssuerContextState>(contextDefaultValues);

export const IssuerProvider = ({ children }: Props): ReactElement => {
  const [RemainingCerts, setRemainingCerts] = useState<number>(contextDefaultValues.RemainingCerts);
  const [LoadingRemainingCerts, setLoadingRemainingCerts] = useState<boolean>(
    contextDefaultValues.LoadingRemainingCerts,
  );

  const [IssuerProfile, setIssuerProfile] = useState<Issuer | undefined>(
    contextDefaultValues.IssuerProfile,
  );

  const [VerifiedIssuer, setVerifiedIssuer] = useState<boolean | undefined>(
    contextDefaultValues.VerifiedIssuer,
  );

  const { Querier, QueryPermit, Address, refreshQueryPermit } = useWallet();

  // query credits as soon as permit and querier are available
  useEffect(() => {
    if (!Querier || !QueryPermit) return;
    refreshIssuer(undefined, true);
  }, [QueryPermit, Querier]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Checking for credits...');
      refreshCredits();
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const refreshCredits = async () => {
    //setLoadingRemainingCerts(true);
    try {
      const query = new IssuerDataQueryMsg(Address);

      const response = (await queryManagerContract({
        query,
        signature: QueryPermit,
      })) as IssuerDataResponse;

      if (!response) {
        //setLoadingRemainingCerts(false);
        return;
      }

      const result = parseInt(response.issuer_data.issuer.remaining_certs || '0', 10);
      if (result > (RemainingCerts || 9999999)) {
        const diff = result - RemainingCerts;
        toast.success(`${diff} certificate credits have been credited to your account.`, {
          autoClose: false,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      //setLoadingRemainingCerts(false);
    }
  };

  const refreshIssuer = async (
    queryPermit = QueryPermit,
    force = false,
  ): Promise<number | undefined> => {
    if (!force && LoadingRemainingCerts) return;
    setLoadingRemainingCerts(true);

    let response: IssuerDataResponse | undefined | string;
    const query = new IssuerDataQueryMsg(Address);
    try {
      response = (await queryManagerContract({
        query,
        signature: queryPermit,
        checkErrors: false,
      })) as IssuerDataResponse;

      // Retry with new permit if permit is invalid
      if (response.generic_err?.msg.includes('Failed to verify signatures for the given permit')) {
        await refreshQueryPermit();
        response = (await queryManagerContract({
          query,
          signature: queryPermit,
          checkErrors: false,
        })) as IssuerDataResponse;
      }

      // Check for Query Errors
      if (response?.parse_err || response?.generic_err) {
        // Check if not an issuer
        if (response.generic_err?.msg.includes('not a verified issuer')) {
          setLoadingRemainingCerts(false);
          setVerifiedIssuer(false);
          return;
        }

        // Throw other errors
        const errorMsg =
          response?.parse_err?.msg ||
          response?.generic_err?.msg ||
          JSON.stringify(response, undefined, 2);
        throw new Error(errorMsg);
      }

      // Save results to state
      const result = parseInt(response.issuer_data.issuer.remaining_certs || '0', 10);
      setIssuerProfile(response.issuer_data.issuer);
      setRemainingCerts(result);
      setVerifiedIssuer(true);
      setLoadingRemainingCerts(false);
      return result;
    } catch (error: any) {
      console.error(error);
      if (
        error.toString().includes('Network Error') ||
        error.toString().includes('503') ||
        error.toString().includes('Response closed without headers')
      ) {
        toast.error(
          'Failed to load issuer status: Failed to query network. Out nodes may be experiencing issues. Please try again.',
        );
      } else {
        toast.error(`Failed to load issuer status: ${error.toString()}`);
      }
    } finally {
      setLoadingRemainingCerts(false);
    }
  };

  const values = {
    RemainingCerts,
    IssuerProfile,
    LoadingRemainingCerts,
    refreshIssuer,
    VerifiedIssuer,
  };

  // add values to provider to reach them out from another component
  return <IssuerContext.Provider value={values}>{children}</IssuerContext.Provider>;
};

// created custom hook
export const useIssuer = (): IssuerContextState => useContext(IssuerContext);
