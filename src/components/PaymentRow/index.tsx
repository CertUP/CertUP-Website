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
import useQuery from '../../hooks/QueryHook';

import CUSelectButton from '../CUSelectButton';

import styles from './styles.module.scss';
import CUSpinner from '../CUSpinner';
import { useIssuer } from '../../contexts/IssuerContext';
import { Prices } from '../../interfaces/common/common.inteface';

export interface Confirmation {
  string: string;
  number: ReactNode | string;
}

interface PRProps {
  num_certs?: number;
  editable?: boolean;
  onPaid?: (confirmation: Confirmation) => void;
}

const getPriceUsd = (priceList: Prices[], numCerts: number) => {
  return Math.min(
    ...priceList.filter((prices) => prices.minCerts <= numCerts).map((o) => o.priceUsd),
  );
};

const getPriceScrt = (priceList: Prices[], numCerts: number) => {
  // return Math.min(
  //   ...priceList.filter((prices) => prices.minCerts <= numCerts).map((o) => o.priceuScrt),
  // );
  const availablePrices = priceList.filter((prices) => prices.minCerts <= numCerts);
  const bestPrice = availablePrices.reduce((max, price) =>
    max.priceuScrt < price.priceuScrt ? max : price,
  );
  return bestPrice;
};

export default function PaymentRow({ num_certs = 0, editable = true, onPaid }: PRProps) {
  const { Address, LoginToken } = useWallet();

  const [numCerts, setNumCerts] = useState<number>(num_certs);

  //const [certPriceSCRT, setCertPriceSCRT] = useState(0);
  const [totaluSCRT, setTotaluSCRT] = useState<number>(0);
  const [sScrtBalance, setSScrtBalance] = useState(0);
  const [scrtBalance, setScrtBalance] = useState(0);
  const [payWithSSCRT, setPayWithSSCRT] = useState(false);

  const [coupon, setCoupon] = useState<string>();

  //const [certPriceUSD, setCertPriceUSD] = useState(0);
  const [priceList, setPriceList] = useState();
  const [totalUSD, setTotalUSD] = useState<number>(0);
  const [chargeId, setChargeId] = useState<string>();

  const { paySSCRT, paySCRT } = useExecute();
  const { ProcessingTx } = useWallet();
  const { queryCertPrice, getSSCRTBalance, getSCRTBalance } = useQuery();

  const [loadingSCRT, setLoadingSCRT] = useState(false);

  const totalSCRTString = `${totaluSCRT / 10e5} ${payWithSSCRT ? 'sSCRT' : 'SCRT'}`;
  const totalUSDString = `$${(totalUSD / 10e1).toFixed(2)}`;

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    setNumCerts(num_certs);
  }, [num_certs]);

  useEffect(() => {
    if (!numCerts || !priceList) return;
    calculateTotalUSD(numCerts);
    calculateTotalSCRT(numCerts);
  }, [numCerts, priceList]);

  useEffect(() => {
    getCharge(numCerts);
  }, [totalUSD]);

  const init = async () => {
    getPriceList();
    // setPriceSCRT();
    checkSSCRT();
  };

  const getPriceList = async () => {
    const url = new URL('/payment', process.env.REACT_APP_BACKEND).toString();
    const {
      data: { price_list },
    } = await axios.get(url);
    console.log('PriceList', price_list);
    setPriceList(price_list);
    return price_list;
  };

  // const setPriceSCRT = async () => {
  //   const price = await queryCertPrice();
  //   console.log('sSCRT Price uSCRT', price);
  //   setCertPriceSCRT(price);
  // };

  const calculateTotalSCRT = (_numCerts: number) => {
    if (!priceList) return;
    const price = getPriceScrt(priceList, _numCerts);
    console.log(price);
    // const price = certPriceSCRT; //uscrt
    const total = price.priceuScrt * _numCerts;
    setTotaluSCRT(total);
    setNumCerts(_numCerts);
    setCoupon(price.coupon);
  };

  const checkSSCRT = async () => {
    // determine if to present sSCRT payment option
    const sscrtBal = await getSSCRTBalance();
    setSScrtBalance(sscrtBal);
    console.log('sSCRT Balance', sscrtBal);

    const scrtBal = await getSCRTBalance();
    setScrtBalance(scrtBal);
  };

  const calculateTotalUSD = (_numCerts: number) => {
    if (!priceList) return;
    const price = getPriceUsd(priceList, _numCerts);
    //_numCerts = _numCerts.replace(/\D/g, '');
    //if (!price) price = certPriceUSD;
    const total = price * _numCerts; //cents
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
    setLoadingSCRT(true);
    try {
      e.preventDefault();
      if (!numCerts) throw new Error('Number of Certs is undefined.');

      let response;
      if (payWithSSCRT) {
        response = await paySSCRT({ numCerts, amount: totaluSCRT.toString(), toastRef, coupon });
      } else {
        response = await paySCRT({ numCerts, amount: totaluSCRT.toString(), coupon });
      }
      console.log(response);

      toast.update(toastRef, new ToastProps('Success', 'success'));
      const confirm: Confirmation = {
        string: 'Your transaction hash is',
        number: (
          <a
            href={`${process.env.REACT_APP_EXPLORER_URL}/${response.transactionHash}`}
            target="_blank"
            rel="noreferrer"
            style={{
              lineBreak: 'anywhere',
            }}
          >
            {response.transactionHash}
          </a>
        ),
      };
      if (onPaid) onPaid(confirm);
    } catch (error: any) {
      toast.update(toastRef, new ToastProps(error.toString(), 'error'));
    } finally {
      setLoadingSCRT(false);
    }
  };

  //   const handleCBError = (msg: MessageData) => {
  //     console.error(msg);
  //     setShowCoinbase(false);
  //   };

  //   const hideCBModal = () => {
  //     setShowCoinbase(false);
  //   };

  return (
    <>
      <Row>
        <Col xs={12} sm={6} className="d-flex flex-column">
          <Row className="text-center my-4 justify-content-center">
            <Row className="text-center mb-2">
              <h4>Pay with $SCRT</h4>
            </Row>
            {!totaluSCRT && (
              <Col xs="auto">
                <CUSpinner size="md" className="mb-2" />
              </Col>
            )}

            {sScrtBalance > 0.1 && (
              <Row className="justify-content-center">
                <Col xs="auto">
                  <CUSelectButton
                    type="button"
                    selected={!payWithSSCRT}
                    onClick={() => setPayWithSSCRT(false)}
                  >
                    <span className={!payWithSSCRT ? styles.payWithtext : undefined}>
                      Pay with SCRT
                    </span>
                    <br />
                    <span className={styles.balanceText}>
                      Balance: {scrtBalance.toFixed(3)} SCRT
                    </span>
                  </CUSelectButton>
                </Col>
                <Col xs="auto">
                  <CUSelectButton
                    type="button"
                    selected={payWithSSCRT}
                    onClick={() => setPayWithSSCRT(true)}
                  >
                    <span className={payWithSSCRT ? styles.payWithtext : undefined}>
                      Pay with secretSCRT
                    </span>
                    <br />
                    <span className={styles.balanceText}>
                      Balance: {sScrtBalance.toFixed(3)} sSCRT
                    </span>
                  </CUSelectButton>
                </Col>
              </Row>
            )}
          </Row>
          <Row>
            <Form>
              <Form.Group
                as={Row}
                className="mb-3 justify-content-center"
                controlId="formHorizontalEmail"
              >
                <Form.Label column xs={4}>
                  Total
                </Form.Label>
                <Col xs="8" md="6">
                  <Form.Control
                    required
                    value={totalSCRTString}
                    disabled={true}
                    type="text"
                    placeholder="123"
                  />
                </Col>
              </Form.Group>

              <Row className="justify-content-center">
                <Col xs="10" md="8" lg="6">
                  <CUButton
                    disabled={!totaluSCRT || ProcessingTx || loadingSCRT}
                    fill={true}
                    onClick={handleSCRTPayment}
                  >
                    {loadingSCRT ? <CUSpinner size="xs" /> : 'Pay with Keplr Wallet'}
                  </CUButton>
                </Col>
              </Row>
            </Form>
          </Row>
        </Col>
        <Col xs={{ span: 10, offset: 1 }} className="d-sm-none mt-4">
          <hr />
        </Col>
        <Col xs={12} sm={6} className="d-flex flex-column justify-content-between">
          <Row className="text-center my-4 justify-content-center">
            <Row className="mb-2">
              <h4>Pay with Coinbase</h4>
            </Row>
            <Row className="px-3">
              <p className="px-3 mb-0" style={{ color: '#333333' }}>
                You will be redirected to Coinbase&apos;s cryptocurrency payment gateway where you
                can pay with a variety of coins and tokens.
              </p>
            </Row>
            {!chargeId && (
              <Col xs="auto">
                <CUSpinner size="md" className="mb-2" />
              </Col>
            )}
          </Row>
          <Row>
            <Form>
              <Form.Group
                as={Row}
                className="mb-3 justify-content-center"
                controlId="formHorizontalEmail"
              >
                <Form.Label column xs={4}>
                  Total
                </Form.Label>
                <Col xs="8" md="6">
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
                <Col xs="10" md="8" lg="6">
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
          </Row>
        </Col>
      </Row>
    </>
  );
}
