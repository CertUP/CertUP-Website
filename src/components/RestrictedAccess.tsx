/* eslint-disable jsx-a11y/anchor-is-valid */
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useWallet } from '../contexts';
import { useIssuer } from '../contexts/IssuerContext';

export const RestrictedAccess = ({ text }: { text?: string }) => {
  const { toggleLoginModal } = useWallet();
  const { VerifiedIssuer } = useIssuer();
  useEffect(() => {
    if (VerifiedIssuer === false && process.env.REACT_APP_SELF_REGFISTER === 'true') {
      toggleLoginModal('register');
    }
  }, []);

  if (text)
    return (
      <Container>
        <Row className="justify-content-center">
          <Col className="text-center" md={8} xs={12}>
            <h4>
              <p>{text}</p>
            </h4>
          </Col>
        </Row>
      </Container>
    );

  // if (MigrationNeeded) {
  //   return (
  //     <Container>
  //       <Row className="justify-content-center">
  //         <Col className="text-center" md={10} xs={12}>
  //           <h4>
  //             <p style={{ lineHeight: 1.5 }}>
  //               We encounted an error migrating your issuer profile to our new contract.
  //               <br />
  //               Please{' '}
  //               <a href="javascript:window.location.href=window.location.href">
  //                 refresh the page
  //               </a>{' '}
  //               to try again or <Link to="/contact">Contact Us</Link> for asistance.
  //             </p>
  //           </h4>
  //         </Col>
  //       </Row>
  //     </Container>
  //   );
  // }

  if (process.env.REACT_APP_SELF_REGFISTER === 'true') {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col className="text-center" md={8} xs={12}>
            <h4>
              <p style={{ lineHeight: 1.5 }}>
                You have not yet registered as an issuer.
                <br />
                <a href="#" onClick={() => toggleLoginModal('register')}>
                  Click Here
                </a>{' '}
                to register.
              </p>
            </h4>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col className="text-center" md={8} xs={12}>
          <h4>
            <p>
              You are not a verified certificate issuer. Early access is restricted to verified issuers. Please{' '}
              <Link to="/contact">Contact Us</Link> for access.
            </p>
          </h4>
        </Col>
      </Row>
    </Container>
  );
};
