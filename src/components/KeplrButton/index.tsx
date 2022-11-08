/* eslint-disable @typescript-eslint/ban-types */
import { ReactElement, ReactNode, useEffect, useState, forwardRef } from 'react';
// import cn from 'classnames';
import styles from './styles.module.scss';
import logo from './keplrLogo.svg';
import { toast } from 'react-toastify';

import { useCookies } from 'react-cookie';

import { useGlobalState } from '../../state';
import { EncryptionUtils, SecretNetworkClient, Wallet } from 'secretjs';
import { useWallet } from '../../contexts/WalletContext';
import {
  getErrorMessage,
  numDaysBetween,
  reportError,
  sleep,
  suggestTestnet,
} from '../../utils/helpers';
import getPermits, {
  getCachedLoginToken,
  getCachedQueryPermit,
  isExpired,
  LoginToken,
} from '../../utils/loginPermit';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate } from 'react-router-dom';
import { ButtonProps } from 'react-bootstrap';
import { useIssuer } from '../../contexts/IssuerContext';

type DivProps = JSX.IntrinsicElements['div'];

// eslint-disable-next-line react/display-name
const CustomMenu = React.forwardRef<HTMLDivElement, DivProps>((props, ref) => {
  // eslint-disable-next-line react/prop-types
  const { children, style, className, 'aria-labelledby': labeledBy } = props;

  return (
    <div ref={ref} style={{ width: '100%' }} className="d-flex justify-content-end">
      <div style={style} className={className} aria-labelledby={labeledBy}>
        <ul className="list-unstyled mb-1">
          {React.Children.toArray(children).map((child) => child)}
          {/* {React.Children.toArray(children).filter(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          (child) => !value || child.props.children.toLowerCase().startsWith(value),
        )} */}
        </ul>
      </div>
    </div>
  );
});

const handleCopy = async (address: string) => {
  navigator.clipboard.writeText(address);
  toast.success(`Address copied to clipboard.`, {
    autoClose: 1500,
    pauseOnFocusLoss: false,
    pauseOnHover: false,
  });
};

const truncateAddress = (address: string) => {
  return `secret1...${address.substring(address.length - 7)}`;
};

interface KeplrButtonProps {
  // Determines if the button will attempt to autoconnect if a recent logon cookie is found.
  autoConnect?: boolean;
}

