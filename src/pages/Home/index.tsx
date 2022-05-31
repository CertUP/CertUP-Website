// import styles from "./styles.module.scss"
import { CUButton, CUButtonDark } from '../../components';
import Layout from '../../components/Layout';
import CertUpButton from '../../components/CUButton';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import styles from './styles.module.scss';
import bannerImage from '../../assets/BannerImage.svg';

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
              <Row style={{ paddingTop: '60px' }}>
                <Col md={'auto'}>
                  {parseInt(process.env.REACT_APP_HOME_ONLY as string, 10) ? (
                    <CUButton disabled={true}>Coming Soon</CUButton>
                  ) : (
                    <CUButton>Get Started</CUButton>
                  )}
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
              <span className={styles.infoTitle}>SNIP721 v.s. ETH</span>
            </Row>

            <Row>
              <Col xs={3} md={2} className={styles.labelCol}>
                <Row>
                  <span className={styles.infoLeftLabel}>Private</span>
                </Row>
                <Row>
                  <span className={styles.infoLeftLabel}>Public</span>
                </Row>
              </Col>

              <Col xs={9} md={3} className={styles.infoCol}>
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
                    When made, everyone can see all the info posted inside the NFT.
                    <ul>
                      <li>Personal info.</li>
                      <li>Birthdays.</li>
                      <li>Account numbers.</li>
                      <li>Everything!</li>
                    </ul>
                  </div>
                </Row>
              </Col>

              <Col xs={3} className={`${styles.labelCol} d-flex d-md-none`}>
                <Row>
                  <span className={styles.infoLeftLabel}>Private</span>
                </Row>
                <Row>
                  <span className={styles.infoLeftLabel}>Public</span>
                </Row>
              </Col>

              <Col xs={9} md={3} className={styles.infoCol}>
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
                    Once data id published on a public blockchain, the issuer and recipient can
                    never take it down or otherwise hide it. They’ve lost control of their data.
                  </p>
                </Row>
              </Col>

              <Col xs={3} className={`${styles.labelCol} d-flex d-md-none`}>
                <Row>
                  <span className={styles.infoLeftLabel}>Private</span>
                </Row>
                <Row>
                  <span className={styles.infoLeftLabel}>Public</span>
                </Row>
              </Col>
              <Col xs={9} md={4} className={styles.infoCol} style={{ paddingRight: '100px' }}>
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
                  <p className={styles.infoBody}>
                    Certifiate owners data is viewable by the world, posing risks to their security.
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
              <span className={styles.createSubTitle}>Learn and share lessons with gratitude.</span>
            </Row>
            <Row className="justify-content-center">
              <Col md="auto">
                {parseInt(process.env.REACT_APP_HOME_ONLY as string, 10) ? (
                  <CUButtonDark disabled={true}>Coming Soon</CUButtonDark>
                ) : (
                  <CUButtonDark>Get Started</CUButtonDark>
                )}
              </Col>
            </Row>
          </div>
        </Container>
        <br />
      </Layout>
    </>
  );
}
