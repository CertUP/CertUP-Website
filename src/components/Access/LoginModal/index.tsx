import { useEffect, useState } from 'react';

import Image from 'react-bootstrap/Image';

import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { useWallet } from '../../../contexts';
import cOnly from '../../../assets/cOnly.svg';
import { AuthenticateButton } from '../../AuthenticateButton';

import styles from './styles.module.scss';
import { NewIssuer } from '../../../interfaces/manager';
import Form from 'react-bootstrap/esm/Form';
import CUButton from '../../CUButton';
import { Id, toast } from 'react-toastify';
import useExecute from '../../../hooks/ExecuteHook';
import CUSpinner from '../../CUSpinner';
import { useIssuer } from '../../../contexts/IssuerContext';

const blankIssuer: NewIssuer = {
  name: undefined,
  website: undefined,
  logo_img_url: undefined,
};

export default function LoginModal() {
  const { ShowLoginModal, toggleLoginModal, ProcessingTx } = useWallet();
  const { registerIssuer } = useExecute();
  const [newIssuerData, setNewIssuerData] = useState<NewIssuer>(blankIssuer);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});

  interface FormErrors {
    name?: any;
  }

  const findFormErrors = (): FormErrors => {
    const { name, website, logo_img_url } = newIssuerData;

    let newErrors: FormErrors = {};
    if (!name || name === '') newErrors = { ...newErrors, name: `Please enter a company or individual's name.` };

    console.log('Errors:', newErrors);
    return newErrors;
  };

  const updateIssuerData = (changedData: any) => {
    setNewIssuerData({
      ...newIssuerData,
      ...changedData,
    });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let toastRef = undefined;
    try {
      const newErrors = findFormErrors();
      // Conditional logic:
      if (Object.keys(newErrors).length > 0) {
        // We got errors!
        setErrors(newErrors);
        return;
      }

      setLoadingUpdate(true);
      toastRef = toast.loading('Processing Transaction...');

      const result = await registerIssuer({
        name: newIssuerData?.name,
        website: newIssuerData?.website,
        logo_img_url: newIssuerData?.logo_img_url,
        toastRef,
      });
      setLoadingUpdate(false);
      toggleLoginModal(undefined);
    } catch (error: any) {
      if (toastRef)
        toast.update(toastRef, {
          render: error.toString(),
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
      console.error(error);
    }
    setLoadingUpdate(false);
  };

  const handleClose = () => {
    toggleLoginModal('');
  };

  if (ShowLoginModal === 'register')
    return (
      <Modal show={ShowLoginModal ? true : false} onHide={handleClose} size="lg">
        <Modal.Header closeButton className="px-4">
          <Modal.Title>Issuer Registration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className={`justify-content-center mb-4 text-center`}>
            <span style={{ fontSize: '24px' }}>
              You have not yet registered as an issuer.
              <br />
              Complete your issuer profile below to register.
            </span>
          </Row>
          <Form
            noValidate
            //as={Row}
            className={`justify-content-center ${styles.certupInputForm}`}
            onSubmit={handleRegister}
          >
            <Row className={`justify-content-center`}>
              <Col md="3" className="pt-4">
                <div className={`${styles.largeLabel} mb-2`} style={{ fontWeight: '600' }}>
                  Logo Preview:
                </div>
                <Row className="mx-4 text-center">
                  <Image src={newIssuerData?.logo_img_url} fluid style={{ maxHeight: '35vh' }} />
                </Row>
              </Col>
              <Col>
                <Col xs={{ span: 12, offset: 0 }}>
                  <Row className="justify-content-center mt-4">
                    <Form.Group as={Col} md="12" controlId="validationCustom01">
                      <Row className="mb-4" style={{ width: '100%' }}>
                        <Col style={{ paddingTop: '0vh' }} xs={{ span: 4, offset: 4 }} md={{ span: 2, offset: 1 }}>
                          <Form.Label className={`${styles.largeLabel} mb-0`}>Name</Form.Label>
                        </Col>
                        <Col style={{ paddingTop: '0vh' }} xs={12} md={8}>
                          <Form.Control
                            required
                            value={newIssuerData?.name}
                            onChange={(e) => {
                              updateIssuerData({ name: e.target.value });
                            }}
                            type="text"
                            placeholder="Corporate Finance Institute"
                            className="mt-1"
                            disabled={loadingUpdate}
                            isInvalid={!!errors.name}
                          />
                          <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                        </Col>
                      </Row>
                    </Form.Group>
                  </Row>

                  <Row className="justify-content-center">
                    <Form.Group as={Col} md="12" controlId="validationCustom01">
                      <Row className="mb-4" style={{ width: '100%' }}>
                        <Col style={{ paddingTop: '0vh' }} xs={{ span: 4, offset: 4 }} md={{ span: 2, offset: 1 }}>
                          <Form.Label className={`${styles.largeLabel} mb-0`}>
                            <div>
                              Website
                              <br />
                              <span className={styles.optional}>Optional</span>
                            </div>
                          </Form.Label>
                        </Col>
                        <Col style={{ paddingTop: '0vh' }} xs={12} md={8}>
                          <Form.Control
                            required
                            value={newIssuerData?.website}
                            onChange={(e) => {
                              updateIssuerData({ website: e.target.value });
                              //setDirty(true);
                            }}
                            type="text"
                            placeholder="https://cfi.org"
                            className="mt-1"
                            disabled={loadingUpdate}
                            //isInvalid={!!errors.projectName}
                          />
                          <Form.Control.Feedback type="invalid">{/* {errors.projectName} */}</Form.Control.Feedback>
                        </Col>
                      </Row>
                    </Form.Group>
                  </Row>

                  <Row className="justify-content-center">
                    <Form.Group as={Col} md="12" controlId="validationCustom01">
                      <Row className="mb-4" style={{ width: '100%' }}>
                        <Col style={{ paddingTop: '0vh' }} xs={{ span: 4, offset: 4 }} md={{ span: 2, offset: 1 }}>
                          <Form.Label className={`${styles.largeLabel} mb-0`}>
                            <div>
                              Logo URL
                              <br />
                              <span className={styles.optional}>Optional</span>
                            </div>
                          </Form.Label>
                        </Col>
                        <Col style={{ paddingTop: '0vh' }} xs={12} md={8}>
                          <Form.Control
                            required
                            value={newIssuerData?.logo_img_url}
                            onChange={(e) => {
                              updateIssuerData({ logo_img_url: e.target.value });
                              //setDirty(true);
                            }}
                            type="text"
                            placeholder="https://cfi.org/logo.png"
                            className="mt-1"
                            disabled={loadingUpdate}
                            //isInvalid={!!errors.projectName}
                          />
                          <Form.Control.Feedback type="invalid">{/* {errors.projectName} */}</Form.Control.Feedback>
                        </Col>
                      </Row>
                    </Form.Group>
                  </Row>
                </Col>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col xs="auto">
                <CUButton btnStyle="square" type="submit" disabled={ProcessingTx}>
                  {loadingUpdate ? (
                    <>
                      <span>Registering</span>&nbsp;
                      <CUSpinner size="xs" />
                    </>
                  ) : (
                    'Register'
                  )}
                </CUButton>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>
    );

  if (ShowLoginModal === 'issuer') {
    const modalText = `Click the button below to authenticate your wallet with our servers. Just like a query permit, you will be asked to sign a message that allows you to save incomplete projects to our servers. All of your data is fully encrypted using your wallet's encryption seed.`;
    return (
      <LoginModalWrapper
        title="Issuer Login"
        body={modalText}
        button={<AuthenticateButton callback={handleClose} issuer={true} />}
        show={ShowLoginModal ? true : false}
        handleClose={handleClose}
      />
    );
  } else {
    const modalText =
      'Click the button below to authenticate yourself with our smart contracts. You will be asked to sign a message that allows you to access private infomation within the contract.';
    return (
      <LoginModalWrapper
        title="Login to CertUP"
        body={modalText}
        button={<AuthenticateButton callback={handleClose} />}
        show={ShowLoginModal ? true : false}
        handleClose={handleClose}
        showWelcome={true}
      />
    );
  }
}

interface WrapperProps {
  title: string;
  body: string;
  button: any;
  show: boolean;
  handleClose: () => any;
  showWelcome?: boolean;
}
function LoginModalWrapper({ title, body, button, show, handleClose, showWelcome }: WrapperProps) {
  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton className="px-4">
        <Modal.Title>
          <img src={cOnly} alt="Logo" style={{ maxHeight: '100%', maxWidth: '10%' }} className="d-md-none" />
          <span className="mx-4">{title}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col xs={4} style={{ padding: '0rem 4rem' }} className="d-none d-md-block pt-2 mt-4">
            <Image src={cOnly} fluid />
          </Col>
          <Col className="px-4 py-4 d-flex flex-column justify-content-center align-items-center">
            <Row>
              {!!showWelcome && <h4 className="mb-3">Welcome to CertUP!</h4>}
              <p style={{ fontSize: '1.12rem', lineHeight: '180%' }}>{body}</p>
            </Row>
          </Col>
        </Row>
        <Row className="justify-content-center mb-4">
          <Col xs="auto">{button}</Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}
