// import styles from "./styles.module.scss"
import { CUButton } from '../../components';
import Layout from '../../components/Layout';
import CertUpButton from '../../components/CUButton';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import styles from './styles.module.scss';
import bannerImage from '../../assets/BannerImage.svg';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <Layout>
        <Container style={{ marginTop: '100px' }}>
          <Row>
            <span className={styles.certTitle}>SecretNFT Certificates</span>
          </Row>
          <Row>
            <Col lg={8} xs={12}>
              <Row>
                <span className={styles.certSubTitle}>
                  Revolutionising official document distribution, verification and publication
                </span>
              </Row>
              <Row>
                <span className={styles.certTagline}>for training courses, events and more!</span>
              </Row>
              <Row className={styles.gsButtonRow}>
                <Col xs={'auto'}>
                  <Link to="/issuers">
                    <CUButton btnStyle="large">Get Started</CUButton>
                  </Link>
                </Col>
              </Row>
            </Col>
            <Col md={4} className="d-none d-lg-block">
              <Image src={bannerImage} fluid />
            </Col>
          </Row>
        </Container>

        <Container fluid>
          <div className={styles.infoBox}>
            <Row>
              <span className={styles.infoTitle}>
                SecretNFT’s &nbsp;<span className={styles.infoTitleVs}>vs.</span>&nbsp; Ethereum
              </span>
            </Row>

            <Row>
              <Col xs={4} md={2} className={styles.labelCol}>
                <Row>
                  <span className={styles.infoLeftLabel}>Secret NFT</span>
                </Row>
                <Row>
                  <span className={styles.infoLeftLabel}>Ethereum</span>
                </Row>
              </Col>

              <Col xs={8} md={3} className={styles.infoCol}>
                <Row>
                  <span className={styles.infoTopLabel}>Secure Creation</span>
                  <hr className={styles.info1} />
                  <p className={styles.infoBody}>
                    Issuers choose what info to keep private, or allow to be publicly viewed.
                    Sensitive info stays secret.
                  </p>
                </Row>
                <Row>
                  <div className={styles.infoBody}>
                    Once created, everyone can see all the info posted inside the NFT.
                    <ul>
                      <li>Personal info.</li>
                      <li>Birthdays.</li>
                      <li>Account numbers.</li>
                      <li>Everything!</li>
                    </ul>
                  </div>
                </Row>
              </Col>

              <Col xs={4} className={`${styles.labelCol} d-flex d-md-none`}>
                <Row>
                  <span className={styles.infoLeftLabel}>Secret NFT</span>
                </Row>
                <Row>
                  <span className={styles.infoLeftLabel}>Ethereum</span>
                </Row>
              </Col>

              <Col xs={8} md={3} className={styles.infoCol}>
                <Row>
                  <span className={styles.infoTopLabel}>Superior Control</span>
                  <hr className={styles.info2} />
                  <p className={styles.infoBody}>
                    The recipient can whitelist or de-whitelist specific viewers at any time to view
                    private contents, allowing flexibility and security.
                  </p>
                </Row>
                <Row>
                  <p className={styles.infoBody}>
                    Once data is published on a public blockchain, the issuer and recipient can
                    never take it down or otherwise hide it. They’ve lost control of their data.
                  </p>
                </Row>
              </Col>

              <Col xs={4} className={`${styles.labelCol} d-flex d-md-none`}>
                <Row>
                  <span className={styles.infoLeftLabel}>Secret NFT</span>
                </Row>
                <Row>
                  <span className={styles.infoLeftLabel}>Ethereum</span>
                </Row>
              </Col>
              <Col xs={8} md={4} className={styles.infoCol} style={{ paddingRight: '50px' }}>
                <Row>
                  <span className={styles.infoTopLabel}>Happier Users</span>
                  <hr className={styles.info3} />
                  <p className={styles.infoBody}>
                    Certificate owners feel safe knowing they can control who has access to their
                    data at all times, and have the ability to change their settings with the ease
                    of a few clicks!
                  </p>
                </Row>
                <Row>
                  <p className={`${styles.infoBody} ${styles.lastColSpacer}`}>
                    Certifiate owners data is viewable by the world, posing risks to their security
                    and privacy.
                  </p>
                </Row>
              </Col>
            </Row>
          </div>
        </Container>

        <Container>
          <div className={styles.createBox}>
            <Row>
              <span className={styles.createTitle}>Create Certificate</span>
            </Row>
            <Row>
              <span className={styles.createSubTitle}>Certify and verify securely.</span>
            </Row>
            <Row className="justify-content-center">
              <Col xs="auto">
                <Link to="/issuers">
                  <CUButton btnStyle="dark">Get Started</CUButton>
                </Link>
              </Col>
            </Row>
          </div>
        </Container>
        <br />
      </Layout>
    </>
  );
}
