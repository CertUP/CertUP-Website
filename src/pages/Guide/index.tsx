// import styles from "./styles.module.scss"
import { CUButton, CUButtonSq, Spacer, StepNumber } from '../../components';
import Layout from '../../components/Layout';
import CertUpButton from '../../components/CUButton';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import styles from './styles.module.scss';
import exampleCert from '../../assets/ExampleCert.svg';
import leftBlobs from '../../assets/leftBlobs.svg';
import rightBlobs from '../../assets/rightBlobs.svg';
import centerLines from '../../assets/centerLines.svg';

import stepsImg from '../../assets/steps.svg';
import connectImg from '../../assets/connectKeplr.svg';
import step3Img from '../../assets/step3.svg';
import step4Img from '../../assets/step4.svg';

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
            <span className={styles.guideSubtitle}>How to create and issue your certificates</span>
          </Row>
        </Container>

        <Spacer height={50} />

        <Container style={{ paddingLeft: '0.75rem' }}>
          <Row className="justify-content-around" style={{ marginBottom: '3rem' }}>
            <Col md="5">
              <Row>
                <Col md="2">
                  <StepNumber>1.</StepNumber>
                </Col>
                <Col md="10">
                  <div>
                    <p className={`${styles.guideStep}`}>Login with Keplr Wallet</p>
                    <p className={styles.keplrSupports}>(supported on Chrome/Brave browsers)</p>
                    <CUButtonSq style={{ color: '#000', width: '50%' }}>Get Keplr</CUButtonSq>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Image className="mt-3" src={connectImg} fluid />
                  </div>
                </Col>
              </Row>
            </Col>
            <Col md="5">
              <Row style={{ height: '50%' }}></Row>
              <Row style={{ height: '50%' }}>
                <Col md="2">
                  <StepNumber>2.</StepNumber>
                </Col>
                <Col md="10">
                  <p className={`${styles.guideStep} mb-4`}>Create a new certificate project</p>
                  <Image src={stepsImg} fluid />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="justify-content-around">
            <Col md="5">
              <Row>
                <Col md="2">
                  <StepNumber>3.</StepNumber>
                </Col>
                <Col md="10">
                  <div>
                    <p className={`${styles.guideStep}`}>
                      Insert all relevant information for the secretNFT Certificate
                    </p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Image className="mt-3" src={step3Img} fluid />
                  </div>
                </Col>
              </Row>
            </Col>
            <Col md="5">
              <Row style={{ height: '50%' }}></Row>
              <Row style={{ height: '50%' }}>
                <Col md="2">
                  <StepNumber>4.</StepNumber>
                </Col>
                <Col md="10">
                  <p className={`${styles.guideStep} mb-4`}>
                    Select the amount of certificates and proceed to payment
                  </p>
                  <Image src={step4Img} fluid />
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>

        <Spacer height={150} />
      </Layout>
    </>
  );
}