export default function KeplrButton({ autoConnect }: KeplrButtonProps): ReactElement {
  const { Address, updateClient, toggleLoginModal } = useWallet();
  const { IssuerProfile } = useIssuer();
  const [loading, setLoading] = useState(false);

  const [cookies, setCookie, removeCookie] = useCookies(['ConnectedKeplr', 'IssuerLogin']);

  const navigate = useNavigate();

  // eslint-disable-next-line react/display-name
  const CustomToggle = React.forwardRef<HTMLButtonElement, ButtonProps>(
    // eslint-disable-next-line react/prop-types
    ({ onClick }, ref) => (
      <button className={styles.keplrButton} onClick={onClick} ref={ref}>
        <img src={logo} alt="Keplr Wallet" className={styles.keplrLogo} />
        <span>{truncateAddress(Address)}</span>
        <FontAwesomeIcon icon={faAngleDown} style={{ paddingLeft: '.5rem' }} />
      </button>
    ),
  );

  useEffect(() => {
    if (!autoConnect) return;
    if (!window.keplr || !window.getOfflineSignerOnlyAmino || !window.getOfflineSignerOnlyAmino)
      sleep(100);
    if (!window.keplr || !window.getOfflineSignerOnlyAmino || !window.getOfflineSignerOnlyAmino)
      sleep(300);
    if (!window.keplr || !window.getOfflineSignerOnlyAmino || !window.getOfflineSignerOnlyAmino)
      sleep(500);
    if (!window.keplr || !window.getOfflineSignerOnlyAmino || !window.getOfflineSignerOnlyAmino)
      return;

    if (cookies.ConnectedKeplr) {
      if (
        numDaysBetween(new Date(cookies.ConnectedKeplr), new Date()) <
        15 /* && getCachedQueryPermit(Address) */
      ) {
        handleConnect();
      }
    }
  }, [window.keplr]);

  const handleConnect = async () => {
    if (loading) return;
    try {
      setLoading(true);
      if (!window.keplr || !window.getEnigmaUtils || !window.getOfflineSignerOnlyAmino) {
        toast.error('Keplr Extension Not Found');
        setLoading(false);
        return;
      }

      if (process.env.REACT_APP_CHAIN_ID.includes('pulsar')) await suggestTestnet();
      await window.keplr.enable(process.env.REACT_APP_CHAIN_ID as string);

      const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(
        process.env.REACT_APP_CHAIN_ID as string,
      );
      const [{ address: myAddress }] = await keplrOfflineSigner.getAccounts();

      const secretjs = await SecretNetworkClient.create({
        grpcWebUrl: process.env.REACT_APP_GRPC_URL as string,
        chainId: process.env.REACT_APP_CHAIN_ID as string,
        wallet: keplrOfflineSigner,
        walletAddress: myAddress,
        encryptionUtils: window.getEnigmaUtils(process.env.REACT_APP_CHAIN_ID as string),
      });

      //check for QUERY permit from storage, use modal if it isnt there
      const cachedPermit = getCachedQueryPermit(myAddress);
      if (!cachedPermit) {
        updateClient({
          client: secretjs,
          wallet: keplrOfflineSigner as Wallet,
          address: myAddress,
        });
        toggleLoginModal('true');
        setLoading(false);
        return; //modal will handle the rest
      }

      //check for LOGIN permit from storage
      const cachedToken = getCachedLoginToken(myAddress);
      if (cachedToken && !isExpired(cachedToken)) {
        updateClient({
          client: secretjs,
          wallet: keplrOfflineSigner as Wallet,
          address: myAddress,
          permit: cachedPermit,
          token: cachedToken,
        });
      } else {
        updateClient({
          client: secretjs,
          wallet: keplrOfflineSigner as Wallet,
          address: myAddress,
          permit: cachedPermit,
        });
      }

      setCookie('ConnectedKeplr', new Date().toISOString(), { path: '/' });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      reportError({ message: getErrorMessage(error) });
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      if (!window.keplr || !window.getEnigmaUtils || !window.getOfflineSignerOnlyAmino) {
        toast.error('Keplr Extension Not Found');
        setLoading(false);
        return;
      }

      updateClient({ force: true });
      removeCookie('ConnectedKeplr', { path: '/' });
      removeCookie('IssuerLogin', { path: '/' });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      reportError({ message: getErrorMessage(error) });
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  //const { Items } = useItem();
  //console.log(Items);
  // return loading ? (
  //   <button className={styles.keplrButton} style={{ cursor: 'wait' }}>
  //     <img src={logo} alt="Keplr Wallet" className={styles.keplrLogo} />
  //     <span>Connecting Keplr</span>
  //   </button>
  // ) : Address ? (
  //   <button className={styles.keplrButton} style={{ cursor: 'default' }}>
  //     <img src={logo} alt="Keplr Wallet" className={styles.keplrLogo} />
  //     <span>{truncateAddress(Address)}</span>
  //   </button>
  // ) : (
  //   <button className={styles.keplrButton} onClick={() => handleConnect()}>
  //     <img src={logo} alt="Keplr Wallet" className={styles.keplrLogo} />
  //     <span>Connect to Keplr!</span>
  //   </button>
  // );
  return loading ? (
    <button className={styles.keplrButton} style={{ cursor: 'wait' }}>
      <img src={logo} alt="Keplr Wallet" className={styles.keplrLogo} />
      <span>Loading Keplr</span>
    </button>
  ) : Address ? (
    // <DropdownButton className={styles.keplrButton} style={{ cursor: 'default' }}>
    //   <img src={logo} alt="Keplr Wallet" className={styles.keplrLogo} />
    //   <span>{truncateAddress(Address)}</span>
    // </DropdownButton>
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
        Custom toggle
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" as={CustomMenu} className="text-center">
        <Dropdown.Item eventKey="1" onClick={() => handleCopy(Address)}>
          Copy Wallet Address
        </Dropdown.Item>
        {IssuerProfile ? (
          <Dropdown.Item eventKey="2" onClick={() => handleProfile()}>
            Issuer Profile
          </Dropdown.Item>
        ) : null}
        <Dropdown.Item eventKey="3" onClick={() => handleLogout()}>
          Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  ) : (
    <button className={styles.keplrButton} onClick={() => handleConnect()}>
      <img src={logo} alt="Keplr Wallet" className={styles.keplrLogo} />
      <span>Connect to Keplr!</span>
    </button>
  );
}
