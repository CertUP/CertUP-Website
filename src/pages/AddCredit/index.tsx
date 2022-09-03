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
import { useEffect, useState } from 'react';
import ProjectForm from '../../components/ProjectForm';
import Project from '../../interfaces/Project';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { Tx } from 'secretjs';
import { toast } from 'react-toastify';
import { ProgressBar } from '../../components';

export default function AddCredit() {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken } = useWallet();
  const [numCerts, setNumCerts] = useState<string>();
  const [totalString, setTotalString] = useState<string>('0 SCRT');
  const [totaluSCRT, setTotaluSCRT] = useState<number>(0);
  const [paymentAddr, setPaymentAddr] = useState<string>();
  const [gotError, setGotError] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  //const numCerts = location.state?.num_certificates || undefined;

  useEffect(() => {
    console.log('running effect');
    console.log(location.state);

    calculateTotal(location.state?.num_certificates.toString() || '0');
    getPaymentAddress();

    // if (location.state?.projectId)
    //   navigate('/issuers', { state: { projectId: location.state?.projectId, step: 'generate' } });
  }, []);

  const getPaymentAddress = async () => {
    const url = new URL('/payment', process.env.REACT_APP_BACKEND).toString();
    const {
      data: { payment_address },
    } = await axios.get(url);
    console.log({ payment_address });
    setPaymentAddr(payment_address);
  };

  const calculateTotal = (numCerts: string) => {
    numCerts = numCerts.replace(/\D/g, '');
    const price = 5; //uscrt
    const total = price * parseInt(numCerts, 10);
    setTotalString(`${total / 10e5} SCRT`);
    setTotaluSCRT(total);
    setNumCerts(numCerts);
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true }); // the current entry in the history stack will be replaced with the new one with { replace: true }
    }
  };

  const handlePayment = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const toastRef = toast.loading('Transaction Processing...');
    const result: Tx | undefined = await Client?.tx.bank.send(
      {
        fromAddress: Address,
        toAddress: paymentAddr || '',
        amount: [{ denom: 'uscrt', amount: totaluSCRT.toString() }],
      },
      {
        gasLimit: 20_000,
      },
    );
    console.log(result);
    if (!result) throw new Error('Something went wrong');
    if (result.code) throw new Error(result.rawLog);
    const url = new URL(
      `/payment/${result.transactionHash}`,
      process.env.REACT_APP_BACKEND,
    ).toString();

    const checkResult = await axios.get(url);
    console.log(checkResult);
    toast.update(toastRef, { render: 'Success!', type: 'success', isLoading: false });

    if (location.state?.projectId)
      navigate('/issuers', { state: { projectId: location.state?.projectId, step: 'generate' } });
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

          <ConnectBanner text="Connect a wallet to buy certificate credits." issuer={true} />

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
            <span className={styles.aboutTitle}>Payment</span>
          </Row>
        </Container>
        <ProgressBar step={2} />
        <Spacer height={50} />
        <Container>
          <Row className="justify-content-center">
            <Col xs={'auto'}>
              <span className={styles.payInFont}>Pay in SCRT</span>
            </Col>
          </Row>
          <Row className="justify-content-center" style={{ marginBottom: '25px' }}>
            <Col xs={'auto'}>
              <button className={styles.cancelBtn} onClick={handleCancel}>
                Cancel
              </button>
            </Col>
          </Row>
          <hr />

          <Row className="justify-content-center">
            <Col xs="6">
              <Form>
                <Form.Group
                  as={Row}
                  className="mb-3 justify-content-center"
                  controlId="formHorizontalEmail"
                >
                  <Form.Label column sm={4}>
                    Number of Certificates
                  </Form.Label>
                  <Col sm={4}>
                    <Form.Control
                      required
                      value={numCerts}
                      onChange={(e) => calculateTotal(e.target.value)}
                      type="text"
                      placeholder="123"
                    />
                  </Col>
                </Form.Group>
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
                    <CUButton disabled={false} fill={true} onClick={handlePayment}>
                      Pay with Keplr Wallet
                    </CUButton>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Container>
      </Layout>
    </>
  );
}
