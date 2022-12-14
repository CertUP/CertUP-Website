// import styles from "./styles.module.scss"
import { CUButton, Spacer } from '../../components';
import Layout from '../../components/Layout';
import CertUpButton from '../../components/CUButton';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import styles from './styles.module.scss';
import etsLogo from '../../assets/ETSLogo.png';
import { useEffect } from 'react';
import ContactInfo from '../../components/ContactInfo';

export default function Contact() {
  useEffect(() => {
    document.title = `CertUP - Contact Us`;
  }, []);

  return (
    <>
      <Layout>
        <Spacer height={100} />

        <Container>
          <Row>
            <span className={styles.aboutTitle}>Contact Us</span>
          </Row>
        </Container>

        <Spacer height={30} />
        <Container>
          <Col xs={{ span: 12, offset: 0 }} md={{ span: 6, offset: 3 }}>
            <ContactInfo />
          </Col>
        </Container>
      </Layout>
    </>
  );
}
