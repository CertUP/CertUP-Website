import { createContext, useState, useContext, ReactElement, ReactNode, useEffect } from 'react';
import { useWallet } from '.';
import { toast } from 'react-toastify';
import { BatchNftDossier, NftDossier } from '../interfaces/721';
import useQuery from '../hooks/QueryHook';

export interface NftContextState {
  Dossiers: BatchNftDossier[];
  LoadingNfts: boolean;
  refreshDossiers: () => Promise<void>;
  findNft: (tokenId: string) => NftDossier | undefined;
}

interface Props {
  children: ReactNode;
}

// set default values for initializing
const contextDefaultValues: NftContextState = {
  Dossiers: [],
  LoadingNfts: true,
  refreshDossiers: async function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  findNft: function (tokenId: string): NftDossier {
    throw new Error('Function not implemented.');
  },
};

// created context with default values
const NftContext = createContext<NftContextState>(contextDefaultValues);

export const NftProvider = ({ children }: Props): ReactElement => {
  const [Dossiers, setDossiers] = useState<BatchNftDossier[]>(contextDefaultValues.Dossiers);
  const [Loading, setLoading] = useState<boolean>(contextDefaultValues.LoadingNfts);

  const { Address, QueryPermit, Querier } = useWallet();
  const { getOwnedCerts } = useQuery();

  useEffect(() => {
    if (!Address || !QueryPermit) return;
    refreshDossiers();
  }, [QueryPermit, Address]);

  const refreshDossiers = async () => {
    try {
      setLoading(true);
      const response = await getOwnedCerts();
      setDossiers(response);
    } catch (error: any) {
      console.error('Error loading owned certs: ', error);
      toast.error(`Error loading owned certs: ${error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  // find item by using id value
  const findNft = (tokenId: string): BatchNftDossier | undefined => {
    const dossier = Dossiers.find((token) => token.token_id === tokenId);
    return dossier;
  };

  const values = {
    Dossiers,
    LoadingNfts: Loading,
    refreshDossiers,
    findNft,
  };

  // add values to provider to reach them out from another component
  return <NftContext.Provider value={values}>{children}</NftContext.Provider>;
};

// created custom hook
export const useNft = () => useContext(NftContext);
