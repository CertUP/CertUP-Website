import { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useWallet } from '../../contexts';
import { getLoginToken, getQueryPermit } from '../../utils/loginPermit';
import CUButton from '../CUButton';

import { useCookies } from 'react-cookie';

interface AButtonProps {
  callback?: () => void;
  issuer?: boolean;
}

export function AuthenticateButton({ callback, issuer }: AButtonProps) {
  const [loading, setLoading] = useState(false);
  const { updateClient, ShowLoginModal, toggleLoginModal, Address } = useWallet();
  const [cookies, setCookie, removeCookie] = useCookies(['IssuerLogin']);

  const handleAuthenticate = async () => {
    setLoading(true);
    try {
      const queryPermit = await getQueryPermit(Address, true);
      updateClient({ permit: queryPermit });
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
      Authenticate {loading && <Spinner animation="border" variant="info" size="sm" />}
    </CUButton>
  );
}