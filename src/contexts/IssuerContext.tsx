import { createContext, useState, useContext, ReactElement, ReactNode, useEffect } from 'react';
import context from 'react-bootstrap/esm/AccordionContext';

import { toast } from 'react-toastify';
import { Issuer, IssuerDataResponse } from '../interfaces/manager';
import { IssuerDataQueryMsg } from '../utils/queries/managerQueries';
import { queryManagerContract, queryOldManagerContract } from '../utils/queryWrapper';
import { useWallet } from './WalletContext';
import LogRocket from 'logrocket';

export interface IssuerContextState {
  RemainingCerts: number;
  IssuerProfile?: Issuer;
  LoadingRemainingCerts: boolean;
  VerifiedIssuer?: boolean;
  isOperator: boolean;
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
  isOperator: false,
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
  const [LoadingOperator, setLoadingOperator] = useState<boolean>(false);

  const [IssuerProfile, setIssuerProfile] = useState<Issuer | undefined>(contextDefaultValues.IssuerProfile);

  const [VerifiedIssuer, setVerifiedIssuer] = useState<boolean | undefined>(contextDefaultValues.VerifiedIssuer);
  const [isOperator, setIsOperator] = useState<boolean>(contextDefaultValues.isOperator);

  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timer>();

  const { Querier, QueryPermit, Address, refreshQueryPermit, DummyWallet } = useWallet();

  // query credits as soon as permit and querier are available
  useEffect(() => {
    if (!QueryPermit) return;
    console.log('Permit Updated!', QueryPermit);
    refreshIssuer(undefined, true);
    refreshOperator(undefined, true);
  }, [QueryPermit]);

  useEffect(() => {
    if (!Address) return;
    console.log('RemainingCerts updated', RemainingCerts);
    const key = `CertUP-Cert-Credits-v1-${Address}`;

    const storedCredits = localStorage.getItem(key);
    if (storedCredits) {
      const previousRemaining = parseInt(storedCredits);
      if (RemainingCerts && RemainingCerts > previousRemaining) {
        const diff = RemainingCerts - previousRemaining;
        const message = (
          <>
            {diff.toLocaleString()} certificate credits have been credited to your account.
            <br />
            You now have {RemainingCerts.toLocaleString()} credits.
          </>
        );
        toast.info(message, {
          autoClose: false,
        });
      }
    }
    localStorage.setItem(key, RemainingCerts.toString());
  }, [RemainingCerts]);

  useEffect(() => {
    if (refreshInterval) clearInterval(refreshInterval);

    if (!QueryPermit) return;
    const interval = setInterval(() => {
      console.log('Checking for credits...', QueryPermit);
      refreshCredits(QueryPermit);
    }, 30_000);
    setRefreshInterval(interval);
    return () => clearInterval(interval);
  }, [QueryPermit]);

  const refreshCredits = async (queryPermit = QueryPermit) => {
    if (!queryPermit) return;
    //setLoadingRemainingCerts(true);
    try {
      const query = new IssuerDataQueryMsg({ viewer: Address });

      const response = (await queryManagerContract({
        query,
        signature: queryPermit,
      })) as IssuerDataResponse;

      if (!response) {
        //setLoadingRemainingCerts(false);
        return;
      }

      const result = parseInt(response.issuer_data.issuer.remaining_certs || '0', 10);
      setRemainingCerts(result);
      // if (result > (RemainingCerts || 9999999)) {
      //   const diff = result - RemainingCerts;
      //   toast.success(`${diff} certificate credits have been credited to your account.`, {
      //     autoClose: false,
      //   });
      // }
    } catch (error) {
      console.error(error);
    } finally {
      //setLoadingRemainingCerts(false);
    }
  };

  const refreshIssuer = async (queryPermit = QueryPermit, force = false): Promise<number | undefined> => {
    if (!force && LoadingRemainingCerts) return;
    setLoadingRemainingCerts(true);

    let response: IssuerDataResponse | undefined | string;
    const query = new IssuerDataQueryMsg({ viewer: Address });
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
          response?.parse_err?.msg || response?.generic_err?.msg || JSON.stringify(response, undefined, 2);
        throw new Error(errorMsg);
      }

      // Save results to state
      const result = parseInt(response.issuer_data.issuer.remaining_certs || '0', 10);
      setIssuerProfile(response.issuer_data.issuer);
      setRemainingCerts(result);
      setVerifiedIssuer(true);
      setLoadingRemainingCerts(false);

      // Identify user for LogRocket
      const fields: any = {};
      if (response.issuer_data.issuer.name) fields.name = response.issuer_data.issuer.name;
      if (response.issuer_data.issuer.verified_name) fields.verified_name = response.issuer_data.issuer.verified_name;
      LogRocket.identify(Address, {
        ...fields,
        verified: response.issuer_data.issuer.verified,
      });

      return result;
    } catch (error: any) {
      console.error(error);
      if (
        error.toString().includes('Network Error') ||
        error.toString().includes('503') ||
        error.toString().includes('Response closed without headers')
      ) {
        toast.error(
          'Failed to load issuer status: Failed to query network. Our nodes may be experiencing issues. Please try again.',
        );
      } else {
        toast.error(`Failed to load issuer status: ${error.toString()}`);
      }
    } finally {
      setLoadingRemainingCerts(false);
    }
  };

  const refreshOperator = async (queryPermit = QueryPermit, force = false): Promise<boolean | undefined> => {
    if (!force && LoadingOperator) return;
    setLoadingOperator(true);

    let response: IssuerDataResponse | undefined | string;
    const query = new IssuerDataQueryMsg({
      viewer: Address,
      issuer: DummyWallet?.address || 'secret13xhm2y4dyn9n3caclt629ddmy0jfgd0djay974',
    });
    try {
      response = (await queryManagerContract({
        query,
        signature: queryPermit,
        checkErrors: false,
      })) as IssuerDataResponse;

      // This isnt important for most users, refreshIssuer will handle it then operators can just refresh to fix this query
      if (response.generic_err?.msg.includes('Failed to verify signatures for the given permit')) {
        return;
      }

      // Check for Query Errors
      if (response?.parse_err || response?.generic_err) {
        // Check if not an operator
        if (response.generic_err?.msg.includes('operator command')) {
          setLoadingOperator(false);
          setIsOperator(false);
          return false;
        }

        // Throw other errors
        const errorMsg =
          response?.parse_err?.msg || response?.generic_err?.msg || JSON.stringify(response, undefined, 2);
        throw new Error(errorMsg);
      }

      // Save results to state if an operator
      setIsOperator(true);
      setLoadingOperator(false);
      console.log('You are a CertUP operator!');
      return true;
    } catch (error: any) {
      console.error('Failed to load operator status:', error);
    } finally {
      setLoadingOperator(false);
    }
  };

  const values = {
    RemainingCerts,
    IssuerProfile,
    LoadingRemainingCerts,
    refreshIssuer,
    VerifiedIssuer,
    isOperator,
  };

  // add values to provider to reach them out from another component
  return <IssuerContext.Provider value={values}>{children}</IssuerContext.Provider>;
};

// created custom hook
export const useIssuer = (): IssuerContextState => useContext(IssuerContext);
