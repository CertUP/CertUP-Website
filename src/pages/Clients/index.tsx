// import styles from "./styles.module.scss"
import { Button, ButtonDark, Spacer } from '../../components';
import Layout from '../../components/Layout';
import CertUpButton from '../../components/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import styles from './styles.module.scss';
import etsLogo from '../../assets/ETSLogo.png';

export default function Clients() {
  return (
    <>
      <Layout>
        <Spacer height={100} />

        <Container>
          <Row>
            <span className={styles.aboutTitle}>Clients</span>
          </Row>
        </Container>

        <Spacer height={30} />
        <Container>
          <div style={{ width: '385px', paddingBottom: '20px' }} className="text-center">
            <Image src={etsLogo} />
            <br />
            <a style={{ fontSize: '20px' }} href="https://europeantech.school/">
              https://europeantech.school/
            </a>
          </div>
          <span style={{ fontSize: '28px', paddingLeft: '40px' }}>
            Offering 6-12 week cohor-based Blockchain courses
          </span>
        </Container>

        <Spacer height={100} />

        <Container>
          <Row>
            <Col md={6}>
              <div className={styles.infoBox} style={{ margin: '0px 30px' }}>
                <Row>
                  <span className={styles.aboutSubtitle}>Mission</span>
                </Row>

                <Row>
                  <p className={styles.aboutInfoText}>
                    You get certificates as proof of completing your school education, high school,
                    college, and university education. Furthermore, certificates help you find jobs
                    with potential employers when you need to show off your skills. Unfortunately,
                    Most certificate platforms only make use of publicly accessible information with
                    little to no consideration for sensitive and personal data held within. With
                    secretNFT Certificates you will be able to make finetune your usage of public
                    and private data to perfectly meet your needs. Use-cases include: events,
                    education, manufacturing, space, military and more!{' '}
                  </p>
                </Row>
              </div>
            </Col>
            <Col md={6}>
              <div className={styles.infoBox} style={{ margin: '0px 30px' }}>
                <Row>
                  <span className={styles.aboutSubtitle}>Methodology</span>
                </Row>

                <Row>
                  <p className={styles.aboutInfoText}>
                    You get certificates as proof of completing your school education, high school,
                    college, and university education. Furthermore, certificates help you find jobs
                    with potential employers when you need to show off your skills. Unfortunately,
                    Most certificate platforms only make use of publicly accessible information with
                    little to no consideration for sensitive and personal data held within. With
                    secretNFT Certificates you will be able to make finetune your usage of public
                    and private data to perfectly meet your needs. Use-cases include: events,
                    education, manufacturing, space, military and more!{' '}
                  </p>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </Layout>
    </>
  );
}
