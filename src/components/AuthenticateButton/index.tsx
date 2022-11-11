import { useState } from 'react';

import { toast } from 'react-toastify';
import { useWallet } from '../../contexts';
import { getLoginToken, getQueryPermit } from '../../utils/loginPermit';
import CUButton from '../CUButton';

import { useCookies } from 'react-cookie';
import CUSpinner from '../CUSpinner';

interface AButtonProps {
  callback?: () => void;
  issuer?: boolean;
}

export function AuthenticateButton({ callback, issuer }: AButtonProps) {
  const [loading, setLoading] = useState(false);
  const { updateClient, ShowLoginModal, toggleLoginModal, Address } = useWallet();
  const [cookies, setCookie, removeCookie] = useCookies(['IssuerLogin', 'ConnectedKeplr']);

  const handleAuthenticate = async () => {
    setLoading(true);
    try {
      const queryPermit = await getQueryPermit(Address, true);
      updateClient({ permit: queryPermit });
      setCookie('ConnectedKeplr', new Date().toISOString(), { path: '/' });
      setLoading(false);
      if (callback) callback();
    } catch (error: any) {
      console.error(error);
      toast.error(error.toString());
    }
    setLoading(false);
  };

  const handleAuthIssuer = async () => {
    setLoading(true);
    try {
      const loginToken = await getLoginToken(Address);
      updateClient({ token: loginToken });
      setCookie('IssuerLogin', new Date().toISOString(), { path: '/' });
      setLoading(false);
      if (callback) callback();
    } catch (error: any) {
      console.error(error);
      toast.error(error.toString());
    }
    setLoading(false);
  };

  return (
    <CUButton
      disabled={loading}
      onClick={() => {
        if (issuer) handleAuthIssuer();
        else handleAuthenticate();
      }}
    >
      Authenticate {loading && <CUSpinner size="xs" />}
    </CUButton>
  );
}
