import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import { useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { useWallet } from '../../contexts';
import useExecute from '../../hooks/ExecuteHook';
import CUButton from '../CUButton';
import { ToastProps } from '../../utils/toastHelper';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import CoinbaseCommerceButton from 'react-coinbase-commerce';

import btnStyles from '../CUButton/styles.module.scss';

const certPriceSCRT = parseInt(process.env.REACT_APP_USCRT_PRICE, 10); //uscrt

export interface Confirmation {
  string: string;
  number: ReactNode | string;
}

interface PRProps {
  num_certs?: number;
  editable?: boolean;
  onPaid?: (confirmation: Confirmation) => void;
}

export default function PaymentRow({ num_certs = 0, editable = true }: PRProps) {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, queryCredits } = useWallet();

  const [loading, setLoading] = useState<boolean>(true);
  const [certPriceUsd, setCertPriceUsd] = useState(0);
  const [numCerts, setNumCerts] = useState<number>(num_certs);
  const [totalString, setTotalString] = useState<string>('0 SCRT');
  const [totalUSDString, setTotalUSDString] = useState<string>('$0.00');
  const [totaluSCRT, setTotaluSCRT] = useState<number>(0);
  const [totalUSD, setTotalUSD] = useState<number>(0);
  const [gotError, setGotError] = useState<boolean>(false);
  const [chargeId, setChargeId] = useState<string>();

  const [paid, setPaid] = useState<boolean>(false);
  const [confirmation, setConfirmation] = useState<Confirmation>();

  const [showCoinbase, setShowCoinbase] = useState(false);

  const { paySSCRT } = useExecute();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!numCerts) return;
    calculateTotalSCRT(numCerts);
    calculateTotalUSD(numCerts);
  }, [numCerts]);

  useEffect(() => {
    if (!numCerts) return;
    calculateTotalUSD(numCerts);
  }, [certPriceUsd]);

  const init = async () => {
    await getPaymentInfo();
    getCharge(numCerts);
    setLoading(false);
  };

  const getPaymentInfo = async () => {
    const url = new URL('/payment', process.env.REACT_APP_BACKEND).toString();
    const {
      data: { usd_price_cents },
    } = await axios.get(url);
    console.log('USD Price Cents', usd_price_cents);
    setCertPriceUsd(usd_price_cents);
    return usd_price_cents;
  };

  const calculateTotalSCRT = (_numCerts: number) => {
    const price = certPriceSCRT; //uscrt
    const total = price * _numCerts;
    setTotalString(`${total / 10e5} SCRT`);
    setTotaluSCRT(total);
    setNumCerts(_numCerts);
  };

  const calculateTotalUSD = (_numCerts: number, price?: number) => {
    //_numCerts = _numCerts.replace(/\D/g, '');
    if (!price) price = certPriceUsd;
    const total = price * _numCerts; //cents
    setTotalUSDString(`$${(total / 10e1).toFixed(2)}`);
    setTotalUSD(total);
    setNumCerts(_numCerts);
  };

  const getCharge = async (numCert: number) => {
    console.log('Getting Coinbase Charge');

    const request = {
      address: Address,
      num_certs: numCert,
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

  //   const getCharge2 = async (numCert: number) => {
  //     console.log('Getting Coinbase Charge');

  //     const request = {
  //       address: Address,
  //       num_certs: numCert,
  //       issuer_name: 'todo',
  //     };

  //     const url = new URL(`/payment/createCharge`, process.env.REACT_APP_BACKEND).toString();

  //     const chargeResult = await axios.post(url, request);
  //     console.log(chargeResult);

  //     return chargeResult.data.chargeCode;
  //   };

  //   const handleUSDPayment = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  //     e.preventDefault();
  //     const code = await getCharge2(numCerts);
  //     setChargeId(code);
  //     setShowCoinbase(true);
  //     return null;
  //   };

  const handleSCRTPayment = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const toastRef = toast.loading('Transaction Processing...');
    try {
      e.preventDefault();
      if (!numCerts) throw new Error('Number of Certs is undefined.');

      const response = await paySSCRT(numCerts, totaluSCRT.toString());
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

  //   const handleCBError = (msg: MessageData) => {
  //     console.error(msg);
  //     setShowCoinbase(false);
  //   };

  //   const hideCBModal = () => {
  //     setShowCoinbase(false);
  //   };

  console.log('chargeId', chargeId);
  return (
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
              <CoinbaseCommerceButton
                chargeId={chargeId}
                className={`${btnStyles.certupBtn} ${btnStyles.certupBtnSmall} ${btnStyles.certupButtonColor}`}
                disabled={!chargeId}
                style={{ width: '100%' }}
              >
                Pay with Coinbase
              </CoinbaseCommerceButton>
            </Col>
          </Row>
        </Form>
      </Col>
    </Row>
  );
}
