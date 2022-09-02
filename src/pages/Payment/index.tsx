// import styles from "./styles.module.scss"
import { CUButton, Spacer } from '../../components';
import Layout from '../../components/Layout';
import CertUpButton from '../../components/CUButton';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import styles from './styles.module.scss';
import exampleCert from '../../assets/ExampleCert.svg';
import { useWallet } from '../../contexts';
import ConnectBanner from '../../components/ConnectBanner';
import ProjectList from '../../components/ProjectList';
import { ReactNode, useEffect, useState } from 'react';
import ProjectForm from '../../components/ProjectForm';
import Project from '../../interfaces/Project';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Spinner } from 'react-bootstrap';
import { Tx } from 'secretjs';
import { toast } from 'react-toastify';
import { ProgressBar } from '../../components';
import useExecute from '../../hooks/ExecuteHook';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ToastProps } from '../../utils/toastHelper';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import CoinbaseCommerceButton from 'react-coinbase-commerce';

const certPriceSCRT = parseInt(process.env.REACT_APP_USCRT_PRICE, 10); //uscrt
const certPriceUSD = 10; //cents

interface Confirmation {
  string: string;
  number: ReactNode | string;
}

export default function Payment() {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, queryCredits } = useWallet();
  const [loading, setLoading] = useState<boolean>(true);
  const [paid, setPaid] = useState<boolean>(false);
  const [numCerts, setNumCerts] = useState<string>();
  const [totalString, setTotalString] = useState<string>('0 SCRT');
  const [totalUSDString, setTotalUSDString] = useState<string>('$0.00');
  const [totaluSCRT, setTotaluSCRT] = useState<number>(0);
  const [totalUSD, setTotalUSD] = useState<number>(0);
  const [paymentAddr, setPaymentAddr] = useState<string>();
  const [gotError, setGotError] = useState<boolean>(false);
  const [confirmation, setConfirmation] = useState<Confirmation>();
  const [chargeId, setChargeId] = useState<string>();

  const navigate = useNavigate();
  const location = useLocation();
  //const numCerts = location.state?.num_certificates || undefined;

  const { paySSCRT } = useExecute();

  useEffect(() => {
    if (!Address) return;
    console.log('Passed State', location.state);
    if (!location.state?.projectId) {
      navigate('/issuers');
      return;
    }
    init();
  }, [Address]);

  const init = async () => {
    const credits = await queryCredits();
    console.log('Credits', credits);
    if (credits > location.state.num_certificates) {
      navigate('/generate', { state: { projectId: location.state.projectId } });
      return;
    }
    calculateTotalSCRT(location.state.num_certificates.toString() || '0');
    calculateTotalUSD(location.state.num_certificates.toString() || '0');
    getCharge(location.state.num_certificates.toString());
    setLoading(false);
  };

  const calculateTotalSCRT = (numCerts: string) => {
    numCerts = numCerts.replace(/\D/g, '');
    const price = certPriceSCRT; //uscrt
    const total = price * parseInt(numCerts, 10);
    setTotalString(`${total / 10e5} SCRT`);
    setTotaluSCRT(total);
    setNumCerts(numCerts);
  };

  const calculateTotalUSD = (numCerts: string) => {
    numCerts = numCerts.replace(/\D/g, '');
    const price = certPriceUSD; //uscrt
    const total = price * parseInt(numCerts, 10);
    setTotalUSDString(`$${(total / 10e1).toFixed(2)}`);
    setTotalUSD(total);
    setNumCerts(numCerts);
  };

  const getCharge = async (numCert: string) => {
    console.log('Getting Coinbase Charge');
    const numCertNum = parseInt(numCert, 10);
    // const toastRef = toast.loading('Transaction Processing...');
    // const result: Tx | undefined = await Client?.tx.bank.send(
    //   {
    //     fromAddress: Address,
    //     toAddress: paymentAddr || '',
    //     amount: [{ denom: 'uscrt', amount: totaluSCRT.toString() }],
    //   },
    //   {
    //     gasLimit: 20_000,
    //   },
    // );
    // console.log(result);
    // if (!result) throw new Error('Something went wrong');
    // if (result.code) throw new Error(result.rawLog);

    const request = {
      address: Address,
      num_certs: numCertNum,
      issuer_name: 'todo',
    };

    const url = new URL(`/payment/createCharge`, process.env.REACT_APP_BACKEND).toString();

    const chargeResult = await axios.post(url, request);
    console.log(chargeResult);
    //toast.update(toastRef, { render: 'Success!', type: 'success', isLoading: false });

    // if (location.state?.projectId)
    //   navigate('/issuers', { state: { projectId: location.state?.projectId, step: 'generate' } });
    setChargeId(chargeResult.data.chargeCode);
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true }); // the current entry in the history stack will be replaced with the new one with { replace: true }
    }
  };

  const handleUSDPayment = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    toast.error('Not Implemented');
    return null;
  };

  const handleSCRTPayment = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const toastRef = toast.loading('Transaction Processing...');
    try {
      e.preventDefault();
      if (!numCerts) throw new Error('Number of Certs is undefined.');

      const response = await paySSCRT(parseInt(numCerts, 10), totaluSCRT.toString());
      console.log(response);

      toast.update(toastRef, new ToastProps('Success', 'success'));
      setPaid(true);
      setConfirmation({
        string: 'Your transaction hash is',
        number: (
          <a
            href={`https://secretnodes.com/secret/chains/${process.env.REACT_APP_CHAIN_ID}/transactions/${response.transactionHash}`}
            target="_blank"
            rel="noreferrer"
            // style={{
            //   textDecoration: 'underline',
            //   color: '#0000EE',
            // }}
          >
            {response.transactionHash}
          </a>
        ),
      });
    } catch (error: any) {
      toast.update(toastRef, new ToastProps(error.toString(), 'error'));
    }
  };

  const handleContinue = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    navigate('/generate', { state: { projectId: location.state.projectId } });
  };

  if (!Wallet || !Address || !LoginToken)
    return (
      <>
        <Layout>
          <Spacer height={100} />

          <Container>
            <Row>
              <span className={styles.aboutTitle}>Payment</span>
            </Row>
          </Container>
          <Spacer height={50} />

          <ConnectBanner />

          <Spacer height={150} />
        </Layout>
      </>
    );
  return (
    <>
      <Layout>
        <Spacer height={100} />

        <Container>
          <Row>
            <Col xs={2}>
              {/* <button className={styles.cancelBtn} onClick={handleCancel}>
                <FontAwesomeIcon icon={faArrowLeft} /> Go Back
              </button> */}
              <CUButton btnStyle="square" className={styles.cancelBtn} onClick={handleCancel}>
                <FontAwesomeIcon icon={faArrowLeft} /> Go Back
              </CUButton>
            </Col>
            <Col className="text-center">
              <span className={styles.aboutTitle}>Payment</span>
            </Col>
            <Col xs={2}> </Col>
          </Row>
        </Container>
        <ProgressBar step={2} />
        <Spacer height={50} />
        <Container>
          <Row className="justify-content-center">
            <Col xs="6" className="text-center">
              <h4>{numCerts} Certificates</h4>
              TODO show preview
              <hr />
            </Col>
          </Row>
          {loading ? (
            <Spinner animation="border" variant="info" />
          ) : paid ? (
            <>
              {confirmation ? (
                <Row className="justify-content-center text-center mb-4">
                  <Col xs="auto">
                    <h5>{confirmation.string}</h5>
                    <h6>{confirmation.number}</h6>
                  </Col>
                </Row>
              ) : null}
              <Row className="justify-content-center">
                <Col xs="auto">
                  <CUButton disabled={false} fill={true} onClick={handleContinue}>
                    Proceed to Minting
                  </CUButton>
                </Col>
              </Row>
            </>
          ) : (
            <Row>
              <Col>
                <Row className="text-center my-4">
                  <h4>Pay with $SCRT</h4>
                </Row>
                <Form>
                  <Form.Group
                    as={Row}
                    className="mb-3 justify-content-center"
                    controlId="formHorizontalEmail"
                  >
                    <Form.Label column sm={4}>
                      Total
                    </Form.Label>
                    <Col sm={4}>
                      <Form.Control
                        required
                        value={totalString}
                        disabled={true}
                        type="text"
                        placeholder="123"
                      />
                    </Col>
                  </Form.Group>

                  <Row className="justify-content-center">
                    <Col md="7">
                      <CUButton disabled={false} fill={true} onClick={handleSCRTPayment}>
                        Pay with Keplr Wallet
                      </CUButton>
                    </Col>
                  </Row>
                </Form>
              </Col>
              <Col>
                <Row className="text-center my-4">
                  <h4>Pay with Coinbase</h4>
                </Row>
                <Form>
                  <Form.Group
                    as={Row}
                    className="mb-3 justify-content-center"
                    controlId="formHorizontalEmail"
                  >
                    <Form.Label column sm={4}>
                      Total
                    </Form.Label>
                    <Col sm={4}>
                      <Form.Control
                        required
                        value={totalUSDString}
                        disabled={true}
                        type="text"
                        placeholder="123"
                      />
                    </Col>
                  </Form.Group>

                  <Row className="justify-content-center">
                    <Col md="7">
                      <CUButton disabled={!chargeId} fill={true} onClick={handleUSDPayment}>
                        Pay with Coinbase
                      </CUButton>
                      {chargeId ? <CoinbaseCommerceButton chargeId={chargeId} /> : null}
                    </Col>
                  </Row>
                </Form>
              </Col>
            </Row>
          )}
        </Container>
      </Layout>
    </>
  );
}
