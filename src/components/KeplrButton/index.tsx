/* eslint-disable @typescript-eslint/ban-types */
import { ReactElement, ReactNode, useEffect, useState, forwardRef } from 'react';
import { useItem } from '../../contexts';
// import cn from 'classnames';
import styles from './styles.module.scss';
import logo from './keplrLogo.svg';
import { toast } from 'react-toastify';

import { useCookies } from 'react-cookie';

import { useGlobalState } from '../../state';
import { EncryptionUtils, SecretNetworkClient, Wallet } from 'secretjs';
import { useWallet } from '../../contexts/WalletContext';
import { getErrorMessage, numDaysBetween, reportError } from '../../utils/helpers';
import getPermits, { getCachedQueryPermit, LoginToken } from '../../utils/loginPermit';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate } from 'react-router-dom';
import { ButtonProps } from 'react-bootstrap';

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

const addHours = (date: Date, hours: number): Date => {
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  return date;
};

const truncateAddress = (address: string) => {
  return `secret1...${address.substring(address.length - 7)}`;
};

export default function KeplrButton(): ReactElement {
  const { Address, updateClient } = useWallet();
  const [loading, setLoading] = useState(false);

  const [cookies, setCookie, removeCookie] = useCookies(['ConnectedKeplr']);

  const navigate = useNavigate();

  //const [secretJs, setSecretJs] = useGlobalState('secretJs');
  //const [acctAddr, setAcctAddr] = useGlobalState('walletAddress');
  //const [isSigner, setIsSigner] = useGlobalState('isSigner');

  // eslint-disable-next-line react/display-name
  const CustomToggle = React.forwardRef<HTMLButtonElement, ButtonProps>(
    // eslint-disable-next-line react/prop-types
    ({ onClick }, ref) => (
      <button className={styles.keplrButton} onClick={onClick} ref={ref}>
        <img src={logo} alt="Keplr Wallet" className={styles.keplrLogo} />
        <span>{truncateAddress(Address)}</span>
        <FontAwesomeIcon icon={faAngleDown} style={{ paddingLeft: '.5rem' }} />
      </button>
      // <a
      //   href=""
      //   ref={ref}
      //   onClick={(e) => {
      //     e.preventDefault();
      //     onClick(e);
      //   }}
      // >
      //   {children}
      //   &#x25bc;
      // </a>
    ),
  );

  useEffect(() => {
    if (!window.keplr) return;
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
    try {
      setLoading(true);
      if (!window.keplr || !window.getEnigmaUtils || !window.getOfflineSignerOnlyAmino) {
        toast.error('Keplr Extension Not Found');
        setLoading(false);
        return;
      }

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

      const issueDate = new Date();
      const expDate = addHours(new Date(), 12);
      const { loginPermit: token, queryPermit: permit } = await getPermits(
        myAddress,
        issueDate,
        expDate,
      );
      updateClient(secretjs, keplrOfflineSigner as Wallet, myAddress, token, permit);
      setCookie('ConnectedKeplr', new Date().toISOString(), { path: '/' });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      reportError({ message: getErrorMessage(error) });
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      if (!window.keplr || !window.getEnigmaUtils || !window.getOfflineSignerOnlyAmino) {
        toast.error('Keplr Extension Not Found');
        setLoading(false);
        return;
      }

      updateClient(undefined, undefined, undefined, undefined, undefined);
      removeCookie('ConnectedKeplr', { path: '/' });
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

      <Dropdown.Menu align="end" as={CustomMenu}>
        <Dropdown.Item eventKey="1" onClick={() => handleProfile()}>
          Issuer Profile
        </Dropdown.Item>
        <Dropdown.Item eventKey="2" onClick={() => handleLogout()}>
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
