import { ReactElement, ReactNode, useEffect } from 'react';
import { useItem, useWallet } from '../../contexts';
import KeplrButton from '../KeplrButton';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
// import cn from 'classnames';
import styles from './styles.module.scss';
import { AuthenticateButton } from '../AuthenticateButton';
import { useCookies } from 'react-cookie';
import { numDaysBetween } from '../../utils/helpers';
import { getLoginToken } from '../../utils/loginPermit';

interface Props {
  text?: string;
  issuer?: boolean;
}

export default function ConnectBanner({ text, issuer }: Props) {
  const { updateClient, Wallet, Address, LoginToken, QueryPermit, toggleLoginModal } = useWallet();

  const [cookies, setCookie, removeCookie] = useCookies(['IssuerLogin']);

  console.log('State', { Wallet, Address, QueryPermit });

  useEffect(() => {
    if (!Address || !Wallet || !issuer) return;
    if (cookies.IssuerLogin) {
      if (
        numDaysBetween(new Date(cookies.IssuerLogin), new Date()) <
        15 /* && getCachedQueryPermit(Address) */
      ) {
        handleLogin();
      }
    } else {
      toggleLoginModal('issuer');
    }
  }, [Address, Wallet]);

  const handleLogin = async () => {
    const loginToken = await getLoginToken(Address);
    updateClient({ token: loginToken });
    setCookie('IssuerLogin', new Date().toISOString(), { path: '/' });
  };

  if (!Address || !Wallet)
    return (
      <Container fluid={true} className={styles.bannerContainer}>
        <Container>
          <Row>
            <span className={styles.bannerTitle}>Connect Wallet</span>
          </Row>
          <Row>
            <span className={styles.bannerSubtitle}>
              {text || 'Connect a wallet to use this function.'}
            </span>
          </Row>
          <Col xs={'auto'}>
            <Row>
              <Col xs={'auto'} className="text-end">
                <KeplrButton />
                <div className="mt-1">
                  <a
                    href="https://keplr.app"
                    className={`${styles.bannerLink}`}
                    target="blank"
                    rel="noopener noreferrer"
                  >
                    Get Keplr Wallet →
                  </a>
                </div>
              </Col>
            </Row>
          </Col>
        </Container>
      </Container>
    );

  if (!QueryPermit)
    return (
      <Container fluid={true} className={styles.bannerContainer}>
        <Container>
          <Row>
            <span className={styles.bannerTitle}>Authenticate Wallet</span>
          </Row>
          <Row>
            <Col xs={12} md={11} lg={9}>
              <p className={`${styles.bannerSubtitle} mx-4`}>
                Finish logging in by signing a query permit. A query permit authenticates you with
                our smart contracts. You will be asked to sign a message that allows you to access
                private infomation within the contract.
              </p>
            </Col>
          </Row>
          <Col xs={'auto'}>
            <Row>
              <Col xs={3} className="text-end mx-4">
                <AuthenticateButton />
                <div className="mt-1">
                  <a
                    href="https://docs.scrt.network/secret-network-documentation/secret-network-overview/privacy-technology/access-control/permits"
                    className={`${styles.bannerLink}`}
                    target="blank"
                    rel="noopener noreferrer"
                  >
                    Learn More about Permits →
                  </a>
                </div>
              </Col>
            </Row>
          </Col>
        </Container>
      </Container>
    );

  if (issuer && !LoginToken)
    return (
      <Container fluid={true} className={styles.bannerContainer}>
        <Container>
          <Row>
            <span className={styles.bannerTitle}>Authenticate Wallet</span>
          </Row>
          <Row>
            <Col xs={12} md={11} lg={9}>
              <p className={`${styles.bannerSubtitle} mx-4`}>
                Start issuing certificates by authenticating your wallet with our servers. You will
                be asked to sign a message that allows you to save and access incomplete certificate
                projects.
              </p>
            </Col>
          </Row>
          <Col xs={'auto'}>
            <Row>
              <Col xs={3} className="text-end mx-4">
                <AuthenticateButton issuer={true} />
              </Col>
            </Row>
          </Col>
        </Container>
      </Container>
    );

  return <h2>Something went wrong.</h2>;
}
