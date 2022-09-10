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
import triviumLogo from '../../assets/triviumcolor.png';
import alterLogo from '../../assets/alterlogo.png';
import { Link } from 'react-router-dom';

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

        <Spacer height={120} />

        <Container>
          <span className={styles.aboutSubtitle}>Team</span>
          <Row className="mx-2 mt-4 justify-content-around">
            <Col md={4} sm={5} xs={6}>
              {/* <div className={styles.teamDiv}> */}
              <Row>
                <h3>Trivium</h3>
                <Row className="justify-content-center">
                  <Image src={triviumLogo} fluid className={styles.teamLogo} />
                </Row>
                <p>
                  Trivium is a validator for Secret Network, and a software development team focused
                  on decentralized privacy solutions for companies and individuals.
                </p>
              </Row>
              <Row className="text-end">
                <a href="https://trivium.network">https://trivium.network</a>
              </Row>
            </Col>
            {/* </div> */}
            {/* <div className={styles.teamDiv}> */}
            <Col md={4} sm={5} xs={6}>
              <Row>
                <h3>ALTER</h3>
                <Row className="justify-content-center">
                  <Image src={alterLogo} fluid className={styles.teamLogo} />
                </Row>
                <p>
                  ALTER is a dedicated company aiming to build data privacy solutions for the next
                  generation of the web.
                </p>
              </Row>
              <Row className="text-end">
                <a href="https://altermail.live">https://altermail.live</a>
              </Row>
            </Col>
            {/* </div> */}
          </Row>
        </Container>

        <Spacer height={120} />

        <Container>
          <span className={styles.aboutSubtitle}>Product</span>

          <Row className="mx-2 mt-2">
            <p className={styles.productText}>
              The product works on a SNIP-721 smart contract technology provided by Secret Network.
              Having the ability to store private and public meta-data enables any industry to
              easily setup the certificate as a non-fungible token and issue to the relevant party.
            </p>
          </Row>
        </Container>

        <Spacer height={120} />

        <Container>
          <Image src={exampleCert} fluid />
        </Container>

        <Spacer height={120} />

        <Container>
          <span className={styles.aboutSubtitle}>Use-cases</span>
          <Row className="mx-2 mt-2">
            <p className={styles.productText}>
              Many schools, events, and manufacturing sectors are facing the problems with tracking
              and verifying certificates using old systems in their rapidly evolving industries. The
              SecretNFT Certificate resolves the consensus side between all parties with real-time
              track recording, as the certificate holder can verify the authenticity easily with a
              digital signiture attached to every document.
            </p>
          </Row>
          <Row className="justify-content-center mt-2">
            <Col xs={'auto'}>
              <Link to="/issuers">
                <CUButton>Get Started</CUButton>
              </Link>
            </Col>
          </Row>
        </Container>
      </Layout>
    </>
  );
}
