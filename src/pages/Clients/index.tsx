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

export default function Clients() {
  useEffect(() => {
    document.title = `CertUP`;
  }, []);

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
                  <p className={styles.aboutInfoText38}>
                    Upgrade your certificates to keep pace with your rapidly evolving field. The
                    digital age is making else more convenient, but certification and important
                    documents systems have remained shackled to the past, creating serious
                    bottlenecks for all of us. Our mission is to break those shackles, bringing
                    these items into the digital age without sacrificing security.
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
                    Using the power of{' '}
                    <a
                      href="https://github.com/SecretFoundation/SNIPs/blob/master/SNIP-721.md"
                      target="_blank"
                      rel="noreferrer"
                    >
                      SNIP-721 secretNFTs
                    </a>{' '}
                    on the world&apos;s only production ready encrypted blockchain, we give you the
                    ability to upgrade your certification systems with ease! Simply register
                    yourself as an issuer, and purchase a package of certificates. When filling in
                    the data, decide which data is allowed to remain public, and which must be
                    private. Then, when the data is submitted, you may give the recipient the
                    redemption key our system provides to you. When they redeem this key, the
                    certificate will be permanently associated with them, and have a digital
                    signature attached proving you were the true issuer.
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
