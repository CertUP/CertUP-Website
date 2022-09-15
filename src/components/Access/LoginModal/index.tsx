import { useState } from 'react';

import Image from 'react-bootstrap/Image';

import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { useWallet } from '../../../contexts';
import cOnly from '../../../assets/cOnly.svg';
import { AuthenticateButton } from '../../AuthenticateButton';

interface ModalProps {
  issuerLogin?: boolean;
}

export default function LoginModal({ issuerLogin }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const { updateClient, ShowLoginModal, toggleLoginModal, Address } = useWallet();

  const handleClose = () => toggleLoginModal('');
  if (ShowLoginModal === 'issuer')
    return (
      <Modal show={ShowLoginModal ? true : false} onHide={handleClose} size="lg">
        <Modal.Header closeButton className="px-4">
          <Modal.Title>Issuer Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={4} style={{ padding: '3rem' }}>
              <Image src={cOnly} fluid />
            </Col>
            <Col className="px-4 py-4 d-flex justify-content-center align-items-center">
              <Row>
                {/* <h4 className="mb-3">Welcome to CertUP!</h4> */}
                <p style={{ fontSize: '1.12rem' }}>
                  Click the button below to authenticate your wallet with our servers. Just like a
                  query permit, you will be asked to sign a message that allows you to save
                  incomplete projects to our servers. All of your data is fully encrypted using your
                  wallet&apos;s encryption seed.
                </p>
              </Row>
            </Col>
          </Row>
          <Row className="justify-content-center mb-4">
            <Col xs="5">
              <AuthenticateButton callback={handleClose} issuer={true} />
            </Col>
          </Row>
        </Modal.Body>
        {/* <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer> */}
      </Modal>
    );
  else
    return (
      <Modal show={ShowLoginModal ? true : false} onHide={handleClose} size="lg">
        <Modal.Header closeButton className="px-4">
          <Modal.Title>Login to CertUP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={4} style={{ padding: '3rem' }}>
              <Image src={cOnly} fluid />
            </Col>
            <Col className="px-4 py-4 d-flex justify-content-center align-items-center">
              <Row>
                <h4 className="mb-3">Welcome to CertUP!</h4>
                <p style={{ fontSize: '1.12rem' }}>
                  Click the button below to authenticate yourself with our smart contracts. You will
                  be asked to sign a message that allows you to access private infomation within the
                  contract.
                </p>
              </Row>
            </Col>
          </Row>
          <Row className="justify-content-center mb-4">
            <Col xs="5">
              <AuthenticateButton callback={handleClose} />
            </Col>
          </Row>
        </Modal.Body>
        {/* <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer> */}
      </Modal>
    );
}
