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
            <Row>
              <p className={styles.contactParagraph}>
                If you have any questions or would like to rquest early access, please get in touch!
              </p>
            </Row>
            <Row className="mx-4 px-4">
              <ul>
                <li>
                  <span className={styles.contactTitle}>Email: </span>
                  <a href="mailto:info@certup.net" className={`${styles.contactText} px-2`}>
                    info@certup.net
                  </a>
                </li>
              </ul>
            </Row>
            {/* <Row>
            <span>Discord: </span>
            <a href="https://discord.gg/jNZJYBDcZQ">
              <h4>https://discord.gg/CertUP</h4>
            </a>
          </Row> */}
          </Col>
        </Container>
      </Layout>
    </>
  );
}
