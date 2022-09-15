import { faPaste, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactElement, ReactNode, useState } from 'react';
import { toast } from 'react-toastify';
import { useWallet } from '../../../contexts';
import { sleep } from '../../../utils/helpers';
import useExecute from '../../../hooks/ExecuteHook';

import styles from './styles.module.scss';

export interface ButtonProps
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    React.AriaAttributes {
  tokenId: string;
  code?: string;
  address?: string;
  refresher: () => void;
}

export const RemoveButton: React.FC<ButtonProps> = (props) => {
  const { tokenId, code, address, className, refresher, ...rest } = props;
  if (!code && !address)
    throw new Error('RemoveButton must be used with either a code or address prop.');
  if (code && address)
    throw new Error('RemoveButton must be used with either a code or address prop, not both.');

  const { removeAccessCode, removeAddressAccess } = useExecute();
  const { ProcessingTx } = useWallet();

  const [loading, setLoading] = useState(false);

  const removeCode = async () => {
    if (!code) throw new Error('Something went wrong. Code to remove not found.');
    try {
      setLoading(true);
      const toastId = toast.loading('Processing transaction...');

      const result = await removeAccessCode({ tokenId, code, toastRef: toastId });
      // toast.success('Code copied to clipboard.', {autoClose: 1500, pauseOnFocusLoss: false, pauseOnHover: false});
      // await sleep(500);
      refresher();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const removeAddress = async () => {
    if (!address) throw new Error('Something went wrong. Address to remove not found.');
    try {
      setLoading(true);
      const toastId = toast.loading('Processing transaction...');

      const result = await removeAddressAccess({ tokenId, address, toastRef: toastId });
      // toast.success('Code copied to clipboard.', {autoClose: 1500, pauseOnFocusLoss: false, pauseOnHover: false});
      // await sleep(500);
      refresher();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleClick = code ? removeCode : removeAddress;

  return (
    <button
      onClick={() => {
        handleClick();
      }}
      className={`${styles.blankButton} ${styles.removeButton} ${
        loading ? styles.clicked : null
      } ${className}`}
      disabled={ProcessingTx}
    >
      <FontAwesomeIcon icon={faTimesCircle} beatFade={loading} />
    </button>
  );
};

export default RemoveButton;
