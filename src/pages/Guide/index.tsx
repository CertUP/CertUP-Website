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
import leftBlobs from '../../assets/leftBlobs.svg';
import rightBlobs from '../../assets/rightBlobs.svg';
import centerLines from '../../assets/centerLines.svg';

export default function Guide() {
  return (
    <>
      <Layout>
        <Spacer height={100} />
        <img src={leftBlobs} alt="" className={styles.leftBlobs} />
        <img src={rightBlobs} alt="" className={styles.rightBlobs} />
        <div className={styles.centerContainer}>
          <img src={centerLines} alt="" className={styles.centerLines} />
        </div>

        <Container>
          <Row>
            <span className={styles.aboutTitle}>Guide</span>
          </Row>
        </Container>

        <Spacer height={50} />

        <Container>
          <div className={styles.infoBox}>
            <Row>
              <span className={styles.aboutSubtitle}>Info</span>
            </Row>

            <Row>
              <p className={styles.aboutInfoText}>
                You get certificates as proof of completing your school education, high school,
                college, and university education. Furthermore, certificates help you find jobs with
                potential employers when you need to show off your skills. Unfortunately, Most
                certificate platforms only make use of publicly accessible information with little
                to no consideration for sensitive and personal data held within. With secretNFT
                Certificates you will be able to make finetune your usage of public and private data
                to perfectly meet your needs. Use-cases include: events, education, manufacturing,
                space, military and more!{' '}
              </p>
            </Row>
          </div>
        </Container>

        <Spacer height={150} />

        <Container>
          <span className={styles.aboutSubtitle}>Team</span>
        </Container>

        <Container>
          <span className={styles.aboutSubtitle}>Product</span>
          <p className={styles.productText}>
            The product works on a SNIP-721 smart contract technology provided by Secret Network.
            Having the possibility to have private and public meta-data enables any industry to
            easily setup the certificate as a non-fungible token and issue to the relevant party.
          </p>
        </Container>

        <Spacer height={130} />

        <Container>
          <Image src={exampleCert} fluid />
        </Container>

        <Spacer height={135} />

        <Container>
          <span className={styles.aboutSubtitle}>Use-cases</span>
          <p className={styles.productText}>
            Many schools, educational events and manufacturing sectors are facing the reality of
            tracking issued certificates and proof of certification from that particular industry.
            The secretNFT Certificate resolves the consensus side between the issuer with real-time
            track recording, for the certificate receiver can easily proof the certificate and
            verification.
          </p>

          <Button>Get Started</Button>
        </Container>
      </Layout>
    </>
  );
}
