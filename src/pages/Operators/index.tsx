/* eslint-disable @typescript-eslint/ban-ts-comment */
// import styles from "./styles.module.scss"
import { CUButton, Spacer } from '../../components';
import Layout from '../../components/Layout';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import styles from './styles.module.scss';
import { useWallet } from '../../contexts';
import ConnectBanner from '../../components/ConnectBanner';
import { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { RestrictedAccess } from '../../components/RestrictedAccess';
import CUSpinner from '../../components/CUSpinner';
import { Issuer } from '../../interfaces/manager';
import useExecute from '../../hooks/ExecuteHook';
import { useIssuer } from '../../contexts/IssuerContext';
import { ListIssuersQueryMsg } from '../../utils/queries/managerQueries';
import useQuery from '../../hooks/QueryHook';
import IssuerViewer from '../../components/Operators/IssuerViewer';

export default function Operators() {
  const {
    Wallet,
    Address,
    QueryPermit,
    // IssuerProfile,
    // VerifiedIssuer,
    // LoadingRemainingCerts,
    ProcessingTx,
  } = useWallet();

  const { IssuerProfile, VerifiedIssuer, LoadingRemainingCerts, isOperator } = useIssuer();

  const { queryIssuerList } = useQuery();

  const [issuerList, setIssuerList] = useState<Issuer[]>([]);
  const [issuerPage, setIssuerPage] = useState(0);
  const [totalIssuedCerts, setTotalIssuedCerts] = useState(0);

  useEffect(() => {
    document.title = `CertUP - Dashboard`;
  }, []);

  useEffect(() => {
    if (!isOperator) return;

    getIssuerList();
  }, [isOperator]);

  useEffect(() => {
    calculateTotalIssuedCerts();
  }, [issuerList]);

  const getIssuerList = async () => {
    const list = await queryIssuerList(issuerPage);
    setIssuerList(list);
  };

  const calculateTotalIssuedCerts = () => {
    //todo make this work with multiple pages
    const total: number = issuerList.reduce((total, obj) => total + parseInt(obj.cert_num), 0);
    setTotalIssuedCerts(total);
  };

  if (!Wallet || !Address || !QueryPermit)
    return (
      <>
        <Layout>
          <Spacer height={100} />

          <Container>
            <Row>
              <span className={styles.aboutTitle}>Restricted</span>
            </Row>
          </Container>
          <Spacer height={50} />

          <ConnectBanner text="This page is restricted to approved wallets." issuer={true} />

          <Spacer height={150} />
        </Layout>
      </>
    );
  else if (!isOperator)
    return (
      <Layout>
        <Spacer height={100} />

        <Container>
          <Row>
            <span className={styles.aboutTitle}>Restricted</span>
          </Row>
        </Container>
        <Spacer height={50} />

        <RestrictedAccess text="This page is restricted to approved wallets." />

        <Spacer height={150} />
      </Layout>
    );

  return (
    <>
      <Layout>
        <Spacer height={100} />

        <Container>
          <Row className="justify-content-center text-center">
            <Col md={12} lg={8}>
              <span className={styles.aboutTitle}>Operator Dashboard</span>
            </Col>
          </Row>
          <Row>
            <Col className="text-center">
              <h6>Total Issuers</h6>
              <p>{issuerList.length}</p>
            </Col>
            <Col className="text-center">
              <h6>Certificates Issued</h6>
              <p>{totalIssuedCerts}</p>
            </Col>
            <Col className="text-center">
              <h6>Certificates Claimed</h6>
              <p>~</p>
            </Col>
          </Row>
        </Container>
        <Spacer height={50} />
        <Container>
          <IssuerViewer issuerList={issuerList} refresh={getIssuerList} />
        </Container>
      </Layout>
    </>
  );
}
