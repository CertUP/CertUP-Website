import { createContext, useState, useContext, ReactElement, ReactNode, useEffect } from 'react';
import Project from '../interfaces/Project';
// import { getRandom } from '../utils/helpers';
import { nanoid } from 'nanoid'; // TODO: DELETE HERE IF IT IS NOT NECESSARY
import { useWallet } from '.';
import axios from 'axios';
import { toast } from 'react-toastify';
import { dataURLtoFile } from '../utils/fileHelper';
import { NftDossier } from '../interfaces';
import useQuery from '../hooks/QueryHook';

const projectsUrl = new URL('/projects', process.env.REACT_APP_BACKEND).toString();

export interface NftContextState {
  Inventory: string[];
  Dossiers: NftDossier[];
  LoadingNfts: boolean;
  refreshInventory: () => Promise<void>;
  refreshDossiers: () => Promise<void>;
  findNft: (tokenId: string) => NftDossier | undefined;
}

interface Props {
  children: ReactNode;
}

// set default values for initializing
const contextDefaultValues: NftContextState = {
  Inventory: [],
  Dossiers: [],
  LoadingNfts: true,
  refreshInventory: async function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
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
  const [Inventory, setInventory] = useState<string[]>(contextDefaultValues.Inventory);
  const [Dossiers, setDossiers] = useState<NftDossier[]>(contextDefaultValues.Dossiers);
  const [Loading, setLoading] = useState<boolean>(contextDefaultValues.LoadingNfts);

  const { Address, QueryPermit, Querier } = useWallet();
  const { getOwnedCerts } = useQuery();

  // useEffect(() => {
  //   if (!Address || !QueryPermit) return;
  //   refreshProjects();
  // }, [LoginToken, Address]);

  const refreshInventory = async () => {
    setLoading(true);
    const response = await getOwnedCerts();
    setDossiers(response);
    setLoading(false);
  };

  const refreshDossiers = async () => {
    setLoading(true);
    const response = await getOwnedCerts();
    console.log('dossiers response', response);
    setDossiers(response);
    setLoading(false);
  };

  // find item by using id value
  const findNft = (tokenId: string): NftDossier | undefined => {
    const dossier = Dossiers.find((token) => token.token_id === tokenId);
    return dossier;
  };

  const values = {
    Inventory,
    Dossiers,
    LoadingNfts: Loading,
    refreshInventory,
    refreshDossiers,
    findNft,
  };

  // add values to provider to reach them out from another component
  return <NftContext.Provider value={values}>{children}</NftContext.Provider>;
};

// created custom hook
export const useNft = () => useContext(NftContext);
