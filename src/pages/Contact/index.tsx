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

export default function Contact() {
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
          <a href="mailto:info@certup.net">
            <h4>info@certup.net</h4>
          </a>
        </Container>
      </Layout>
    </>
  );
}
