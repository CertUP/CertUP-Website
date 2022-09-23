/* eslint-disable jsx-a11y/anchor-is-valid */
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useWallet } from '../contexts';

export const RestrictedAccess = () => {
  const { toggleLoginModal, VerifiedIssuer } = useWallet();
  useEffect(() => {
    if (!VerifiedIssuer && process.env.REACT_APP_SELF_REGFISTER === 'true') {
      toggleLoginModal('register');
    }
  }, []);

  if (process.env.REACT_APP_SELF_REGFISTER === 'true') {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col className="text-center" md={8} xs={12}>
            <h4>
              <p>
                You have not yet registered your issuer profile.{' '}
                <a href="#" onClick={() => toggleLoginModal('register')}>
                  Click Here
                </a>{' '}
                to complete your profile.
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
              You are not a verified certificate issuer. Early access is restricted to verified
              issuers. Please <Link to="/contact">Contact Us</Link> for access.
            </p>
          </h4>
        </Col>
      </Row>
    </Container>
  );
};
