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
import triviumLogo from '../../assets/triviumcolor.svg';
import alterLogo from '../../assets/alterlogo.png';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import etsLogo from '../../assets/ETSLogo.png';
import ContactInfo from '../../components/ContactInfo';

export default function About() {
  useEffect(() => {
    document.title = `CertUP`;
  }, []);

  return (
    <>
      <Layout>
        <Container>
          <Spacer height={100} />

          <Row>
            <span className={styles.aboutTitle}>About</span>
          </Row>

          <Spacer height={50} />

          <div className={styles.infoBox}>
            <Row>
              <span className={styles.aboutSubtitle}>Info</span>
            </Row>

            <Row>
              <p className={styles.aboutInfoText}>
                Certificates play a role in all our lives, whether it be at school, work, or even in our hobbies.
                Certificates are proof of your accomplishments, to show that you deserve that job you&apos;ve been
                dreaming of. They show that piece of art that brings life to your living room is the real deal, and not
                just a picture. And they show that the family car has passed a rigorous safety inspection, so you can
                take that roadtrip with confidence. We can&apos;t leave them behind as the rest of the world marches
                forward in the digital age. They&apos;re far too important. Unfortunately, other digital certificate
                platforms only make use of publicly accessible information with little to no consideration for sensitive
                and personal data held within. With secretNFT Certificates you will be able to make finetune your usage
                of public and private data to perfectly meet your needs, whether it be for events, education,
                manufacturing, space, military, or something yet to be created!
              </p>
            </Row>
          </div>

          <Spacer height={120} />

          <span className={styles.aboutSubtitle}>Product</span>

          <Row className="mx-2 mt-2">
            <p className={styles.productText}>
              Using the power of{' '}
              <a
                href="https://github.com/SecretFoundation/SNIPs/blob/master/SNIP-721.md"
                target="_blank"
                rel="noreferrer"
              >
                SNIP-721 secretNFTs
              </a>{' '}
              on the world&apos;s only production ready encrypted blockchain, we give you the ability to upgrade your
              certification systems with ease! Simply register yourself as an issuer, and purchase a package of
              certificates. When filling in the data, decide which data is allowed to remain public, and which must be
              private. Then, when the data is submitted, you may give the recipient the redemption key our system
              provides to you. When they redeem this key, the certificate will be permanently associated with them, and
              have a digital signature attached proving you were the true issuer.
            </p>
          </Row>

          <Spacer height={120} />

          <Image src={exampleCert} fluid />

          <Spacer height={120} />

          <span className={styles.aboutSubtitle}>Use-cases</span>
          <Row className="mx-2 mt-2">
            <p className={styles.productText}>
              Many schools, events, and manufacturing sectors are facing the problems with tracking and verifying
              certificates using old systems in their rapidly evolving industries. The SecretNFT Certificate resolves
              the consensus side between all parties with real-time track recording, as the certificate holder can
              verify the authenticity easily with a digital signiture attached to every document.
            </p>
          </Row>

          <Row className="mt-4">
            <Col xs={{ span: 12, offset: 0 }} lg={{ span: 6, offset: 0 }} className="mb-4">
              <div className={styles.infoBox} style={{ margin: '0px 30px' }}>
                <Row>
                  <span className={styles.aboutSubtitle}>Mission</span>
                </Row>

                <Row>
                  <p className={styles.aboutInfoText38}>
                    Upgrade your certificates to keep pace with your rapidly evolving field. The digital age is making
                    everything else more convenient, but certification and document systems have remained shackled to
                    the past, creating serious bottlenecks for all of us. Our mission is to break those shackles,
                    bringing these items into the digital age without sacrificing security.
                  </p>
                </Row>
              </div>
            </Col>
            <Col xs={{ span: 12, offset: 0 }} lg={{ span: 6, offset: 0 }}>
              <div className={styles.infoBox} style={{ margin: '0px 30px' }}>
                <Row>
                  <span className={styles.aboutSubtitle}>Methodology</span>
                </Row>

                <Row>
                  <p className={styles.aboutInfoText}>
                    Using the power of{' '}
                    <a
                      href="https://github.com/SecretFoundation/SNIPs/blob/master/SNIP-721.md"
                      target="_blank"
                      rel="noreferrer"
                    >
                      SNIP-721 secretNFTs
                    </a>{' '}
                    on the world&apos;s only production ready encrypted blockchain, we give you the ability to upgrade
                    your certification systems with ease! Simply register yourself as an issuer, and purchase a package
                    of certificates. When filling in the data, decide which data is allowed to remain public, and which
                    must be private. Then, when the data is submitted, you may give the recipient the redemption key our
                    system provides to you. When they redeem this key, the certificate will be permanently associated
                    with them, and have a digital signature attached proving you were the true issuer.
                  </p>
                </Row>
              </div>
            </Col>
          </Row>

          <Spacer height={120} />

          <span className={styles.aboutSubtitle}>Team</span>
          <Row className="mx-2 mt-4 justify-content-around">
            <Col md={4} sm={6} xs={12} className="mb-4">
              <Row>
                <h3>Trivium</h3>
                <Row className="justify-content-center">
                  <Image src={triviumLogo} fluid className={styles.teamLogo} />
                </Row>
                <p>
                  Trivium is a validator on multiple PoS chains, and a software development team focused on
                  decentralized privacy solutions for companies and individuals.
                </p>
              </Row>
              <Row className="text-end">
                <a href="https://trivium.network" target="_blank" rel="noreferrer">
                  https://trivium.network
                </a>
              </Row>
            </Col>
            <Col md={4} sm={6} xs={12}>
              <Row>
                <h3>ALTER</h3>
                <Row className="justify-content-center">
                  <Image src={alterLogo} fluid className={styles.teamLogo} />
                </Row>
                <p>
                  ALTER is a dedicated company aiming to build data privacy solutions for the next generation of the
                  web.
                </p>
              </Row>
              <Row className="text-end">
                <a href="https://altermail.live" target="_blank" rel="noreferrer">
                  https://altermail.live
                </a>
              </Row>
            </Col>
          </Row>

          <Spacer height={100} />

          <Row>
            <span className={styles.aboutSubtitle}>Clients</span>
            <Col xs="12" md="8">
              <div style={{ width: '385px', paddingBottom: '20px', marginLeft: '4rem' }}>
                <Image src={etsLogo} style={{ width: '15vw' }} />
                <br />
                <a style={{ fontSize: '20px' }} href="https://europeantech.school/">
                  https://europeantech.school/
                </a>
              </div>
              <span style={{ fontSize: '22px', paddingLeft: '40px' }}>
                Offering 6-12 week cohor-based Blockchain courses
              </span>
            </Col>
          </Row>

          <Spacer height={120} />

          <Row>
            <span className={styles.aboutSubtitle}>Contact</span>
            <Col xs={{ span: 12, offset: 0 }} lg={{ span: 6, offset: 3 }}>
              <ContactInfo />
            </Col>
          </Row>

          <Spacer height={120} />
        </Container>
      </Layout>
    </>
  );
}
