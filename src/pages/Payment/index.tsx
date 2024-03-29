// import styles from "./styles.module.scss"
import { CUButton, Spacer } from '../../components';
import Layout from '../../components/Layout';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import styles from './styles.module.scss';
import { useProject, useWallet } from '../../contexts';
import ConnectBanner from '../../components/ConnectBanner';
import { useEffect, useState } from 'react';
import Project from '../../interfaces/Project';
import { useLocation, useNavigate } from 'react-router-dom';

import { ProgressBar } from '../../components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import PaymentRow, { Confirmation } from '../../components/PaymentRow';
import CUSpinner from '../../components/CUSpinner';
import { useIssuer } from '../../contexts/IssuerContext';

export default function Payment() {
  const { Wallet, Address, LoginToken } = useWallet();
  const { RemainingCerts, LoadingRemainingCerts } = useIssuer();
  const { refreshIssuer } = useIssuer();

  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [numToPurchase, setNumToPurchase] = useState<number>(0);
  const [paid, setPaid] = useState<boolean>(false);
  const [confirmation, setConfirmation] = useState<Confirmation>();
  const [project, setProject] = useState<Project>();

  const { findProject, LoadingPendingProjects } = useProject();

  useEffect(() => {
    document.title = `CertUP - Payment`;
  }, []);

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
    await refreshIssuer();
    console.log('Credits', RemainingCerts);

    // calculateNumCerts();
    loadProject();
    setLoading(false);
  };

  useEffect(() => {
    if (!!confirmation || LoadingRemainingCerts) return;

    if (RemainingCerts && RemainingCerts >= location.state.num_certificates) {
      //navigate('/generate', { state: { projectId: location.state.projectId } });
      setPaid(true);
      setConfirmation({
        string: 'You have enough certificate credits for this project.',
        number: '',
      });
      setLoading(false);
    }
  }, [RemainingCerts, LoadingRemainingCerts]);

  useEffect(() => {
    if (LoadingPendingProjects) return;
    loadProject();
  }, [LoadingPendingProjects]);

  const loadProject = () => {
    if (LoadingPendingProjects) return;
    const foundProject = findProject(location.state?.projectId);
    setProject(foundProject);
  };

  useEffect(() => {
    calculateNumCerts();
  }, [RemainingCerts]);

  const calculateNumCerts = () => {
    const toPurchase = location.state.num_certificates - RemainingCerts;

    console.log(
      'Passed Number',
      location.state.num_certificates,
      'Remaining',
      RemainingCerts,
      'To Purchase',
      toPurchase,
    );
    setNumToPurchase(toPurchase);
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (location.state.projectId) {
      navigate('/issuers', { state: { projectId: location.state.projectId, show: true } });
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true }); // the current entry in the history stack will be replaced with the new one with { replace: true }
    }
  };

  const callback = (confirmation: Confirmation) => {
    setPaid(true);
    setConfirmation(confirmation);
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

          <ConnectBanner issuer={true} />

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
            <Col xs={'auto'} lg={3}>
              <CUButton btnStyle="square" className={styles.cancelBtn} onClick={handleCancel}>
                <FontAwesomeIcon icon={faArrowLeft} /> Go Back
              </CUButton>
            </Col>
            <Col className="text-center" xs={12} lg={6}>
              <span className={styles.aboutTitle}>Payment</span>
            </Col>
          </Row>
        </Container>
        <ProgressBar step={2} />
        <Spacer height={50} />
        <Container>
          <Row className="justify-content-center">
            <Col xs="6" className="text-center">
              <h3 style={{ fontWeight: 'bold' }} className="mb-1">
                {project?.project_name}
              </h3>
              <h5>{project?.participants.length} Certificates</h5>
              {RemainingCerts ? (
                <h5 className="mt-3">You have {RemainingCerts} certificate credits.</h5>
              ) : null}
              <Image fluid src={project?.lastPreview} />
              <hr />
            </Col>
          </Row>
          {loading ? (
            <Row className="justify-content-center">
              <CUSpinner size="xl" className="mt-4 pt-4" />
            </Row>
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
            <>
              <Row className="text-center">
                <h4>Purchasing {numToPurchase} Certificate Credits</h4>
              </Row>
              <PaymentRow num_certs={numToPurchase} editable={false} onPaid={callback} />
            </>
          )}
        </Container>
      </Layout>
    </>
  );
}
