import { InitialEntry } from 'history';
import { createGlobalState } from 'react-hooks-global-state';
import { SecretNetworkClient } from 'secretjs';

export interface InitialState {
  secretJs: SecretNetworkClient | undefined;
  isSigner: boolean;
  walletAddress: string;
  queryPermit: any;
}

const initialState: InitialState = {
  secretJs: undefined,
  isSigner: false,
  walletAddress: '',
  queryPermit: undefined,
};

export const { useGlobalState } = createGlobalState(initialState);
