// import styles from "./styles.module.scss"
import { CUButton, CUButtonDark, Spacer } from '../../components';
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
import { useState } from 'react';
import ProjectForm from '../../components/ProjectForm';

export default function Issuers() {
  const [showProject, setShowProject] = useState(true);
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
        {showProject ? <ProjectForm /> : <ProjectList />}
      </Layout>
    </>
  );
}
