// import styles from "./styles.module.scss"
import { CUButton, Spacer } from '../../components';
import Layout from '../../components/Layout';
import CertUpButton from '../../components/CUButton';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import styles from './styles.module.scss';
import exampleCert from '../../assets/ExampleCert.svg';

export default function About() {
  return (
    <>
      <Layout>
        <Spacer height={100} />

        <Container>
          <Row>
            <span className={styles.aboutTitle}>About</span>
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
                Certificates play a role in all our lives, whether it be at school, work, or even in
                our hobbies. Certificates are proof of your accomplishments, to show that you
                deserve that job you&apos;ve been dreaming of. They show that piece of art that
                brings life to your living room is the real deal, and not just a picture. And they
                show that the family car has passed a rigorous safety inspection, so you can take
                that roadtrip with confidence. We can&apos;t leave them behind as the rest of the
                world marches forward in the digital age. They&apos;re far too important.
                Unfortunately, other digital certificate platforms only make use of publicly
                accessible information with little to no consideration for sensitive and personal
                data held within. With secretNFT Certificates you will be able to make finetune your
                usage of public and private data to perfectly meet your needs, whether it be for
                events, education, manufacturing, space, military, or something yet to be created!
              </p>
            </Row>
          </div>
        </Container>

        <Spacer height={150} />

        <Container>
          <span className={styles.aboutSubtitle}>Team</span>
          <Row className="mx-2 mt-2 justify-content-around">
            <Col xs={6} md={4}>
              Trivium
            </Col>
            <Col xs={6} md={4}>
              Alter
            </Col>
          </Row>
        </Container>

        <Spacer height={150} />

        <Container>
          <span className={styles.aboutSubtitle}>Product</span>

          <Row className="mx-2 mt-2">
            <p className={styles.productText}>
              The product works on a SNIP-721 smart contract technology provided by Secret Network.
              Having the possibility to have private and public meta-data enables any industry to
              easily setup the certificate as a non-fungible token and issue to the relevant party.
            </p>
          </Row>
        </Container>

        <Spacer height={130} />

        <Container>
          <Image src={exampleCert} fluid />
        </Container>

        <Spacer height={135} />

        <Container>
          <span className={styles.aboutSubtitle}>Use-cases</span>
          <Row className="mx-2 mt-2">
            <p className={styles.productText}>
              Many schools, educational events and manufacturing sectors are facing the reality of
              tracking issued certificates and proof of certification from that particular industry.
              The secretNFT Certificate resolves the consensus side between the issuer with
              real-time track recording, for the certificate receiver can easily proof the
              certificate and verification.
            </p>
          </Row>
          <Row className="justify-content-center">
            <Col xs={'auto'}>
              <CUButton>Get Started</CUButton>
            </Col>
          </Row>
        </Container>
      </Layout>
    </>
  );
}
