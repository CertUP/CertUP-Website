// import styles from "./styles.module.scss"
import { Button, ButtonDark, Spacer } from '../../components';
import Layout from '../../components/Layout';
import CertUpButton from '../../components/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import styles from './styles.module.scss';
import exampleCert from '../../assets/ExampleCert.svg';
import { useWallet } from '../../contexts';
import ConnectBanner from '../../components/ConnectBanner';

export default function Issuers() {
  const { Client, ClientIsSigner, Wallet, Address } = useWallet();

  if (!Wallet || !Address)
    return (
      <>
        <Layout>
          <Spacer height={100} />

          <Container>
            <Row>
              <span className={styles.aboutTitle}>For Issuers</span>
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
          <Row className="justify-content-center">
            <span className={styles.aboutTitle}>For Issuers</span>

            <Col xs={'auto'}>
              <Button>New Certificate</Button>
            </Col>
          </Row>
        </Container>

        <Spacer height={50} />

        <Container>
          <h3 className={styles.certsLabel}>Your Certificates</h3>
          <span className={styles.certStatus}>You dont have any certificate projets yet.</span>
        </Container>
      </Layout>
    </>
  );
}
